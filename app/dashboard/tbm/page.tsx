import { prisma } from '@/app/lib/prisma';
import TbmContainer from '@/app/tbm/components/TbmContainer';
import TbmHeader from '@/app/tbm/components/TbmHeader';
import TbmAttendance from '@/app/tbm/components/TbmAttendance';
import TbmWorkDetails from '@/app/tbm/components/TbmWorkDetails';
import TbmSafetyRules from '@/app/tbm/components/TbmSafetyRules';
import TbmSecondPage from '@/app/tbm/components/TbmSecondPage';

import DatePicker from './date-picker';

export const dynamic = 'force-dynamic';

async function getWeatherForDate(targetDate: Date): Promise<string> {
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const targetKST = new Date(targetDate.getTime() + KST_OFFSET);
    const isoDate = targetKST.toISOString().split('T')[0];

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=35.1561&longitude=128.6629&daily=weather_code&timezone=Asia%2FSeoul&start_date=${isoDate}&end_date=${isoDate}`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();

        if (data.daily && data.daily.weather_code && data.daily.weather_code.length > 0) {
            const code = data.daily.weather_code[0];
            if (code <= 1) return '맑음';
            if (code <= 3) return '흐림';
            if (code === 45 || code === 48) return '안개';
            if (code >= 51 && code <= 67) return '비';
            if (code >= 71 && code <= 77) return '눈';
            if (code >= 80 && code <= 82) return '소나기';
            if (code >= 85 && code <= 86) return '눈보라';
            if (code >= 95) return '뇌우';
        }
    } catch (e) {
        console.error('Weather fetch error:', e);
    }
    return '맑음'; // fallback
}

async function getRosterData(requestedDate?: string) {
    let targetDate: Date;
    let roster: any = null;

    if (requestedDate) {
        targetDate = new Date(requestedDate);
        targetDate.setUTCHours(0, 0, 0, 0);
    } else {
        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstNow = new Date(now.getTime() + kstOffset);
        targetDate = new Date(kstNow);
        targetDate.setUTCHours(0, 0, 0, 0);
    }

    roster = await prisma.roster.findUnique({
        where: { date: targetDate },
        include: {
            assignments: {
                include: {
                    user: { include: { company: true } }
                }
            }
        }
    });

    const allWorkers = await prisma.user.findMany({
        where: {
            isApproved: true,
            OR: [
                { resignationDate: null },
                { resignationDate: { gt: targetDate } }
            ]
        },
        include: { company: true }
    });

    const assignedUserIds = new Set(
        roster?.assignments?.map((a: any) => a.userId) ?? []
    );

    const absenteesData = allWorkers
        .filter(u => !assignedUserIds.has(u.id))
        .map(u => ({ user: u }));

    return { roster, absenteesData, date: targetDate };
}

export default async function TbmPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const { date: requestedDate } = await searchParams;
    const { roster, absenteesData, date } = await getRosterData(requestedDate);
    const weatherStr = await getWeatherForDate(date);

    type WorkerInfo = { affil: string, name: string };
    const inspection: (WorkerInfo | null)[] = new Array(7).fill(null);
    const clamp: (WorkerInfo | null)[] = new Array(7).fill(null);
    const fork: (WorkerInfo | null)[] = new Array(7).fill(null);
    const support: (WorkerInfo | null)[] = new Array(7).fill(null);

    if (roster) {
        const workersByPos: Record<string, { info: WorkerInfo, team: string, userId: string }[]> = {
            '검수': [], '클램프': [], '포크': [], '상하역': [], 'OTHERS': []
        };

        roster.assignments.forEach((a: any) => {
            if (a.user.role === 'MANAGER' || a.position === '관리') return;
            let affilName = a.user.company?.name || '';
            affilName = affilName.replace(/\(주\)/g, '').trim();
            if (affilName === '신항만건기') affilName = '신항만 건기';
            const info: WorkerInfo = { affil: affilName, name: a.user.name };
            const team = a.team || '';
            const userId = String(a.user.id || a.user.name);

            if (workersByPos[a.position]) {
                workersByPos[a.position].push({ info, team, userId });
            } else {
                workersByPos['OTHERS'].push({ info, team, userId });
            }
        });

        const userPositionCount: Record<string, number> = {};
        roster.assignments.forEach((a: any) => {
            if (a.user.role === 'MANAGER' || a.position === '관리') return;
            const key = String(a.user.id || a.user.name);
            userPositionCount[key] = (userPositionCount[key] || 0) + 1;
        });

        const multiPositionWorkerIds = new Set<string>(
            Object.entries(userPositionCount)
                .filter(([, count]) => count >= 2)
                .map(([id]) => id)
        );

        const distribute = (bucket: any[], sourceList: { info: WorkerInfo, team: string, userId: string }[]) => {
            const teamNums: number[] = [];
            sourceList.forEach(item => {
                const match = item.team.match(/(\d+)/);
                const n = match ? parseInt(match[1]) : null;
                if (n && n >= 1 && n <= 5 && !teamNums.includes(n)) teamNums.push(n);
            });
            teamNums.sort((a, b) => a - b);

            const placedUserIds = new Set<string>();
            teamNums.forEach((teamNum, slotIdx) => {
                const candidate = sourceList.find(
                    item => item.team.match(/(\d+)/)?.[1] === String(teamNum) && !multiPositionWorkerIds.has(item.userId)
                ) || sourceList.find(
                    item => item.team.match(/(\d+)/)?.[1] === String(teamNum)
                );
                if (candidate && !bucket[slotIdx]) {
                    bucket[slotIdx] = candidate.info;
                    placedUserIds.add(candidate.userId);
                }
            });

            const remaining: WorkerInfo[] = sourceList
                .filter(item => !placedUserIds.has(item.userId) && !multiPositionWorkerIds.has(item.userId))
                .map(item => item.info);

            let fillIdx = teamNums.length;
            remaining.forEach(info => {
                while (fillIdx < 7 && bucket[fillIdx] !== null) fillIdx++;
                if (fillIdx < 7) { bucket[fillIdx] = info; fillIdx++; }
            });

            const multiWorkers: WorkerInfo[] = sourceList
                .filter(item => multiPositionWorkerIds.has(item.userId) && !placedUserIds.has(item.userId))
                .map(item => { placedUserIds.add(item.userId); return item.info; });

            multiWorkers.forEach(info => {
                while (fillIdx < 7 && bucket[fillIdx] !== null) fillIdx++;
                if (fillIdx < 7) { bucket[fillIdx] = info; fillIdx++; }
            });
        };

        distribute(inspection, workersByPos['검수']);
        distribute(clamp, workersByPos['클램프']);
        distribute(fork, workersByPos['포크']);
        distribute(support, [...workersByPos['상하역'], ...workersByPos['OTHERS']]);
    }

    const dateStr = date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    const absentNames = absenteesData.map((a: any) => a.user.name);
    const absentString = absentNames.length > 0 ? absentNames.join(', ') : '없음';

    const potentialPopups = await prisma.schedule.findMany({
        where: {
            isPopup: true, isActive: true,
            startDate: { lte: date },
            OR: [{ endDate: null }, { endDate: { gte: date } }],
        },
        select: { title: true, description: true, type: true, startDate: true, endDate: true, dayOfWeek: true, dayOfMonth: true, weekOfMonth: true },
    });

    const dayOfWeek = date.getUTCDay();
    const dayOfMonth = date.getUTCDate();
    const weekOfMonth = Math.ceil(dayOfMonth / 7);

    const activePopups = potentialPopups.filter(s => {
        if (s.startDate > date) return false;
        if (s.endDate && s.endDate < date) return false;
        switch (s.type) {
            case 'ONCE': return s.startDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
            case 'DAILY': return true;
            case 'WEEKLY': return s.dayOfWeek.includes(dayOfWeek);
            case 'MONTHLY_DATE': return s.dayOfMonth === dayOfMonth || s.dayOfMonth === -1;
            case 'MONTHLY_DAY': return s.weekOfMonth === weekOfMonth && s.dayOfWeek.includes(dayOfWeek);
            default: return false;
        }
    });

    const remarksHtml = activePopups.length > 0 ? '<br/>' + activePopups.map(s => `• ${s.description || s.title}`).join('<br/>') : '';

    const allSafetyItems = await prisma.safetyEducation.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });

    let safetyEducation: string[] = [];
    if (allSafetyItems.length > 0) {
        const epochMs = date.getTime();
        const daysSinceEpoch = Math.floor(epochMs / (1000 * 60 * 60 * 24));
        const totalItems = allSafetyItems.length;
        for (let i = 0; i < 3; i++) {
            const index = (daysSinceEpoch * 3 + i) % totalItems;
            const safeIndex = (index % totalItems + totalItems) % totalItems;
            safetyEducation.push(`${i + 1}. ${allSafetyItems[safeIndex].content}`);
        }
    } else {
        safetyEducation = ['1. 등록된 안전교육 내용이 없습니다.', '2. 설정 메뉴에서 교육 내용을 등록해주세요.', '3. 작업 전 기본 안전수칙을 반드시 준수 바랍니다.'];
    }

    const isoDate = date.toISOString().split('T')[0];

    const photo1Config = await prisma.systemConfig.findUnique({ where: { key: 'tbm_photo_1' } });
    const photo2Config = await prisma.systemConfig.findUnique({ where: { key: 'tbm_photo_2' } });

    const photo1 = photo1Config ? JSON.parse(photo1Config.value) : null;
    const photo2 = photo2Config ? JSON.parse(photo2Config.value) : null;

    return (
        <TbmContainer>
            <div className="no-print mb-4">
                <DatePicker initialDate={isoDate} />
            </div>

            <div className="tbm-page-segment">
                <div className="tbm-content-zoom">
                    <TbmHeader date={dateStr} weather={weatherStr} />
                    <TbmAttendance inspection={inspection} clamp={clamp} fork={fork} support={support} absentList={absentString} remarks={remarksHtml} />
                    <TbmWorkDetails safetyEducation={safetyEducation} />
                    <TbmSafetyRules />
                </div>
            </div>

            <div className="tbm-page-segment">
                <div className="tbm-content-zoom">
                    <TbmSecondPage photo1={photo1} photo2={photo2} />
                </div>
            </div>
        </TbmContainer>
    );
}

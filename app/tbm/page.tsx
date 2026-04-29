import { prisma } from '@/app/lib/prisma';
import TbmContainer from './components/TbmContainer';
import TbmHeader from './components/TbmHeader';
import TbmAttendance from './components/TbmAttendance';
import TbmWorkDetails from './components/TbmWorkDetails';
import TbmSafetyRules from './components/TbmSafetyRules';
import TbmSecondPage from './components/TbmSecondPage';

import DatePicker from './date-picker';

export const dynamic = 'force-dynamic';

// ... (getRosterData remains the same)

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
        // Get today's date in KST (UTC+9)
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

    // If no roster for today/requested date, we might still want to find the latest
    // for fallback purposes? The user said "default to today", so we'll show empty if none.
    // But usually showing the latest is more helpful. Let's stick to the prompt.


    // Calculate absentees = all approved active workers NOT in the roster (same as dashboard)
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
    // Prepare data buckets (7 slots each)
    const inspection: (WorkerInfo | null)[] = new Array(7).fill(null);
    const clamp: (WorkerInfo | null)[] = new Array(7).fill(null);
    const fork: (WorkerInfo | null)[] = new Array(7).fill(null);
    const support: (WorkerInfo | null)[] = new Array(7).fill(null);

    if (roster) {
        // Step 1: Group workers by position
        const workersByPos: Record<string, { info: WorkerInfo, team: string, userId: string }[]> = {
            '검수': [], '클램프': [], '포크': [], '상하역': [], 'OTHERS': []
        };

        roster.assignments.forEach((a: any) => {
            // Filter out managers and management personnel
            if (a.user.role === 'MANAGER' || a.position === '관리') {
                return;
            }

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

        // Build map: userId -> count of positions they appear in (to find multi-position workers)
        const userPositionCount: Record<string, number> = {};
        roster.assignments.forEach((a: any) => {
            if (a.user.role === 'MANAGER' || a.position === '관리') return;
            const key = String(a.user.id || a.user.name);
            userPositionCount[key] = (userPositionCount[key] || 0) + 1;
        });

        // Collect multi-position workers (appear in 2+ positions) — deduplicated
        const multiPositionWorkerIds = new Set<string>(
            Object.entries(userPositionCount)
                .filter(([, count]) => count >= 2)
                .map(([id]) => id)
        );

        // Step 2: Distribution function
        // - Teams 1–5 appear left-to-right (compact: empty teams skipped)
        // - Multi-position workers fill trailing slots (after the main team columns)
        // Returns overflow workers that didn't fit in 7 slots
        const distribute = (bucket: any[], sourceList: { info: WorkerInfo, team: string, userId: string }[]) => {
            const overflow: WorkerInfo[] = [];

            // Collect team numbers that have a worker for this position (sorted 1→5)
            const teamNums: number[] = [];
            sourceList.forEach(item => {
                const match = item.team.match(/(\d+)/);
                const n = match ? parseInt(match[1]) : null;
                if (n && n >= 1 && n <= 5 && !teamNums.includes(n)) {
                    teamNums.push(n);
                }
            });
            teamNums.sort((a, b) => a - b);

            // Pass 1: assign one worker per team, compacted left-to-right (up to first 5 slots)
            const placedUserIds = new Set<string>();
            teamNums.forEach((teamNum, slotIdx) => {
                if (slotIdx >= 7) return; // safety

                const candidate = sourceList.find(
                    item => item.team.match(/(\d+)/)?.[1] === String(teamNum)
                        && !multiPositionWorkerIds.has(item.userId)  // prefer non-multi first
                ) || sourceList.find(
                    item => item.team.match(/(\d+)/)?.[1] === String(teamNum)
                );
                if (candidate && !bucket[slotIdx]) {
                    bucket[slotIdx] = candidate.info;
                    placedUserIds.add(candidate.userId);
                }
            });

            // Pass 2: remaining un-placed workers from sourceList (duplicate team, 2nd person, etc.)
            const remaining: WorkerInfo[] = sourceList
                .filter(item => !placedUserIds.has(item.userId) && !multiPositionWorkerIds.has(item.userId))
                .map(item => item.info);

            // Fill slots after the team slots (indexes teamNums.length → 6)
            let fillIdx = teamNums.length;
            remaining.forEach(info => {
                while (fillIdx < 7 && bucket[fillIdx] !== null) fillIdx++;
                if (fillIdx < 7) {
                    bucket[fillIdx] = info;
                    fillIdx++;
                } else {
                    overflow.push(info);
                }
            });

            // Pass 3: Multi-position workers fill the very last remaining slots
            const multiWorkers: WorkerInfo[] = sourceList
                .filter(item => multiPositionWorkerIds.has(item.userId) && !placedUserIds.has(item.userId))
                .map(item => { placedUserIds.add(item.userId); return item.info; });

            multiWorkers.forEach(info => {
                while (fillIdx < 7 && bucket[fillIdx] !== null) fillIdx++;
                if (fillIdx < 7) {
                    bucket[fillIdx] = info;
                    fillIdx++;
                } else {
                    overflow.push(info);
                }
            });

            return overflow;
        };

        const inspectionOverflow = distribute(inspection, workersByPos['검수']);
        const clampOverflow = distribute(clamp, workersByPos['클램프']);
        const forkOverflow = distribute(fork, workersByPos['포크']);

        // Support role includes '상하역' + any unidentified positions (OP, MANAGEMENT, etc.)
        const supportOverflow = distribute(support, [...workersByPos['상하역'], ...workersByPos['OTHERS']]);

        // Step 3: Handle Overflow (Fallback logic)
        // Helper to fill null slots in bucket with overflow list
        const fillFallback = (bucket: (WorkerInfo | null)[], overflow: WorkerInfo[]) => {
            if (overflow.length === 0) return;
            let fillIdx = 0;
            overflow.forEach(info => {
                while (fillIdx < 7 && bucket[fillIdx] !== null) fillIdx++;
                if (fillIdx < 7) {
                    bucket[fillIdx] = info;
                    fillIdx++;
                }
            });
        };

        // Apply rules: 
        // Inspection -> Support
        // Support -> Inspection
        // Clamp -> Fork
        // Fork -> Clamp
        fillFallback(support, inspectionOverflow);
        fillFallback(inspection, supportOverflow);
        fillFallback(fork, clampOverflow);
        fillFallback(clamp, forkOverflow);
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

    const remarksHtml = activePopups.length > 0
        ? '<br/>' + activePopups.map(s => `• ${s.description || s.title}`).join('<br/>')
        : '';

    // Fetch dynamic safety education items
    const allSafetyItems = await prisma.safetyEducation.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' }
    });

    let safetyEducation: string[] = [];
    if (allSafetyItems.length > 0) {
        // Use the date to determine the rotation index. 
        // We use UTC time to avoid timezone shifts causing different results on the same logical day.
        const epochMs = date.getTime();
        const daysSinceEpoch = Math.floor(epochMs / (1000 * 60 * 60 * 24));

        const totalItems = allSafetyItems.length;
        for (let i = 0; i < 3; i++) {
            const index = (daysSinceEpoch * 3 + i) % totalItems;
            // Ensure positive index in JS modulo
            const safeIndex = (index % totalItems + totalItems) % totalItems;
            safetyEducation.push(`${i + 1}. ${allSafetyItems[safeIndex].content}`);
        }
    } else {
        safetyEducation = [
            '1. 등록된 안전교육 내용이 없습니다.',
            '2. 설정 메뉴에서 교육 내용을 등록해주세요.',
            '3. 작업 전 기본 안전수칙을 반드시 준수 바랍니다.'
        ];
    }

    const isoDate = date.toISOString().split('T')[0];

    // Fetch TBM photos from SystemConfig
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
                    <TbmAttendance
                        inspection={inspection}
                        clamp={clamp}
                        fork={fork}
                        support={support}
                        absentList={absentString}
                        remarks={remarksHtml}
                    />
                    <TbmWorkDetails
                        safetyEducation={safetyEducation}
                    />
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

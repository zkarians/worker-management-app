import { prisma } from '@/app/lib/prisma';
import TbmContainer from '@/app/tbm/components/TbmContainer';
import TbmHeader from '@/app/tbm/components/TbmHeader';
import TbmAttendance from '@/app/tbm/components/TbmAttendance';
import TbmWorkDetails from '@/app/tbm/components/TbmWorkDetails';
import TbmSafetyRules from '@/app/tbm/components/TbmSafetyRules';
import TbmSecondPage from '@/app/tbm/components/TbmSecondPage';
import DatePicker from './date-picker';
import {
    getWeatherForDate,
    getRosterData,
    processWorkerDistribution,
    getActivePopupsRemarks,
    getSafetyEducationList
} from '@/app/tbm/tbm-utils';

export const dynamic = 'force-dynamic';

export default async function TbmPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const { date: requestedDate } = await searchParams;
    const { roster, absenteesData, date } = await getRosterData(requestedDate);
    const weatherStr = await getWeatherForDate(date);

    const { inspection, clamp, fork, support } = processWorkerDistribution(roster);

    const dateStr = date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    const absentNames = absenteesData.map((a: any) => a.user.name);
    const absentString = absentNames.length > 0 ? absentNames.join(', ') : '없음';

    const remarksHtml = await getActivePopupsRemarks(date);
    const safetyEducation = await getSafetyEducationList(date);

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


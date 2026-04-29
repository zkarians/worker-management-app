import React from 'react';
import { WorkerInfo } from './types';

interface TbmAttendanceProps {
    inspection: (WorkerInfo | null)[];
    clamp: (WorkerInfo | null)[];
    fork: (WorkerInfo | null)[];
    support: (WorkerInfo | null)[];
    absentList: string;
    remarks: string;
}

const TbmAttendance: React.FC<TbmAttendanceProps> = ({
    inspection,
    clamp,
    fork,
    support,
    absentList,
    remarks,
}) => {
    const renderSlots = (prefix: string, bucket: (WorkerInfo | null)[]) => {
        return bucket.map((info, i) => (
            <React.Fragment key={`${prefix}-${i}`}>
                <td className="xl140" width={59} style={{ borderLeft: 'none', width: '44pt' }}>{info?.affil || ''}</td>
                <td className="xl141" width={59} style={{ borderLeft: 'none', width: '44pt', color: '#888888' }}>{info?.name || ''}</td>
            </React.Fragment>
        ));
    };

    return (
        <>
            <div style={{ height: '2px' }}></div>
            <table border={0} cellPadding={0} cellSpacing={0} width={1106} style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: '825pt' }}>
                <colgroup>
                    <col className="xl129" width={44} style={{ width: '33pt' }} />
                    <col className="xl129" width={59} span={2} style={{ width: '44pt' }} />
                    <col className="xl131" width={59} span={2} style={{ width: '44pt' }} />
                    <col className="xl130" width={59} span={4} style={{ width: '44pt' }} />
                    <col className="xl129" width={59} span={4} style={{ width: '44pt' }} />
                    <col className="xl129" width={59} style={{ width: '44pt' }} />
                    <col className="xl129" width={59} style={{ width: '44pt' }} />
                    <col className="xl132" width={59} span={4} style={{ width: '44pt' }} />
                </colgroup>
                <tbody>
                    <tr style={{ height: '26.25pt' }}>
                        <td rowSpan={5} height={199} className="xl295" style={{ borderBottom: '1.0pt solid black', height: '149.25pt' }}>출하</td>
                        <td className="xl137" style={{ borderLeft: 'none' }}>구분</td>
                        <td className="xl137" style={{ borderLeft: 'none' }}>소속</td>
                        <td className="xl137" style={{ borderLeft: 'none' }}>이름</td>
                        <td className="xl138" style={{ borderLeft: 'none' }}>소속</td>
                        <td className="xl138" style={{ borderLeft: 'none' }}>이름</td>
                        <td className="xl137" style={{ borderLeft: 'none' }}>소속</td>
                        <td className="xl137" style={{ borderLeft: 'none' }}>이름</td>
                        <td className="xl137" style={{ borderLeft: 'none' }}>소속</td>
                        <td className="xl137" style={{ borderLeft: 'none' }}>이름</td>
                        <td className="xl137" style={{ borderLeft: 'none' }}>소속</td>
                        <td className="xl137" style={{ borderLeft: 'none' }}>이름</td>
                        <td className="xl138" style={{ borderLeft: 'none' }}>소속</td>
                        <td className="xl138" style={{ borderLeft: 'none' }}>이름</td>
                        <td className="xl138" style={{ borderLeft: 'none' }}>소속</td>
                        <td className="xl138" style={{ borderLeft: 'none' }}>이름</td>
                        <td colSpan={3} rowSpan={3} className="xl274 absent-cell" width={177} style={{ borderRight: '1.0pt solid black', borderBottom: '.5pt solid black', width: '132pt', verticalAlign: 'top', padding: '4pt' }}>
                            <div style={{ width: '100%', whiteSpace: 'normal', wordBreak: 'break-all', overflow: 'hidden' }}>
                                결근:<br />{absentList}
                            </div>
                        </td>
                    </tr>
                    <tr style={{ height: '30.75pt' }}>
                        <td height={41} className="xl139" width={59} style={{ height: '30.75pt', width: '44pt' }}>검수</td>
                        {renderSlots('inspection', inspection)}
                    </tr>
                    <tr style={{ height: '30.75pt' }}>
                        <td height={41} className="xl142" width={59} style={{ height: '30.75pt', width: '44pt' }}>클램프</td>
                        {renderSlots('clamp', clamp)}
                    </tr>
                    <tr style={{ height: '30.75pt' }}>
                        <td height={41} className="xl139" width={59} style={{ height: '30.75pt', borderTop: 'none', width: '44pt' }}>포크</td>
                        {renderSlots('fork', fork)}
                        <td colSpan={3} rowSpan={2} className="xl280" width={177} style={{ borderRight: '1.0pt solid black', borderLeft: 'none', width: '132pt', verticalAlign: 'top', padding: '4pt', textAlign: 'left' }}>
                            <div style={{ width: '100%', whiteSpace: 'normal', wordBreak: 'break-all', overflow: 'hidden' }}>
                                비고:
                                <span dangerouslySetInnerHTML={{ __html: remarks }} />
                            </div>
                        </td>
                    </tr>
                    <tr style={{ height: '30.75pt' }}>
                        <td height={41} className="xl146" width={59} style={{ height: '30.75pt', borderTop: 'none', width: '44pt' }}>검수<br />보조</td>
                        {renderSlots('support', support)}
                    </tr>
                </tbody>
            </table>
        </>
    );
};

export default TbmAttendance;

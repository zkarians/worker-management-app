import React from 'react';

interface TbmHeaderProps {
    date: string;
    weather: string;
}

const TbmHeader: React.FC<TbmHeaderProps> = ({ date, weather }) => {
    return (
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
                <tr style={{ height: '30.0pt' }}>
                    <td colSpan={15} rowSpan={3} height={71} className="xl224" width={870} style={{ borderBottom: '1.0pt solid black', height: '53.25pt', width: '649pt', textAlign: 'center' }}>
                        <a id="Print_Area">일별 작업 계획서(차량계) 및 TBM 일지</a>
                    </td>
                    <td rowSpan={5} className="xl218" width={59} style={{ borderBottom: '1.0pt solid black', width: '44pt' }}>결재</td>
                    <td rowSpan={3} className="xl201" width={59} style={{ width: '44pt' }}>작성</td>
                    <td colSpan={2} rowSpan={3} className="xl201" width={118} style={{ borderRight: '1.0pt solid black', width: '88pt' }}>승인</td>
                </tr>
                <tr style={{ height: '13.5pt' }}></tr>
                <tr style={{ height: '9.75pt' }}></tr>
                <tr style={{ height: '24.95pt' }}>
                    <td colSpan={3} height={33} className="xl226" style={{ height: '24.95pt' }}>작 업 일 자</td>
                    <td colSpan={4} className="xl217 header-value-center" width={236} style={{ borderLeft: 'none', width: '176pt' }}>{date}</td>
                    <td className="xl136 header-shade-center" width={59} style={{ width: '44pt' }}>날씨:</td>
                    <td colSpan={3} className="xl215 header-value-center" width={177} style={{ borderRight: '.5pt solid black', width: '132pt' }}>{weather}</td>
                    <td colSpan={2} className="xl201 header-shade-center">작업시간</td>
                    <td colSpan={2} className="xl201 header-value-center" style={{ borderLeft: 'none' }}>19:00~04:00</td>
                    <td rowSpan={2} className="xl203" style={{ borderBottom: '1.0pt solid black', borderTop: 'none' }}>　</td>
                    <td colSpan={2} rowSpan={2} className="xl211" style={{ borderRight: '1.0pt solid black', borderBottom: '1.0pt solid black', borderTop: 'none' }}>　</td>
                </tr>
                <tr style={{ height: '24.95pt' }}>
                    <td colSpan={3} height={33} className="xl253" style={{ height: '24.95pt' }}>작 업 장 소</td>
                    <td colSpan={8} className="xl203 tbm-shrink-fit" style={{ borderLeft: 'none' }}>경남 창원시 진해구 신항7로6, 동방웅동물류센터 내</td>
                    <td colSpan={2} className="xl203 header-shade-center" style={{ borderLeft: 'none' }}>교육장소</td>
                    <td colSpan={2} className="xl203 header-value-center" style={{ borderLeft: 'none' }}>A동 식당</td>
                </tr>
                <tr style={{ height: '24.95pt' }}>
                    <td colSpan={3} height={33} className="xl253" style={{ height: '24.95pt' }}>지게차 속도, 중량</td>
                    <td colSpan={5} className="xl250 tbm-shrink-fit" style={{ borderLeft: 'none' }}>사내 5km/h, 사외 10km/h이내, 3톤 미만</td>
                    <td colSpan={2} className="xl203 header-shade-center" style={{ borderLeft: 'none' }}>작업장</td>
                    <td colSpan={5} className="xl207 tbm-shrink-fit" style={{ borderRight: '1.0pt solid black', borderLeft: 'none' }}>강화콘크리트, 평지 / 대지면적: 20,937㎡</td>
                    <td colSpan={2} rowSpan={2} className="xl227 header-value-center" style={{ borderBottom: '1.0pt solid black' }}>작업지휘자</td>
                    <td colSpan={2} rowSpan={2} className="xl263 header-value-center" width={118} style={{ borderRight: '1.0pt solid black', borderBottom: '1.0pt solid black', width: '88pt' }}>출하: 팀별 검수</td>
                </tr>
                <tr style={{ height: '24.95pt' }}>
                    <td colSpan={3} height={33} className="xl267" style={{ height: '24.95pt' }}>작&nbsp;&nbsp; 업&nbsp;&nbsp; 내&nbsp;&nbsp; 용</td>
                    <td colSpan={5} className="xl209 tbm-shrink-fit" style={{ borderLeft: 'none' }}>컨테이너 적/출입 작업</td>
                    <td colSpan={2} className="xl229 header-shade-center" style={{ borderLeft: 'none' }}>작업종류</td>
                    <td colSpan={5} className="xl209 tbm-shrink-fit" style={{ borderRight: '1.0pt solid black', borderLeft: 'none' }}>LG 냉장고, 식기, 컴프레샤, 세탁기</td>
                </tr>
            </tbody>
        </table>
    );
};

export default TbmHeader;

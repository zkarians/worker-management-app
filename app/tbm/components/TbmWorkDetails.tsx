import React from 'react';

interface TbmWorkDetailsProps {
    safetyEducation: string[];
}

const TbmWorkDetails: React.FC<TbmWorkDetailsProps> = ({ safetyEducation }) => {
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
                    <tr style={{ height: '24.95pt' }}>
                        <td colSpan={2} height={33} className="xl252 tbm-center" style={{ height: '24.95pt' }}>작업구분</td>
                        <td colSpan={3} className="xl205 tbm-center" style={{ borderLeft: 'none' }}>화물의 종류</td>
                        <td colSpan={4} className="xl205 tbm-center" style={{ borderLeft: 'none' }}>작업내용</td>
                        <td colSpan={3} className="xl292 header-shade-center tbm-center" style={{ borderRight: '.5pt solid black' }}>※ 금일 안전교육 내용</td>
                        <td colSpan={2} className="xl287 tbm-center" style={{ borderRight: '.5pt solid black' }}>교육일시</td>
                        <td colSpan={2} className="xl287 tbm-center" style={{ borderRight: '.5pt solid black' }}>19:00~19:30</td>
                        <td className="xl134 tbm-center">장소</td>
                        <td colSpan={2} className="xl287 tbm-center" style={{ borderRight: '1.0pt solid black', borderLeft: 'none' }}>A동 식당</td>
                    </tr>
                    <tr style={{ height: '24.95pt' }}>
                        <td rowSpan={2} height={66} className="xl268 tbm-center" style={{ borderBottom: '1.0pt solid black', height: '49.9pt' }}>출하</td>
                        <td className="xl135 tbm-center" style={{ borderLeft: 'none' }}>20FT</td>
                        <td colSpan={3} className="xl207 tbm-indent-left tbm-shrink-fit" style={{ borderLeft: 'none' }}>냉장고,식기,컴프레샤</td>
                        <td colSpan={4} className="xl259 tbm-indent-left tbm-shrink-fit" width={236} style={{ borderLeft: 'none', width: '176pt' }}>팔레트 적출 및 컨테이너 반입작업</td>
                        <td colSpan={10} className="xl254 tbm-indent-left tbm-shrink-fit" style={{ borderRight: '1.0pt solid black' }}>{safetyEducation[0]}</td>
                    </tr>
                    <tr style={{ height: '24.95pt' }}>
                        <td height={33} className="xl133 tbm-center" style={{ height: '24.95pt', borderTop: 'none', borderLeft: 'none' }}>40FT</td>
                        <td colSpan={3} className="xl286 tbm-indent-left tbm-shrink-fit" style={{ borderLeft: 'none' }}>냉장고,식기,컴프레샤</td>
                        <td colSpan={4} className="xl261 tbm-indent-left tbm-shrink-fit" width={236} style={{ borderLeft: 'none', width: '176pt' }}>팔레트 적출 및 컨테이너 반입작업</td>
                        <td colSpan={10} className="xl254 tbm-indent-left tbm-shrink-fit" style={{ borderRight: '1.0pt solid black' }}>{safetyEducation[1]}</td>
                    </tr>
                    <tr style={{ height: '24.95pt' }}>
                        <td colSpan={2} height={33} className="xl252 tbm-center" style={{ height: '24.95pt' }}>구 분</td>
                        <td colSpan={7} className="xl257 tbm-center" width={413} style={{ borderLeft: 'none', width: '308pt' }}>안&nbsp;&nbsp; 전&nbsp;&nbsp; 점&nbsp;&nbsp;&nbsp;&nbsp; 검&nbsp;&nbsp;&nbsp; 내&nbsp;&nbsp;&nbsp; 용</td>
                        <td colSpan={10} className="xl237 tbm-indent-left tbm-shrink-fit" style={{ borderRight: '1.0pt solid black' }}>{safetyEducation[2]}</td>
                    </tr>
                    <tr style={{ height: '24.95pt' }}>
                        <td colSpan={2} rowSpan={4} height={132} className="xl231 tbm-center" style={{ borderRight: '.5pt solid black', borderBottom: '.5pt solid black', height: '99.8pt' }}>화물의상태</td>
                        <td colSpan={7} className="xl183 tbm-indent-left tbm-shrink-fit" width={413} style={{ borderRight: '.5pt solid black', width: '308pt' }}>화물의 중량은 지게차의 정격하중을 초과하지 않을 것</td>
                        <td colSpan={2} rowSpan={2} className="xl242 tbm-center" width={118} style={{ borderRight: '.5pt solid black', borderBottom: '.5pt solid black', width: '88pt' }}>작업전<br />안전 교육</td>
                        <td colSpan={8} className="xl206 tbm-indent-left tbm-shrink-fit" style={{ borderRight: '1.0pt solid black', borderLeft: 'none' }}>화물 입출하 작업시 차량간 사고 및 작업자 간 부딪힘</td>
                    </tr>
                    <tr style={{ height: '24.95pt' }}>
                        <td colSpan={7} height={33} className="xl183 tbm-indent-left tbm-shrink-fit" width={413} style={{ borderRight: '.5pt solid black', height: '24.95pt', width: '308pt' }}>화물이 운전자의 시야를 방해 않도록 후진 이동 할 것</td>
                        <td colSpan={8} className="xl169 tbm-indent-left tbm-shrink-fit" style={{ borderRight: '1.0pt solid black' }}>온열기구 사용법 및 화재예방 안전수칙</td>
                    </tr>
                    <tr style={{ height: '24.95pt' }}>
                        <td colSpan={7} height={33} className="xl183 tbm-indent-left tbm-shrink-fit" width={413} style={{ borderRight: '.5pt solid black', height: '24.95pt', width: '308pt' }}>인체에 위험한 화물 시 위험성에 대한 교육을 실시 할 것</td>
                        <td colSpan={2} rowSpan={2} className="xl246 tbm-center" width={118} style={{ borderRight: '.5pt solid black', borderBottom: '.5pt solid black', width: '88pt' }}>작업자 지게차<br />면허 필수</td>
                        <td colSpan={3} className="xl169 tbm-indent-left tbm-shrink-fit" style={{ borderRight: '.5pt solid black' }}>안전장구(모, 화, 장갑) 착용</td>
                        <td colSpan={5} className="xl183 tbm-indent-left tbm-shrink-fit" width={295} style={{ borderRight: '1.0pt solid black', borderLeft: 'none', width: '220pt' }}>위험요소 여부(위험성평가 숙지 여부)</td>
                    </tr>
                    <tr style={{ height: '24.95pt' }}>
                        <td colSpan={7} height={33} className="xl183 tbm-indent-left tbm-shrink-fit" width={413} style={{ borderRight: '.5pt solid black', height: '24.95pt', width: '308pt' }}>붕괴, 전도, 낙하 위험이 있는 화물을 견고하게 묶을 것</td>
                        <td colSpan={3} className="xl169 tbm-indent-left tbm-shrink-fit" style={{ borderRight: '.5pt solid black' }}>음주시 근무 부적격</td>
                        <td colSpan={5} className="xl169 tbm-indent-left tbm-shrink-fit" style={{ borderRight: '1.0pt solid black', borderLeft: 'none' }}>건강 이상 시 부적합 근무(조퇴 할 것)</td>
                    </tr>
                    <tr style={{ height: '24.95pt' }}>
                        <td colSpan={2} rowSpan={2} height={66} className="xl186 tbm-center" width={103} style={{ borderRight: '.5pt solid black', borderBottom: '.5pt solid black', height: '49.9pt', width: '77pt' }}>작업장의 상태</td>
                        <td colSpan={7} className="xl183 tbm-indent-left tbm-shrink-fit" width={413} style={{ borderRight: '.5pt solid black', width: '308pt' }}>통행로 확보(폭 1.2m) 및 장애물 있을 시 정리 정돈 할 것</td>
                        <td colSpan={2} rowSpan={2} className="xl190 tbm-center" width={118} style={{ borderRight: '.5pt solid black', borderBottom: '.5pt solid black', width: '88pt' }}>지게차<br />작동 점검</td>
                        <td colSpan={8} className="xl169 tbm-indent-left tbm-shrink-fit" style={{ borderRight: '1.0pt solid black' }}>작업 개시 전 지게차 안전점검 실시 후 체크리스트 작성</td>
                    </tr>
                    <tr style={{ height: '24.95pt' }}>
                        <td colSpan={7} height={33} className="xl183 tbm-indent-left tbm-shrink-fit" width={413} style={{ borderRight: '.5pt solid black', height: '24.95pt', width: '308pt' }}>지면이 평평하지는 못하나 수리를 하고 있고 붕괴위험 없음</td>
                        <td colSpan={8} className="xl169 tbm-indent-left tbm-shrink-fit" style={{ borderRight: '1.0pt solid black' }}>월1회 정기점검 실시결과 하여 양호할 것</td>
                    </tr>
                    <tr style={{ height: '24.95pt' }}>
                        <td colSpan={2} height={33} className="xl181 tbm-center" width={103} style={{ borderRight: '.5pt solid black', height: '24.95pt', width: '77pt' }}>위험성평가</td>
                        <td colSpan={17} className="xl198 tbm-indent-left tbm-shrink-fit" width={1003} style={{ borderRight: '1.0pt solid black', borderLeft: 'none', width: '748pt' }}>
                            바닥꺼짐으로 차량전도 및 제품 낙하 가능성 있음(바닥 보수 공사 중), 우천시 천장 비샘(수시로 점검중)
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    );
};

export default TbmWorkDetails;

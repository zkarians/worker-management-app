import React from 'react';

interface TbmSecondPageProps {
    photo1?: string | null;
    photo2?: string | null;
}

const TbmSecondPage: React.FC<TbmSecondPageProps> = ({ photo1, photo2 }) => {
    return (
        <div className="tbm-page-2 print:mt-0" style={{ width: '1106px' }}>
            {/* Header / Title */}
            <div className="mb-4">
                <h2 className="text-3xl font-bold text-black flex items-center gap-2 mb-2">
                    {'>'} 작업중지권
                </h2>
                <div className="space-y-1 text-lg text-black leading-relaxed">
                    <p className="font-bold">■ (주)동방웅동물류센터 전 사업장에 대하여 6대 안전 긴급조치를 시행합니다.</p>
                    <p>- 긴급조치에 위배되는 사항 발견 시 안전작성허가자와 작업관리감독자는 작업을 중지하고 개선해야하며, 작업자는 작업 중지를 요청해야합니다.</p>
                </div>
            </div>

            {/* 6 Rules Box */}
            <div className="border-[2.5px] border-black p-4 mb-4 bg-white">
                <h3 className="font-bold text-xl mb-2">[6대 안전 긴급조치]</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-1 text-base">
                    <p>① 가동중인 장비의 점검·수리작업 금지</p>
                    <p>② 고위험작업(화기사용 및 용접용단 등) 부서장 결재</p>
                    <p>③ 모든 작업자 작업중지권 부여</p>
                    <p>④ 안전조치사항 관계수급사 위임 금지</p>
                    <p>⑤ 모든 작업시 CCTV 의무 활용</p>
                    <p>⑥ 미허가자 및 안전장구류 미착용자 야드 출입 금지</p>
                </div>
            </div>

            {/* Legal Basis */}
            <div className="space-y-4 mb-4">
                <div className="text-lg leading-relaxed">
                    <p className="font-bold">■ [작업중지권] 귀하는 산안법 제52조에 의거하여 작업 전 안전조치가 미흡할 경우 작업을 거부할 수 있으며, 작업 중 위험상황이 발생할 경우 작업을 중지하고 안전조치를 요구할 수 있습니다.</p>
                </div>
                <div className="text-base leading-relaxed text-black">
                    <p className="font-bold mb-1">[관련 法] 산업안전보건법 제 52조(근로자의 작업중지)</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>근로자는 산업재해가 발생할 급박한 위험이 있는 경우에는 작업을 중지하고 대피할 수 있다.</li>
                        <li>작업을 중지하고 대피한 근로자는 지체없이 그 사실을 관리감독자 또는 그 밖에 부서의 장에게 보고하여야 한다.</li>
                        <li>관리감독자 등은 보고를 받으면 안전 및 보건에 관하여 필요한 조치를 하여야 한다.</li>
                        <li>사업주는 산업재해가 발생할 급박한 위험이 있다고 근로자가 미듬 만한 합리적인 이유가 있을 때에는 그 근로자에 대해서 해고나 그 밖의 불리한 처우를 해서는 아니된다.</li>
                    </ul>
                </div>
            </div>

            {/* Condition Check */}
            <div className="mb-4">
                <p className="text-base mb-2 font-bold">아래 3항의 조건을 충족 후 일일작업계획서에 서명한다.</p>
                <div className="border-[2.5px] border-black p-4 text-base space-y-1">
                    <p>① 귀하는 6대 안전 긴급조치를 포함한 충분한 안전조치를 확인한다.</p>
                    <p>② 귀하는 현재 신체 또는 심리조건(질병, 스트레스, 음주 등)의 정상 상태에서 일일 작업하기로 한다.</p>
                    <p>③ 귀하는 "금일 작업에 대한 방법 및 안전수칙, 작업중지권"에 대한 내용을 숙지한다.</p>
                </div>
            </div>

            {/* Map Section */}
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-black flex items-center gap-2 mb-2">
                    {'>'} (주)동방웅동물류센터 내 운행 경로(도면)
                </h2>
                <div className="border-[2.5px] border-black p-1 bg-white">
                    <img
                        src="/tbm-map.png"
                        alt="운행 경로 도면"
                        className="w-full h-auto object-contain max-h-[380px]"
                    />
                </div>
            </div>

            {/* Footer Photo Section */}
            <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t-[2px] border-black print:border-t-0">
                <div className="border-[2.5px] border-black h-[380px] flex items-center justify-center bg-white overflow-hidden">
                    {photo1 ? (
                        <img src={photo1} alt="TBM 사진 1" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-base text-slate-400">TBM 사진 1 (설정에서 등록 가능)</span>
                    )}
                </div>
                <div className="border-[2.5px] border-black h-[380px] flex items-center justify-center bg-white overflow-hidden">
                    {photo2 ? (
                        <img src={photo2} alt="TBM 사진 2" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-base text-slate-400">TBM 사진 2 (설정에서 등록 가능)</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TbmSecondPage;

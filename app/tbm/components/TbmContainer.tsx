import React from 'react';

const tbmStyles = `@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      overflow: visible !important;
  }
  .no-print, header, aside, .sidebar-container {
      display: none !important;
  }
  .tbm-page-wrapper {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      display: block !important;
  }
  .tbm-page-segment:not(:last-child) {
      page-break-after: always !important;
  }
  .tbm-page-segment {
      width: 100% !important;
      height: 297mm !important; 
      max-height: 297mm !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important; /* Center content vertically */
      position: relative !important;
      overflow: hidden !important;
      page-break-inside: avoid !important;
  }
  .tbm-page-segment:not(:last-child) {
      page-break-after: always !important;
  }
  .tbm-content-zoom {
      zoom: 0.63 !important;
      width: 1106px !important;
      margin: 0 auto !important; /* Remove top offset for perfect centering */
      display: block !important;
  }
  .bg-white { background-color: white !important; }
  .tbm-page-container { margin: 0 !important; padding: 0 !important; border: none !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}

@media screen {
  .no-print {
      font-family: "맑은 고딕", sans-serif;
  }
}

td {
    empty-cells: show !important;
    white-space: nowrap;
    overflow: hidden;
}

.absent-cell {
    overflow: visible !important;
    white-space: normal !important;
    word-wrap: break-word !important;
}

/* Excel-exported styles moved here for component use */
.xl129,.xl130,.xl131,.xl132,.xl133,.xl134,.xl135,.xl136,.xl137,.xl138,.xl139,.xl140,.xl141,.xl142,.xl143,.xl144,.xl145,.xl146,.xl154,.xl155,.xl157,.xl159,.xl161,.xl163,.xl165,.xl167,.xl168,.xl169,.xl181,.xl183,.xl186,.xl190,.xl198,.xl201,.xl203,.xl205,.xl206,.xl207,.xl209,.xl211,.xl215,.xl217,.xl218,.xl224,.xl226,.xl227,.xl229,.xl231,.xl237,.xl242,.xl246,.xl250,.xl252,.xl253,.xl254,.xl257,.xl259,.xl261,.xl263,.xl267,.xl268,.xl274,.xl280,.xl286,.xl287,.xl292,.xl295 {
    font-family: "맑은 고딕", sans-serif;
    border: .5pt solid windowtext;
}
.xl224 { font-size: 20pt; font-weight: 700; border: none; }
.xl226,.xl253,.xl267,.xl252,.xl295,.xl137,.xl138,.xl139,.xl142,.xl146,.xl168,.xl163,.xl165 { font-weight: 700; background: #e2e2e2; text-align: center; }
.xl161 { font-weight: 700; background: #e2e2e2; text-align: left; padding-left: 10pt; }
.xl227,.xl263 { border-bottom: 1.0pt solid windowtext !important; }

/* Custom overrides for roster readability */
.xl140 { 
    white-space: normal !important; 
    line-height: 1.1 !important; 
    text-align: center !important; 
    vertical-align: middle !important; 
    font-size: 10pt !important;
}
.xl141 { 
    text-align: center !important; 
    vertical-align: middle !important; 
}
.xl242, .xl246, .xl190, .xl257, .xl231, .xl186, .xl181, .xl259, .xl261, .xl183, .xl205, .xl287, .xl134, .xl135, .xl133, .xl169, .xl206, .xl207, .xl286, .xl292, .xl252, .xl218, .xl201, .xl203, .xl211, .xl227, .xl263, .xl224, .xl268 {
    white-space: normal !important;
    text-align: center !important;
    vertical-align: middle !important;
    line-height: 1.2 !important;
}
.safety-content, .xl167, .xl157, .xl155, .xl159, .xl154 {
    white-space: normal !important;
    text-align: left !important;
    vertical-align: top !important;
    line-height: 1.6 !important;
    padding: 6pt 8pt !important;
}
.header-shade-center {
    background-color: #e2e2e2 !important;
    text-align: center !important;
    vertical-align: middle !important;
    font-weight: 700 !important;
}
.header-value-center {
    text-align: center !important;
    vertical-align: middle !important;
}
`;

interface TbmContainerProps {
    children: React.ReactNode;
}

const TbmContainer: React.FC<TbmContainerProps> = ({ children }) => {
    return (
        <div className="flex flex-col bg-transparent print:p-0 print:m-0 print:bg-white" suppressHydrationWarning>
            <div className="overflow-x-auto print:m-0 print:p-0 print:overflow-visible print:block print:w-full">
                <div className="tbm-page-wrapper inline-block min-w-full align-middle pl-[12px] print:p-0 print:m-0 print:min-w-0">
                    <style dangerouslySetInnerHTML={{ __html: tbmStyles }} />
                    <div className="tbm-page-container bg-white shadow-sm print:shadow-none print:bg-transparent">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TbmContainer;

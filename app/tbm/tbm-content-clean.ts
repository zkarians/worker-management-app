export const tbmTemplate = `<table border=0 cellpadding=0 cellspacing=0 width=1106 style='border-collapse:
 collapse;table-layout:fixed;width:825pt'>
 <col class=xl129 width=44 style='width:33pt'>
 <col class=xl129 width=59 span=2 style='width:44pt'>
 <col class=xl131 width=59 span=2 style='width:44pt'>
 <col class=xl130 width=59 span=4 style='width:44pt'>
 <col class=xl129 width=59 span=4 style='width:44pt'>
 <col class=xl129 width=59 style='width:44pt'>
 <col class=xl129 width=59 style='width:44pt'>
 <col class=xl132 width=59 span=4 style='width:44pt'>
 <tr height=40 style='height:30.0pt'>
  <td colspan=15 rowspan=3 height=71 class=xl224 width=870 style='border-bottom:
  1.0pt solid black;height:53.25pt;width:649pt;text-align:center'>일별 작업 계획서(차량계) 및 TBM 일지</td>
  <td rowspan=5 class=xl218 width=59 style='border-bottom:1.0pt solid black;
  width:44pt'>결재</td>
  <td rowspan=3 class=xl201 width=59 style='width:44pt'>작성</td>
  <td colspan=2 rowspan=3 class=xl201 width=118 style='border-right:1.0pt solid black;
  width:88pt'>승인</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=3 height=33 class=xl226 style='height:24.95pt'>작 업 일 자</td>
  <td colspan=4 class=xl217 width=236 style='border-left:none;width:176pt'>{{DATE}}</td>
  <td class=xl136 width=59 style='width:44pt'>날씨:</td>
  <td colspan=3 class=xl215 width=177 style='border-right:.5pt solid black;
  width:132pt'>{{WEATHER}}</td>
  <td colspan=2 class=xl201>작업시간</td>
  <td colspan=2 class=xl201 style='border-left:none'>19:00~04:00</td>
  <td rowspan=2 class=xl203 style='border-bottom:1.0pt solid black;border-top:
  none'>　</td>
  <td colspan=2 rowspan=2 class=xl211 style='border-right:1.0pt solid black;
  border-bottom:1.0pt solid black'>　</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=3 height=33 class=xl253 style='height:24.95pt'>작 업 장 소</td>
  <td colspan=8 class=xl203 style='border-left:none'>경남 창원시 진해구 신항7로6, 동방웅동물류센터
  내&nbsp;</td>
  <td colspan=2 class=xl203 style='border-left:none'>교육장소</td>
  <td colspan=2 class=xl203 style='border-left:none'>A동 식당</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=3 height=33 class=xl253 style='height:24.95pt'>지게차 속도, 중량</td>
  <td colspan=5 class=xl250 style='border-left:none'>사내 5km/h, 사외 10km/h이내, 3톤
  미만</td>
  <td colspan=2 class=xl203 style='border-left:none'>작업장</td>
  <td colspan=5 class=xl207 style='border-right:1.0pt solid black;border-left:
  none'>강화콘크리트, 평지 / 대지면적: 20,937㎡</td>
  <td colspan=2 rowspan=2 class=xl227 style='border-bottom:1.0pt solid black !important'>작업지휘자</td>
  <td colspan=2 rowspan=2 class=xl263 width=118 style='border-right:1.0pt solid black !important;
  border-bottom:1.0pt solid black !important;width:88pt'>출하: 팀별 검수</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=3 height=33 class=xl267 style='height:24.95pt'>작&nbsp;업&nbsp;내&nbsp;용</td>
  <td colspan=5 class=xl209 style='border-left:none'>&nbsp;컨테이너 적/출입 작업</td>
  <td colspan=2 class=xl229 style='border-left:none'>작업종류</td>
  <td colspan=5 class=xl209 style='border-right:1.0pt solid black;border-left:
  none'>LG 냉장고, 식기, 컴프레샤, 세탁기</td>
 </tr>
</table>
<div style="height: 2px;"></div>
<table border=0 cellpadding=0 cellspacing=0 width=1106 style='border-collapse: collapse;table-layout:fixed;width:825pt'>
 <col class=xl129 width=44 style='width:33pt'>
 <col class=xl129 width=59 span=2 style='width:44pt'>
 <col class=xl131 width=59 span=2 style='width:44pt'>
 <col class=xl130 width=59 span=4 style='width:44pt'>
 <col class=xl129 width=59 span=4 style='width:44pt'>
 <col class=xl129 width=59 style='width:44pt'>
 <col class=xl129 width=59 style='width:44pt'>
 <col class=xl132 width=59 span=4 style='width:44pt'>

 <tr height=35 style='height:26.25pt'>
  <td rowspan=5 height=199 class=xl295 style='border-bottom:1.0pt solid black;
  height:149.25pt'>출하</td>
  <td class=xl137 style='border-left:none'>구분</td>
  <td class=xl137 style='border-left:none'>소속</td>
  <td class=xl137 style='border-left:none'>이름</td>
  <td class=xl138 style='border-left:none'>소속</td>
  <td class=xl138 style='border-left:none'>이름</td>
  <td class=xl137 style='border-left:none'>소속</td>
  <td class=xl137 style='border-left:none'>이름</td>
  <td class=xl137 style='border-left:none'>소속</td>
  <td class=xl137 style='border-left:none'>이름</td>
  <td class=xl137 style='border-left:none'>소속</td>
  <td class=xl137 style='border-left:none'>이름</td>
  <td class=xl138 style='border-left:none'>소속</td>
  <td class=xl138 style='border-left:none'>이름</td>
  <td class=xl138 style='border-left:none'>소속</td>
  <td class=xl138 style='border-left:none'>이름</td>
  <td colspan=3 rowspan=3 class="xl274 absent-cell" width=177 style='border-top:1.0pt solid black;border-right:1.0pt solid black;
  border-bottom:.5pt solid black;width:132pt;vertical-align:top;padding-top:4pt;'>
   <div style="width: 100%; white-space: normal !important; word-break: break-all !important; overflow: hidden;">
    결근:<br/>{{ABSENT_LIST}}
   </div>
  </td>
 </tr>
 <tr height=41 style='height:30.75pt'>
  <td height=41 class=xl139 width=59 style='height:30.75pt;width:44pt'>검수</td>
  <td class=xl140 width=59 style='border-left:none;width:44pt'>{{INSPECTION_AFFIL_0}}</td>
  <td class=xl141 width=59 style='border-left:none;width:44pt'>{{INSPECTION_NAME_0}}</td>
  <td class=xl140 width=59 style='border-left:none;width:44pt'>{{INSPECTION_AFFIL_1}}</td>
  <td class=xl141 width=59 style='border-left:none;width:44pt'>{{INSPECTION_NAME_1}}</td>
  <td class=xl140 width=59 style='border-left:none;width:44pt'>{{INSPECTION_AFFIL_2}}</td>
  <td class=xl141 width=59 style='border-left:none;width:44pt'>{{INSPECTION_NAME_2}}</td>
  <td class=xl140 width=59 style='border-left:none;width:44pt'>{{INSPECTION_AFFIL_3}}</td>
  <td class=xl141 width=59 style='border-left:none;width:44pt'>{{INSPECTION_NAME_3}}</td>
  <td class=xl140 width=59 style='border-left:none;width:44pt'>{{INSPECTION_AFFIL_4}}</td>
  <td class=xl141 width=59 style='border-left:none;width:44pt'>{{INSPECTION_NAME_4}}</td>
  <td class=xl140 width=59 style='border-left:none;width:44pt'>{{INSPECTION_AFFIL_5}}</td>
  <td class=xl141 width=59 style='border-left:none;width:44pt'>{{INSPECTION_NAME_5}}</td>
  <td class=xl140 width=59 style='border-left:none;width:44pt'>{{INSPECTION_AFFIL_6}}</td>
  <td class=xl141 width=59 style='border-left:none;width:44pt'>{{INSPECTION_NAME_6}}</td>
 </tr>
 <tr height=41 style='height:30.75pt'>
  <td height=41 class=xl142 width=59 style='height:30.75pt;width:44pt'>클램프</td>
  <td class=xl143 style='border-left:none'>{{CLAMP_AFFIL_0}}</td>
  <td class=xl144 style='border-left:none'>{{CLAMP_NAME_0}}</td>
  <td class=xl143 style='border-left:none'>{{CLAMP_AFFIL_1}}</td>
  <td class=xl144 style='border-left:none'>{{CLAMP_NAME_1}}</td>
  <td class=xl145 width=59 style='border-left:none;width:44pt'>{{CLAMP_AFFIL_2}}</td>
  <td class=xl144 style='border-left:none'>{{CLAMP_NAME_2}}</td>
  <td class=xl140 width=59 style='border-top:none;border-left:none;width:44pt'>{{CLAMP_AFFIL_3}}</td>
  <td class=xl141 width=59 style='border-top:none;border-left:none;width:44pt'>{{CLAMP_NAME_3}}</td>
  <td class=xl140 width=59 style='border-top:none;border-left:none;width:44pt'>{{CLAMP_AFFIL_4}}</td>
  <td class=xl144 style='border-left:none'>{{CLAMP_NAME_4}}</td>
  <td class=xl140 width=59 style='border-top:none;border-left:none;width:44pt'>{{CLAMP_AFFIL_5}}</td>
  <td class=xl150 style='border-top:none;border-left:none'>{{CLAMP_NAME_5}}</td>
  <td class=xl140 width=59 style='border-left:none;width:44pt'>{{CLAMP_AFFIL_6}}</td>
  <td class=xl141 width=59 style='border-left:none;width:44pt'>{{CLAMP_NAME_6}}</td>
 </tr>
 <tr height=41 style='height:30.75pt'>
  <td height=41 class=xl139 width=59 style='height:30.75pt;border-top:none;
  width:44pt'>포크</td>
  <td class=xl140 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_AFFIL_0}}</td>
  <td class=xl141 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_NAME_0}}</td>
  <td class=xl140 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_AFFIL_1}}</td>
  <td class=xl141 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_NAME_1}}</td>
  <td class=xl140 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_AFFIL_2}}</td>
  <td class=xl141 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_NAME_2}}</td>
  <td class=xl140 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_AFFIL_3}}</td>
  <td class=xl141 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_NAME_3}}</td>
  <td class=xl140 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_AFFIL_4}}</td>
  <td class=xl141 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_NAME_4}}</td>
  <td class=xl140 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_AFFIL_5}}</td>
  <td class=xl141 width=59 style='border-top:none;border-left:none;width:44pt'>{{FORK_NAME_5}}</td>
  <td class=xl140 width=59 style='border-left:none;width:44pt'>{{FORK_AFFIL_6}}</td>
  <td class=xl141 width=59 style='border-left:none;width:44pt'>{{FORK_NAME_6}}</td>
  <td colspan=3 rowspan=2 class=xl280 width=177 style='border-right:1.0pt solid black;
  border-left:none;width:132pt'>비고:</td>
 </tr>
 <tr height=41 style='height:30.75pt'>
  <td height=41 class=xl146 width=59 style='height:30.75pt;border-top:none;
  width:44pt'>검수<br />
    보조</td>
  <td class=xl147 style='border-top:none;border-left:none'>{{SUPPORT_AFFIL_0}}</td>
  <td class=xl148 style='border-top:none;border-left:none'>{{SUPPORT_NAME_0}}</td>
  <td class=xl147 style='border-top:none;border-left:none'>{{SUPPORT_AFFIL_1}}</td>
  <td class=xl148 style='border-top:none;border-left:none'>{{SUPPORT_NAME_1}}</td>
  <td class=xl147 style='border-top:none;border-left:none'>{{SUPPORT_AFFIL_2}}</td>
  <td class=xl148 style='border-top:none;border-left:none'>{{SUPPORT_NAME_2}}</td>
  <td class=xl147 style='border-top:none;border-left:none'>{{SUPPORT_AFFIL_3}}</td>
  <td class=xl148 style='border-top:none;border-left:none'>{{SUPPORT_NAME_3}}</td>
  <td class=xl147 style='border-top:none;border-left:none'>{{SUPPORT_AFFIL_4}}</td>
  <td class=xl148 style='border-top:none;border-left:none'>{{SUPPORT_NAME_4}}</td>
  <td class=xl147 style='border-top:none;border-left:none'>{{SUPPORT_AFFIL_5}}</td>
  <td class=xl148 style='border-top:none;border-left:none'>{{SUPPORT_NAME_5}}</td>
  <td class=xl147 style='border-top:none;border-left:none'>{{SUPPORT_AFFIL_6}}</td>
  <td class=xl148 style='border-top:none;border-left:none'>{{SUPPORT_NAME_6}}</td>
 </tr>
</table>
<div style="height: 2px;"></div>
<table border=0 cellpadding=0 cellspacing=0 width=1106 style='border-collapse: collapse;table-layout:fixed;width:825pt'>
 <col class=xl129 width=44 style='width:33pt'>
 <col class=xl129 width=59 span=2 style='width:44pt'>
 <col class=xl131 width=59 span=2 style='width:44pt'>
 <col class=xl130 width=59 span=4 style='width:44pt'>
 <col class=xl129 width=59 span=4 style='width:44pt'>
 <col class=xl129 width=59 style='width:44pt'>
 <col class=xl129 width=59 style='width:44pt'>
 <col class=xl132 width=59 span=4 style='width:44pt'>

 <tr height=33 style='height:24.95pt'>
  <td colspan=2 height=33 class=xl252 style='height:24.95pt'>작업구분</td>
  <td colspan=3 class=xl205 style='border-left:none'>화물의 종류</td>
  <td colspan=4 class=xl205 style='border-left:none'>작업내용</td>
  <td colspan=3 class=xl292 style='border-right:.5pt solid black'>※ 금일 안전교육 내용</td>
  <td colspan=2 class=xl287 style='border-right:.5pt solid black'>교육일시</td>
  <td colspan=2 class=xl287 style='border-right:.5pt solid black'>19:00~19:30</td>
  <td class=xl134>장소</td>
  <td colspan=2 class=xl287 style='border-right:1.0pt solid black;border-left:
  none'>A동 식당</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td rowspan=2 height=66 class=xl268 style='border-bottom:1.0pt solid black;
  height:49.9pt'>출하</td>
  <td class=xl135 style='border-left:none'>20FT</td>
  <td colspan=3 class=xl207 style='border-left:none'>냉장고,식기,컴프레샤</td>
  <td colspan=4 class=xl259 width=236 style='border-left:none;width:176pt'>팔레트
  적출 및 컨테이너 반입 작업</td>
  <td colspan=10 class=xl254 style='border-right:1.0pt solid black'>1. 식기세척기
  작업중 공박스 장입시 클램프 작업방법 교육</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td height=33 class=xl133 style='height:24.95pt;border-top:none;border-left:
  none'>40FT</td>
  <td colspan=3 class=xl286 style='border-left:none'>냉장고,식기,컴프레샤</td>
  <td colspan=4 class=xl261 width=236 style='border-left:none;width:176pt'>팔레트
  적출 및 컨테이너 반입 작업</td>
  <td colspan=10 class=xl254 style='border-right:1.0pt solid black'>2. PDA사용후
  반납 및 제자리에 두기, 작업공간, 지게차내 두고 내리지말것</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=2 height=33 class=xl252 style='height:24.95pt'>구 분</td>
  <td colspan=7 class=xl257 width=413 style='border-left:none;width:308pt'>안&nbsp;전&nbsp;점&nbsp;검&nbsp;내&nbsp;용</td>
  <td colspan=10 class=xl237 style='border-right:1.0pt solid black'>3. 실리카겔
  가져올시 포대사진 및 수량 보고할것</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=2 rowspan=4 height=132 class=xl231 style='border-right:.5pt solid black;
  border-bottom:.5pt solid black;height:99.8pt'>화물의상태</td>
  <td colspan=7 class=xl183 width=413 style='border-right:.5pt solid black;
  width:308pt'>화물의 중량은 지게차의 정격하중을 초과하지 않을 것</td>
  <td colspan=2 rowspan=2 class=xl242 width=118 style='border-right:.5pt solid black;
  border-bottom:.5pt solid black;width:88pt'>작업전 안전 교육</td>
  <td colspan=8 class=xl206 style='border-right:1.0pt solid black;border-left:
  none'>화물 입출하 작업시 차량간 사고 및 작업자 간 부딪힘&nbsp;</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=7 height=33 class=xl183 width=413 style='border-right:.5pt solid black;
  height:24.95pt;width:308pt'>화물이 운전자의 시야를 방해 않도록 후진 이동 할 것</td>
  <td colspan=8 class=xl169 style='border-right:1.0pt solid black'>온열기구 사용법 및
  화재예방 안전수칙</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=7 height=33 class=xl183 width=413 style='border-right:.5pt solid black;
  height:24.95pt;width:308pt'>인체에 위험한 화물 시 위험성에 대한 교육을 실시 할 것</td>
  <td colspan=2 rowspan=2 class=xl246 width=118 style='border-right:.5pt solid black;
  border-bottom:.5pt solid black;width:88pt'>작업자<br />
    지게차 면허 필수</td>
  <td colspan=3 class=xl169 style='border-right:.5pt solid black'>안전장구(모, 화,
  장갑) 착용</td>
  <td colspan=5 class=xl183 width=295 style='border-right:1.0pt solid black;
  border-left:none;width:220pt'>위험요소 여부(위험성평가 숙지 여부)</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=7 height=33 class=xl183 width=413 style='border-right:.5pt solid black;
  height:24.95pt;width:308pt'>붕괴, 전도, 낙하 위험이 있는 화물을 견고하게 묶을 것</td>
  <td colspan=3 class=xl169 style='border-right:.5pt solid black'>음주시 근무 부적격</td>
  <td colspan=5 class=xl169 style='border-right:1.0pt solid black;border-left:
  none'>건강 이상 시 부적합 근무(조퇴 할 것)</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=2 rowspan=2 height=66 class=xl186 width=103 style='border-right:
  .5pt solid black;border-bottom:.5pt solid black;height:49.9pt;width:77pt'>작업장의
  상태</td>
  <td colspan=7 class=xl183 width=413 style='border-right:.5pt solid black;
  width:308pt'>통행로 확보(폭 1.2m) 및 장애물 있을 시 정리 정돈 할 것</td>
  <td colspan=2 rowspan=2 class=xl190 width=118 style='border-right:.5pt solid black;
  border-bottom:.5pt solid black;width:88pt'>지게차 작동 점검</td>
  <td colspan=8 class=xl169 style='border-right:1.0pt solid black'>작업 개시 전 지게차
  안전점검 실시 후 체크리스트 작성</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=7 height=33 class=xl183 width=413 style='border-right:.5pt solid black;
  height:24.95pt;width:308pt'>지면이 평평하지는 못하나 수리를 하고 있고 붕괴위험 없음</td>
  <td colspan=8 class=xl169 style='border-right:1.0pt solid black'>월1회 정기점검
  실시결과 하여 양호할 것</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=2 height=33 class=xl181 width=103 style='border-right:.5pt solid black;
  height:24.95pt;width:77pt'>위험성평가</td>
  <td colspan=17 class=xl198 width=1003 style='border-right:1.0pt solid black;
  border-left:none;width:748pt'>바닥꺼짐으로 차량전도 및 제품 낙하 가능성 있음(바닥 보수 공사 중), 우천시 천장
  비샘(수시로 점검중)</td>
 </tr>
 <tr height=33 style='height:24.95pt'>
  <td colspan=19 height=33 class=xl161 style='height:24.95pt;border-top:1.0pt solid black;text-align:left;padding-left:10pt'>1. 물류창고 안전작업 수칙(중량물 포함)</td>
 </tr>
 <tr height=168 style='height:126.0pt'>
  <td colspan=8 style='border-top:none;border-left:1.0pt solid black;border-right:none;border-bottom:1.0pt solid black;padding:4pt 6pt;vertical-align:top;font-size:9pt;font-family:"맑은 고딕",sans-serif'>
    <div style="margin-bottom: 2px;">○ <font class="font18">지정된 담당자 외 운전을 금지. (지게차 키 함에 보관 및 관리)</font></div>
    <div style="margin-bottom: 2px;">○ 지정된 유도자를 배치하고 신호에 따라 운전한다.</div>
    <div style="margin-bottom: 2px;">○ 중량물을 매달아 둔 채 운전자는 이탈하지 않는다.</div>
    <div style="margin-bottom: 2px;">○ 작업 전 안전장치, 와이어로프 등 안전점검을 실시한다.</div>
    <div style="margin-bottom: 2px;">○ 운전 중에 청소, 점검, 주유 등을 하지 않는다.</div>
    <div style="margin-bottom: 2px;">○ <font class="font18">주변 작업자 및 물체에 주의하여 운행한다.</font></div>
    <div style="margin-bottom: 2px;">○ 작업구역 내 타작업자의 출입을 금지한다.</div>
    <div style="margin-bottom: 2px;">○ <font class="font18">중량물의 형상, 크기, 무게에 맞는 밴딩을 한다.</font></div>
    <div style="margin-bottom: 2px;">○ <font class="font18">운전자 시야불량, 운전미숙, 과속에 의한 충돌 방지한다.</font></div>
    <div>○ 주행, 상하 이동 시 천천히 운행할 것</div>
  </td>
  <td colspan=11 style='border-top:none;border-left:none;border-right:1.0pt solid black;border-bottom:1.0pt solid black;padding:4pt 6pt;vertical-align:top;font-size:9pt;font-family:"맑은 고딕",sans-serif'>
    <div style="margin-bottom: 2px;">○ <font class="font18">경사면 또는 무게중심 상승 상태에서 급선회에 의한 전도 예방한다.</font></div>
    <div style="margin-bottom: 2px;">○ 안전검사 대상인 경우 주기에 맞추어 검사를 실시하도록 하며 검사합격 표시를 눈에 잘 보이는 장소에 부착한다.</div>
    <div style="margin-bottom: 2px;">○ <font class="font18">이동 시 진행방향의 주변 작업자 돌출물 상태를 확인할 것.(후진 이동 동일)</font></div>
    <div style="margin-bottom: 2px;">○ 급출발, 급정지, 급선회시키지 않도록 할 것.</div>
    <div style="margin-bottom: 2px;">○ <font class="font18">작업에 적합한 안전모를 지급하고 턱근을 조여 안전하게 착용한다.</font></div>
    <div style="margin-bottom: 2px;">○ 적재하중을 초과하는 하중을 걸어서 사용하지 않도록 한다.</div>
    <div style="margin-bottom: 2px;">○ 화물과다 적재, 편하중, 지면요철 등에 의한 화물 낙하위험 예방한다.</div>
    <div style="margin-bottom: 2px;">○ 포크를 상승시킨 상태에서 고소작업 중 추락위험</div>
    <div>○ 지게차 주행 전 지게차 점검일지에 따라 제동, 유압 장치 및 각종 표시등 상태를 확인한다.</div>
  </td>
 </tr>
 <tr height=22 style='height:16.5pt'>
  <td colspan=19 rowspan=2 height=44 class=xl161 style='border-bottom:1.0pt solid black;
  height:33.0pt'>2. 사업주 및 근로자 준수사항(예방 활동)</td>
 </tr>
 <tr height=27 style='height:20.25pt'>
  <td colspan=2 height=27 class=xl168 style='height:20.25pt'>재해형태</td>
  <td colspan=8 class=xl163 style='border-left:none'>사업주(관리감독자) 조치사항</td>
  <td colspan=9 class=xl163 style='border-right:1.0pt solid black;border-left:
  none'>근로자 준수사항</td>
 </tr>
 <tr height=22 style='height:16.5pt'>
  <td colspan=2 rowspan=5 height=110 class=xl165 style='height:82.5pt'>충돌</td>
  <td colspan=8 rowspan=5 class=xl167 width=472 style='width:352pt'>1. 지게차 전용통로
  확보<br />
    2. 지게차 제한 속도를 지정하고 해당 운행구간에 표지판 부착<br />
    3. 교차로 등 사각지대 반사경 설치 또는 일시 정지 및 양보 운전<br />
    4. 지게차 관리전담자 지정 및 키관리<br />
    5. 무자격자 운전금지</td>
  <td colspan=9 rowspan=5 class=xl157 width=531 style='border-right:1.0pt solid black;
  width:396pt'><font class="font19">1. 통로구간 운행준수</font><font class="font9"><br
  />
    2. 운행구간별 제한속도 준수<br />
    3. 지게차 주행시 전조등 및 후미등 점등<br />
    4. 지게차 전담자 이외의자 운전금지<br />
    </font></td>
 </tr>
 <tr height=22 style='height:16.5pt'>
  <td colspan=2 rowspan=4 height=88 class=xl165 style='height:66.0pt'>협착</td>
  <td colspan=8 rowspan=4 class=xl167 width=472 style='width:352pt'>1. 불안전한
  화물적재 금지 및 시야 확보가 가능토록 적재<br />
    2. 안전벨트 부착</td>
  <td colspan=9 rowspan=4 class=xl155 width=531 style='border-right:1.0pt solid black;
  width:396pt'>1. 포크에 화물을 매달은 상태에서 주행(급선회)금지<br />
    2. 화물 과다 적재 후 시야 확보 시까지 포크를 상승시킨 후<br />
    &nbsp;주행금지<br />
    3. 안전벨트 착용</td>
 </tr>
 <tr height=22 style='height:16.5pt'>
  <td colspan=2 rowspan=2 height=44 class=xl165 style='height:33.0pt'>낙하</td>
  <td colspan=8 rowspan=2 class=xl167 width=472 style='width:352pt'>1. 화물적재
  상태확인<br />
    2. 마모가 심한 타이어 교체</td>
  <td colspan=9 rowspan=2 class=xl159 style='border-right:1.0pt solid black'>화물
  과다적재 및 편하중 적재금지</td>
 </tr>
 <tr height=22 style='height:16.5pt'>
  <td colspan=2 rowspan=2 height=44 class=xl165 style='height:33.0pt'>추락</td>
  <td colspan=8 rowspan=2 class=xl167 width=472 style='width:352pt'>1. 지게차를 이용한
  고소작업 금지(난간이 부착된 운반구 가능)<br />
    2. 도크 작업시 가용가동범위 표시 및 교육(추락방지)</td>
  <td colspan=9 rowspan=2 class=xl155 width=531 style='border-right:1.0pt solid black;
  width:396pt'>1. 안전난간이 부착된 전용운반구 사용시에만 고소작업실시<br />
    2. 승차석 외 탑승금지</td>
 </tr>
 <tr height=22 style='height:16.5pt'>
  <td colspan=2 rowspan=3 height=66 class=xl165 style='height:49.5pt'>전도</td>
  <td colspan=8 rowspan=3 class=xl167 width=472 style='width:352pt'>1. 작업장 정리
  정돈 철저<br />
    2. 작업장 및 통로에 충분한 조도 확보<br />
    3. 미끄러짐 위험이 있는 장소에 대한 안전조치 및 교육</td>
  <td colspan=9 rowspan=3 class=xl157 width=531 style='border-right:1.0pt solid black;
  width:396pt'>1. 작업 전후 정리정돈<br />
    2. 조도 미확보시 이동식 LED램프 사용<br />
    3. 미끄러짐 방지 안전화 착용 및 안전모 착용</td>
 </tr>
 <tr height=22 style='height:16.5pt'>
  <td colspan=2 rowspan=2 height=44 class=xl165 style='height:33.0pt'>붕괴</td>
  <td colspan=8 rowspan=2 class=xl154>화물 적재 시 편하중 되지 않도록 교육</td>
  <td colspan=9 rowspan=2 class=xl159 style='border-right:1.0pt solid black'>화물
  무게중심 확인 및 작업자 위험구간 접근통제</td>
 </tr>
</table>`;
export const tbmStyles = `@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100vh !important;
      width: 100vw !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      overflow: auto !important;
  }
  body > div, body > div > div, body > div > div > div {
      height: 100% !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      border: none !important;
      box-shadow: none !important;
  }
  .no-print { display: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important; }
  .tbm-page-wrapper {
      width: 1122px !important;
      height: max-content !important;
      zoom: 0.67 !important; /* Scaled down to prevent horizontal cutoff */
      margin: 0 auto !important;
      padding: 0 !important;
      padding-left: 12px !important; /* Shaded to the right slightly for pure centering */
      display: block !important;
      page-break-inside: avoid !important;
      page-break-after: avoid !important;
  }
  .tbm-page-wrapper > div {
      display: block !important;
      width: 100% !important;
  }
  td {
      height: auto !important;
  }
} @media screen { .no-print { font-family:"맑은 고딕", sans-serif; } } td { empty-cells: show !important; white-space: nowrap; overflow: hidden; } .absent-cell { overflow: visible !important; white-space: normal !important; word-wrap: break-word !important; }

v\:* {behavior:url(#default#VML);}
o\:* {behavior:url(#default#VML);}
x\:* {behavior:url(#default#VML);}
.shape {behavior:url(#default#VML);}


<!--table
	{mso-displayed-decimal-separator:"\.";
	mso-displayed-thousand-separator:"\,";}
@page
	{margin:0in 0in 0in 0in;
	mso-header-margin:0in;
	mso-footer-margin:0in;
	mso-horizontal-page-align:center;
	mso-vertical-page-align:center;}
ruby
	{ruby-align:left;}
rt
	{color:windowtext;
	font-size:8.0pt;
	font-weight:400;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", sans-serif;
	mso-font-charset:129;
	mso-char-type:none;
	display:none;}
-->


tr
	{mso-height-source:auto;
	mso-ruby-visibility:none;}
col
	{mso-width-source:auto;
	mso-ruby-visibility:none;}
br
	{mso-data-placement:same-cell;}
ruby
	{ruby-align:left;}
.style0
	{mso-number-format:General;
	text-align:general;
	vertical-align:bottom;
	white-space:nowrap;
	mso-rotate:0;
	mso-background-source:auto;
	mso-pattern:auto;
	color:windowtext;
	font-size:11.0pt;
	font-weight:400;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", sans-serif;
	mso-font-charset:129;
	border:none !important;
	mso-protection:locked visible;
	mso-style-name:표준;
	mso-style-id:0;}
.style79
	{mso-number-format:General;
	text-align:general;
	vertical-align:middle;
	white-space:nowrap;
	mso-rotate:0;
	mso-background-source:auto;
	mso-pattern:auto;
	color:black;
	font-size:11.0pt;
	font-weight:400;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	border:none !important;
	mso-protection:locked visible;
	mso-style-name:"표준 6";}
.font7
	{color:windowtext;
	font-size:11.0pt;
	font-weight:700;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
.font8
	{color:windowtext;
	font-size:10.0pt;
	font-weight:400;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
.font9
	{color:windowtext;
	font-size:11.0pt;
	font-weight:400;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
.font11
	{color:windowtext;
	font-size:8.0pt;
	font-weight:400;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
.font15
	{color:windowtext;
	font-size:10.0pt;
	font-weight:700;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
.font18
	{color:red;
	font-size:11.0pt;
	font-weight:700;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
.font19
	{color:red;
	font-size:11.0pt;
	font-weight:400;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
td
	{mso-style-parent:style0;
	padding:0px;
	mso-ignore:padding;
	color:windowtext;
	font-size:11.0pt;
	font-weight:400;
	font-style:normal;
	text-decoration:none;
	font-family:"맑은 고딕", sans-serif;
	mso-font-charset:129;
	mso-number-format:General;
	text-align:general;
	vertical-align:bottom;
	border:none;
	mso-background-source:auto;
	mso-pattern:auto;
	mso-protection:locked visible;
	white-space:nowrap;
	mso-rotate:0;}

/* Border line fixes */
td { border: .5pt solid windowtext !important; }
td[style*="border-right:1.0pt solid black"] { border-right: 1.0pt solid black !important; }
.xl271, .xl274, .xl280, .xl283 { border-right: 1.0pt solid black !important; border-top: .5pt solid windowtext !important; border-bottom: .5pt solid windowtext !important; }
.xl129
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
.xl130
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
.xl131
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;}
.xl132
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\#\,\#\#0_ ";
	text-align:center;
	vertical-align:middle;}
.xl133
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:none !important;
	border-left:.5pt solid windowtext !important;}
.xl134
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl135
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border:.5pt solid windowtext !important;}
.xl136
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\[ENG\]\[$-F800\]dddd\\\,\\ mmmm\\ dd\\\,\\ yyyy";
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl137
	{mso-style-parent:style0;
	color:black;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl138
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl139
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl140
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl141
	{mso-style-parent:style0;
	color:gray;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl142
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl143
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl144
	{mso-style-parent:style0;
	color:gray;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl145
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl146
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl147
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl148
	{mso-style-parent:style0;
	color:gray;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl149
	{mso-style-parent:style79;
	color:black;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;}
.xl150
	{mso-style-parent:style0;
	color:gray;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border:.5pt solid windowtext !important;}
.xl151
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\#\,\#\#0_ ";
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl152
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\#\,\#\#0_ ";
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl153
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	vertical-align:top;
	border:.5pt solid windowtext !important;}
.xl154
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border:.5pt solid windowtext !important;}
.xl155
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	border:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl156
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl157
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl158
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl159
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border:.5pt solid windowtext !important;}
.xl160
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl161
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:none !important;}
.xl162
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl163
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl164
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl165
	{mso-style-parent:style0;
	font-size:13.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl166
	{mso-style-parent:style0;
	font-size:13.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border:.5pt solid windowtext !important;}
.xl167
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl168
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl169
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl170
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl171
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl172
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl173
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl174
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:none !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl175
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	white-space: nowrap !important;}
.xl176
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl177
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl178
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl179
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:none !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl180
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:none !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl181
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	background:#D9D9D9;
	mso-pattern:black none;
	white-space: nowrap !important;}
.xl182
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;
	background:#D9D9D9;
	mso-pattern:black none;
	white-space: nowrap !important;}
.xl183
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl184
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl185
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl186
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl187
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl188
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl189
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl190
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl191
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl192
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl193
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl194
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl195
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl196
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl197
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl198
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl199
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl200
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl201
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl202
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl203
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border:.5pt solid windowtext !important;}
.xl204
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl205
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl206
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl207
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border:.5pt solid windowtext !important;}
.xl208
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl209
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl210
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl211
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\#\,\#\#0_ ";
	text-align:center;
	vertical-align:middle;
	border:.5pt solid windowtext !important;}
.xl212
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\#\,\#\#0_ ";
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl213
	{mso-style-parent:style0;
	font-size:22.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;}
.xl214
	{mso-style-parent:style0;
	font-size:22.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl215
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\[ENG\]\[$-F800\]dddd\\\,\\ mmmm\\ dd\\\,\\ yyyy";
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl216
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\[ENG\]\[$-F800\]dddd\\\,\\ mmmm\\ dd\\\,\\ yyyy";
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl217
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\[ENG\]\[$-F800\]dddd\\\,\\ mmmm\\ dd\\\,\\ yyyy";
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl218
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	layout-flow:vertical-ideographic;}
.xl219
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	layout-flow:vertical-ideographic;}
.xl220
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	layout-flow:vertical-ideographic;}
.xl221
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl222
	{mso-style-parent:style0;
	font-size:22.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:top;}
.xl223
	{mso-style-parent:style0;
	font-size:22.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:top;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl224
	{mso-style-parent:style0;
	font-size:22.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	text-align:center !important;}
.xl225
	{mso-style-parent:style0;
	font-size:22.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl226
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl227
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl228
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl229
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl230
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:none !important;}
.xl231
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:1.0pt solid windowtext !important;}
.xl232
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;}
.xl233
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:1.0pt solid windowtext !important;}
.xl234
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;}
.xl235
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl236
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl237
	{mso-style-parent:style79;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl238
	{mso-style-parent:style79;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl239
	{mso-style-parent:style79;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl240
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl241
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl242
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl243
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl244
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl245
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl246
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:.5pt solid windowtext !important;
	background:#D9D9D9;
	mso-pattern:black none;
	white-space: nowrap !important;}
.xl247
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;
	background:#D9D9D9;
	mso-pattern:black none;
	white-space: nowrap !important;}
.xl248
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	background:#D9D9D9;
	mso-pattern:black none;
	white-space: nowrap !important;}
.xl249
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	background:#D9D9D9;
	mso-pattern:black none;
	white-space: nowrap !important;}
.xl250
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\@";
	text-align:center;
	vertical-align:middle;
	border:.5pt solid windowtext !important;}
.xl251
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl252
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl253
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl254
	{mso-style-parent:style79;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl255
	{mso-style-parent:style79;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl256
	{mso-style-parent:style79;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl257
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl258
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl259
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl260
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl261
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:none !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl262
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl263
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl264
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl265
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl266
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl267
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl268
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:none !important;
	border-left:1.0pt solid windowtext !important;}
.xl269
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl270
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl271
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl272
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl273
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl274
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl275
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl276
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl277
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl278
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl279
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:none !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl280
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl281
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl282
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl283
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl284
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl285
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl286
	{mso-style-parent:style0;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:none !important;
	border-left:.5pt solid windowtext !important;}
.xl287
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl288
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl289
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl290
	{mso-style-parent:style0;
	font-size:12.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;}
.xl291
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl292
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	background:#BFBFBF;
	mso-pattern:black none;}
.xl293
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	background:#BFBFBF;
	mso-pattern:black none;}
.xl294
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;
	background:#BFBFBF;
	mso-pattern:black none;}
.xl295
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl296
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl297
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"LG Smart_Korean Light", monospace;
	mso-font-charset:129;
	text-align:center;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl298
	{mso-style-parent:style0;
	text-align:center;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl299
	{mso-style-parent:style0;
	text-align:center;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl300
	{mso-style-parent:style0;
	text-align:center;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl301
	{mso-style-parent:style0;
	text-align:center;
	border:.5pt solid windowtext !important;}
.xl302
	{mso-style-parent:style0;
	text-align:center;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl303
	{mso-style-parent:style0;
	text-align:center;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl304
	{mso-style-parent:style0;
	text-align:center;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl305
	{mso-style-parent:style0;
	text-align:center;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl306
	{mso-style-parent:style0;
	text-align:center;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl307
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:top;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;
	white-space: nowrap !important;}
.xl308
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
.xl309
	{mso-style-parent:style0;
	text-align:center;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:1.0pt solid windowtext !important;}
.xl310
	{mso-style-parent:style0;
	text-align:center;
	border-top:1.0pt solid windowtext !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:none !important;}
.xl311
	{mso-style-parent:style0;
	text-align:center;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;}
.xl312
	{mso-style-parent:style0;
	text-align:center;
	border-top:none !important;
	border-right:none !important;
	border-bottom:none !important;
	border-left:1.0pt solid windowtext !important;}
.xl313
	{mso-style-parent:style0;
	text-align:center;}
.xl314
	{mso-style-parent:style0;
	text-align:center;
	border-top:none !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:none !important;
	border-left:none !important;}
.xl315
	{mso-style-parent:style0;
	text-align:center;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl316
	{mso-style-parent:style0;
	text-align:center;
	border-top:none !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl317
	{mso-style-parent:style0;
	text-align:center;
	border-top:none !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl318
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	white-space: nowrap !important;}
.xl319
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl320
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl321
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl322
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl323
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border:.5pt solid windowtext !important;}
.xl324
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl325
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl326
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl327
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;}
.xl328
	{mso-style-parent:style0;
	font-size:10.0pt;
	text-align:left;
	vertical-align:middle;
	white-space: nowrap !important;}
.xl329
	{mso-style-parent:style0;
	font-size:14.0pt;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;}
.xl330
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;}
.xl331
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;
	white-space: nowrap !important;}
.xl332
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	vertical-align:middle;}
.xl333
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl334
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:1.0pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl335
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:1.0pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl336
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl337
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl338
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl339
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;
	white-space: nowrap !important;}
.xl340
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:.5pt solid windowtext !important;
	border-right:.5pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl341
	{mso-style-parent:style0;
	font-size:10.0pt;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:top;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:.5pt solid windowtext !important;
	white-space: nowrap !important;}
.xl342
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl343
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl344
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:1.0pt solid windowtext !important;
	border-left:none !important;}
.xl345
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl346
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl347
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl348
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\@";
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:1.0pt solid windowtext !important;}
.xl349
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\@";
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:none !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}
.xl350
	{mso-style-parent:style0;
	font-weight:700;
	font-family:"맑은 고딕", monospace;
	mso-font-charset:129;
	mso-number-format:"\@";
	text-align:left;
	vertical-align:middle;
	border-top:.5pt solid windowtext !important;
	border-right:1.0pt solid windowtext !important;
	border-bottom:.5pt solid windowtext !important;
	border-left:none !important;}

`;

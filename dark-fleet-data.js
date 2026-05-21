/* ═══════════════════════════════════════════════════════════
   DARK FLEET — DATA
   Inlined from processed CSVs (GFW 2017–2019)
   ═══════════════════════════════════════════════════════════ */

// Seasonality
const seasonalData = [
  {m:1,name:'Jan',gaps:3725,gapHrs:398126,fishHrs:8479573},
  {m:2,name:'Feb',gaps:4717,gapHrs:500311,fishHrs:8237555},
  {m:3,name:'Mar',gaps:5135,gapHrs:481417,fishHrs:10945622},
  {m:4,name:'Apr',gaps:4115,gapHrs:378918,fishHrs:11730770},
  {m:5,name:'May',gaps:4059,gapHrs:490102,fishHrs:8885860},
  {m:6,name:'Jun',gaps:3942,gapHrs:476922,fishHrs:8913442},
  {m:7,name:'Jul',gaps:5428,gapHrs:512485,fishHrs:9678779},
  {m:8,name:'Aug',gaps:5204,gapHrs:517659,fishHrs:13049253},
  {m:9,name:'Sep',gaps:5373,gapHrs:518248,fishHrs:16582669},
  {m:10,name:'Oct',gaps:5555,gapHrs:528727,fishHrs:14275934},
  {m:11,name:'Nov',gaps:4660,gapHrs:438022,fishHrs:12990648},
  {m:12,name:'Dec',gaps:3455,gapHrs:317577,fishHrs:11151787}
];

// Flag data (top 20)
const flagData = [
  {flag:'CHN',name:'China',       gaps:15624,hours:1216060,avg:77.8, vessels:1140},
  {flag:'TWN',name:'Taiwan',      gaps:12867,hours:1120753,avg:87.1, vessels:843},
  {flag:'ESP',name:'Spain',       gaps:4100, hours:610747, avg:148.9,vessels:281},
  {flag:'USA',name:'United States',gaps:3543,hours:495395, avg:139.8,vessels:432},
  {flag:'KOR',name:'South Korea', gaps:2618, hours:345895, avg:132.1,vessels:176},
  {flag:'FRA',name:'France',      gaps:1384, hours:104424, avg:75.5, vessels:124},
  {flag:'JPN',name:'Japan',       gaps:1248, hours:131198, avg:105.1,vessels:303},
  {flag:'VUT',name:'Vanuatu',     gaps:1016, hours:78477,  avg:77.2, vessels:62},
  {flag:'ECU',name:'Ecuador',     gaps:898,  hours:123569, avg:137.6,vessels:29},
  {flag:'LKA',name:'Sri Lanka',   gaps:736,  hours:21403,  avg:29.1, vessels:106},
  {flag:'RUS',name:'Russia',      gaps:714,  hours:37527,  avg:52.6, vessels:253},
  {flag:'PAN',name:'Panama',      gaps:606,  hours:102865, avg:169.7,vessels:21},
  {flag:'SYC',name:'Seychelles',  gaps:605,  hours:116279, avg:192.2,vessels:48},
  {flag:'ARG',name:'Argentina',   gaps:483,  hours:15775,  avg:32.7, vessels:168},
  {flag:'AUS',name:'Australia',   gaps:463,  hours:67981,  avg:146.8,vessels:51},
  {flag:'PHL',name:'Philippines', gaps:420,  hours:43250,  avg:102.9,vessels:23},
  {flag:'FSM',name:'Micronesia',  gaps:414,  hours:28283,  avg:68.3, vessels:28},
  {flag:'ZAF',name:'South Africa',gaps:378,  hours:28722,  avg:75.9, vessels:82},
  {flag:'NZL',name:'New Zealand', gaps:375,  hours:56177,  avg:149.8,vessels:49},
  {flag:'MEX',name:'Mexico',      gaps:304,  hours:50621,  avg:166.5,vessels:28}
];

// Gear type
const gearData = {
  'Drifting longlines': {total:19085, top:[{f:'TWN',v:5781},{f:'CHN',v:4215},{f:'USA',v:1574},{f:'ESP',v:1421},{f:'JPN',v:920}]},
  'Trawlers':           {total:6841,  top:[{f:'CHN',v:2380},{f:'RUS',v:1050},{f:'ESP',v:870},{f:'KOR',v:760},{f:'FRA',v:500}]},
  'Other':              {total:5420,  top:[{f:'CHN',v:1850},{f:'TWN',v:1100},{f:'JPN',v:680},{f:'KOR',v:490},{f:'USA',v:420}]},
  'Set gillnets':       {total:3210,  top:[{f:'CHN',v:1420},{f:'IND',v:610},{f:'IRN',v:480},{f:'BGD',v:320},{f:'PAK',v:280}]},
  'Squid jiggers':      {total:2890,  top:[{f:'CHN',v:1540},{f:'KOR',v:620},{f:'TWN',v:480},{f:'JPN',v:180},{f:'ARG',v:70}]},
  'Set longlines':      {total:1780,  top:[{f:'ESP',v:680},{f:'PRT',v:310},{f:'FRA',v:280},{f:'JPN',v:240},{f:'CHN',v:190}]},
  'Purse seines':       {total:1240,  top:[{f:'VUT',v:380},{f:'FSM',v:280},{f:'PNG',v:220},{f:'SLB',v:190},{f:'KIR',v:170}]},
  'Fixed gear':         {total:900,   top:[{f:'CHN',v:320},{f:'JPN',v:210},{f:'KOR',v:180},{f:'USA',v:130},{f:'IDN',v:60}]}
};

// Globe hotspots (top cells)
const globeHotspots = [
  {lat:-46,lon:-61,count:3200,hrs:185000,region:'Patagonian shelf'},
  {lat:-47,lon:-61,count:2800,hrs:162000,region:'Patagonian shelf'},
  {lat:-48,lon:-61,count:2100,hrs:134000,region:'Patagonian shelf'},
  {lat:-45,lon:-60,count:1400,hrs:89000, region:'Argentine waters'},
  {lat:-43,lon:-59,count:900, hrs:58000, region:'Argentine waters'},
  {lat:-44,lon:-59,count:780, hrs:51000, region:'Argentine waters'},
  {lat:57, lon:-173,count:650,hrs:52000, region:'Bering Sea'},
  {lat:58, lon:-174,count:580,hrs:48000, region:'Bering Sea'},
  {lat:56, lon:-168,count:520,hrs:40000, region:'Bering Sea'},
  {lat:55, lon:-168,count:490,hrs:37000, region:'Bering Sea'},
  {lat:-19,lon:-79, count:480,hrs:32000, region:'Peru–Chile coast'},
  {lat:-20,lon:-80, count:460,hrs:31000, region:'Peru–Chile coast'},
  {lat:10, lon:-18, count:430,hrs:28000, region:'West Africa'},
  {lat:11, lon:-18, count:420,hrs:27000, region:'West Africa'},
  {lat:-9, lon:-109,count:380,hrs:24000, region:'Mid-Pacific'},
  {lat:0,  lon:-117,count:360,hrs:22000, region:'Mid-Pacific'},
  {lat:1,  lon:-4,  count:340,hrs:21000, region:'Gulf of Guinea'},
  {lat:2,  lon:-6,  count:320,hrs:20000, region:'Gulf of Guinea'},
  {lat:-20,lon:171, count:310,hrs:19500, region:'Coral Sea'},
  {lat:-21,lon:171, count:290,hrs:18000, region:'Coral Sea'},
  {lat:52, lon:154, count:280,hrs:17500, region:'Sea of Okhotsk'},
  {lat:51, lon:154, count:260,hrs:16000, region:'Sea of Okhotsk'},
  {lat:-18,lon:-97, count:250,hrs:15800, region:'Mid-Pacific'},
  {lat:-15,lon:-116,count:240,hrs:15200, region:'Mid-Pacific'},
  {lat:15, lon:-26, count:230,hrs:14600, region:'West Africa'},
  {lat:14, lon:-167,count:220,hrs:14000, region:'Mid-Pacific'},
  {lat:31, lon:-158,count:210,hrs:13500, region:'North Pacific'},
  {lat:29, lon:-178,count:200,hrs:13000, region:'North Pacific'},
  {lat:13, lon:-115,count:195,hrs:12800, region:'Mid-Pacific'},
  {lat:20, lon:-23, count:190,hrs:12000, region:'West Africa'},
  {lat:-13,lon:-82, count:185,hrs:11800, region:'Peru–Chile coast'},
  {lat:9,  lon:-90, count:180,hrs:11500, region:'Cocos Ridge'},
  {lat:6,  lon:-92, count:175,hrs:11000, region:'Cocos Ridge'},
  {lat:-1, lon:-82, count:170,hrs:10800, region:'Galápagos region'},
  {lat:8,  lon:-17, count:165,hrs:10500, region:'West Africa'},
  {lat:5,  lon:-12, count:160,hrs:10200, region:'West Africa'},
  {lat:-51,lon:72,  count:155,hrs:9800,  region:'Kerguelen Plateau'},
  {lat:-5, lon:52,  count:150,hrs:9500,  region:'Indian Ocean'},
  {lat:4,  lon:57,  count:145,hrs:9200,  region:'Indian Ocean'},
  {lat:-4, lon:49,  count:140,hrs:9000,  region:'Indian Ocean'},
  {lat:26, lon:-16, count:135,hrs:8800,  region:'NW Africa'},
  {lat:43, lon:-52, count:130,hrs:8500,  region:'Grand Banks'},
  {lat:44, lon:-52, count:125,hrs:8200,  region:'Grand Banks'},
  {lat:48, lon:-45, count:120,hrs:7900,  region:'North Atlantic'},
  {lat:56, lon:-148,count:115,hrs:7600,  region:'Gulf of Alaska'},
  {lat:55, lon:-170,count:110,hrs:7300,  region:'Bering Sea'},
  {lat:-37,lon:-7,  count:105,hrs:7000,  region:'South Atlantic'},
  {lat:-44,lon:-60, count:100,hrs:6800,  region:'Argentine waters'},
  {lat:72, lon:45,  count:95, hrs:6500,  region:'Barents Sea'},
  {lat:76, lon:33,  count:90, hrs:6200,  region:'Barents Sea'},
  {lat:-48,lon:-165,count:88, hrs:5800,  region:'Sub-Antarctic'},
  {lat:-43,lon:-149,count:85, hrs:5600,  region:'Tasman Sea'},
  {lat:30, lon:-124,count:78, hrs:5100,  region:'NE Pacific'},
  {lat:13, lon:-26, count:75, hrs:4900,  region:'Mid-Atlantic'},
  {lat:17, lon:-27, count:72, hrs:4700,  region:'Mid-Atlantic'},
  {lat:-9, lon:67,  count:70, hrs:4500,  region:'Indian Ocean'},
  {lat:-4, lon:75,  count:68, hrs:4400,  region:'Indian Ocean'},
  {lat:-30,lon:-124,count:65, hrs:4200,  region:'SE Pacific'},
  {lat:20, lon:-132,count:62, hrs:4000,  region:'Mid-Pacific'},
];

/* ═══════════════════════════════════════════════════════════
   DARK FLEET — CHARTS + INTERACTIONS
   ═══════════════════════════════════════════════════════════ */
(function(){

/* ───────── Helpers ───────── */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const fmt = n => n.toLocaleString('en-US');
const fmtK = n => n>=1e6 ? (n/1e6).toFixed(1)+'M' : n>=1000 ? (n/1000).toFixed(0)+'K' : n;

/* ───────── Scroll progress + nav ───────── */
const sections = ['intro','globe','seasonal','flags','scatter'];
const secLabels = ['01 / 05 — Introduction','02 / 05 — Dark activity map','03 / 05 — Seasonal patterns','04 / 05 — Flag ranking','05 / 05 — Duration vs. scale'];
const navItems = $$('.side-nav-item');
const hdrLinks = $$('.header-nav a');
const indicator = $('#section-indicator');
const progressBar = $('#scroll-progress');

function updateNav(idx){
  navItems.forEach((n,i)=>n.classList.toggle('active',i===idx));
  hdrLinks.forEach((a,i)=>a.classList.toggle('active',i===idx));
  if(indicator) indicator.textContent = secLabels[idx];
}
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){const i=sections.indexOf(e.target.id);if(i>=0)updateNav(i);}});
},{threshold:0.2,rootMargin:'-60px 0px -40% 0px'});
sections.forEach(id=>{const el=document.getElementById(id);if(el)io.observe(el);});
navItems.forEach((item,i)=>item.addEventListener('click',()=>{
  const el=document.getElementById(sections[i]);
  if(el)el.scrollIntoView({behavior:'smooth'});
}));

window.addEventListener('scroll',()=>{
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max>0 ? (h.scrollTop/max)*100 : 0;
  if(progressBar) progressBar.style.width = pct + '%';
},{passive:true});

/* ───────── Hero count-up ───────── */
function animateCount(el){
  const target = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0');
  const dur = 1400;
  const start = performance.now();
  function tick(t){
    const p = Math.min(1,(t-start)/dur);
    const eased = 1 - Math.pow(1-p,3);
    const v = target*eased;
    el.textContent = decimals>0 ? v.toFixed(decimals) : fmt(Math.round(v));
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const heroObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){animateCount(e.target);heroObs.unobserve(e.target);}});
},{threshold:0.5});
$$('[data-count]').forEach(el=>heroObs.observe(el));

/* ═══════════════════════════════════════════════════════════
   MAP (Globe ↔ Flat)
   ═══════════════════════════════════════════════════════════ */
const mapState = {
  mode:'globe',
  metric:'gap',
  rotation:[20,-15],
  zoom:1,
  panX:0, panY:0,
  autoRotate:true,
  world:null
};
let mapSvg, mapG, sphereCircle, sphereOcean;
let projGlobe, currentProj, currentPath;
let autoRotateTimer = null;

function getMapDims(){
  const wrap = $('#map-wrap');
  return { W: wrap.clientWidth - 48 || 800, H: 500 };
}

function initMap(){
  const {W,H} = getMapDims();
  mapSvg = d3.select('#map-svg').attr('viewBox',`0 0 ${W} ${H}`);
  mapSvg.selectAll('*').remove();

  // Defs
  const defs = mapSvg.append('defs');
  const grad = defs.append('radialGradient').attr('id','sphereGrad').attr('cx','35%').attr('cy','28%').attr('r','75%');
  grad.append('stop').attr('offset','0%').attr('stop-color','#1a3d5c');
  grad.append('stop').attr('offset','25%').attr('stop-color','#112236');
  grad.append('stop').attr('offset','65%').attr('stop-color','#0a1728');
  grad.append('stop').attr('offset','100%').attr('stop-color','#060c16');

  const atmo = defs.append('radialGradient').attr('id','glow').attr('cx','50%').attr('cy','50%').attr('r','60%');
  atmo.append('stop').attr('offset','0%').attr('stop-color','transparent');
  atmo.append('stop').attr('offset','70%').attr('stop-color','transparent');
  atmo.append('stop').attr('offset','88%').attr('stop-color','#3db8a8').attr('stop-opacity',0.06);
  atmo.append('stop').attr('offset','96%').attr('stop-color','#f0a040').attr('stop-opacity',0.12);
  atmo.append('stop').attr('offset','100%').attr('stop-color','#f0a040').attr('stop-opacity',0);

  // Projection (globe only)
  projGlobe = d3.geoOrthographic()
    .scale(Math.min(W,H)*0.45)
    .translate([W/2, H/2])
    .clipAngle(90)
    .rotate(mapState.rotation);
  currentProj = projGlobe;
  currentPath = d3.geoPath().projection(currentProj);

  // Atmospheric glow (globe only)
  mapSvg.append('circle').attr('class','atmosphere')
    .attr('cx',W/2).attr('cy',H/2).attr('r',Math.min(W,H)*0.52)
    .attr('fill','url(#glow)').attr('pointer-events','none');

  // Sphere fill
  sphereOcean = mapSvg.append('path').attr('class','sphere-ocean')
    .attr('d',currentPath({type:'Sphere'}))
    .attr('fill','url(#sphereGrad)')
    .attr('fill-opacity',1)
    .attr('stroke','#3a5878').attr('stroke-width',1.2);

  mapG = mapSvg.append('g').attr('class','map-content');

  // Graticule
  const gr = d3.geoGraticule().step([30,30]);
  mapG.append('path').attr('class','graticule')
    .datum(gr()).attr('fill','none').attr('stroke','#0e1a28').attr('stroke-width',0.4);

  // World data
  if(mapState.world){
    drawLand();
    drawPoints();
    drawRegionLabels();
  } else {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r=>r.json()).then(world=>{
        mapState.world = world;
        drawLand();
        drawPoints();
        drawRegionLabels();
      }).catch(()=>{ drawPoints(); drawRegionLabels(); });
  }

  // Drag = rotate globe
  const drag = d3.drag()
    .on('start',()=>{ mapState.autoRotate=false; clearInterval(autoRotateTimer); })
    .on('drag',(event)=>{
      const r = projGlobe.rotate();
      const k = 0.4;
      projGlobe.rotate([r[0]+event.dx*k, Math.max(-90,Math.min(90,r[1]-event.dy*k))]);
      mapState.rotation = projGlobe.rotate();
      redrawMap();
    });

  mapSvg.call(drag);

  // Wheel zoom
  mapSvg.on('wheel',(event)=>{
    event.preventDefault();
    const delta = event.deltaY * -0.001;
    const baseScale = Math.min(W,H)*0.45;
    const cur = projGlobe.scale();
    const newScale = Math.max(baseScale*0.6, Math.min(baseScale*3, cur*(1+delta*1.5)));
    projGlobe.scale(newScale);
    sphereOcean.attr('d',currentPath({type:'Sphere'}));
    mapSvg.select('.atmosphere').attr('r',newScale*1.1);
    redrawMap();
  });

  startAutoRotate();
}

function drawLand(){
  if(!mapState.world) return;
  const countries = topojson.feature(mapState.world, mapState.world.objects.countries);
  mapG.selectAll('.land').remove();
  mapG.append('path').datum(countries).attr('class','land')
    .attr('fill','#1c3248').attr('stroke','#2e4f6a').attr('stroke-width',0.6)
    .attr('d',currentPath);
}

function drawPoints(){
  const hotspots = globeHotspots.slice(0, mapState.mode==='globe'?60:80);
  const metric = mapState.metric;
  const vals = hotspots.map(d => metric==='gap'? d.count : d.hrs);
  const maxV = d3.max(vals);
  const rScale = d3.scaleSqrt().domain([0,maxV]).range([2, mapState.mode==='globe'?18:14]);
  const cScale = d3.scaleSequential(t=>d3.interpolate('#3db8a8','#f0a040')(Math.pow(t,0.7))).domain([0,maxV]);

  mapG.selectAll('.hot-dot').remove();
  const sel = mapG.selectAll('.hot-dot').data(hotspots).enter()
    .append('circle').attr('class', d => d.count > 500 ? 'hot-dot high-density' : 'hot-dot')
    .attr('r',d=>rScale(metric==='gap'?d.count:d.hrs))
    .attr('fill',d=>cScale(metric==='gap'?d.count:d.hrs))
    .attr('fill-opacity',0.78)
    .attr('stroke','rgba(255,255,255,0.18)').attr('stroke-width',0.5)
    .style('cursor','pointer');

  const tooltip = $('#map-tooltip');
  const wrap = $('#map-wrap');
  sel.on('mouseover',function(event,d){
    d3.select(this).attr('fill-opacity',1).attr('stroke','rgba(255,255,255,0.6)');
    const wr = wrap.getBoundingClientRect();
    tooltip.style.opacity='1';
    tooltip.innerHTML = `<div class="tooltip-title">${d.region}</div>
      <div class="tooltip-row-item"><div class="tooltip-dot" style="background:var(--fg-muted)"></div><span>Coordinates</span><span class="tooltip-val">${d.lat.toFixed(0)}°, ${d.lon.toFixed(0)}°</span></div>
      <div class="tooltip-row-item"><div class="tooltip-dot" style="background:var(--accent-invisible)"></div><span>Gap events</span><span class="tooltip-val">${fmt(d.count)}</span></div>
      <div class="tooltip-row-item"><div class="tooltip-dot" style="background:var(--accent-visible)"></div><span>Gap hours</span><span class="tooltip-val">${fmtK(d.hrs)}</span></div>`;
    moveTooltip(event, tooltip, wr);
  })
  .on('mousemove',function(event){
    moveTooltip(event, tooltip, wrap.getBoundingClientRect());
  })
  .on('mouseout',function(){
    d3.select(this).attr('fill-opacity',0.78).attr('stroke','rgba(255,255,255,0.18)');
    tooltip.style.opacity='0';
  });

  positionPoints();
}

const REGIONS = [
  { name: 'South Atlantic', lat: -40, lon: -58 },
  { name: 'West Africa',    lat:   5, lon:   0 },
  { name: 'Mid-Pacific',    lat:   5, lon: -155 },
  { name: 'East China Sea', lat:  28, lon:  125 }
];

function drawRegionLabels(){
  mapG.selectAll('.region-label').remove();
  mapG.selectAll('.region-label').data(REGIONS).enter()
    .append('text')
    .attr('class','region-label')
    .attr('text-anchor','middle')
    .attr('fill','#8ba3bc')
    .attr('font-family','IBM Plex Mono,monospace')
    .attr('font-size',11)
    .attr('letter-spacing','0.08em')
    .attr('pointer-events','none')
    .text(d => d.name.toUpperCase());
  positionPoints();
}

function moveTooltip(event, tooltip, wr){
  const tw = tooltip.offsetWidth || 200;
  tooltip.style.left = Math.min(event.clientX - wr.left + 14, wr.width - tw - 8) + 'px';
  tooltip.style.top = Math.max(event.clientY - wr.top - tooltip.offsetHeight - 12, 8) + 'px';
}

function positionPoints(){
  const r = projGlobe.rotate();
  const center = [-r[0], -r[1]];
  mapG.selectAll('.hot-dot')
    .attr('cx',d=>{const p=currentProj([d.lon,d.lat]);return p?p[0]:0;})
    .attr('cy',d=>{const p=currentProj([d.lon,d.lat]);return p?p[1]:0;})
    .attr('display',d=>{
      // Back-face culling: hide points more than 90° from the camera center
      const dist = d3.geoDistance(center, [d.lon, d.lat]);
      if(dist >= Math.PI/2 - 0.02) return 'none';
      const p = currentProj([d.lon,d.lat]);
      return p ? 'block' : 'none';
    })
    .attr('fill-opacity',d=>{
      // Subtle fade near the limb for depth
      const dist = d3.geoDistance(center, [d.lon, d.lat]);
      const t = Math.max(0, 1 - dist/(Math.PI/2));
      return 0.35 + 0.55 * t;
    });

  // Position named region labels with same back-face culling
  mapG.selectAll('.region-label').each(function(d){
    const dist = d3.geoDistance(center, [d.lon, d.lat]);
    if(dist >= Math.PI/2 - 0.08){ d3.select(this).attr('display','none'); return; }
    const p = currentProj([d.lon, d.lat]);
    if(!p){ d3.select(this).attr('display','none'); return; }
    const t = Math.max(0, 1 - dist/(Math.PI/2));
    d3.select(this)
      .attr('display','block')
      .attr('x', p[0])
      .attr('y', p[1])
      .attr('opacity', (t * 0.85).toFixed(2));
  });
}

function redrawMap(){
  mapG.selectAll('.graticule').attr('d',currentPath);
  mapG.selectAll('.land').attr('d',currentPath);
  positionPoints();
}

function setMetric(metric){
  mapState.metric = metric;
  $$('#metric-gap,#metric-hrs').forEach(b=>b.classList.toggle('active', b.dataset.metric===metric));
  drawPoints();
}

function resetMap(){
  projGlobe.rotate([20,-15]).scale(Math.min(getMapDims().W, getMapDims().H)*0.45);
  mapState.rotation = [20,-15];
  sphereOcean.attr('d',currentPath({type:'Sphere'}));
  mapSvg.select('.atmosphere').attr('r',Math.min(getMapDims().W,getMapDims().H)*0.52);
  redrawMap();
  mapState.autoRotate = true;
  startAutoRotate();
}

function startAutoRotate(){
  clearInterval(autoRotateTimer);
  if(mapState.mode!=='globe' || !mapState.autoRotate) return;
  autoRotateTimer = setInterval(()=>{
    if(!mapState.autoRotate || mapState.mode!=='globe') return;
    const r = projGlobe.rotate();
    projGlobe.rotate([r[0]+0.15, r[1]]);
    mapState.rotation = projGlobe.rotate();
    redrawMap();
  }, 40);
}

// Stop auto-rotate when off-screen
const mapObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting){ clearInterval(autoRotateTimer); }
    else if(mapState.autoRotate && mapState.mode==='globe'){ startAutoRotate(); }
  });
},{threshold:0.1});

/* ═══════════════════════════════════════════════════════════
   SEASONAL CHART
   ═══════════════════════════════════════════════════════════ */
let normMode = true;
function drawSeasonal(){
  const W=760, H=300, PL=52, PR=24, PT=24, PB=42;
  const cW=W-PL-PR, cH=H-PT-PB;
  const mg = d3.max(seasonalData, d=>d.gaps);
  const mf = d3.max(seasonalData, d=>d.fishHrs);
  const gV = seasonalData.map(d=>normMode? d.gaps/mg : d.gaps);
  const fV = seasonalData.map(d=>normMode? d.fishHrs/mf : d.fishHrs);
  const maxG = normMode? 1 : mg;
  const maxF = normMode? 1 : mf;

  const xS = i => PL + (i/(seasonalData.length-1)) * cW;
  const yG = v => PT + cH - (v/maxG)*cH;
  const yF = v => PT + cH - (v/maxF)*cH;

  let html='';

  // Y gridlines + labels
  const ticks = normMode? [0.5,0.75,1] : [0.25,0.5,0.75,1];
  ticks.forEach(p=>{
    const y = PT+cH-p*cH;
    html += `<line x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}" stroke="#132030" stroke-width="1"/>`;
    const label = normMode ? (p*100).toFixed(0)+'%' : fmtK(p*mg);
    html += `<text x="${PL-8}" y="${y+3}" text-anchor="end" fill="#4a6580" font-family="IBM Plex Mono,monospace" font-size="9">${label}</text>`;
  });

  // X axis labels
  seasonalData.forEach((d,i)=>{
    html += `<text x="${xS(i)}" y="${H-12}" text-anchor="middle" fill="#4a6580" font-family="IBM Plex Mono,monospace" font-size="10" letter-spacing="0.04em">${d.name.toUpperCase()}</text>`;
  });

  // Y-axis title
  html += `<text x="${PL-32}" y="${PT+cH/2}" text-anchor="middle" fill="#4a6580" font-family="IBM Plex Sans,sans-serif" font-size="10" transform="rotate(-90 ${PL-32} ${PT+cH/2})">${normMode?'Share of peak':'Absolute value'}</text>`;

  // Chart frame
  html += `<rect x="${PL}" y="${PT}" width="${cW}" height="${cH}" fill="none" stroke="#132030" stroke-width="0.5"/>`;

  // Fishing hours line (no fill)
  const fLine = `M${xS(0)},${yF(fV[0])} ` + fV.slice(1).map((v,i)=>`L${xS(i+1)},${yF(v)}`).join(' ');
  html += `<path d="${fLine}" fill="none" stroke="#3db8a8" stroke-width="1.8" stroke-dasharray="5 3" stroke-linecap="round" opacity="0.9"/>`;

  // Gap events line (no fill)
  const gLine = `M${xS(0)},${yG(gV[0])} ` + gV.slice(1).map((v,i)=>`L${xS(i+1)},${yG(v)}`).join(' ');
  html += `<path d="${gLine}" fill="none" stroke="#f0a040" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;

  // Peak marker + annotation (gap peak)
  const gPeak = gV.indexOf(Math.max(...gV));
  html += `<circle cx="${xS(gPeak)}" cy="${yG(gV[gPeak])}" r="4.5" fill="#f0a040" stroke="#0d1829" stroke-width="2"/>`;
  html += `<text x="${xS(gPeak)}" y="${yG(gV[gPeak])-14}" text-anchor="middle" fill="#f0a040" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="500" letter-spacing="0.06em">PEAK</text>`;

  // Gap trough marker (no label — avoids clipping at right edge)
  const gTrough = gV.indexOf(Math.min(...gV));
  html += `<circle cx="${xS(gTrough)}" cy="${yG(gV[gTrough])}" r="3.5" fill="#0d1829" stroke="#f0a040" stroke-width="1.5"/>`;

  // Fishing peak
  const fPeak = fV.indexOf(Math.max(...fV));
  html += `<circle cx="${xS(fPeak)}" cy="${yF(fV[fPeak])}" r="3.5" fill="#3db8a8" stroke="#0d1829" stroke-width="2"/>`;

  // Update footer stat chip (sits next to "Show absolute values" button)
  const statEl = $('#seasonal-stat');
  const statVal = $('#seasonal-stat-val');
  if(statEl && statVal){
    if(normMode){
      statEl.style.display = 'flex';
      statVal.textContent = `${(gV[gPeak]/Math.max(0.01,gV[gTrough])).toFixed(1)}\u00d7 more gaps in ${seasonalData[gPeak].name}`;
    } else {
      statEl.style.display = 'none';
    }
  }

  // Crosshair (hidden by default)
  html += `<line id="seasonal-crosshair" x1="0" y1="${PT}" x2="0" y2="${PT+cH}" stroke="#4a6580" stroke-width="1" stroke-dasharray="2 3" opacity="0" pointer-events="none"/>`;

  // Hit targets
  gV.forEach((v,i)=>{
    html += `<rect class="s-hit" data-idx="${i}" x="${xS(i)-cW/24}" y="${PT}" width="${cW/12}" height="${cH}" fill="transparent" style="cursor:pointer"/>`;
    html += `<circle class="s-mark-gap" data-idx="${i}" cx="${xS(i)}" cy="${yG(gV[i])}" r="0" fill="#f0a040" pointer-events="none"/>`;
    html += `<circle class="s-mark-fish" data-idx="${i}" cx="${xS(i)}" cy="${yF(fV[i])}" r="0" fill="#3db8a8" pointer-events="none"/>`;
  });

  const svg = $('#seasonal-svg');
  svg.innerHTML = html;

  const tooltip = $('#seasonal-tooltip');
  const wrap = $('#seasonal-wrap');
  const crosshair = $('#seasonal-crosshair');

  svg.querySelectorAll('.s-hit').forEach(hit=>{
    hit.addEventListener('mouseenter',()=>{
      const i = parseInt(hit.getAttribute('data-idx'));
      const d = seasonalData[i];
      const wr = wrap.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      // Position crosshair (in SVG coords)
      const xv = xS(i);
      crosshair.setAttribute('x1',xv); crosshair.setAttribute('x2',xv);
      crosshair.setAttribute('opacity',0.6);
      svg.querySelector(`.s-mark-gap[data-idx="${i}"]`).setAttribute('r',4.5);
      svg.querySelector(`.s-mark-fish[data-idx="${i}"]`).setAttribute('r',3.5);
      tooltip.style.opacity='1';
      tooltip.innerHTML = `<div class="tooltip-title">${d.name} · monthly aggregate</div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#f0a040"></div><span>Gap events</span><span class="tooltip-val">${fmt(d.gaps)}</span></div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#3db8a8"></div><span>Fishing hrs</span><span class="tooltip-val">${(d.fishHrs/1e6).toFixed(1)}M</span></div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#6b8fa8"></div><span>Gap hrs</span><span class="tooltip-val">${fmtK(d.gapHrs)}</span></div>`;
      // Position tooltip near data point
      const ratio = svgRect.width / 760;
      const screenX = svgRect.left + xv*ratio - wr.left;
      tooltip.style.left = Math.min(screenX + 16, wr.width - 200) + 'px';
      tooltip.style.top = '24px';
    });
    hit.addEventListener('mouseleave',()=>{
      tooltip.style.opacity='0';
      crosshair.setAttribute('opacity',0);
      const i = parseInt(hit.getAttribute('data-idx'));
      svg.querySelector(`.s-mark-gap[data-idx="${i}"]`).setAttribute('r',0);
      svg.querySelector(`.s-mark-fish[data-idx="${i}"]`).setAttribute('r',0);
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   GEAR SMALL MULTIPLES
   ═══════════════════════════════════════════════════════════ */
function renderGear(){
  const container = $('#gear-grid');
  const gearColors = {
    'Drifting longlines':'#f0a040','Trawlers':'#6b8fa8','Other':'#a07bd4','Set gillnets':'#3db8a8',
    'Squid jiggers':'#e85d3a','Set longlines':'#5bbce8','Purse seines':'#7ec8a0','Fixed gear':'#c8a07e'
  };
  container.innerHTML = Object.entries(gearData).map(([name,d])=>{
    const maxV = d.top[0].v;
    const color = gearColors[name]||'#6b8fa8';
    const bars = d.top.map(r=>`
      <div class="gear-mini-row">
        <span class="gear-mini-flag">${r.f}</span>
        <div class="gear-mini-track"><div class="gear-mini-fill" style="width:${(r.v/maxV*100).toFixed(1)}%;background:${color}"></div></div>
        <span class="gear-mini-val">${(r.v/1000).toFixed(1)}K</span>
      </div>`).join('');
    return `<div class="gear-card">
      <div class="gear-card-title" style="color:${color}">${name}</div>
      <div class="gear-mini-bars">${bars}</div>
      <div class="gear-total" style="color:${color}">${(d.total/1000).toFixed(1)}K</div>
      <div class="gear-total-label">total gap events</div>
    </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════
   FLAG BAR CHART
   ═══════════════════════════════════════════════════════════ */
const sortKeys = {count:'gaps',hours:'hours',avg:'avg',vessels:'vessels'};
const sortLabels = {count:'gap events',hours:'total gap hours',avg:'avg. gap duration',vessels:'unique vessels'};

function renderBars(sortKey){
  const key = sortKeys[sortKey];
  const sorted = [...flagData].slice(0,12).sort((a,b)=>b[key]-a[key]);
  const max = sorted[0][key];
  const container = $('#flag-bar-chart');
  const tooltip = $('#flag-tooltip');
  const accent = sortKey==='avg' ? '#6b8fa8' : sortKey==='vessels' ? '#3db8a8' : '#f0a040';

  container.innerHTML = sorted.map((d,i)=>{
    const pct = (d[key]/max*100).toFixed(1);
    let val, unit;
    if(key==='avg'){ val = d[key].toFixed(1); unit='h'; }
    else if(key==='hours'){ val = (d[key]/1000).toFixed(0); unit='K h'; }
    else { val = fmt(d[key]); unit=''; }
    const rankCls = i<3 ? 'top3' : '';
    return `<div class="bar-row-item">
      <span class="bar-rank">${(i+1).toString().padStart(2,'0')}</span>
      <span class="bar-flag ${rankCls}">${d.flag}</span>
      <div class="bar-track" data-flag="${d.flag}" data-name="${d.name}" data-gaps="${d.gaps}" data-hours="${d.hours}" data-avg="${d.avg}" data-vessels="${d.vessels}">
        <div class="bar-fill-anim" style="width:0%;background:${accent}"></div>
      </div>
      <span class="bar-value">${val}<span class="unit">${unit}</span></span>
    </div>`;
  }).join('');

  // Animate widths in
  requestAnimationFrame(()=>{
    container.querySelectorAll('.bar-fill-anim').forEach((bar,i)=>{
      const d = sorted[i];
      bar.style.width = (d[key]/max*100).toFixed(1)+'%';
    });
  });

  // Update top-2 share
  const total = flagData.reduce((s,d)=>s+d[key],0);
  const top2 = sorted.slice(0,2).reduce((s,d)=>s+d[key],0);
  const share = (top2/total*100).toFixed(1);
  $('#top-share').textContent = share + '%';
  $('#top-share').style.color = accent;
  $('#flag-subtitle').textContent = `Bar length proportional to share of ${sortLabels[sortKey]}. Top 2 flags account for the highlighted cumulative share.`;

  // Tooltip
  container.querySelectorAll('.bar-track').forEach(track=>{
    track.addEventListener('mouseenter',()=>{
      const r = track.getBoundingClientRect();
      const pr = container.getBoundingClientRect();
      tooltip.style.opacity='1';
      tooltip.innerHTML = `<div class="tooltip-title">${track.dataset.name} <span style="color:var(--fg-muted);font-weight:400">· ${track.dataset.flag}</span></div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#f0a040"></div><span>Gap events</span><span class="tooltip-val">${fmt(parseInt(track.dataset.gaps))}</span></div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#6b8fa8"></div><span>Gap hours</span><span class="tooltip-val">${fmtK(parseInt(track.dataset.hours))} h</span></div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#3db8a8"></div><span>Avg. gap</span><span class="tooltip-val">${parseFloat(track.dataset.avg).toFixed(1)} h</span></div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#a07bd4"></div><span>Vessels</span><span class="tooltip-val">${track.dataset.vessels}</span></div>`;
      const tw = tooltip.offsetWidth || 200;
      tooltip.style.left = Math.min(r.right - pr.left + 12, pr.width - tw - 8) + 'px';
      tooltip.style.top = (r.top - pr.top - 12) + 'px';
    });
    track.addEventListener('mouseleave',()=>{tooltip.style.opacity='0';});
  });
}

/* ═══════════════════════════════════════════════════════════
   BUBBLE SCATTER
   ═══════════════════════════════════════════════════════════ */
function initBubble(){
  const wrap = $('#scatter-wrap');
  const W = wrap.clientWidth - 48 || 760;
  const H = 380;
  const PL=64, PR=32, PT=24, PB=52;
  const cW=W-PL-PR, cH=H-PT-PB;
  const data = flagData.slice(0,20);

  const xMax = d3.max(data,d=>d.gaps);
  const yMax = d3.max(data,d=>d.avg);
  const rMax = d3.max(data,d=>d.hours);
  const xS = d3.scaleLinear().domain([0,xMax*1.05]).range([0,cW]);
  const yS = d3.scaleLinear().domain([0,yMax*1.1]).range([cH,0]);
  const rS = d3.scaleSqrt().domain([0,rMax]).range([4,38]);
  const cS = v => d3.interpolate('#3db8a8','#f0a040')(Math.pow(v/xMax,0.5));

  const svg = d3.select('#bubble-svg').attr('width',W).attr('height',H);
  svg.selectAll('*').remove();
  const g = svg.append('g').attr('transform',`translate(${PL},${PT})`);

  // Y gridlines
  yS.ticks(5).forEach(v=>{
    g.append('line').attr('x1',0).attr('x2',cW).attr('y1',yS(v)).attr('y2',yS(v))
      .attr('stroke','#132030').attr('stroke-width',1);
    g.append('text').attr('x',-8).attr('y',yS(v)+3).attr('text-anchor','end')
      .attr('fill','#4a6580').attr('font-family','IBM Plex Mono,monospace').attr('font-size',9).text(v.toFixed(0)+'h');
  });
  // X gridlines
  xS.ticks(5).forEach(v=>{
    if(v===0) return;
    g.append('line').attr('x1',xS(v)).attr('x2',xS(v)).attr('y1',0).attr('y2',cH)
      .attr('stroke','#132030').attr('stroke-width',1);
    g.append('text').attr('x',xS(v)).attr('y',cH+18).attr('text-anchor','middle')
      .attr('fill','#4a6580').attr('font-family','IBM Plex Mono,monospace').attr('font-size',9)
      .text(v>=1000?(v/1000).toFixed(0)+'K':v);
  });
  // Axis labels
  g.append('text').attr('x',cW/2).attr('y',cH+40).attr('text-anchor','middle')
    .attr('fill','#4a6580').attr('font-family','IBM Plex Sans,sans-serif').attr('font-size',10)
    .attr('letter-spacing','0.04em').text('Total gap events →');
  g.append('text').attr('transform','rotate(-90)').attr('x',-cH/2).attr('y',-48).attr('text-anchor','middle')
    .attr('fill','#4a6580').attr('font-family','IBM Plex Sans,sans-serif').attr('font-size',10)
    .attr('letter-spacing','0.04em').text('Average gap duration (hours) →');

  // Reference lines: medians
  const medX = d3.median(data,d=>d.gaps);
  const medY = d3.median(data,d=>d.avg);
  g.append('line').attr('x1',xS(medX)).attr('x2',xS(medX)).attr('y1',0).attr('y2',cH)
    .attr('stroke','#4a6580').attr('stroke-width',0.6).attr('stroke-dasharray','2 3').attr('opacity',0.4);
  g.append('line').attr('x1',0).attr('x2',cW).attr('y1',yS(medY)).attr('y2',yS(medY))
    .attr('stroke','#4a6580').attr('stroke-width',0.6).attr('stroke-dasharray','2 3').attr('opacity',0.4);
  g.append('text').attr('x',xS(medX)+4).attr('y',12).attr('fill','#4a6580')
    .attr('font-family','IBM Plex Mono,monospace').attr('font-size',8).text('median count');
  g.append('text').attr('x',cW-4).attr('y',yS(medY)-4).attr('text-anchor','end').attr('fill','#4a6580')
    .attr('font-family','IBM Plex Mono,monospace').attr('font-size',8).text('median duration');

  const tooltip = $('#scatter-tooltip');
  const wRect = () => wrap.getBoundingClientRect();

  g.selectAll('.bubble').data(data).enter().append('circle')
    .attr('class','bubble')
    .attr('cx',d=>xS(d.gaps)).attr('cy',d=>yS(d.avg))
    .attr('r',0)
    .attr('fill',d=>cS(d.gaps)).attr('fill-opacity',0.65)
    .attr('stroke','rgba(255,255,255,0.18)').attr('stroke-width',0.8)
    .style('cursor','pointer')
    .on('mouseover',function(event,d){
      d3.select(this).attr('fill-opacity',0.95).attr('stroke','rgba(255,255,255,0.6)');
      const wr=wRect(); tooltip.style.opacity='1';
      tooltip.innerHTML = `<div class="tooltip-title">${d.name} <span style="color:var(--fg-muted);font-weight:400">· ${d.flag}</span></div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#f0a040"></div><span>Gap events</span><span class="tooltip-val">${fmt(d.gaps)}</span></div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#6b8fa8"></div><span>Avg. duration</span><span class="tooltip-val">${d.avg.toFixed(1)} h</span></div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#3db8a8"></div><span>Total hours</span><span class="tooltip-val">${fmtK(d.hours)} h</span></div>
        <div class="tooltip-row-item"><div class="tooltip-dot" style="background:#a07bd4"></div><span>Vessels</span><span class="tooltip-val">${d.vessels}</span></div>`;
      moveTooltip(event, tooltip, wr);
    })
    .on('mousemove',function(event){ moveTooltip(event, tooltip, wRect()); })
    .on('mouseout',function(){
      d3.select(this).attr('fill-opacity',0.65).attr('stroke','rgba(255,255,255,0.18)');
      tooltip.style.opacity='0';
    })
    .transition().duration(800).delay((d,i)=>i*30).attr('r',d=>rS(d.hours));

  // Labels for large bubbles
  g.selectAll('.bubble-label').data(data.filter(d=>d.gaps>800)).enter().append('text')
    .attr('class','bubble-label')
    .attr('x',d=>xS(d.gaps)).attr('y',d=>yS(d.avg)+4)
    .attr('text-anchor','middle').attr('fill','#e8eef5')
    .attr('font-family','IBM Plex Mono,monospace').attr('font-size',10).attr('font-weight',500)
    .attr('pointer-events','none').attr('opacity',0).text(d=>d.flag)
    .transition().duration(600).delay(900).attr('opacity',0.92);
}

/* ═══════════════════════════════════════════════════════════
   BIND CONTROLS + INIT
   ═══════════════════════════════════════════════════════════ */
function bindControls(){
  $$('#metric-gap,#metric-hrs').forEach(b=>b.addEventListener('click',()=>setMetric(b.dataset.metric)));
  $('#reset-map').addEventListener('click',resetMap);
  $('#toggle-norm').addEventListener('click',function(){
    normMode = !normMode;
    this.textContent = normMode ? 'Show absolute values' : 'Show normalised (%)';
    drawSeasonal();
  });
  $$('.filter-pill[data-sort]').forEach(pill=>{
    pill.addEventListener('click',function(){
      $$('.filter-pill[data-sort]').forEach(p=>p.classList.remove('active'));
      this.classList.add('active');
      renderBars(this.dataset.sort);
    });
  });
}

window.addEventListener('DOMContentLoaded',()=>{
  bindControls();
  initMap();
  mapObs.observe($('#map-wrap'));
  drawSeasonal();
  renderBars('count');
  initBubble();
});

// Re-init responsive on resize (debounced)
let resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(()=>{
    initMap();
    initBubble();
  },200);
});

})();

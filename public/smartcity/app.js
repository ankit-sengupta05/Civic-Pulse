const ACTION={"Pothole":"Road resurfacing crew","Streetlight outage":"Lighting repair squad","Signal failure":"Signal maintenance team","Blocked drain":"Drain desilting crew","Flooding":"Drainage + flood-gate inspection","Collision":"Traffic-calming / pedestrian-safety audit"};
const SAFE=(s)=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let D,T,V,sel=null,viewer,ents={};
const $=id=>document.getElementById(id);
const col=s=>{const t=Math.min(1,Math.max(0,(s-30)/65));return (typeof Cesium!=="undefined"&&Cesium.Color)?Cesium.Color.fromHsl(0.52-0.52*t,1,0.55,0.9):"#27e6ff"};

async function init(){
 const tryFetch = async (n) => {
   const urls = [`data/${n}.json`, `/smartcity/data/${n}.json`, `../smartcity/data/${n}.json`];
   for (const u of urls) {
     try {
       const r = await fetch(u);
       if (r.ok) return await r.json();
     } catch(e) {}
   }
   throw new Error("Could not load " + n + ".json");
 };
 [D,T,V]=await Promise.all(["priorities","trends","validation"].map(tryFetch));

 $("asof").textContent="as of "+D.meta.asof+" · "+D.locations.length+" locations";
 D.meta.zones.map(z=>z.zone).sort().forEach(z=>$("fz").add(new Option(z,z)));
 Object.keys(ACTION).forEach(t=>$("ft").add(new Option(t,t)));
 ["fz","fc","ft"].forEach(i=>$(i).onchange=renderList);$("fs").oninput=renderList;
 document.querySelectorAll("#tabs button").forEach(b=>b.onclick=()=>{
   document.querySelectorAll("#tabs button").forEach(x=>x.classList.toggle("on",x===b));
   document.querySelectorAll(".pane").forEach(p=>{
     p.classList.toggle("on",p.id==="p-"+b.dataset.t);
     p.style.display=p.classList.contains("on")?(p.id==="p-queue"?"flex":"block"):"none";
   });
 });

 // Render lists and views immediately
 renderList();renderTrends();renderPlan();renderEvidence();

 // Safely initialize 3D Cesium background
 try {
   if (typeof Cesium !== "undefined") {
     let imagery;
     if (typeof Cesium.UrlTemplateImageryProvider === "function") {
       imagery = new Cesium.UrlTemplateImageryProvider({url:"https://tile.openstreetmap.org/{z}/{x}/{y}.png"});
     }
     viewer=new Cesium.Viewer("cesium",{baseLayer:imagery?new Cesium.ImageryLayer(imagery):undefined,terrain:undefined,baseLayerPicker:false,geocoder:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,animation:false,timeline:false,fullscreenButton:false,infoBox:false,selectionIndicator:false});
     viewer.scene.globe.enableLighting=false;viewer.scene.skyAtmosphere.show=true;
     if (viewer.imageryLayers && viewer.imageryLayers.length > 0) {
       viewer.imageryLayers.get(0).brightness=0.55;viewer.imageryLayers.get(0).saturation=0.5;
     }
     D.locations.forEach(l=>{
       ents[l.id]=viewer.entities.add({id:l.id,position:Cesium.Cartesian3.fromDegrees(l.lon,l.lat),
         point:{pixelSize:l.rank<=50?9:5,color:col(l.score),outlineColor:Cesium.Color.BLACK.withAlpha(.6),outlineWidth:1,disableDepthTestDistance:1e7}});
       if(l.rank<=100)viewer.entities.add({position:Cesium.Cartesian3.fromDegrees(l.lon,l.lat,l.score*7),cylinder:{length:l.score*14,topRadius:60,bottomRadius:60,material:col(l.score).withAlpha(.55)}});
     });
     viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(80.53,16.2,60000),orientation:{heading:0,pitch:Cesium.Math.toRadians(-48)},duration:2});
     viewer.screenSpaceEventHandler.setInputAction(c=>{const p=viewer.scene.pick(c.position);if(p&&p.id&&p.id.id&&ents[p.id.id])select(p.id.id,false)},Cesium.ScreenSpaceEventType.LEFT_CLICK);
   }
 } catch(cErr) {
   console.warn("Cesium 3D background init skipped:", cErr);
 }
}

function filtered(){const z=$("fz").value,c=$("fc").value,t=$("ft").value,s=$("fs").value.trim().toUpperCase();
 return D.locations.filter(l=>(!z||l.zone===z)&&(!c||l.conf_label===c)&&(!t||l.top_type===t)&&(!s||l.id.includes(s)))}

function renderList(){const L=filtered().slice(0,150);
 $("list").innerHTML=L.map(l=>`<div class="row ${l.id===sel?"sel":""}" data-id="${l.id}"><span class="rk">#${l.rank}</span><div><b>${l.id}</b> <span style="color:var(--dim)">${l.zone}</span><br><span style="color:var(--dim)">${SAFE(l.reasons[0].label)}</span></div><div style="text-align:right"><div class="sc">${l.score}</div><span class="tag ${l.conf_label}">${l.conf_label}</span></div></div>`).join("")||"<p style='padding:10px;color:var(--dim)'>No matches.</p>";
 $("list").querySelectorAll(".row").forEach(r=>r.onclick=()=>select(r.dataset.id,true))}

function select(id,fly){sel=id;const l=D.locations.find(x=>x.id===id);renderList();
 if(fly&&viewer)viewer.camera.flyTo({destination:Cesium.Cartesian3.fromDegrees(l.lon,l.lat-0.012,3500),orientation:{heading:0,pitch:Cesium.Math.toRadians(-40)},duration:1.2});
 const comp=Object.entries(D.meta.weights).map(([k,w])=>`<div>${SAFE(w.label)} <span style="float:right;color:var(--dim)">${l.components[k]} pct · weight ${w.w}</span></div><div class="bar"><i style="width:${l.components[k]}%"></i></div>`).join("");
 const types=Object.entries(l.by_type).sort((a,b)=>b[1]-a[1]);const tot=types.reduce((s,x)=>s+x[1],0)||1;
 $("detail").innerHTML=`<h3>${l.id} · ${l.zone}</h3><div class="sc" style="font-size:26px">${l.score} <span style="font-size:13px;color:var(--dim)">rank #${l.rank}</span> <span class="tag ${l.conf_label}">${l.conf_label} confidence</span></div>
 <div class="kv"><span>Rank interval (10–90% bootstrap)</span><span>#${l.rank_range[0]} – #${l.rank_range[1]}</span></div>
 <div class="kv"><span>Chance of staying in top 50</span><span>${Math.round(l.p_top50*100)}%</span></div>
 <div class="kv"><span>Evidence</span><span>${l.n_inc} incidents · ${l.n_com} complaints</span></div>
 <h3>Why it ranks here</h3>${l.reasons.map(r=>`<div class="card"><b>+${r.points} pts</b> · ${SAFE(r.label)}<br><span style="color:var(--dim)">${r.pctile}th percentile among 1,000 locations</span></div>`).join("")}
 <h3>Full score breakdown</h3>${comp}
 <h3>Suggested intervention</h3><div class="card"><b>${SAFE(ACTION[l.top_type])}</b><br><span style="color:var(--dim)">Dominant incident type: ${SAFE(l.top_type)} (${Math.round(100*(l.by_type[l.top_type]||0)/tot)}% of weighted load). Complaints mostly say: ${SAFE(l.complaint_type)}.</span></div>
 <h3>What information is still missing</h3>${l.missing.length?l.missing.map(m=>`<div class="miss">${SAFE(m)}</div>`).join(""):"<div style='color:var(--gr)'>Evidence is consistent across sources.</div>"}
 <h3>Context</h3><div class="kv"><span>Road</span><span>${l.road_type} · ${l.road_condition}</span></div><div class="kv"><span>Density</span><span>${l.density.toLocaleString()} /km²</span></div>
 <div class="kv"><span>School / hospital nearby</span><span>${l.school?"yes":"no"} / ${l.hospital?"yes":"no"}</span></div><div class="kv"><span>Pedestrian activity</span><span>${l.ped}</span></div>`}

function lineChart(series,months,h=90){const W=300,max=Math.max(...Object.values(series).flat(),1),cols=["#27e6ff","#ff2e88","#ffb02e","#38f28a","#a58bff","#ff7a45"];
 return `<svg viewBox="0 0 ${W} ${h+14}" width="100%">`+Object.entries(series).map(([k,v],i)=>`<polyline fill="none" stroke="${cols[i%6]}" stroke-width="1.5" points="${v.map((y,x)=>`${x*W/11},${h-y/max*h}`).join(" ")}"/>`).join("")+`<text x="0" y="${h+11}">Jan</text><text x="${W-18}" y="${h+11}">Dec</text></svg><div style="font-size:10px;color:var(--dim)">${Object.keys(series).map((k,i)=>`<span style="color:${cols[i%6]}">■</span> ${k}`).join(" &nbsp; ")}</div>`}

function renderTrends(){const r=T.complaint_days;
 $("p-trends").innerHTML=`<h3>Incidents per month by type</h3>${lineChart(T.incidents_by_type,T.months)}<h3>Complaints per month by category</h3>${lineChart(T.complaints_by_cat,T.months)}
 <h3>Complaint resolution time (days)</h3><table><tr><th>Category</th><th>median</th><th>p90</th><th>still open</th></tr>${Object.entries(r).map(([k,v])=>`<tr><td>${k}</td><td>${v.median}</td><td>${v.p90}</td><td>${Math.round(v.open_share*100)}%</td></tr>`).join("")}</table>
 <h3>Incident median fix time (hours, resolved only)</h3><table>${Object.entries(T.incident_resolution_hours).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>`}

const STRAT={"Highest score":(a)=>[...a].sort((x,y)=>y.score-x.score),"Score × confidence":(a)=>[...a].sort((x,y)=>y.score*y.confidence-x.score*x.confidence),
 "Backlog first":(a)=>[...a].sort((x,y)=>y.components.backlog-x.components.backlog),
 "Zone-balanced":(a)=>{const by={};[...a].sort((x,y)=>y.score-x.score).forEach(l=>(by[l.zone]=by[l.zone]||[]).push(l));const o=[];for(let i=0;i<60;i++)Object.values(by).forEach(z=>z[i]&&o.push(z[i]));return o}};

function renderPlan(){$("p-plan").innerHTML=`<h3>Intervention planner</h3><div style="color:var(--dim)">Pick how many sites your crews can cover. Compare allocation strategies. <b>Effect figures are assumptions you can edit — not measured results.</b></div>
 <div class="kv"><span>Sites to fix</span><b id="kv">50</b></div><input type="range" id="k" min="10" max="200" value="50">
 <div class="kv"><span>Assumed fix effectiveness</span><b id="ev">60%</b></div><input type="range" id="eff" min="10" max="100" value="60"><div id="plan-out"></div>`;
 $("k").oninput=$("eff").oninput=planCalc;planCalc()}

function planCalc(){const K=+$("k").value,E=+$("eff").value/100;$("kv").textContent=K;$("ev").textContent=Math.round(E*100)+"%";
 const tot=D.locations.reduce((s,l)=>s+Object.values(l.by_type).reduce((a,b)=>a+b,0),0);
 const rows=Object.entries(STRAT).map(([n,f])=>{const s=f(D.locations).slice(0,K),load=s.reduce((a,l)=>a+Object.values(l.by_type).reduce((x,y)=>x+y,0),0);
  return `<tr><td>${n}</td><td>${(100*load/tot).toFixed(1)}%</td><td>${(100*E*load/tot).toFixed(1)}%</td><td>${new Set(s.map(l=>l.zone)).size}</td><td>${s.filter(l=>l.conf_label!=="Low").length}</td></tr>`}).join("");
 const base=(100*K/D.locations.length).toFixed(1);
 const crew={};STRAT["Highest score"](D.locations).slice(0,K).forEach(l=>crew[ACTION[l.top_type]]=(crew[ACTION[l.top_type]]||0)+1);
 $("plan-out").innerHTML=`<table style="margin-top:8px"><tr><th>Strategy</th><th>load covered</th><th>assumed cut</th><th>zones</th><th>non-low conf.</th></tr>${rows}</table>
 <div style="color:var(--dim);margin-top:6px">A random pick of ${K} sites would cover ≈${base}% of historical load. Strategies near that line mean the data cannot separate sites well (see Evidence).</div>
 <h3>Crew mix for "Highest score"</h3>${Object.entries(crew).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="kv"><span>${k}</span><span>${v} sites</span></div>`).join("")}`}

function renderEvidence(){const q=D.meta.quality,ks=Object.keys(V);
 $("p-evidence").innerHTML=`<h3>Read this before trusting any rank</h3><div class="card" style="border-color:var(--am)">Incident counts per location are statistically indistinguishable from random Poisson noise (mean 10, sd 3.25 vs 3.16 expected) and unrelated to road condition, zone or density. A time-split test finds <b>no model — ours included — beats chance</b> at predicting next-quarter load. So this tool is <b>evidence triage</b>, not a forecast. Confidence badges and rank intervals show how much each rank can be trusted.</div>
 <h3>Held-out test (precision@100, chance = 0.10)</h3><table><tr><th>Method</th>${ks.map(k=>`<th>${k.replace("test_","")}</th>`).join("")}</tr>${Object.keys(V[ks[0]]).filter(m=>m[0]!=="_").map(m=>`<tr><td>${m}</td>${ks.map(k=>`<td>${V[k][m].precision_at_100}</td>`).join("")}</tr>`).join("")}</table>
 <h3>Data quality</h3><div class="kv"><span>Duplicates</span><span>${q.duplicate_ids.incidents+q.duplicate_ids.complaints}</span></div><div class="kv"><span>Orphan location IDs</span><span>${q.orphan_location_ids}</span></div><div class="kv"><span>Missing values</span><span>${q.missing_values}</span></div>
 <div class="kv"><span>Unresolved incidents (censored hours)</span><span>${q.unresolved_with_hours_censored}</span></div><div class="kv"><span>Open complaints</span><span>${q.complaints_open}</span></div>
 <h3>Score weights</h3>${Object.values(D.meta.weights).map(w=>`<div class="kv"><span>${SAFE(w.label)}</span><span>${w.w}</span></div>`).join("")}
 <p style="color:var(--dim)">Extra data: none. OpenStreetMap raster tiles are used only as a basemap. No API keys.</p>`}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => init());
} else {
  init();
}

const COLORS={"М1":"#e53935","М2":"#fb8c00","М3":"#2e7d32","М4":"#1e88e5"};
const ROUTE_NAMES={"М1":"Юг / юго-восток","М2":"ТиНАО + ЮЗАО юг","М3":"Внутренний юг / ЮЗАО","М4":"ЦАО + Замоскворечье"};
const ROUTE_META={
"М1":{title:"Юг / юго-восток + часть Бутово",order:[15,11,13,9,6,45,5,3,43,7,8,2,1],corridor:"Щербинка → Южное/Северное Бутово → Чертаново → Москворечье-Сабурово → Царицыно → Братеево/Зябликово → Орехово-Борисово → Бирюлёво",level:"13 объектов, нагрузка близка к средней",far:15,road:"построенный объезд по дорогам: 58,8 км · ≈ 92 мин без пробок",bottleneck:"Братеево/восток ЮАО ↔ Щербинка: до ≈ 28 мин между крайними точками",special:"№6 Россошанская, 4 к2 — капремонт."},
"М2":{title:"ТиНАО + ЮЗАО юг",order:[16,18,24,47,49,48,12,17,19,14],corridor:"Первомайское → Московский → Тёплый Стан → Коньково → Флагман ЮЗАО/Ясенево → Южное Бутово → Коммунарка → Ватутинки → Троицк",level:"10 объектов, самая тяжёлая территория по километражу",far:16,road:"построенный объезд по дорогам: 79,4 км · ≈ 103 мин без пробок",bottleneck:"Первомайское ↔ Ясенево: ≈ 32 мин",special:"№16 Первомайское, Центральная, 100 — точка дома требует ручной проверки. №24 Академика Варги, 26А — капремонт."},
"М3":{title:"Внутренний юг / юго-запад",order:[26,23,22,21,27,25,46,10,41,44,4,42,28,20],corridor:"Обручевский → Ломоносовский/Гагаринский → Академический/Черёмушки/Котловка → Зюзино → север Чертаново → Нагорный/Нагатино → Даниловский/Донской",level:"14 объектов, компактная дорожная зона",far:26,road:"построенный объезд по дорогам: 45,1 км · ≈ 79 мин без пробок",bottleneck:"Обручевский ↔ Нагатинский Затон: до ≈ 20 мин",special:"Без отдельных ограничений в исходном списке."},
"М4":{title:"ЦАО + Замоскворечье",order:[40,31,32,37,29,33,51,50,35,34,36,38,39,30],corridor:"Пресня → Хамовники/Арбат → Якиманка/Замоскворечье → Тверской/Мещанский/Красносельский → Басманный → Таганка",level:"14 объектов, компактно по дороге, сложнее парковка и доступ",far:30,road:"построенный объезд по дорогам: 44,1 км · ≈ 81 мин без пробок",bottleneck:"Таганский ↔ Пресня: ≈ 20 мин",special:"№35 Ипатьевский пер., 4-10 стр.1 — спецпропуск, обслуживание на выходных."}
};
const COORDS={
1:[55.578309,37.676637],2:[55.574655,37.656730],3:[55.636011,37.752356],4:[55.679103,37.630113],5:[55.635706,37.675011],
6:[55.592449,37.609586],7:[55.599611,37.717761],8:[55.596488,37.721642],9:[55.598055,37.605418],10:[55.623173,37.612209],
11:[55.504379,37.597495],12:[55.543664,37.532008],13:[55.574090,37.565299],14:[55.495904,37.321712],15:[55.504216,37.559182],
16:[55.537027,37.158812],17:[55.569164,37.479672],18:[55.597546,37.347656],19:[55.515854,37.351177],20:[55.712868,37.612883],
21:[55.680717,37.580068],22:[55.679417,37.546111],23:[55.676179,37.536203],24:[55.634471,37.474363],25:[55.667858,37.589976],
26:[55.665969,37.514329],27:[55.670336,37.570034],28:[55.705042,37.639824],29:[55.747814,37.593947],30:[55.746481,37.682619],
31:[55.749162,37.539742],32:[55.767266,37.554996],33:[55.733508,37.610197],34:[55.767762,37.604933],35:[55.754436,37.629475],
36:[55.784592,37.636949],37:[55.743066,37.584685],38:[55.785979,37.660521],39:[55.780137,37.685719],40:[55.749380,37.534092],
41:[55.612146,37.606999],42:[55.678204,37.654646],43:[55.622883,37.744118],44:[55.673443,37.615354],45:[55.634161,37.656928],
46:[55.657855,37.593471],47:[55.644887,37.519413],48:[55.608816,37.535412],49:[55.619472,37.509289],50:[55.735515,37.635682],51:[55.732286,37.636958]
};
const WARN={
16:"Яндекс не подтвердил дом 100: точка временно стоит на Центральной улице посёлка Первомайское. Этот адрес надо проверить вручную.",
20:"Яндекс подтвердил Хавскую, 26. Фактически адрес относится к Даниловскому району; в исходном списке указан Донской.",
51:"Яндекс подтвердил дом 30, но не выделил строение 1 отдельно."
};
const statusEl=document.getElementById("status"),filtersEl=document.getElementById("filters"),typeFiltersEl=document.getElementById("typeFilters"),inventorySummaryEl=document.getElementById("inventorySummary"),searchInput=document.getElementById("searchInput"),searchBtn=document.getElementById("searchBtn"),panelEl=document.querySelector(".panel"),panelToggle=document.getElementById("panelToggle"),card=document.getElementById("card"),cardBody=document.getElementById("cardBody");
document.getElementById("closeCard").onclick=()=>card.classList.remove("show");
const active={},groups={},routeButtons={},routeZones={},routeLabels={},markerRecords=[];
Object.keys(COLORS).forEach(t=>{active[t]=true;groups[t]=[]});
let map=null,typeFilter="all";
const mobileMQ=window.matchMedia("(max-width:680px)");
function isMobile(){return mobileMQ.matches}
function setPanelCollapsed(collapsed){
  if(!panelEl||!panelToggle)return;
  panelEl.classList.toggle("collapsed",collapsed);
  panelToggle.textContent=collapsed?"⌄":"⌃";
  panelToggle.setAttribute("aria-label",collapsed?"Развернуть панель":"Свернуть панель");
  setTimeout(()=>{if(map)map.container.fitToViewport()},80);
}
if(panelToggle){
  panelToggle.onclick=()=>setPanelCollapsed(!panelEl.classList.contains("collapsed"));
  if(isMobile())setPanelCollapsed(true);
}
if(mobileMQ.addEventListener)mobileMQ.addEventListener("change",e=>{
  if(e.matches)setPanelCollapsed(true);
  else{
    setPanelCollapsed(false);
    document.getElementById("routeInfo")?.classList.remove("mobile-open");
  }
});


const TYPE_FILTERS=[
  ["all","Все"],
  ["residential","🏠 Жилые"],
  ["retail","🛍 ТЦ/ТРЦ"],
  ["office","🏢 БЦ/офис"],
  ["public","◼ Общественные"],
  ["unknown","? Неизвестные"],
  ["special","⚠ Особые"]
];
const TYPE_BADGES={residential:"Ж",retail:"Т",office:"Б",public:"О",unknown:"?",special:"!"};

function objectInfo(n){return (window.MFC_OBJECT_INFO||{})[n]||{}}
function objectTypeKey(n){
  const x=objectInfo(n),t=String(x.type||"").toLowerCase();
  if(/не определ/.test(t))return "unknown";
  if(/торгов|трц|тц/.test(t))return "retail";
  if(/жил/.test(t))return "residential";
  if(/бизнес|офис|административ|государствен/.test(t))return "office";
  return "public";
}
function isSpecialObject(n){
  const x=objectInfo(n),txt=((x.notes||"")+" "+(x.access||"")+" "+(x.special||"")).toLowerCase();
  return !!WARN[n]||/капремонт|спецпропуск|спец.?пропуск|режимн|пропуск/.test(txt);
}
function typeMatches(rec){
  if(typeFilter==="all")return true;
  if(typeFilter==="special")return isSpecialObject(rec.item.n);
  return rec.kind===typeFilter;
}
function setMarkerVisible(rec,want){
  if(want&&!rec.visible){map.geoObjects.add(rec.pm);rec.visible=true}
  else if(!want&&rec.visible){map.geoObjects.remove(rec.pm);rec.visible=false}
}
function applyVisibility(){
  if(!map)return;
  let shown=0;
  markerRecords.forEach(rec=>{const want=active[rec.item.team]&&typeMatches(rec);setMarkerVisible(rec,want);if(want)shown++});
  statusEl.textContent="Показано: "+shown+" / 51 · 4 зоны обслуживания";
}
function button(team){
  const b=document.createElement("button"),c=MFC.filter(r=>r[1]===team).length;
  b.textContent=team+" · "+c;b.title=ROUTE_NAMES[team];b.style.background=COLORS[team];routeButtons[team]=b;
  b.onclick=()=>{
    active[team]=!active[team];b.classList.toggle("off",!active[team]);
    if(routeZones[team])active[team]?map.geoObjects.add(routeZones[team]):map.geoObjects.remove(routeZones[team]);
    if(routeLabels[team])active[team]?map.geoObjects.add(routeLabels[team]):map.geoObjects.remove(routeLabels[team]);
    applyVisibility();
  };
  filtersEl.appendChild(b);
}
Object.keys(COLORS).forEach(button);

function setTypeFilter(id){
  typeFilter=id;
  [...typeFiltersEl.querySelectorAll("button")].forEach(b=>b.classList.toggle("on",b.dataset.type===id));
  applyVisibility();
}
function setupTypeFilters(){
  TYPE_FILTERS.forEach(([id,label])=>{const b=document.createElement("button");b.dataset.type=id;b.textContent=label;b.onclick=()=>setTypeFilter(id);typeFiltersEl.appendChild(b)});
  setTypeFilter("all");
}
function setupInventorySummary(){
  const vals=MFC.map(r=>objectInfo(r[0]).confidence||"low");
  const high=vals.filter(v=>v==="high").length,medium=vals.filter(v=>v==="medium").length,low=vals.filter(v=>v==="low").length;
  inventorySummaryEl.textContent="Инвентаризация: "+high+" подтверждено · "+medium+" частично · "+low+" проверить";
}
function openObjectByNumber(n,zoom){
  const r=MFC.find(x=>x[0]===Number(n));
  if(!r)return;
  const [num,team,district,address]=r,p=COORDS[num];
  if(!p)return;
  if(!active[team]){
    active[team]=true;
    routeButtons[team]?.classList.remove("off");
    if(routeZones[team])map.geoObjects.add(routeZones[team]);
    if(routeLabels[team])map.geoObjects.add(routeLabels[team]);
  }
  if(typeFilter!=="all")setTypeFilter("all");else applyVisibility();
  map.setCenter(p,zoom||(isMobile()?14:15));
  if(isMobile())setPanelCollapsed(true);
  cardFor({n:num,team,district,address},p);
  statusEl.textContent="Объект №"+num+" · "+district;
}
function searchObject(){
  const q=String(searchInput.value||"").trim().toLowerCase();
  if(!q)return;
  let candidates=MFC.map(r=>{
    const [n,team,district,address]=r,x=objectInfo(n);
    const hay=[n,district,address,x.name,x.type,x.placement].join(" ").toLowerCase();
    let score=hay.includes(q)?1:0;
    if(String(n)===q)score=100;
    else if(String(address).toLowerCase().startsWith(q)||String(district).toLowerCase().startsWith(q))score=10;
    return {r,x,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  if(!candidates.length){statusEl.textContent="Ничего не найдено по запросу «"+searchInput.value+"»";return}
  openObjectByNumber(candidates[0].r[0]);
}
searchBtn.onclick=searchObject;
searchInput.addEventListener("keydown",e=>{if(e.key==="Enter")searchObject()});
function esc(v){return String(v??"—").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function cardFor(item,p){
  const w=WARN[item.n]||"Координата зафиксирована после проверки через Яндекс Геокодер.";
  const x=(window.MFC_OBJECT_INFO||{})[item.n]||{};
  const conf={high:["Подтверждено","ok"],medium:["Частично подтверждено","medium"],low:["Требует проверки","warn"]}[x.confidence]||["Нет оценки","warn"];
  const row=(label,value)=>'<div class="objrow"><div class="objlabel">'+label+'</div><div class="objvalue">'+esc(value||"Нет подтверждённых данных")+'</div></div>';
  cardBody.innerHTML=
    '<h2>'+esc(item.team)+' · '+esc(ROUTE_NAMES[item.team])+' · №'+item.n+' · '+esc(item.district)+'</h2>'+
    '<p><b>Адрес:</b> '+esc(item.address)+'</p>'+
    '<div class="objgrid">'+
      row("Тип объекта",x.type)+
      row("Название / комплекс",x.name)+
      row("Размещение МФЦ",x.placement)+
      row("Здание",x.building)+
      row("Парковка",x.parking)+
      row("Доступ",x.access)+
      row("Особенности",x.notes)+
      row("Источники",x.sources)+
    '</div>'+
    '<div class="confidence '+conf[1]+'"><b>Достоверность:</b> '+conf[0]+'</div>'+
    '<p class="coord"><b>Координаты:</b> '+p[0].toFixed(6)+', '+p[1].toFixed(6)+'</p>'+
    '<div class="check '+(WARN[item.n]?"warn":"ok")+'">'+esc(w)+'</div>';
  card.classList.add("show");
}
function loadV21(){return new Promise((resolve,reject)=>{if(window.ymaps)return resolve();const old=[...document.scripts].find(s=>s.src&&s.src.includes("api-maps.yandex.ru/v3/"));if(!old)return reject(new Error("Не найден загрузчик Яндекс Карт"));const sc=document.createElement("script");sc.src=old.src.replace("/v3/","/2.1/");sc.onload=resolve;sc.onerror=()=>reject(new Error("Не удалось загрузить Яндекс JS API 2.1"));document.head.appendChild(sc)})}

function setupRouteCard(){
  const panel=document.querySelector(".panel");
  if(!panel||document.getElementById("routeInfo"))return;
  const box=document.createElement("div");box.id="routeInfo";box.style.cssText="margin-top:10px;padding-top:10px;border-top:1px solid #eaecf0;font-size:12px;color:#344054";
  const sel=document.createElement("select");sel.id="routeSelect";sel.style.cssText="width:100%;padding:8px 10px;border:1px solid #d0d5dd;border-radius:10px;background:#fff;font-weight:700";
  Object.keys(ROUTE_META).forEach(t=>{const o=document.createElement("option");o.value=t;o.textContent=t+" · "+ROUTE_META[t].title+" · "+MFC.filter(r=>r[1]===t).length+" объектов";sel.appendChild(o)});
  const toggle=document.createElement("button");toggle.type="button";toggle.className="route-details-toggle";toggle.textContent="Показать подробности маршрута";
  const content=document.createElement("div");content.id="routeInfoBody";content.style.marginTop="8px";
  toggle.onclick=()=>{
    const open=box.classList.toggle("mobile-open");
    toggle.textContent=open?"Скрыть подробности маршрута":"Показать подробности маршрута";
    setTimeout(()=>{if(map)map.container.fitToViewport()},50);
  };
  box.appendChild(sel);box.appendChild(toggle);box.appendChild(content);panel.appendChild(box);
  function render(){
    const t=sel.value,m=ROUTE_META[t],rr=(window.MFC_ROAD_ROUTES||{})[t],byNum=Object.fromEntries(MFC.map(r=>[r[0],r]));
    const order=(rr&&rr.order)||m.order;
    const seq=order.map((n,i)=>{const r=byNum[n];return '<button class="route-address-link" data-n="'+n+'">'+(i+1)+'. №'+n+' '+esc(r[2])+' — '+esc(r[3])+'</button>'}).join("");
    const members=MFC.filter(r=>r[1]===t),counts={residential:0,retail:0,office:0,public:0,unknown:0};
    members.forEach(r=>counts[objectTypeKey(r[0])]++);
    const mix=[counts.residential?counts.residential+" жил.":null,counts.retail?counts.retail+" ТЦ/ТРЦ":null,counts.office?counts.office+" БЦ/офис":null,counts.public?counts.public+" общ.":null,counts.unknown?counts.unknown+" неизвестн.":null].filter(Boolean).join(" · ");
    content.innerHTML="<b>"+t+" · "+m.title+"</b><br><span style='color:#667085'>Нагрузка: "+m.level+" · самый удалённый от центра зоны объект: №"+m.far+"</span><br><span style='color:#667085'>Состав объектов: "+mix+"</span><br><br><b>Основной коридор:</b> "+m.corridor+(rr?"<br><b>Маршрут по дорогам:</b> "+rr.distance_km+" км · ≈ "+rr.duration_min+" мин":"")+"<br><br><b>Ориентир порядка объезда:</b><div class='route-addresses'>"+seq+"</div><br><b>Особые условия:</b> "+m.special+"<br><span style='display:block;margin-top:6px;color:#667085'>Нажми на любой адрес выше — откроется карточка объекта.</span>";
    content.querySelectorAll(".route-address-link").forEach(btn=>btn.onclick=()=>openObjectByNumber(btn.dataset.n));
  }
  sel.onchange=render;render();
}

function convexHull(points){
  const pts=points.map(p=>({lat:p[0],lon:p[1]})).sort((a,b)=>a.lon-b.lon||a.lat-b.lat);
  if(pts.length<=2)return pts.map(p=>[p.lat,p.lon]);
  const cross=(o,a,b)=>(a.lon-o.lon)*(b.lat-o.lat)-(a.lat-o.lat)*(b.lon-o.lon);
  const lower=[];
  for(const p of pts){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p)}
  const upper=[];
  for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p)}
  upper.pop();lower.pop();
  return lower.concat(upper).map(p=>[p.lat,p.lon]);
}
function paddedHull(points,factor=1.075){
  const hull=convexHull(points);
  const center=[points.reduce((a,p)=>a+p[0],0)/points.length,points.reduce((a,p)=>a+p[1],0)/points.length];
  return hull.map(([lat,lon])=>[center[0]+(lat-center[0])*factor,center[1]+(lon-center[1])*factor]);
}
function routeCenter(points){
  return [points.reduce((a,p)=>a+p[0],0)/points.length,points.reduce((a,p)=>a+p[1],0)/points.length];
}

async function init(){
  try{
    statusEl.textContent="Загружаю Яндекс Карты…";
    await loadV21();
    await new Promise((resolve,reject)=>ymaps.ready(resolve,reject));
    map=new ymaps.Map("map",{center:[55.55,37.45],zoom:9,controls:isMobile()?[]:["zoomControl"]},{suppressMapOpenBlock:true});

    setupRouteCard();
    setupTypeFilters();
    setupInventorySummary();

    Object.keys(ROUTE_META).forEach(t=>{
      const pts=MFC.filter(r=>r[1]===t).map(r=>COORDS[r[0]]).filter(Boolean);
      const hull=paddedHull(pts);
      routeZones[t]=new ymaps.Polygon([hull],{hintContent:t+" · "+ROUTE_NAMES[t]},{fillColor:COLORS[t],fillOpacity:.085,strokeColor:COLORS[t],strokeOpacity:.55,strokeWidth:2,interactivityModel:"default#transparent"});
      map.geoObjects.add(routeZones[t]);
      const center=routeCenter(pts);
      const labelLayout=ymaps.templateLayoutFactory.createClass('<div class="route-zone-label" style="border-color:'+COLORS[t]+';color:'+COLORS[t]+'">'+t+'</div>');
      routeLabels[t]=new ymaps.Placemark(center,{}, {iconLayout:labelLayout,iconOffset:[-22,-16],zIndex:50});
      map.geoObjects.add(routeLabels[t]);
    });

    const bounds=[];
    for(const r of MFC){
      const [n,team,district,address]=r,p=COORDS[n];
      if(!p)continue;
      const item={n,team,district,address},x=objectInfo(n),kind=objectTypeKey(n);
      const pm=new ymaps.Placemark(p,{iconContent:String(n),hintContent:"№"+n+" · "+district+" · "+(x.type||"")},{preset:"islands#circleIcon",iconColor:COLORS[team],zIndex:100});
      pm.events.add("click",()=>openObjectByNumber(n));
      groups[team].push(pm);
      markerRecords.push({pm,item,p,kind,visible:true});
      map.geoObjects.add(pm);
      bounds.push(p);
    }
    if(bounds.length)map.setBounds(bounds,{checkZoomRange:true,zoomMargin:isMobile()?[125,18,24,18]:[24,24,24,470]});
    applyVisibility();
    let resizeTimer;
    window.addEventListener("resize",()=>{
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(()=>{if(map)map.container.fitToViewport()},120);
    });
    window.addEventListener("orientationchange",()=>setTimeout(()=>{if(map)map.container.fitToViewport()},220));
  }catch(e){
    console.error(e);
    statusEl.textContent="Ошибка загрузки Яндекс Карт: "+(e.message||e);
  }
}
init();
// deploy build 8

// optimized routing build 9

// final route boundaries build 10

// deploy route cards build 11

// colored service zones build 20

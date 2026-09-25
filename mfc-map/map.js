const COLORS={"М1":"#e53935","М2":"#fb8c00","М3":"#2e7d32","М4":"#1e88e5","М5":"#8e24aa"};
const ROUTE_NAMES={"М1":"ЮАО юг/юго-восток","М2":"Бутово + ТиНАО","М3":"ЮЗАО","М4":"ЦАО","М5":"Внутренний юг"};
const ROUTE_META={
"М1":{title:"ЮАО юг / юго-восток",order:[45,5,3,43,7,8,1,2,6,9],corridor:"Каширское направление → Братеево/Зябликово → Бирюлёво → Чертаново",level:"средняя",far:3,special:"№6 Россошанская, 4 к2 — капремонт."},
"М2":{title:"Бутово + ТиНАО",order:[16,14,19,18,17,13,12,15,11],corridor:"Первомайское/Троицк → Ватутинки → Московский → Коммунарка → Бутово/Щербинка",level:"высокая по пробегу",far:16,special:"№16 Первомайское, Центральная, 100 — дом требует ручной проверки координаты."},
"М3":{title:"ЮЗАО",order:[48,49,24,47,26,23,22,27,46,10,41],corridor:"Ясенево → Тёплый Стан/Коньково → Обручевский → Ломоносовский/Гагаринский → Черёмушки/Зюзино → Чертаново",level:"средняя",far:41,special:"№24 Академика Варги, 26А — капремонт."},
"М4":{title:"ЦАО",order:[30,39,38,36,34,35,29,37,31,40,32],corridor:"Таганка/Басманный → Красносельский/Мещанский → Тверской → Арбат/Хамовники → Пресня",level:"высокая по парковке и доступу",far:39,special:"№35 Ипатьевский пер., 4-10 стр.1 — спецпропуск, обслуживание на выходных."},
"М5":{title:"Внутренний юг",order:[21,25,44,4,42,28,20,33,50,51],corridor:"Академический/Котловка → Нагорный/Нагатино → Даниловский → Якиманка/Замоскворечье",level:"средняя",far:50,special:"Без отдельных ограничений в исходном списке."}
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
const statusEl=document.getElementById("status"),filtersEl=document.getElementById("filters"),card=document.getElementById("card"),cardBody=document.getElementById("cardBody");
document.getElementById("closeCard").onclick=()=>card.classList.remove("show");
const active={},groups={};Object.keys(COLORS).forEach(t=>{active[t]=true;groups[t]=[]});
let map=null;const routeLines={};
function button(team){const b=document.createElement("button");const c=MFC.filter(r=>r[1]===team).length;b.textContent=team+" · "+c;b.title=ROUTE_NAMES[team];b.style.background=COLORS[team];b.onclick=()=>{active[team]=!active[team];b.classList.toggle("off",!active[team]);groups[team].forEach(pm=>active[team]?map.geoObjects.add(pm):map.geoObjects.remove(pm));if(routeLines[team]){active[team]?map.geoObjects.add(routeLines[team]):map.geoObjects.remove(routeLines[team])}};filtersEl.appendChild(b)}
Object.keys(COLORS).forEach(button);
function cardFor(item,p){const w=WARN[item.n]||"Координата зафиксирована после проверки через Яндекс Геокодер.";cardBody.innerHTML='<h2>'+item.team+' · '+ROUTE_NAMES[item.team]+' · №'+item.n+' · '+item.district+'</h2><p><b>Адрес:</b> '+item.address+'</p><p><b>Координаты:</b> '+p[0].toFixed(6)+', '+p[1].toFixed(6)+'</p><div class="check '+(WARN[item.n]?"warn":"ok")+'">'+w+'</div>';card.classList.add("show")}
function loadV21(){return new Promise((resolve,reject)=>{if(window.ymaps)return resolve();const old=[...document.scripts].find(s=>s.src&&s.src.includes("api-maps.yandex.ru/v3/"));if(!old)return reject(new Error("Не найден загрузчик Яндекс Карт"));const sc=document.createElement("script");sc.src=old.src.replace("/v3/","/2.1/");sc.onload=resolve;sc.onerror=()=>reject(new Error("Не удалось загрузить Яндекс JS API 2.1"));document.head.appendChild(sc)})}

function setupRouteCard(){
  const panel=document.querySelector(".panel");
  if(!panel||document.getElementById("routeInfo"))return;
  const box=document.createElement("div");box.id="routeInfo";box.style.cssText="margin-top:10px;padding-top:10px;border-top:1px solid #eaecf0;font-size:12px;color:#344054";
  const sel=document.createElement("select");sel.id="routeSelect";sel.style.cssText="width:100%;padding:8px 10px;border:1px solid #d0d5dd;border-radius:10px;background:#fff;font-weight:700";
  Object.keys(ROUTE_META).forEach(t=>{const o=document.createElement("option");o.value=t;o.textContent=t+" · "+ROUTE_META[t].title+" · "+MFC.filter(r=>r[1]===t).length+" объектов";sel.appendChild(o)});
  const content=document.createElement("div");content.id="routeInfoBody";content.style.marginTop="8px";
  box.appendChild(sel);box.appendChild(content);panel.appendChild(box);
  function render(){
    const t=sel.value,m=ROUTE_META[t],byNum=Object.fromEntries(MFC.map(r=>[r[0],r]));
    const seq=m.order.map((n,i)=>{const r=byNum[n];return (i+1)+". №"+n+" "+r[2]+" — "+r[3]}).join("<br>");
    content.innerHTML="<b>"+t+" · "+m.title+"</b><br><span style='color:#667085'>Нагрузка: "+m.level+" · самый удалённый от центра зоны объект: №"+m.far+"</span><br><br><b>Основной коридор:</b> "+m.corridor+"<br><br><b>Ориентир порядка объезда:</b><br>"+seq+"<br><br><b>Особые условия:</b> "+m.special+"<br><span style='display:block;margin-top:6px;color:#667085'>Порядок — ориентир без возвратов по территории. В конкретный день используются только адреса с заявками.</span>";
  }
  sel.onchange=render;render();
}

async function init(){try{statusEl.textContent="Загружаю Яндекс Карты…";await loadV21();await new Promise((resolve,reject)=>ymaps.ready(resolve,reject));map=new ymaps.Map("map",{center:[55.55,37.45],zoom:9,controls:["zoomControl"]},{suppressMapOpenBlock:true});setupRouteCard();Object.keys(ROUTE_META).forEach(t=>{const pts=ROUTE_META[t].order.map(n=>COORDS[n]).filter(Boolean);routeLines[t]=new ymaps.Polyline(pts,{}, {strokeColor:COLORS[t],strokeWidth:3,strokeOpacity:.45});map.geoObjects.add(routeLines[t])});const bounds=[];let count=0;for(const r of MFC){const [n,team,district,address]=r,p=COORDS[n];if(!p)continue;const item={n,team,district,address};const pm=new ymaps.Placemark(p,{iconContent:String(n)},{preset:"islands#circleIcon",iconColor:COLORS[team]});pm.events.add("click",()=>cardFor(item,p));groups[team].push(pm);map.geoObjects.add(pm);bounds.push(p);count++}if(bounds.length)map.setBounds(bounds,{checkZoomRange:true,zoomMargin:50});statusEl.textContent="На карте: "+count+" / 51 · координаты зафиксированы"}catch(e){console.error(e);statusEl.textContent="Ошибка загрузки Яндекс Карт: "+(e.message||e)}}
init();
// deploy build 8

// optimized routing build 9

// final route boundaries build 10

const COLORS={"М1":"#e53935","М2":"#fb8c00","М3":"#2e7d32","М4":"#1e88e5","М5":"#8e24aa"};
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
let map=null;
function button(team){const b=document.createElement("button");b.textContent=team;b.style.background=COLORS[team];b.onclick=()=>{active[team]=!active[team];b.classList.toggle("off",!active[team]);groups[team].forEach(pm=>active[team]?map.geoObjects.add(pm):map.geoObjects.remove(pm))};filtersEl.appendChild(b)}
Object.keys(COLORS).forEach(button);
function cardFor(item,p){const w=WARN[item.n]||"Координата зафиксирована после проверки через Яндекс Геокодер.";cardBody.innerHTML='<h2>'+item.team+' · №'+item.n+' · '+item.district+'</h2><p><b>Адрес:</b> '+item.address+'</p><p><b>Координаты:</b> '+p[0].toFixed(6)+', '+p[1].toFixed(6)+'</p><div class="check '+(WARN[item.n]?"warn":"ok")+'">'+w+'</div>';card.classList.add("show")}
function loadV21(){return new Promise((resolve,reject)=>{if(window.ymaps)return resolve();const old=[...document.scripts].find(s=>s.src&&s.src.includes("api-maps.yandex.ru/v3/"));if(!old)return reject(new Error("Не найден загрузчик Яндекс Карт"));const sc=document.createElement("script");sc.src=old.src.replace("/v3/","/2.1/");sc.onload=resolve;sc.onerror=()=>reject(new Error("Не удалось загрузить Яндекс JS API 2.1"));document.head.appendChild(sc)})}
async function init(){try{statusEl.textContent="Загружаю Яндекс Карты…";await loadV21();await new Promise((resolve,reject)=>ymaps.ready(resolve,reject));map=new ymaps.Map("map",{center:[55.55,37.45],zoom:9,controls:["zoomControl"]},{suppressMapOpenBlock:true});const bounds=[];let count=0;for(const r of MFC){const [n,team,district,address]=r,p=COORDS[n];if(!p)continue;const item={n,team,district,address};const pm=new ymaps.Placemark(p,{iconContent:String(n)},{preset:"islands#circleIcon",iconColor:COLORS[team]});pm.events.add("click",()=>cardFor(item,p));groups[team].push(pm);map.geoObjects.add(pm);bounds.push(p);count++}if(bounds.length)map.setBounds(bounds,{checkZoomRange:true,zoomMargin:50});statusEl.textContent="На карте: "+count+" / 51 · координаты зафиксированы"}catch(e){console.error(e);statusEl.textContent="Ошибка загрузки Яндекс Карт: "+(e.message||e)}}
init();
// deploy build 8

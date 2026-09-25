const C={"М1":"#e53935","М2":"#fb8c00","М3":"#2e7d32","М4":"#1e88e5","М5":"#8e24aa"};
const a={},g={};Object.keys(C).forEach(t=>{a[t]=true;g[t]=[]});
const s=document.getElementById("status"),f=document.getElementById("filters"),card=document.getElementById("card"),body=document.getElementById("cardBody");
document.getElementById("closeCard").onclick=()=>card.classList.remove("show");
Object.keys(C).forEach(t=>{const b=document.createElement("button");b.textContent=t;b.style.background=C[t];b.onclick=()=>{a[t]=!a[t];b.classList.toggle("off",!a[t]);g[t].forEach(x=>a[t]?map.geoObjects.add(x):map.geoObjects.remove(x))};f.appendChild(b)});
let map;
ymaps.ready(()=>{map=new ymaps.Map("map",{center:[55.55,37.45],zoom:9,controls:["zoomControl"]},{suppressMapOpenBlock:true});const bounds=[];let count=0;
for(const r of MFC){const [n,team,district,address]=r,p=MFC_COORDS[n];if(!p)continue;const pm=new ymaps.Placemark(p,{iconContent:String(n)},{preset:"islands#circleIcon",iconColor:C[team]});pm.events.add("click",()=>{const w=(MFC_COORD_WARN||{})[n]||"Координата зафиксирована после проверки адреса.";body.innerHTML='<h2>'+team+' · №'+n+' · '+district+'</h2><p><b>Адрес:</b> '+address+'</p><p><b>Координаты:</b> '+p[0].toFixed(6)+', '+p[1].toFixed(6)+'</p><div class="check '+((MFC_COORD_WARN||{})[n]?"warn":"ok")+'">'+w+'</div>';card.classList.add("show")});g[team].push(pm);map.geoObjects.add(pm);bounds.push(p);count++}
if(bounds.length)map.setBounds(bounds,{checkZoomRange:true,zoomMargin:50});s.textContent="На карте: "+count+" / 51 · координаты зафиксированы";});
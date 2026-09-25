const C={"М1":"#e63946","М2":"#f59e0b","М3":"#16a34a","М4":"#2563eb","М5":"#9333ea"},m=L.map("map",{zoomControl:false}).setView([55.55,37.45],9),g={},b=[];
L.control.zoom({position:"bottomright"}).addTo(m);
L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{maxZoom:20,subdomains:"abcd",attribution:"© OpenStreetMap © CARTO"}).addTo(m);
for(const t in C){g[t]=L.layerGroup().addTo(m);let x=document.createElement("button");x.textContent=t;x.style.background=C[t];x.onclick=()=>{if(m.hasLayer(g[t])){m.removeLayer(g[t]);x.style.opacity=.28}else{g[t].addTo(m);x.style.opacity=1}};f.appendChild(x)}
const corrections={
1:{address:"Загорьевская улица, 10 корпус 4, Москва",note:"Уточнён корпус 4"},
3:{address:"улица Борисовские Пруды, 18 корпус 3, Москва",note:"Уточнён корпус 3"},
19:{note:"ВНИМАНИЕ: подразделение по адресу 2-я Нововатутинская, 1 отмечено в актуальных картах как закрытое"},
20:{district:"Даниловский",note:"В исходнике район указан как Донской; актуальные справочники относят Хавскую, 26 к МФЦ Даниловского района"},
28:{note:"Автозаводская, 18 — реальный адрес ТРЦ Ривьера; требуется подтверждение, что это обслуживаемый офис МФЦ, а не только ориентир/остановка"},
47:{note:"В актуальных справочниках МФЦ Коньково указан на Академика Волгина, 25 к1; исходный адрес Миклухо-Маклая, 18 к2 оставлен для проверки"}
};
function norm(a){let o=corrections[a[0]]||{};return [a[0],a[1],o.district||a[2],o.address||a[3],o.note||"Адрес совпадает с проверенными справочниками"]}
function add(a,p){let i=L.divIcon({className:"",html:`<div class=n style="background:${C[a[1]]}">${a[0]}</div>`,iconSize:[34,34],iconAnchor:[17,17]});let warn=/ВНИМАНИЕ|требуется|актуальных/.test(a[4]);L.marker(p,{icon:i}).bindPopup(`<b>${a[1]} · №${a[0]}</b><br><b>${a[2]}</b><br>${a[3]}<br><small>Координаты: ${p[0].toFixed(6)}, ${p[1].toFixed(6)}</small><hr><span style="color:${warn?"#b45309":"#15803d"}">${a[4]}</span>`).addTo(g[a[1]]);b.push(p)}
async function geo(raw){let a=norm(raw),k="mfc-v2:"+a[3],z=localStorage.getItem(k);if(z){add(a,JSON.parse(z));return 1}try{let r=await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ru&addressdetails=1&q="+encodeURIComponent(a[3]+", Россия"),{headers:{"Accept-Language":"ru"}}),j=await r.json();if(j[0]){let p=[+j[0].lat,+j[0].lon];localStorage.setItem(k,JSON.stringify(p));add(a,p);return 1}}catch(e){}return 0}
(async()=>{let ok=0,bad=[];for(let i=0;i<MFC.length;i++){st.textContent=`Проверяю координаты: ${i+1}/51`;if(await geo(MFC[i]))ok++;else bad.push(MFC[i][0]);await new Promise(r=>setTimeout(r,1050))}if(b.length)m.fitBounds(b,{padding:[45,45]});st.textContent=`Точки: ${ok}/51`+(bad.length?` · не найдены № ${bad.join(", ")}`:" · координаты определены по полным адресам")})();
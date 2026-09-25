const COLORS={"М1":"#e53935","М2":"#fb8c00","М3":"#2e7d32","М4":"#1e88e5","М5":"#8e24aa"};
const statusEl=document.getElementById("status"),filtersEl=document.getElementById("filters"),card=document.getElementById("card"),cardBody=document.getElementById("cardBody");
document.getElementById("closeCard").onclick=()=>card.classList.remove("show");
const VERIFIED={
  1:{query:"Москва, Загорьевская улица, 10 корпус 4",display:"Загорьевская улица, д. 10, корп. 4",note:"Корпус уточнён по официальному городскому справочнику."},
  3:{query:"Москва, улица Борисовские Пруды, 18 корпус 3",display:"ул. Борисовские Пруды, д. 18, корп. 3",note:"Корпус уточнён по официальному городскому справочнику."},
  20:{district:"Даниловский",note:"Хавская, 26 относится к Даниловскому району; в исходном списке район был указан как Донской."}
};
const active={};Object.keys(COLORS).forEach(t=>active[t]=true);
let map=null;const markerGroups={};Object.keys(COLORS).forEach(t=>markerGroups[t]=[]);
function normalized(raw){
  const [n,team,district,address]=raw,v=VERIFIED[n]||{};
  return {n,team,district:v.district||district,address:v.display||address,query:v.query||address,note:v.note||""};
}
function makeButton(team){
  const b=document.createElement("button");b.textContent=team;b.style.background=COLORS[team];
  b.onclick=()=>{active[team]=!active[team];b.classList.toggle("off",!active[team]);for(const x of markerGroups[team]){if(active[team]&&!x.on){map.addChild(x.marker);x.on=true}else if(!active[team]&&x.on){map.removeChild(x.marker);x.on=false}}};
  filtersEl.appendChild(b);
}
Object.keys(COLORS).forEach(makeButton);
function showCard(item,result,coords,source){
  const matched=result?([result.properties?.name,result.properties?.description].filter(Boolean).join(", ")):"";
  const warn=item.note||(!result?"Координаты получены резервным геокодированием; адрес нужно проверить.":"");
  cardBody.innerHTML='<h2>'+item.team+' · №'+item.n+' · '+item.district+'</h2>'+
    '<p><b>Наш адрес:</b> '+item.address+'</p>'+
    (matched?'<p><b>Яндекс нашёл:</b> '+matched+'</p>':'')+
    '<p><b>Координаты:</b> '+coords[1].toFixed(6)+', '+coords[0].toFixed(6)+'</p>'+
    '<div class="check '+(warn?'warn':'ok')+'">'+(warn?warn:'Адрес распознан Яндексом по указанному зданию.')+'<br><span style="color:#667085">Источник координат: '+source+'</span></div>';
  card.classList.add("show");
}
function addMarker(item,result,coords,source){
  const el=document.createElement("div");el.className="pin";el.style.background=COLORS[item.team];el.innerHTML="<span>"+item.n+"</span>";
  const marker=new ymaps3.YMapMarker({coordinates:coords},el);
  el.onclick=(e)=>{e.stopPropagation();showCard(item,result,coords,source)};
  map.addChild(marker);markerGroups[item.team].push({marker,on:true});return coords;
}
async function yandexGeo(item){
  try{
    const r=await ymaps3.search({text:item.query,type:["toponyms"],center:[37.62,55.75],span:[3.5,2.5],limit:1});
    if(r&&r.length&&r[0].geometry?.coordinates)return {result:r[0],coords:r[0].geometry.coordinates,source:"Яндекс Геопоиск"};
  }catch(e){console.warn("Yandex search failed",item.n,e)}
  return null;
}
async function fallbackGeo(item){
  try{
    const u="https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ru&q="+encodeURIComponent(item.query+", Россия");
    const r=await fetch(u,{headers:{"Accept-Language":"ru"}}),j=await r.json();
    if(j[0])return {result:null,coords:[+j[0].lon,+j[0].lat],source:"резервный геокодер"};
  }catch(e){}
  return null;
}
async function main(){
  try{
    await ymaps3.ready;
    ymaps3.getDefaultConfig().setApikeys({search:window.YA_MAPS_KEY});
    const {YMap,YMapDefaultSchemeLayer,YMapDefaultFeaturesLayer}=ymaps3;
    map=new YMap(document.getElementById("map"),{
      location:{center:[37.45,55.55],zoom:9},
      behaviors:["drag","pinchZoom","scrollZoom","dblClick","oneFingerZoom"],
      theme:"light",
      mode:"vector"
    });
    map.addChild(new YMapDefaultSchemeLayer({}));
    map.addChild(new YMapDefaultFeaturesLayer({zIndex:1800}));
    const points=[],failed=[];
    for(let i=0;i<MFC.length;i++){
      const item=normalized(MFC[i]);
      statusEl.textContent="Сверяю адреса с Яндексом: "+(i+1)+" / "+MFC.length;
      let geo=await yandexGeo(item);
      if(!geo)geo=await fallbackGeo(item);
      if(geo)points.push(addMarker(item,geo.result,geo.coords,geo.source));else failed.push(item.n);
      await new Promise(r=>setTimeout(r,120));
    }
    if(points.length){
      const lngs=points.map(p=>p[0]),lats=points.map(p=>p[1]);
      map.setLocation({bounds:[[Math.min(...lngs),Math.max(...lats)],[Math.max(...lngs),Math.min(...lats)]],duration:500});
    }
    statusEl.textContent="На карте: "+points.length+" / 51"+(failed.length?" · не найдены № "+failed.join(", "):" · адреса сопоставлены с координатами");
  }catch(e){
    console.error(e);statusEl.textContent="Яндекс Карты не загрузились. Проверь ограничение API-ключа по HTTP Referer для texas359-art.github.io.";
  }
}
main();
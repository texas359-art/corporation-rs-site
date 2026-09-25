const COLORS={"М1":"#e53935","М2":"#fb8c00","М3":"#2e7d32","М4":"#1e88e5","М5":"#8e24aa"};
const statusEl=document.getElementById("status");
const filtersEl=document.getElementById("filters");
const card=document.getElementById("card");
const cardBody=document.getElementById("cardBody");
document.getElementById("closeCard").onclick=()=>card.classList.remove("show");

const active={}; for(const t of Object.keys(COLORS)) active[t]=true;
const markerGroups={}; for(const t of Object.keys(COLORS)) markerGroups[t]=[];
let map=null;

function makeButton(team){
  const b=document.createElement("button");
  b.textContent=team; b.style.background=COLORS[team];
  b.onclick=()=>{
    active[team]=!active[team];
    b.classList.toggle("off",!active[team]);
    for(const x of markerGroups[team]){
      if(active[team]&&!x.on){ map.addChild(x.marker); x.on=true; }
      else if(!active[team]&&x.on){ map.removeChild(x.marker); x.on=false; }
    }
  };
  filtersEl.appendChild(b);
}
Object.keys(COLORS).forEach(makeButton);

function normalized(raw){
  const [n,team,district,address]=raw;
  return {n,team,district,address,query:address};
}

function showCard(item,coords,source,matched){
  cardBody.innerHTML =
    '<h2>'+item.team+' · №'+item.n+' · '+item.district+'</h2>'+
    '<p><b>Адрес из списка:</b> '+item.address+'</p>'+
    (matched?'<p><b>Геокодер распознал:</b> '+matched+'</p>':'')+
    '<p><b>Координаты:</b> '+coords[1].toFixed(6)+', '+coords[0].toFixed(6)+'</p>'+
    '<div class="check ok">Точка поставлена по полному адресу здания.<br><span style="color:#667085">Источник координат: '+source+'</span></div>';
  card.classList.add("show");
}

function addMarker(item,coords,source,matched){
  const el=document.createElement("div");
  el.className="pin"; el.style.background=COLORS[item.team];
  el.innerHTML="<span>"+item.n+"</span>";
  const marker=new ymaps3.YMapMarker({coordinates:coords},el);
  el.onclick=(e)=>{e.stopPropagation();showCard(item,coords,source,matched)};
  map.addChild(marker);
  markerGroups[item.team].push({marker,on:true});
  return coords;
}

async function geocode(item){
  const cacheKey="mfc-geocode-v3:"+item.address;
  const cached=localStorage.getItem(cacheKey);
  if(cached){
    try{return JSON.parse(cached);}catch(e){}
  }
  const url="https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ru&addressdetails=1&q="+encodeURIComponent(item.query+", Россия");
  const r=await fetch(url,{headers:{"Accept-Language":"ru"}});
  if(!r.ok) throw new Error("Geocoder HTTP "+r.status);
  const j=await r.json();
  if(!j[0]) return null;
  const out={coords:[+j[0].lon,+j[0].lat],matched:j[0].display_name||""};
  localStorage.setItem(cacheKey,JSON.stringify(out));
  return out;
}

async function init(){
  try{
    statusEl.textContent="Загружаю Яндекс Карты…";
    if(typeof ymaps3==="undefined"){throw new Error(window.YA_SCRIPT_ERROR||"объект ymaps3 не появился: API не загрузился или ключ ещё не активирован для домена");}
    await ymaps3.ready;
    const {YMap,YMapDefaultSchemeLayer,YMapDefaultFeaturesLayer}=ymaps3;
    map=new YMap(document.getElementById("map"),{
      location:{center:[37.588144,55.733842],zoom:9}
    });
    map.addChild(new YMapDefaultSchemeLayer({theme:"light"}));
    map.addChild(new YMapDefaultFeaturesLayer({zIndex:1800}));

    const points=[],failed=[];
    for(let i=0;i<MFC.length;i++){
      const item=normalized(MFC[i]);
      statusEl.textContent="Ставлю адреса на карту: "+(i+1)+" / "+MFC.length;
      try{
        const g=await geocode(item);
        if(g){ points.push(addMarker(item,g.coords,"геокодер адресов",g.matched)); }
        else failed.push(item.n);
      }catch(e){ console.warn("geocode",item.n,e); failed.push(item.n); }
      await new Promise(r=>setTimeout(r,1050));
    }
    if(points.length){
      const lngs=points.map(p=>p[0]), lats=points.map(p=>p[1]);
      const bounds=[[Math.min(...lngs),Math.max(...lats)],[Math.max(...lngs),Math.min(...lats)]];
      map.setLocation({bounds,duration:400});
    }
    statusEl.textContent="На карте: "+points.length+" / 51"+(failed.length?" · проверить № "+failed.join(", "):" · все точки поставлены по адресам");
  }catch(e){
    console.error(e);
    const detail=(e&&e.message)?e.message:String(e);
    statusEl.textContent="Ошибка Яндекс Карт: "+detail+". Если ключ только что изменён, подожди до 15 минут и обнови страницу.";
  }
}
init();
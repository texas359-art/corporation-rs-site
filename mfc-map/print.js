const PRINT_COLORS={"М1":"#e53935","М2":"#fb8c00","М3":"#2e7d32","М4":"#1e88e5"};
const PRINT_COORDS={
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

const ROUTE_PRINT_NAMES={
  "М1":"Юг / юго-восток",
  "М2":"ТиНАО + ЮЗАО",
  "М3":"Внутренний юг",
  "М4":"ЦАО + Замоскворечье"
};

function hull(points){
  const pts=points.map(p=>({x:p[1],y:p[0]})).sort((a,b)=>a.x-b.x||a.y-b.y);
  if(pts.length<3)return pts.map(p=>[p.y,p.x]);
  const cross=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lo=[],hi=[];
  for(const p of pts){while(lo.length>=2&&cross(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
  for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(hi.length>=2&&cross(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p)}
  lo.pop();hi.pop();
  return lo.concat(hi).map(p=>[p.y,p.x]);
}
function padded(points,f=1.055){
  const h=hull(points),c=[points.reduce((a,p)=>a+p[0],0)/points.length,points.reduce((a,p)=>a+p[1],0)/points.length];
  return h.map(([lat,lon])=>[c[0]+(lat-c[0])*f,c[1]+(lon-c[1])*f]);
}
function center(points){
  return [points.reduce((a,p)=>a+p[0],0)/points.length,points.reduce((a,p)=>a+p[1],0)/points.length];
}
function shortAddr(a){
  return String(a)
    .replace(/, Москва$/,"")
    .replace("улица ","ул. ")
    .replace("проспект","пр-т")
    .replace("проезд","пр-д")
    .replace("переулок","пер.")
    .replace("строение","стр.")
    .replace("корпус","к.");
}
function markerLayout(team,n,extra=""){
  return ymaps.templateLayoutFactory.createClass('<div class="print-pin '+extra+'" style="background:'+PRINT_COLORS[team]+'">'+n+'</div>');
}
function zoneLabelLayout(team){
  return ymaps.templateLayoutFactory.createClass('<div class="route-zone-label" style="border-color:'+PRINT_COLORS[team]+';color:'+PRINT_COLORS[team]+'">'+team+'</div>');
}

function addZonesAndPins(map,teams,options={}){
  const bounds=[];
  teams.forEach(team=>{
    const rows=MFC.filter(r=>r[1]===team);
    const pts=rows.map(r=>PRINT_COORDS[r[0]]).filter(Boolean);

    if(options.zones!==false){
      map.geoObjects.add(new ymaps.Polygon([padded(pts)],{},{
        fillColor:PRINT_COLORS[team],
        fillOpacity:options.fillOpacity ?? .055,
        strokeColor:PRINT_COLORS[team],
        strokeOpacity:options.strokeOpacity ?? .50,
        strokeWidth:options.strokeWidth ?? 2,
        interactivityModel:"default#transparent"
      }));
    }

    if(options.zoneLabels!==false){
      const c=center(pts);
      map.geoObjects.add(new ymaps.Placemark(c,{},{
        iconLayout:zoneLabelLayout(team),
        iconOffset:[-17,-12],
        zIndex:60
      }));
    }

    rows.forEach(([n,,district])=>{
      const p=PRINT_COORDS[n]; if(!p)return;
      bounds.push(p);
      map.geoObjects.add(new ymaps.Placemark(p,{hintContent:"№"+n+" · "+district},{
        iconLayout:markerLayout(team,n,options.cao?"cao":""),
        iconOffset:[options.cao?-12:-11,options.cao?-12:-11],
        zIndex:100
      }));
    });
  });
  return bounds;
}

function renderLists(){
  const routeLists=document.getElementById("routeLists");
  routeLists.innerHTML="";
  Object.keys(PRINT_COLORS).forEach(team=>{
    const rows=MFC.filter(r=>r[1]===team).sort((a,b)=>a[0]-b[0]);
    const rr=(window.MFC_ROAD_ROUTES||{})[team]||{};

    const box=document.createElement("section");
    box.className="route-box";

    const head=document.createElement("div");
    head.className="route-head";
    head.style.background=PRINT_COLORS[team];
    head.innerHTML='<span>'+team+' · '+ROUTE_PRINT_NAMES[team]+'</span><small>'+rows.length+' объектов'+(rr.distance_km?' · '+rr.distance_km+' км':'')+'</small>';

    const list=document.createElement("div");
    list.className="route-list";
    list.innerHTML=rows.map(([n,,district,address])=>
      '<div class="route-item">'+
        '<div class="route-num">№'+n+'</div>'+
        '<div class="route-text"><span class="route-district">'+district+'</span> — '+shortAddr(address)+'</div>'+
      '</div>'
    ).join("");

    box.appendChild(head);
    box.appendChild(list);
    routeLists.appendChild(box);
  });
}

ymaps.ready(()=>{
  renderLists();

  const mainMap=new ymaps.Map("mapMain",{center:[55.61,37.48],zoom:9,controls:[]},{
    suppressMapOpenBlock:true,
    yandexMapDisablePoiInteractivity:true
  });
  const mainBounds=addZonesAndPins(mainMap,["М1","М2","М3","М4"],{
    fillOpacity:.05,strokeOpacity:.48,strokeWidth:2
  });
  if(mainBounds.length){
    mainMap.setBounds(mainBounds,{checkZoomRange:true,zoomMargin:[30,150,28,32]});
  }

  const caoMap=new ymaps.Map("mapCao",{center:[55.758,37.615],zoom:12,controls:[]},{
    suppressMapOpenBlock:true,
    yandexMapDisablePoiInteractivity:true
  });
  const caoBounds=addZonesAndPins(caoMap,["М4"],{
    zones:false,
    zoneLabels:false,
    cao:true
  });
  if(caoBounds.length){
    caoMap.setBounds(caoBounds,{checkZoomRange:true,zoomMargin:[28,18,18,18]});
  }

  const fit=()=>{
    mainMap.container.fitToViewport();
    caoMap.container.fitToViewport();
  };
  setTimeout(fit,300);
  window.addEventListener("resize",()=>setTimeout(fit,80));
  window.addEventListener("beforeprint",()=>setTimeout(fit,80));
});
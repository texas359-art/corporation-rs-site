import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const mount = document.getElementById('viewer');
const loading = document.getElementById('loading');
const status = document.getElementById('viewer-status');

try {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcfd9e2);
  scene.fog = new THREE.Fog(0xcfd9e2, 32, 92);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 180);
  camera.position.set(14.5, 8.7, 17.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.target.set(0, 3.45, 0);
  controls.minDistance = 8.5;
  controls.maxDistance = 31;
  controls.maxPolarAngle = Math.PI / 2.03;
  controls.enablePan = false;

  // ---------- procedural textures ----------
  const canvasTex = (size, painter, repeatX = 1, repeatY = 1) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    painter(ctx, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return tex;
  };

  const brickTex = canvasTex(1024, (ctx, s) => {
    ctx.fillStyle = '#d9d1c8'; ctx.fillRect(0, 0, s, s);
    const bh = 66, bw = 160, mortar = 7;
    for (let row = 0; row < Math.ceil(s / bh) + 1; row++) {
      const off = row % 2 ? -bw / 2 : 0;
      for (let x = off; x < s + bw; x += bw) {
        const v = 56 + Math.floor(Math.random() * 18);
        ctx.fillStyle = `rgb(${v + 22},${v},${v - 7})`;
        ctx.fillRect(x + mortar / 2, row * bh + mortar / 2, bw - mortar, bh - mortar);
        ctx.fillStyle = 'rgba(255,255,255,.035)';
        ctx.fillRect(x + 10, row * bh + 8, bw - 24, 4);
      }
    }
  }, 2.8, 2.8);

  const foundationTex = canvasTex(768, (ctx, s) => {
    ctx.fillStyle = '#a8aaa6'; ctx.fillRect(0,0,s,s);
    const bh=58,bw=150,m=5;
    for(let r=0;r<Math.ceil(s/bh)+1;r++){
      const off=r%2?-bw/2:0;
      for(let x=off;x<s+bw;x+=bw){
        const g=78+Math.floor(Math.random()*23);
        ctx.fillStyle=`rgb(${g},${g+1},${g+2})`;
        ctx.fillRect(x+m/2,r*bh+m/2,bw-m,bh-m);
      }
    }
  }, 3.1, 1.2);

  const roofTex = canvasTex(1024, (ctx, s) => {
    ctx.fillStyle='#343a43';ctx.fillRect(0,0,s,s);
    const h=44,w=88;
    for(let r=0;r<Math.ceil(s/h)+1;r++){
      const off=r%2?-w/2:0;
      for(let x=off;x<s+w;x+=w){
        ctx.fillStyle=r%2?'#363d47':'#303741';
        ctx.fillRect(x+2,r*h+2,w-4,h-4);
        ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(x+4,r*h+5);ctx.lineTo(x+w-6,r*h+5);ctx.stroke();
      }
    }
  }, 4.8, 5.0);

  const woodTex = canvasTex(768,(ctx,s)=>{
    ctx.fillStyle='#b89264';ctx.fillRect(0,0,s,s);
    for(let i=0;i<70;i++){
      const y=Math.random()*s;
      ctx.strokeStyle=`rgba(${75+Math.random()*45},${50+Math.random()*30},${28+Math.random()*20},${.08+Math.random()*.11})`;
      ctx.lineWidth=1+Math.random()*2;
      ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(s*.3,y+Math.random()*8-4,s*.7,y+Math.random()*10-5,s,y+Math.random()*5-2.5);ctx.stroke();
    }
  }, 1.8, 4.4);

  const grassTex = canvasTex(512,(ctx,s)=>{
    ctx.fillStyle='#748962';ctx.fillRect(0,0,s,s);
    for(let i=0;i<3800;i++){
      const g=85+Math.floor(Math.random()*55);
      ctx.fillStyle=`rgba(${55+Math.random()*28},${g},${42+Math.random()*24},.34)`;
      const x=Math.random()*s,y=Math.random()*s;
      ctx.fillRect(x,y,1+Math.random()*2,1+Math.random()*2);
    }
  }, 22,22);

  const mats = {
    brick: new THREE.MeshStandardMaterial({ map: brickTex, color: 0x8a6558, roughness: 0.93 }),
    foundation: new THREE.MeshStandardMaterial({ map: foundationTex, color: 0x9a9c99, roughness: 0.96 }),
    roof: new THREE.MeshStandardMaterial({ map: roofTex, color: 0x7b838e, roughness: 0.78, metalness: 0.12 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.76 }),
    wood: new THREE.MeshStandardMaterial({ map: woodTex, color: 0xc09a6c, roughness: 0.84 }),
    door: new THREE.MeshStandardMaterial({ color: 0x3a332e, roughness: 0.78 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x9fc5da, roughness: 0.07, transmission: 0.18, transparent: true, opacity: 0.72, metalness: 0.02 }),
    glassNight: new THREE.MeshStandardMaterial({ color: 0xffc77f, emissive: 0xff9c43, emissiveIntensity: 1.5, transparent: true, opacity: 0.92 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0xcacac4, roughness: 0.98 }),
    interiorWall: new THREE.MeshStandardMaterial({ color: 0xe7e1d6, roughness: 0.9 }),
    floor: new THREE.MeshStandardMaterial({ color: 0xb78e63, roughness: 0.86 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x24292d, roughness: 0.78 }),
    sofa: new THREE.MeshStandardMaterial({ color: 0xb8b2a7, roughness: 0.94 }),
    bed: new THREE.MeshStandardMaterial({ color: 0xe0d8ca, roughness: 0.94 }),
    grass: new THREE.MeshStandardMaterial({ map: grassTex, color: 0xb0c89d, roughness: 1 }),
    foliage: new THREE.MeshStandardMaterial({ color: 0x607b52, roughness: 1 }),
    foliage2: new THREE.MeshStandardMaterial({ color: 0x799065, roughness: 1 })
  };

  const meshBox = (parent, w, h, d, material, x, y, z, rx=0, ry=0, rz=0, name='') => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
    m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow=true; m.receiveShadow=true; m.name=name;
    parent.add(m); return m;
  };

  const sceneRoot = new THREE.Group();
  scene.add(sceneRoot);

  // ---------- landscape ----------
  const ground = new THREE.Mesh(new THREE.CircleGeometry(44,96), mats.grass);
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  sceneRoot.add(ground);

  const path = meshBox(sceneRoot, 2.4, .035, 7.2, mats.concrete, -.85, .02, 8.1);
  const apron = meshBox(sceneRoot, 11.6, .035, 2.1, mats.concrete, 0, .018, 5.05);

  function shrub(x,z,s=1, material=mats.foliage){
    const g = new THREE.Group();
    for(let i=0;i<5;i++){
      const q = new THREE.Mesh(new THREE.IcosahedronGeometry(.26*s*(.8+Math.random()*.55),1), material);
      q.position.set((Math.random()-.5)*.42*s,.18*s+Math.random()*.25*s,(Math.random()-.5)*.42*s);
      q.castShadow=true; g.add(q);
    }
    g.position.set(x,0,z); sceneRoot.add(g);
  }
  [[-5.3,4.7,1.0],[-4.7,3.9,.8],[4.8,4.2,1.05],[5.2,2.9,.75],[-5,-3.4,.9],[4.8,-3.6,.85],[-2.9,-5.1,.7],[2.6,-5.2,.8],[-3.9,6.3,.72],[3.8,6.4,.8]].forEach((v,i)=>shrub(v[0],v[1],v[2],i%2?mats.foliage2:mats.foliage));

  // ---------- house hierarchy ----------
  const house = new THREE.Group();
  house.position.y = 0.16;
  sceneRoot.add(house);

  const foundation = new THREE.Group();
  const floor1 = new THREE.Group();
  const floor2 = new THREE.Group();
  const roof = new THREE.Group();
  const porch = new THREE.Group();
  const interior1 = new THREE.Group();
  const interior2 = new THREE.Group();
  house.add(foundation,floor1,floor2,roof,porch,interior1,interior2);

  const W=8,D=8,th=.22, foundationH=.48, f1H=2.7, kneeH=1.34;
  const yF1 = foundationH;
  const yF2 = foundationH+f1H;
  const yRoof = yF2+kneeH;

  meshBox(foundation,W+.18,foundationH,D+.18,mats.foundation,0,foundationH/2,0);
  meshBox(house,W+.05,.10,D+.05,mats.concrete,0,foundationH+.05,0);

  // Separate external walls so cutaway mode can open the front.
  const f1Front = meshBox(floor1,W,f1H,th,mats.brick,0,yF1+f1H/2,D/2,'',0,0,0,'f1-front');
  const f1Back  = meshBox(floor1,W,f1H,th,mats.brick,0,yF1+f1H/2,-D/2,'',0,0,0,'f1-back');
  const f1Left  = meshBox(floor1,th,f1H,D-th*2,mats.brick,-W/2,yF1+f1H/2,0,'',0,0,0,'f1-left');
  const f1Right = meshBox(floor1,th,f1H,D-th*2,mats.brick,W/2,yF1+f1H/2,0,'',0,0,0,'f1-right');

  const f2Front = meshBox(floor2,W,kneeH,th,mats.brick,0,yF2+kneeH/2,D/2,'',0,0,0,'f2-front');
  const f2Back  = meshBox(floor2,W,kneeH,th,mats.brick,0,yF2+kneeH/2,-D/2,'',0,0,0,'f2-back');
  const f2Left  = meshBox(floor2,th,kneeH,D-th*2,mats.brick,-W/2,yF2+kneeH/2,0,'',0,0,0,'f2-left');
  const f2Right = meshBox(floor2,th,kneeH,D-th*2,mats.brick,W/2,yF2+kneeH/2,0,'',0,0,0,'f2-right');

  meshBox(interior1,W-.35,.10,D-.35,mats.floor,0,yF1+.09,0);
  meshBox(interior2,W-.35,.12,D-.35,mats.floor,0,yF2+.07,0);

  // Gables
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-4,0); gableShape.lineTo(-3.35,1.63); gableShape.lineTo(-1.25,2.93); gableShape.lineTo(0,3.18); gableShape.lineTo(1.25,2.93); gableShape.lineTo(3.35,1.63); gableShape.lineTo(4,0); gableShape.lineTo(-4,0);
  const gableGeo = new THREE.ShapeGeometry(gableShape);
  const gableFront = new THREE.Mesh(gableGeo,mats.brick); gableFront.position.set(0,yRoof,D/2+.012); gableFront.castShadow=true; floor2.add(gableFront);
  const gableBack = gableFront.clone(); gableBack.rotation.y=Math.PI; gableBack.position.z=-D/2-.012; floor2.add(gableBack);

  // Gambrel roof panels
  const roofPts=[[-4.45,yRoof],[-3.48,yRoof+1.95],[-1.18,yRoof+3.18],[0,yRoof+3.38],[1.18,yRoof+3.18],[3.48,yRoof+1.95],[4.45,yRoof]];
  const slopePanel=(a,b)=>{
    const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),ang=Math.atan2(dy,dx);
    const panel=meshBox(roof,len,.17,D+.78,mats.roof,(a[0]+b[0])/2,(a[1]+b[1])/2,0,0,0,ang);
    panel.geometry.computeVertexNormals(); return {len,ang,cx:(a[0]+b[0])/2,cy:(a[1]+b[1])/2};
  };
  const slopes=[]; for(let i=0;i<roofPts.length-1;i++) slopes.push(slopePanel(roofPts[i],roofPts[i+1]));
  // white edge trims front/back
  slopes.forEach(s=>{[-1,1].forEach(side=>meshBox(roof,s.len,.10,.10,mats.trim,s.cx,s.cy,side*(D/2+.42),0,0,s.ang));});
  // ridge cap and gutters
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,D+.82,16),mats.dark); ridge.rotation.x=Math.PI/2; ridge.position.set(0,yRoof+3.39,0); ridge.castShadow=true; roof.add(ridge);
  const gutterMat = new THREE.MeshStandardMaterial({color:0xe9e8e3,roughness:.7,metalness:.12});
  [-4.43,4.43].forEach(x=>meshBox(roof,.11,.12,D+.68,gutterMat,x,yRoof+.02,0));

  // ---------- doors and windows ----------
  const windowMeshes=[];
  function makeWindow(w,h){
    const g=new THREE.Group();
    meshBox(g,w+.18,h+.18,.055,mats.dark,0,0,-.035);
    const glass=meshBox(g,w,h,.036,mats.glass,0,0,.015); windowMeshes.push(glass);
    const bar=.055,depth=.075;
    meshBox(g,bar,h+.11,depth,mats.trim,-w/2-bar/2,0,.05); meshBox(g,bar,h+.11,depth,mats.trim,w/2+bar/2,0,.05);
    meshBox(g,w+.17,bar,depth,mats.trim,0,h/2+bar/2,.05); meshBox(g,w+.17,bar,depth,mats.trim,0,-h/2-bar/2,.05);
    meshBox(g,.045,h,depth,mats.trim,0,0,.06); meshBox(g,w,.045,depth,mats.trim,0,0,.06);
    meshBox(g,w+.28,.08,.19,mats.trim,0,-h/2-.10,.08);
    return g;
  }
  function placeWindow(parent,side,pos,y,w=.88,h=1.18){
    const g=makeWindow(w,h);
    if(side==='front'){g.position.set(pos,y,D/2+.145)}
    if(side==='back'){g.position.set(pos,y,-D/2-.145);g.rotation.y=Math.PI}
    if(side==='left'){g.position.set(-W/2-.145,y,pos);g.rotation.y=-Math.PI/2}
    if(side==='right'){g.position.set(W/2+.145,y,pos);g.rotation.y=Math.PI/2}
    parent.add(g); return g;
  }
  // first level
  placeWindow(floor1,'front',-2.55,yF1+1.38,.94,1.24);
  placeWindow(floor1,'front',2.58,yF1+1.38,.82,1.16);
  placeWindow(floor1,'right',-2.25,yF1+1.42,.86,1.20); placeWindow(floor1,'right',1.72,yF1+1.42,.86,1.20);
  placeWindow(floor1,'left',-2.05,yF1+1.42,.86,1.20); placeWindow(floor1,'left',1.65,yF1+1.42,.86,1.20);
  placeWindow(floor1,'back',-2.2,yF1+1.42,.86,1.18); placeWindow(floor1,'back',2.0,yF1+1.42,.86,1.18);
  // mansard / gable
  placeWindow(floor2,'front',0,yRoof+1.68,.82,1.10); placeWindow(floor2,'back',0,yRoof+1.62,.78,1.06);
  placeWindow(floor2,'right',0.20,yF2+.80,.58,.90); placeWindow(floor2,'left',-.10,yF2+.80,.58,.90);

  // front door with trim
  const doorG=new THREE.Group();
  meshBox(doorG,1.18,2.23,.07,mats.trim,0,0,-.03); meshBox(doorG,1.00,2.05,.09,mats.door,0,-.01,.03);
  meshBox(doorG,.18,.64,.035,mats.glass,0.18,.22,.085); meshBox(doorG,.055,.055,.10,new THREE.MeshStandardMaterial({color:0xb0a286,metalness:.7,roughness:.28}),.34,-.12,.11);
  doorG.position.set(.15,yF1+1.10,D/2+.16); floor1.add(doorG);

  // ---------- porch ----------
  const porchX=-.55, porchW=4.45, porchDepth=1.85;
  meshBox(porch,porchW,.18,porchDepth,mats.concrete,porchX,yF1+.09,D/2+porchDepth/2-.02);
  // shed roof, sloped down to garden
  const roofLen=Math.hypot(porchDepth+0.35,.58);
  const porchRoof=meshBox(porch,porchW+.35,.14,roofLen,mats.roof,porchX,yF1+2.45,D/2+porchDepth/2,Math.atan2(-.58,porchDepth+.35),0,0);
  // white fascia on porch roof
  meshBox(porch,porchW+.42,.11,.10,mats.trim,porchX,yF1+2.15,D/2+porchDepth+0.16);
  const frontZ=D/2+porchDepth-.15;
  [porchX-porchW/2+.12,porchX+porchW/2-.12].forEach(x=>meshBox(porch,.13,2.24,.13,mats.trim,x,yF1+1.15,frontZ));
  // rails
  for(let i=0;i<3;i++){meshBox(porch,porchW-1.45,.07,.07,mats.trim,porchX-.38,yF1+.55+i*.27,frontZ+.02)}
  const sideRailX=porchX-porchW/2+.08; for(let i=0;i<3;i++)meshBox(porch,.07,.07,1.35,mats.trim,sideRailX,yF1+.55+i*.27,D/2+1.05);
  // stairs
  meshBox(porch,1.35,.16,.42,mats.wood,.15,yF1-.02,D/2+porchDepth+.19);
  meshBox(porch,1.05,.15,.42,mats.wood,.15,yF1-.16,D/2+porchDepth+.55);
  meshBox(porch,.75,.14,.42,mats.wood,.15,yF1-.29,D/2+porchDepth+.91);
  // downpipes
  const pipeMat=new THREE.MeshStandardMaterial({color:0xf2f1ed,roughness:.65,metalness:.08});
  [[-4.25,4.08],[4.25,-4.08],[4.25,4.08]].forEach(([x,z])=>meshBox(house,.095,3.05,.095,pipeMat,x,yF1+1.55,z));

  // ---------- interior partitions & furniture ----------
  interior1.visible=false; interior2.visible=false;
  // first floor walls: two bedrooms at back, utility core right-front, open living/kitchen left-front
  meshBox(interior1,.10,2.38,3.65,mats.interiorWall,0,yF1+1.25,-2.02);
  meshBox(interior1,3.55,2.38,.10,mats.interiorWall,-2.0,yF1+1.25,-.15);
  meshBox(interior1,2.15,2.38,.10,mats.interiorWall,2.73,yF1+1.25,.15);
  meshBox(interior1,.10,2.38,2.4,mats.interiorWall,1.65,yF1+1.25,2.65);
  // beds
  const bed=(parent,x,z,rot=0)=>{const g=new THREE.Group();meshBox(g,1.45,.28,2.05,mats.bed,0,.26,0);meshBox(g,1.42,.30,.42,mats.sofa,0,.43,-.78);g.position.set(x,yF1+.12,z);g.rotation.y=rot;parent.add(g)};
  bed(interior1,-2.05,-2.55,0); bed(interior1,2.05,-2.55,0);
  // sofa + coffee table
  meshBox(interior1,2.35,.62,.86,mats.sofa,-2.25,yF1+.42,1.8); meshBox(interior1,.92,.34,.65,mats.wood,-1.75,yF1+.25,.75);
  // kitchen cabinets + island
  meshBox(interior1,3.15,.88,.56,mats.wood,-2.05,yF1+.48,-.50); meshBox(interior1,1.65,.90,.72,mats.wood,-1.75,yF1+.49,-1.28);
  // utility core blocks
  meshBox(interior1,1.45,.80,.65,mats.concrete,2.70,yF1+.45,2.15); meshBox(interior1,1.0,.72,.72,mats.concrete,2.65,yF1+.41,1.15);

  // second floor: 2 bedrooms + hall
  meshBox(interior2,.10,1.20,7.45,mats.interiorWall,0,yF2+.70,0);
  meshBox(interior2,7.45,1.20,.10,mats.interiorWall,0,yF2+.70,.35);
  const bed2=(x,z,rot=0)=>{const g=new THREE.Group();meshBox(g,1.55,.28,2.1,mats.bed,0,.26,0);meshBox(g,1.5,.30,.44,mats.sofa,0,.43,-.8);g.position.set(x,yF2+.13,z);g.rotation.y=rot;interior2.add(g)};
  bed2(-2.05,-1.85,0); bed2(2.05,-1.85,0); bed2(-2.05,2.05,Math.PI); bed2(2.05,2.05,Math.PI);
  // stair opening indication
  const stairMat=new THREE.MeshStandardMaterial({color:0x6e5b47,roughness:.9});
  for(let i=0;i<9;i++) meshBox(interior2,1.45,.08,.30,stairMat,.0,yF2+.12+i*.12,1.9-i*.25);

  // ---------- lighting ----------
  const hemi=new THREE.HemisphereLight(0xffffff,0x738064,1.25);scene.add(hemi);
  const ambient=new THREE.AmbientLight(0xffffff,.34);scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xfffbef,3.1);sun.position.set(12,18,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-18;sun.shadow.bias=-.00035;scene.add(sun);
  const dusk=new THREE.DirectionalLight(0xff9f5e,0);dusk.position.set(-13,8,9);scene.add(dusk);
  const interiorLight1=new THREE.PointLight(0xffb56e,0,16,1.8);interiorLight1.position.set(-1.2,2.35,1.2);scene.add(interiorLight1);
  const interiorLight2=new THREE.PointLight(0xffad62,0,14,1.8);interiorLight2.position.set(1.3,4.2,-.6);scene.add(interiorLight2);

  const setNight=(night)=>{
    scene.background.set(night?0x526176:0xcfd9e2);scene.fog.color.set(night?0x526176:0xcfd9e2);
    sun.intensity=night?.28:3.1; hemi.intensity=night?.32:1.25; ambient.intensity=night?.18:.34; dusk.intensity=night?2.0:0;
    interiorLight1.intensity=night?6.5:0;interiorLight2.intensity=night?5.5:0;
    windowMeshes.forEach(w=>{w.material=night?mats.glassNight:mats.glass});
    renderer.toneMappingExposure=night?.82:1.04;
  };

  // ---------- modes ----------
  const cameraViews={
    front:{p:[11.5,7.0,17.5],t:[0,3.5,.4]},
    side:{p:[17.5,6.5,8.5],t:[0,3.5,0]},
    rear:{p:[-10.5,6.7,-17.0],t:[0,3.5,0]},
    top:{p:[12.8,17.8,13.6],t:[0,2.8,0]}
  };
  const animateCamera=(view)=>{
    const v=cameraViews[view]; if(!v)return;
    const start=camera.position.clone(), end=new THREE.Vector3(...v.p), ts=controls.target.clone(), te=new THREE.Vector3(...v.t), begin=performance.now(),dur=560;
    const step=(now)=>{const u=Math.min(1,(now-begin)/dur),e=1-Math.pow(1-u,3);camera.position.lerpVectors(start,end,e);controls.target.lerpVectors(ts,te,e);if(u<1)requestAnimationFrame(step)};requestAnimationFrame(step);
  };

  let mode='exterior';
  const setMode=(next)=>{
    mode=next;
    const exterior=next==='exterior'; const cut=next==='cut'; const one=next==='floor1'; const two=next==='floor2';
    foundation.visible=!two;
    floor1.visible=!two;
    porch.visible=!two;
    floor2.visible=!one;
    roof.visible=exterior;
    interior1.visible=cut||one;
    interior2.visible=cut||two;
    f1Front.visible=exterior;
    f2Front.visible=exterior;
    gableFront.visible=exterior;
    if(cut){controls.target.set(0,3.0,0);animateCamera('front')}
    if(one){floor2.visible=false;roof.visible=false;controls.target.set(0,1.9,0);camera.position.set(11.8,8.8,14.5)}
    if(two){foundation.visible=false;floor1.visible=false;porch.visible=false;roof.visible=false;controls.target.set(0,4.35,0);camera.position.set(11.8,9.4,14.2)}
    if(exterior){controls.target.set(0,3.45,0)}
    document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===next));
  };

  document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.mode)));
  document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{animateCamera(btn.dataset.view);document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===btn))}));
  document.getElementById('day').addEventListener('click',()=>{setNight(false);document.getElementById('day').classList.add('active');document.getElementById('evening').classList.remove('active')});
  document.getElementById('evening').addEventListener('click',()=>{setNight(true);document.getElementById('evening').classList.add('active');document.getElementById('day').classList.remove('active')});
  document.getElementById('reset').addEventListener('click',()=>{setNight(false);setMode('exterior');camera.position.set(14.5,8.7,17.5);controls.target.set(0,3.45,0);document.getElementById('day').classList.add('active');document.getElementById('evening').classList.remove('active');document.querySelectorAll('[data-view]').forEach(b=>b.classList.remove('active'))});

  const resize=()=>{const r=mount.getBoundingClientRect();if(r.width<2||r.height<2)return;camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false)};
  const ro=new ResizeObserver(resize);ro.observe(mount);resize();

  renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera)});
  setNight(false);setMode('exterior');
  status.textContent='3D готово';
  loading.classList.add('done');
  window.__viewerReady=true;
} catch(err){
  console.error(err);window.__viewerError=String(err);status.textContent='Не удалось запустить 3D';status.classList.add('error');loading.innerHTML='<strong>3D не загрузилось</strong><span>Обновите страницу или откройте модель в другом браузере.</span>';
}

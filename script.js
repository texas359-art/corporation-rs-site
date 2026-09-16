const header=document.querySelector('.site-header');
const menuButton=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-menu');

const onScroll=()=>header.classList.toggle('scrolled',window.scrollY>48);
onScroll();
window.addEventListener('scroll',onScroll,{passive:true});

function setMenu(open){
  mobileMenu.classList.toggle('open',open);
  menuButton.setAttribute('aria-expanded',String(open));
  mobileMenu.setAttribute('aria-hidden',String(!open));
  document.body.style.overflow=open?'hidden':'';
}
menuButton.addEventListener('click',()=>setMenu(!mobileMenu.classList.contains('open')));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));

const lb=document.querySelector('.lightbox');
const lbImg=lb.querySelector('img');
function openLb(item){
  lbImg.src=item.dataset.full;
  lbImg.alt=item.querySelector('img')?.alt||'';
  lb.classList.add('open');
  lb.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeLb(){
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden','true');
  lbImg.removeAttribute('src');
  document.body.style.overflow='';
}
document.querySelectorAll('[data-full]').forEach(item=>item.addEventListener('click',()=>openLb(item)));
lb.querySelector('.lightbox-close').addEventListener('click',closeLb);
lb.addEventListener('click',e=>{if(e.target===lb)closeLb();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lb.classList.contains('open'))closeLb();});

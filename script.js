const header=document.querySelector('.site-header');
const menuButton=document.querySelector('.menu-button');
const mobileMenu=document.querySelector('.mobile-menu');
const onScroll=()=>header.classList.toggle('scrolled',window.scrollY>30);
onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
menuButton.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));mobileMenu.setAttribute('aria-hidden',String(!open));document.body.style.overflow=open?'hidden':'';});
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileMenu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');mobileMenu.setAttribute('aria-hidden','true');document.body.style.overflow='';}));
const lb=document.querySelector('.lightbox'),lbImg=lb.querySelector('img'),lbCaption=lb.querySelector('.lightbox-caption');
document.querySelectorAll('.gallery-item').forEach(item=>item.addEventListener('click',()=>{lbImg.src=item.dataset.full;lbImg.alt=item.querySelector('img').alt;lbCaption.textContent=item.querySelector('span')?.textContent||'';lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';}));
function closeLb(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');lbImg.src='';document.body.style.overflow='';}
lb.querySelector('.lightbox-close').addEventListener('click',closeLb);lb.addEventListener('click',e=>{if(e.target===lb)closeLb()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lb.classList.contains('open'))closeLb()});

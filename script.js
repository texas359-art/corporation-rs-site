const mobileFix=document.createElement('link');
mobileFix.rel='stylesheet';
mobileFix.href=document.body.classList.contains('project-page')?'../mobile-fix.css':'mobile-fix.css';
document.head.appendChild(mobileFix);

const menuBtn=document.querySelector('.menu-btn');
const mobileNav=document.querySelector('.mobile-nav');
if(menuBtn&&mobileNav){
  const close=()=>{menuBtn.setAttribute('aria-expanded','false');mobileNav.classList.remove('open');mobileNav.setAttribute('aria-hidden','true');document.body.style.overflow=''};
  menuBtn.addEventListener('click',()=>{const open=menuBtn.getAttribute('aria-expanded')==='true';menuBtn.setAttribute('aria-expanded',String(!open));mobileNav.classList.toggle('open',!open);mobileNav.setAttribute('aria-hidden',String(open));document.body.style.overflow=open?'':'hidden'});
  mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
}

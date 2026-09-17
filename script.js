const menu=document.querySelector('.menu');
const mobileNav=document.querySelector('.mobile-nav');

if(menu&&mobileNav){
  const close=()=>{
    menu.setAttribute('aria-expanded','false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  };

  menu.addEventListener('click',()=>{
    const isOpen=menu.getAttribute('aria-expanded')==='true';
    menu.setAttribute('aria-expanded',String(!isOpen));
    mobileNav.classList.toggle('open',!isOpen);
    mobileNav.setAttribute('aria-hidden',String(isOpen));
    document.body.style.overflow=isOpen?'':'hidden';
  });

  mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
}

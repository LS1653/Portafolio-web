/* ============ NAV: mobile hamburger toggle + active link ============ */
const navToggle = document.getElementById("navToggle");
const mobileNavPanel = document.getElementById("mobileNavPanel");
const navBackdrop = document.getElementById("navBackdrop");

function openMobileNav(){
  mobileNavPanel.classList.add("open");
  navToggle.setAttribute("aria-expanded","true");
  navBackdrop.classList.add("nav-backdrop-visible");
  document.body.classList.add("nav-open-lock");
}

function closeMobileNav(){
  mobileNavPanel.classList.remove("open");
  navToggle.setAttribute("aria-expanded","false");
  navBackdrop.classList.remove("nav-backdrop-visible");
  document.body.classList.remove("nav-open-lock");
}

if(navToggle) {
  navToggle.addEventListener("click", () => {
    mobileNavPanel.classList.contains("open") ? closeMobileNav() : openMobileNav();
  });
}
if(navBackdrop) navBackdrop.addEventListener("click", closeMobileNav);
document.querySelectorAll("#mobileNavPanel a").forEach(a => a.addEventListener("click", closeMobileNav));
document.addEventListener("keydown", (e) => { if(e.key === "Escape") closeMobileNav(); });

/* ============ INTERSECTION OBSERVER (Links) ============ */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const sectionObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      navLinks.forEach(link=>{
        link.classList.toggle("active", link.dataset.section === entry.target.id);
      });
    }
  });
},{rootMargin:"-45% 0px -45% 0px"});
sections.forEach(s=>sectionObserver.observe(s));

/* ============ BACK TO TOP ============ */
const backToTop = document.getElementById("backToTop");
function updateBackToTop(){
  if(window.scrollY > window.innerHeight * 0.6) backToTop.classList.add("backtotop-visible");
  else backToTop.classList.remove("backtotop-visible");
}
window.addEventListener("scroll", updateBackToTop, {passive:true});
updateBackToTop();
backToTop.addEventListener("click", ()=>window.scrollTo({top:0, behavior:"smooth"}));

/* ============ PARALLAX & CARDS ============ */
const back = document.querySelector(".mountain-back");
const mid = document.querySelector(".mountain-mid");
const front = document.querySelector(".mountain-front");
let scrollY = 0, mouseX = 0.5, mouseY = 0.5;

function applyMountainTransform(){
  back.style.transform = `translate(${(mouseX-0.5)*-15}px, ${scrollY*0.1}px)`;
  mid.style.transform = `translate(${(mouseX-0.5)*-28}px, ${scrollY*0.2}px)`;
  front.style.transform = `translate(${(mouseX-0.5)*-45}px, ${scrollY*0.35}px)`;
}

window.addEventListener("scroll", ()=>{ scrollY = window.scrollY; applyMountainTransform(); }, {passive:true});

const heroLayers = document.querySelectorAll(".hero-layer");
const auroraCanvasEl = document.getElementById("auroraCanvas");
let parallaxTicking = false, pendingPointer = null;

function handlePointerParallax(clientX, clientY){
  pendingPointer = {clientX, clientY};
  if(parallaxTicking) return;
  parallaxTicking = true;
  requestAnimationFrame(()=>{
    const px = pendingPointer.clientX, py = pendingPointer.clientY;
    mouseX = px / window.innerWidth;
    mouseY = py / window.innerHeight;
    const offsetX = (mouseX-0.5), offsetY = (mouseY-0.5);
    
    heroLayers.forEach(layer=>{
      const depth = parseFloat(layer.dataset.depth) || 0;
      layer.style.transform = `translate(${offsetX*depth}px, ${offsetY*depth*0.6}px)`;
    });
    applyMountainTransform();
    
    // Sensibilidad adaptativa (Tablet vs Celular)
    const auroraMultX = window.innerWidth > 768 ? 20 : 14;
    const auroraMultY = window.innerWidth > 768 ? 15 : 10;
    auroraCanvasEl.style.transform = `translate(${offsetX*auroraMultX}px, ${offsetY*auroraMultY}px)`;
    
    parallaxTicking = false;
  });
}

window.addEventListener("mousemove", e => handlePointerParallax(e.clientX, e.clientY));
window.addEventListener("touchmove", e => { if(e.touches[0]) handlePointerParallax(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});

/* ============ TILT CARDS ============ */
const tiltCards = document.querySelectorAll(".tilt-card");
function applyCardTilt(card, clientX, clientY){
  const rect = card.getBoundingClientRect();
  const px = (clientX-rect.left)/rect.width;
  const py = (clientY-rect.top)/rect.height;
  
  // Rotación adaptativa
  const mult = window.innerWidth > 768 ? 8 : 5;
  const rotateX = (0.5-py) * mult;
  const rotateY = (px-0.5) * mult;
  
  card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  if(card.classList.contains("skill-card")){
    card.style.setProperty("--mx", `${px*100}%`);
    card.style.setProperty("--my", `${py*100}%`);
  }
}
function resetCardTilt(card){ card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)"; }
function rafThrottle(fn){
  let ticking=false, lastArgs=null;
  return function(...args){
    lastArgs=args;
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(()=>{ fn(...lastArgs); ticking=false; });
  }
}

tiltCards.forEach(card=>{
  const throttledTilt = rafThrottle((x,y)=>applyCardTilt(card,x,y));
  card.addEventListener("mousemove", e => throttledTilt(e.clientX, e.clientY));
  card.addEventListener("mouseleave", ()=>resetCardTilt(card));
  card.addEventListener("touchstart", e => { if(e.touches[0]){ card.classList.add("is-touched"); applyCardTilt(card, e.touches[0].clientX, e.touches[0].clientY); } }, {passive:true});
  card.addEventListener("touchmove", e => { if(e.touches[0]) throttledTilt(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});
  card.addEventListener("touchend", ()=>{ card.classList.remove("is-touched"); resetCardTilt(card); });
});

/* ============ SKILL BARS ============ */
const skillFills = document.querySelectorAll(".skill-bar-fill");
const fillObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.width = entry.target.dataset.fill + "%";
      fillObserver.unobserve(entry.target);
    }
  });
},{threshold:0.4});
skillFills.forEach(f=>fillObserver.observe(f));

/* ============ CANVAS AURORA Y NIEVE ============ */
const auroraCanvas = document.getElementById("auroraCanvas");
const snowCanvas = document.getElementById("snowCanvas");
const auroraCtx = auroraCanvas.getContext("2d");
const snowCtx = snowCanvas.getContext("2d");

function resize(){
  auroraCanvas.width = window.innerWidth;
  auroraCanvas.height = window.innerHeight;
  snowCanvas.width = window.innerWidth;
  snowCanvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let time=0;
function drawAurora(){
  auroraCtx.clearRect(0,0,auroraCanvas.width,auroraCanvas.height);
  const layers = window.innerWidth > 768 ? 6 : 4; // Más capas en PC
  for(let layer=0; layer<layers; layer++){
    let baseHeight = 200 + layer*70;
    let gradient = auroraCtx.createLinearGradient(0, baseHeight, 0, baseHeight+300);
    gradient.addColorStop(0,"rgba(0,255,180,0.05)");
    gradient.addColorStop(0.3,"rgba(0,255,120,0.08)");
    gradient.addColorStop(0.6,"rgba(0,150,255,0.06)");
    gradient.addColorStop(1,"rgba(180,0,255,0.04)");
    auroraCtx.fillStyle = gradient;
    auroraCtx.beginPath();
    auroraCtx.moveTo(0, baseHeight);
    for(let x=0; x<auroraCanvas.width; x+=20){
      let y = baseHeight + Math.sin(x*0.002+time+layer)*80 + Math.sin(x*0.01+time*2)*20;
      auroraCtx.lineTo(x, y);
    }
    auroraCtx.lineTo(auroraCanvas.width, auroraCanvas.height);
    auroraCtx.lineTo(0, auroraCanvas.height);
    auroraCtx.closePath();
    auroraCtx.fill();
  }
  time+=0.0015;
}

let snowflakes = [];
// Cantidad dinámica de nieve según pantalla
const flakeCount = window.innerWidth > 768 ? 130 : 70; 
for(let i=0; i<flakeCount; i++){
  snowflakes.push({ x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight, r:Math.random()*3+1, speed:Math.random()*1+0.5 });
}

let cursorPixelX = -9999, cursorPixelY = -9999;
window.addEventListener("mousemove", e => { cursorPixelX=e.clientX; cursorPixelY=e.clientY; });
window.addEventListener("touchmove", e => { if(e.touches[0]){ cursorPixelX=e.touches[0].clientX; cursorPixelY=e.touches[0].clientY; } }, {passive:true});
window.addEventListener("touchend", ()=>{ cursorPixelX=-9999; cursorPixelY=-9999; }, {passive:true});

function drawSnow(){
  snowCtx.clearRect(0,0,snowCanvas.width,snowCanvas.height);
  snowCtx.fillStyle = "white";
  snowflakes.forEach(f=>{
    snowCtx.beginPath();
    snowCtx.arc(f.x,f.y,f.r,0,Math.PI*2);
    snowCtx.fill();
    f.y += f.speed;
    f.x += Math.sin(time*3+f.y*0.01)*0.4;
    
    const dx = f.x - cursorPixelX, dy = f.y - cursorPixelY, dist = Math.sqrt(dx*dx+dy*dy);
    if(dist < 110){
      const force = (110-dist)/110;
      f.x += (dx/(dist||1)) * force * 2.2;
      f.y += (dy/(dist||1)) * force * 1.2;
    }
    if(f.y > snowCanvas.height){ f.y=0; f.x=Math.random()*snowCanvas.width; }
    if(f.x < -10) f.x = snowCanvas.width+10;
    if(f.x > snowCanvas.width+10) f.x = -10;
  });
}

let rafId = null;
function animate(){
  drawAurora();
  drawSnow();
  rafId = requestAnimationFrame(animate);
}
animate();

document.addEventListener("visibilitychange", ()=>{
  if(document.hidden && rafId){ cancelAnimationFrame(rafId); rafId=null; }
  else if(!rafId) animate();
});
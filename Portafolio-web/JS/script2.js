/* ============ NAV: active link on scroll (always-visible horizontal nav on tablet, no toggle needed) ============ */

const sections=document.querySelectorAll("section[id]")
const navLinks=document.querySelectorAll(".nav-link")

const sectionObserver=new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
const id=entry.target.getAttribute("id")
navLinks.forEach(link=>{
link.classList.toggle("active",link.dataset.section===id)
})
}
})
},{rootMargin:"-45% 0px -45% 0px"})

sections.forEach(s=>sectionObserver.observe(s))

/* ============ BACK TO TOP ============ */

const backToTop=document.getElementById("backToTop")

function updateBackToTop(){
if(window.scrollY>window.innerHeight*0.6){
backToTop.classList.add("backtotop-visible")
}else{
backToTop.classList.remove("backtotop-visible")
}
}

window.addEventListener("scroll",updateBackToTop,{passive:true})
updateBackToTop()

backToTop.addEventListener("click",()=>{
window.scrollTo({top:0,behavior:"smooth"})
})

/* ============ PARALLAX: scroll (mountains) ============ */

const back=document.querySelector(".mountain-back")
const mid=document.querySelector(".mountain-mid")
const front=document.querySelector(".mountain-front")

let scrollY=0
let mouseX=0.5
let mouseY=0.5

function applyMountainTransform(){

back.style.transform=`translate(${(mouseX-0.5)*-15}px, ${scrollY*0.1}px)`
mid.style.transform=`translate(${(mouseX-0.5)*-28}px, ${scrollY*0.2}px)`
front.style.transform=`translate(${(mouseX-0.5)*-45}px, ${scrollY*0.35}px)`

}

window.addEventListener("scroll",()=>{
scrollY=window.scrollY
applyMountainTransform()
},{passive:true})

/* ============ PARALLAX: pointer move — mouse AND touch drag (hero layers, mountains, aurora tint) ============ */
/* Tablets often have no mouse, so touch dragging drives the same effect */

const heroLayers=document.querySelectorAll(".hero-layer")
const auroraCanvasEl=document.getElementById("auroraCanvas")

let parallaxTicking=false
let pendingPointer=null

function handlePointerParallax(clientX,clientY){

pendingPointer={clientX,clientY}

if(parallaxTicking) return
parallaxTicking=true

requestAnimationFrame(()=>{

const px=pendingPointer.clientX
const py=pendingPointer.clientY

mouseX=px/window.innerWidth
mouseY=py/window.innerHeight

const offsetX=(mouseX-0.5)
const offsetY=(mouseY-0.5)

heroLayers.forEach(layer=>{
const depth=parseFloat(layer.dataset.depth)||0
layer.style.transform=`translate(${offsetX*depth}px, ${offsetY*depth*0.6}px)`
})

applyMountainTransform()

auroraCanvasEl.style.transform=`translate(${offsetX*20}px, ${offsetY*15}px)`

parallaxTicking=false

})

}

/* on touch devices this only fires while a finger is actually dragging, so it stays cheap during normal scrolling */
window.addEventListener("mousemove",(e)=>{
handlePointerParallax(e.clientX,e.clientY)
})

window.addEventListener("touchmove",(e)=>{
if(e.touches && e.touches[0]){
handlePointerParallax(e.touches[0].clientX,e.touches[0].clientY)
}
},{passive:true})

/* ============ TILT: project & skill cards react to cursor / finger ============ */

const tiltCards=document.querySelectorAll(".tilt-card")

function applyCardTilt(card,clientX,clientY){

const rect=card.getBoundingClientRect()
const px=(clientX-rect.left)/rect.width
const py=(clientY-rect.top)/rect.height

const rotateX=(0.5-py)*8
const rotateY=(px-0.5)*8

card.style.transform=`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`

if(card.classList.contains("skill-card")){
card.style.setProperty("--mx",`${px*100}%`)
card.style.setProperty("--my",`${py*100}%`)
}

}

function resetCardTilt(card){
card.style.transform="perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)"
}

/* generic rAF throttle so rapid-fire pointer/touch events don't force layout work more than once per frame */
function rafThrottle(fn){
let ticking=false
let lastArgs=null
return function(...args){
lastArgs=args
if(ticking) return
ticking=true
requestAnimationFrame(()=>{
fn(...lastArgs)
ticking=false
})
}
}

tiltCards.forEach(card=>{

const throttledTilt=rafThrottle((x,y)=>applyCardTilt(card,x,y))

card.addEventListener("mousemove",(e)=>{
throttledTilt(e.clientX,e.clientY)
})

card.addEventListener("mouseleave",()=>{
resetCardTilt(card)
})

card.addEventListener("touchstart",(e)=>{
if(e.touches && e.touches[0]){
card.classList.add("is-touched")
applyCardTilt(card,e.touches[0].clientX,e.touches[0].clientY)
}
},{passive:true})

card.addEventListener("touchmove",(e)=>{
if(e.touches && e.touches[0]){
throttledTilt(e.touches[0].clientX,e.touches[0].clientY)
}
},{passive:true})

card.addEventListener("touchend",()=>{
card.classList.remove("is-touched")
resetCardTilt(card)
})

card.addEventListener("touchcancel",()=>{
card.classList.remove("is-touched")
resetCardTilt(card)
})

})

/* ============ SKILL BARS: animate fill on scroll into view ============ */

const skillFills=document.querySelectorAll(".skill-bar-fill")

const fillObserver=new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
const target=entry.target.dataset.fill
entry.target.style.width=target+"%"
fillObserver.unobserve(entry.target)
}
})
},{threshold:0.4})

skillFills.forEach(f=>fillObserver.observe(f))

/* ============ CANVAS SETUP ============ */

const auroraCanvas=document.getElementById("auroraCanvas")
const snowCanvas=document.getElementById("snowCanvas")

const auroraCtx=auroraCanvas.getContext("2d")
const snowCtx=snowCanvas.getContext("2d")

function resize(){

auroraCanvas.width=window.innerWidth
auroraCanvas.height=window.innerHeight

snowCanvas.width=window.innerWidth
snowCanvas.height=window.innerHeight

}

resize()
window.addEventListener("resize",resize)

let time=0

/* AURORA */

function drawAurora(){

auroraCtx.clearRect(0,0,auroraCanvas.width,auroraCanvas.height)

for(let layer=0;layer<6;layer++){

let baseHeight=200+layer*70

let gradient=auroraCtx.createLinearGradient(0,baseHeight,0,baseHeight+300)

gradient.addColorStop(0,"rgba(0,255,180,0.05)")
gradient.addColorStop(0.3,"rgba(0,255,120,0.08)")
gradient.addColorStop(0.6,"rgba(0,150,255,0.06)")
gradient.addColorStop(1,"rgba(180,0,255,0.04)")

auroraCtx.fillStyle=gradient

auroraCtx.beginPath()
auroraCtx.moveTo(0,baseHeight)

for(let x=0;x<auroraCanvas.width;x+=20){

let y=baseHeight+
Math.sin(x*0.002+time+layer)*80+
Math.sin(x*0.01+time*2)*20

auroraCtx.lineTo(x,y)

}

auroraCtx.lineTo(auroraCanvas.width,auroraCanvas.height)
auroraCtx.lineTo(0,auroraCanvas.height)
auroraCtx.closePath()

auroraCtx.fill()

}

time+=0.0015

}

/* SNOW — now with cursor-wind interaction */

let snowflakes=[]

for(let i=0;i<130;i++){

snowflakes.push({
x:Math.random()*window.innerWidth,
y:Math.random()*window.innerHeight,
r:Math.random()*3+1,
speed:Math.random()*1+0.5
})

}

let cursorPixelX=-9999
let cursorPixelY=-9999

window.addEventListener("mousemove",(e)=>{
cursorPixelX=e.clientX
cursorPixelY=e.clientY
})

window.addEventListener("touchmove",(e)=>{
if(e.touches && e.touches[0]){
cursorPixelX=e.touches[0].clientX
cursorPixelY=e.touches[0].clientY
}
},{passive:true})

/* release the wind effect once the finger lifts — otherwise it stays stuck at the last touch point */
window.addEventListener("touchend",()=>{
cursorPixelX=-9999
cursorPixelY=-9999
},{passive:true})

window.addEventListener("touchcancel",()=>{
cursorPixelX=-9999
cursorPixelY=-9999
},{passive:true})

function drawSnow(){

snowCtx.clearRect(0,0,snowCanvas.width,snowCanvas.height)

snowCtx.fillStyle="white"

snowflakes.forEach(f=>{

snowCtx.beginPath()
snowCtx.arc(f.x,f.y,f.r,0,Math.PI*2)
snowCtx.fill()

f.y+=f.speed
f.x+=Math.sin(time*3+f.y*0.01)*0.4

/* gentle wind push away from cursor, keeps winter feel (no gimmicks) */
const dx=f.x-cursorPixelX
const dy=f.y-cursorPixelY
const dist=Math.sqrt(dx*dx+dy*dy)

if(dist<110){
const force=(110-dist)/110
f.x+=(dx/(dist||1))*force*2.2
f.y+=(dy/(dist||1))*force*1.2
}

if(f.y>snowCanvas.height){

f.y=0
f.x=Math.random()*snowCanvas.width

}

if(f.x<-10) f.x=snowCanvas.width+10
if(f.x>snowCanvas.width+10) f.x=-10

})

}

let rafId=null

function animate(){

drawAurora()
drawSnow()

rafId=requestAnimationFrame(animate)

}

animate()

/* pause the render loop while the app/tab is in the background, resume when it's visible again */
document.addEventListener("visibilitychange",()=>{
if(document.hidden){
if(rafId){
cancelAnimationFrame(rafId)
rafId=null
}
}else if(!rafId){
animate()
}
})
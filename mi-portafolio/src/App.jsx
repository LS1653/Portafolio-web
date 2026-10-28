import { useEffect, useState } from 'react';
import './index.css';

// ==========================================
// 1. COMPONENTES REUTILIZABLES (Tus "Prefabs")
// ==========================================

const ProjectThumbnail = ({ href, image, title, description }) => (
  <a href={href} className="project-card tilt-card w-full max-w-sm relative rounded-xl overflow-hidden shadow-xl block">
    <img src={image} className="w-full h-40 md:h-44 object-cover" alt={title} />
    <div className="project-overlay absolute inset-0 bg-black/25"></div>
    <div className="project-caption absolute bottom-0 left-0 right-0 px-4 md:px-5 pt-6 md:pt-8 pb-3 md:pb-4">
      <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
      <p className="text-gray-300 text-xs md:text-sm mt-0.5">{description}</p>
    </div>
  </a>
);

const SkillCard = ({ title, description, fill }) => (
  <div className="skill-card tilt-card">
    <h4 className="font-semibold text-blue-200 mb-1">{title}</h4>
    <p className="text-sm text-gray-400 mb-3">{description}</p>
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div className="skill-bar-fill h-full bg-blue-300 rounded-full" style={{width: '0%'}} data-fill={fill}></div>
    </div>
  </div>
);

// ==========================================
// 2. APLICACIÓN PRINCIPAL
// ==========================================

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    // INTERSECTION OBSERVER (Links)
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

    // BACK TO TOP
    const backToTop = document.getElementById("backToTop");
    function updateBackToTop(){
      if(window.scrollY > window.innerHeight * 0.6) backToTop.classList.add("backtotop-visible");
      else backToTop.classList.remove("backtotop-visible");
    }
    window.addEventListener("scroll", updateBackToTop, {passive:true});
    updateBackToTop();

    // PARALLAX & CARDS
    const back = document.querySelector(".mountain-back");
    const mid = document.querySelector(".mountain-mid");
    const front = document.querySelector(".mountain-front");
    let scrollY = 0, mouseX = 0.5, mouseY = 0.5;

    function applyMountainTransform(){
      if(back) back.style.transform = `translate(${(mouseX-0.5)*-15}px, ${scrollY*0.1}px)`;
      if(mid) mid.style.transform = `translate(${(mouseX-0.5)*-28}px, ${scrollY*0.2}px)`;
      if(front) front.style.transform = `translate(${(mouseX-0.5)*-45}px, ${scrollY*0.35}px)`;
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
        
        const auroraMultX = window.innerWidth > 768 ? 20 : 14;
        const auroraMultY = window.innerWidth > 768 ? 15 : 10;
        if(auroraCanvasEl) auroraCanvasEl.style.transform = `translate(${offsetX*auroraMultX}px, ${offsetY*auroraMultY}px)`;
        
        parallaxTicking = false;
      });
    }

    window.addEventListener("mousemove", e => handlePointerParallax(e.clientX, e.clientY));
    window.addEventListener("touchmove", e => { if(e.touches[0]) handlePointerParallax(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true});

    // TILT CARDS
    const tiltCards = document.querySelectorAll(".tilt-card");
    function applyCardTilt(card, clientX, clientY){
      const rect = card.getBoundingClientRect();
      const px = (clientX-rect.left)/rect.width;
      const py = (clientY-rect.top)/rect.height;
      
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

    // SKILL BARS
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

    // CANVAS AURORA Y NIEVE
    const auroraCanvas = document.getElementById("auroraCanvas");
    const snowCanvas = document.getElementById("snowCanvas");
    if(!auroraCanvas || !snowCanvas) return;

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
      const layers = window.innerWidth > 768 ? 6 : 4; 
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
    const flakeCount = window.innerWidth > 768 ? 130 : 70; 
    for(let i=0; i<flakeCount; i++){
      snowflakes.push({ x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight, r:Math.random()*3+1, speed:Math.random()*1+0.5 });
    }

    let cursorPixelX = -9999, cursorPixelY = -9999;
    const updateCursor = (e) => { cursorPixelX=e.clientX; cursorPixelY=e.clientY; };
    const updateTouchCursor = (e) => { if(e.touches[0]){ cursorPixelX=e.touches[0].clientX; cursorPixelY=e.touches[0].clientY; } };
    const resetCursor = () => { cursorPixelX=-9999; cursorPixelY=-9999; };
    
    window.addEventListener("mousemove", updateCursor);
    window.addEventListener("touchmove", updateTouchCursor, {passive:true});
    window.addEventListener("touchend", resetCursor, {passive:true});

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

    const handleVisibility = () => {
      if(document.hidden && rafId){ cancelAnimationFrame(rafId); rafId=null; }
      else if(!rafId) animate();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", updateCursor);
      window.removeEventListener("touchmove", updateTouchCursor);
      window.removeEventListener("touchend", resetCursor);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const closeNav = () => setIsNavOpen(false);

  return (
    <div className="text-gray-200">
      <canvas id="auroraCanvas"></canvas>
      <canvas id="snowCanvas"></canvas>

      <svg className="mountain-layer mountain-back" viewBox="0 0 1440 320">
        <path fill="#0f172a" d="M0 260 L120 220 L260 260 L420 180 L600 260 L760 200 L900 260 L1100 190 L1260 260 L1440 210 L1440 320 L0 320 Z"></path>
      </svg>
      <svg className="mountain-layer mountain-mid" viewBox="0 0 1440 320">
        <path fill="#020617" d="M0 280 L150 200 L300 270 L480 160 L650 260 L820 170 L1000 260 L1180 180 L1350 260 L1440 210 L1440 320 L0 320 Z"></path>
      </svg>
      <svg className="mountain-layer mountain-front" viewBox="0 0 1440 320">
        <path fill="#01030a" d="M0 300 L180 210 L350 280 L520 180 L700 290 L880 200 L1060 300 L1240 210 L1440 280 L1440 320 L0 320 Z"></path>
      </svg>

      <nav id="mainNav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <a href="#home" className="text-blue-200 font-bold tracking-wide text-base md:text-lg shrink-0">[NOMBRE]</a>
          <div className="hidden md:flex items-center flex-wrap justify-end gap-x-1 gap-y-1">
            <a href="#home" className="nav-link px-3 py-2.5 text-sm" data-section="home">Home</a>
            <a href="#proyectos" className="nav-link px-3 py-2.5 text-sm" data-section="proyectos">Proyectos</a>
            <a href="#experimentos" className="nav-link px-3 py-2.5 text-sm" data-section="experimentos">Experimentos</a>
            <a href="#habilidades" className="nav-link px-3 py-2.5 text-sm" data-section="habilidades">Habilidades</a>
            <a href="#contacto" className="nav-link px-3 py-2.5 text-sm" data-section="contacto">Contacto</a>
          </div>
          <button 
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="md:hidden relative w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-lg border border-blue-300/30 text-blue-200"
          >
            <span className={`hamburger-line transition-transform ${isNavOpen ? 'translate-y-[6.5px] rotate-45' : ''}`}></span>
            <span className={`hamburger-line transition-opacity ${isNavOpen ? 'opacity-0' : ''}`}></span>
            <span className={`hamburger-line transition-transform ${isNavOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`}></span>
          </button>
        </div>

        <div className={`md:hidden px-4 pb-2 text-base divide-y divide-white/5 flex flex-col overflow-hidden transition-all duration-300 ${isNavOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <a href="#home" className="nav-link block py-3.5" data-section="home" onClick={closeNav}>Home</a>
          <a href="#proyectos" className="nav-link block py-3.5" data-section="proyectos" onClick={closeNav}>Proyectos</a>
          <a href="#experimentos" className="nav-link block py-3.5" data-section="experimentos" onClick={closeNav}>Experimentos</a>
          <a href="#habilidades" className="nav-link block py-3.5" data-section="habilidades" onClick={closeNav}>Habilidades</a>
          <a href="#contacto" className="nav-link block py-3.5" data-section="contacto" onClick={closeNav}>Contacto</a>
        </div>
      </nav>

      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-250 ${isNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={closeNav}
      ></div>

      <section id="home" className="text-center pt-28 pb-14 md:pt-32 md:pb-20 flex flex-col items-center justify-center px-5">
        <img data-depth="10" src="assets/logo.jpg" className="hero-layer mx-auto mb-5 md:mb-6 w-32 md:w-48 opacity-90 drop-shadow-[0_0_20px_rgba(0,255,200,0.35)]" alt="[NOMBRE] Logo" />
        <h1 data-depth="6" className="hero-layer text-4xl md:text-5xl font-bold text-blue-200 drop-shadow-lg tracking-wide">[NOMBRE]</h1>
        <p data-depth="4" className="hero-layer mt-4 md:mt-5 text-base md:text-lg text-blue-300">Game Developer • Diseñador • Artista</p>
        <p data-depth="2" className="hero-layer mt-3 text-gray-400 text-sm md:text-base max-w-md">Programación de Gameplay • Diseño de Sistemas • Experimentos Interactivos</p>
        <a href="#proyectos" className="inline-block mt-7 md:mt-8 bg-blue-400 hover:bg-blue-300 text-black px-6 py-3 rounded-lg transition text-sm md:text-base">Ver Proyectos</a>
      </section>

      <section id="proyectos" className="max-w-6xl mx-auto py-12 md:py-16 px-5">
        <p className="eyebrow text-center mb-3">Trabajo terminado</p>
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-16">Proyectos</h2>

        {/* AQUÍ USAMOS NUESTRO COMPONENTE DE TARJETAS DE PROYECTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center mb-12 md:mb-16">
          <ProjectThumbnail 
            href="#project1" 
            image="assets/project-1-cover.jpg" 
            title="[PROYECTO 1]" 
            description="[DESCRIPCION BREVE]" 
          />
          <ProjectThumbnail 
            href="#project2" 
            image="assets/project-2-cover.jpg" 
            title="[PROYECTO 2]" 
            description="[DESCRIPCION BREVE]" 
          />
          <ProjectThumbnail 
            href="#project3" 
            image="assets/project-3-cover.jpg" 
            title="[PROYECTO 3]" 
            description="[DESCRIPCION BREVE]" 
          />
        </div>

        <div id="project1" className="glass-card tilt-card mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">[PROYECTO 1]</h3>
          <p className="text-gray-300 mb-6">[DESCRIPCION COMPLETA DEL PROYECTO 1]</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
            <img src="assets/project-1-image-1.jpg" loading="lazy" className="rounded-lg shadow-lg" alt="" />
            <img src="assets/project-1-image-2.jpg" loading="lazy" className="rounded-lg shadow-lg" alt="" />
            <img src="assets/project-1-image-3.jpg" loading="lazy" className="rounded-lg shadow-lg hidden md:block" alt="" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <a href="#" className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[ENLACE PRINCIPAL]</a>
            <a href="#" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[ENLACE SECUNDARIO]</a>
          </div>
        </div>

        <div id="project2" className="glass-card tilt-card mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">[PROYECTO 2]</h3>
          <p className="text-gray-300 mb-6">[DESCRIPCION COMPLETA DEL PROYECTO 2]</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
            <img src="assets/project-2-image-1.jpg" loading="lazy" className="rounded-lg shadow-lg" alt="" />
            <img src="assets/project-2-image-2.jpg" loading="lazy" className="rounded-lg shadow-lg" alt="" />
            <img src="assets/project-2-image-3.jpg" loading="lazy" className="rounded-lg shadow-lg hidden md:block" alt="" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <a href="#" className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[REPOSITORIO]</a>
            <a href="#" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[PRESENTACION]</a>
          </div>
        </div>

        <div id="project3" className="glass-card tilt-card mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">[PROYECTO 3]</h3>
          <p className="text-gray-300 mb-6">[DESCRIPCION COMPLETA DEL PROYECTO 3]</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
            <img src="assets/project-3-image-1.jpg" loading="lazy" className="rounded-lg shadow-lg" alt="" />
            <img src="assets/project-3-image-2.jpg" loading="lazy" className="rounded-lg shadow-lg" alt="" />
            <img src="assets/project-3-image-3.jpg" loading="lazy" className="rounded-lg shadow-lg hidden md:block" alt="" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <a href="#" className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">Ver Proyecto</a>
          </div>
        </div>
      </section>
      
      <section id="experimentos" className="max-w-6xl mx-auto py-12 md:py-16 px-5">
        <p className="eyebrow text-center mb-3">Exploración técnica</p>
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-16">Experimentos</h2>

        {/* AQUÍ USAMOS NUESTRO COMPONENTE DE TARJETAS DE PROYECTO OTRA VEZ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 place-items-center mb-12 md:mb-16">
          <ProjectThumbnail 
            href="#project4" 
            image="assets/experiment-1-cover.jpg" 
            title="[EXPERIMENTO 1]" 
            description="[DESCRIPCION BREVE]" 
          />
          <ProjectThumbnail 
            href="#project5" 
            image="assets/experiment-2-cover.jpg" 
            title="[EXPERIMENTO 2]" 
            description="[DESCRIPCION BREVE]" 
          />
        </div>

        <div id="project4" className="glass-card tilt-card mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">[EXPERIMENTO 1]</h3>
          <p className="text-gray-300 mb-6">[DESCRIPCION COMPLETA DEL EXPERIMENTO 1]</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
            <img src="assets/experiment-1-image-1.jpg" loading="lazy" className="rounded-lg shadow-lg" alt="" />
            <img src="assets/experiment-1-image-2.jpg" loading="lazy" className="rounded-lg shadow-lg" alt="" />
            <img src="assets/experiment-1-image-3.jpg" loading="lazy" className="rounded-lg shadow-lg hidden md:block" alt="" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <a href="#" className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[ENLACE 1]</a>
            <a href="#" className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[ENLACE 2]</a>
            <a href="#" className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[ENLACE 3]</a>
            <a href="#" className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[ENLACE 4]</a>
          </div>
        </div>

        <div id="project5" className="glass-card tilt-card mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">[EXPERIMENTO 2]</h3>
          <p className="text-gray-300 mb-6">[DESCRIPCION COMPLETA DEL EXPERIMENTO 2]</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
            <img src="assets/experiment-2-image-1.jpg" loading="lazy" className="rounded-lg shadow-lg" alt="" />
            <img src="assets/experiment-2-image-2.jpg" loading="lazy" className="rounded-lg shadow-lg" alt="" />
            <img src="assets/experiment-2-image-3.jpg" loading="lazy" className="rounded-lg shadow-lg hidden md:block" alt="" />
          </div>
          <div className="flex gap-4 flex-wrap">
            <a href="#" className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[ENLACE 1]</a>
            <a href="#" className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[ENLACE 2]</a>
            <a href="#" className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2.5 rounded-lg text-sm md:text-base">[ENLACE 3]</a>
          </div>
        </div>
      </section>

      <section id="habilidades" className="max-w-6xl mx-auto py-12 md:py-16 px-5">
        <p className="eyebrow text-center mb-3">Caja de herramientas</p>
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-16">Habilidades y Herramientas</h2>
        
        {/* AQUÍ USAMOS NUESTRO COMPONENTE DE HABILIDADES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <SkillCard 
            title="Unity / C#" 
            description="Gameplay, sistemas y arquitectura de proyectos." 
            fill="90" 
          />
          <SkillCard 
            title="Diseño de Sistemas" 
            description="Mecánicas, balance y documentación de diseño." 
            fill="85" 
          />
          <SkillCard 
            title="Shaders / VFX" 
            description="Shader Graph, partículas y efectos visuales en Unity." 
            fill="75" 
          />
          <SkillCard 
            title="p5.js / JavaScript" 
            description="Simulaciones generativas y experimentos interactivos." 
            fill="80" 
          />
          <SkillCard 
            title="HTML / CSS" 
            description="Interfaces web e interactividad para portafolios y prototipos." 
            fill="70" 
          />
          <SkillCard 
            title="Trabajo en Equipo / Git" 
            description="Control de versiones y colaboración en game jams y proyectos universitarios." 
            fill="85" 
          />
        </div>
      </section>

      <section id="contacto" className="max-w-3xl mx-auto py-12 md:py-16 px-5">
        <p className="eyebrow text-center mb-3">Quién soy</p>
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-6">Sobre mí</h2>
        <div className="glass-card tilt-card mb-12">
          <p className="text-gray-300 text-center">[BIOGRAFIA Y PRESENTACION PERSONAL]</p>
        </div>
        <div className="glass-card tilt-card text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Contacto</h2>
          <a href="mailto:[CORREO]" className="text-blue-300 text-lg mb-6 inline-block underline decoration-blue-300/40 underline-offset-4">[CORREO]</a>
          <div className="flex justify-center gap-6 flex-wrap">
            <a href="#" className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg">[RED SOCIAL 1]</a>
            <a href="#" className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg">[RED SOCIAL 2]</a>
          </div>
        </div>
      </section>

      <footer className="text-center py-12 text-gray-400">
        <p>© [AÑO] [NOMBRE]</p>
        <a href="#home" className="text-blue-300 hover:text-blue-200 block mt-3">Volver arriba</a>
      </footer>

      <button id="backToTop" aria-label="Volver arriba" onClick={() => window.scrollTo({top:0, behavior:"smooth"})} className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-blue-400 text-black flex items-center justify-center shadow-lg">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"></path>
        </svg>
      </button>
    </div>
  );
}

export default App;
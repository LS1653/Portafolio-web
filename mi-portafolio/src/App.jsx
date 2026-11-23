import { useEffect, useState } from 'react';
import './index.css';

const ProjectThumbnail = ({ href, image, title, description }) => (
  <a
    href={href}
    className="project-card tilt-card w-full max-w-sm relative rounded-xl overflow-hidden shadow-xl block"
  >
    <img
      src={image}
      className="w-full h-40 md:h-44 object-cover"
      alt={title}
    />

    <div className="project-overlay absolute inset-0 bg-black/70 flex flex-col justify-center items-center text-center p-6">
      <h3 className="text-lg md:text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300 text-xs md:text-sm">{description}</p>
    </div>
  </a>
);

const SkillCard = ({ title, description, fill }) => (
  <div className="skill-card tilt-card">
    <h4 className="font-semibold text-blue-200 mb-1">{title}</h4>
    <p className="text-sm text-gray-400 mb-3">{description}</p>

    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="skill-bar-fill h-full bg-blue-300 rounded-full"
        style={{ width: '0%' }}
        data-fill={fill}
      />
    </div>
  </div>
);

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.dataset.section === entry.target.id
              );
            });
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    const backToTop = document.getElementById('backToTop');

    const updateBackToTop = () => {
      if (window.scrollY > window.innerHeight * 0.6) {
        backToTop?.classList.add('backtotop-visible');
      } else {
        backToTop?.classList.remove('backtotop-visible');
      }
    };

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();

    const back = document.querySelector('.mountain-back');
    const mid = document.querySelector('.mountain-mid');
    const front = document.querySelector('.mountain-front');

    let scrollY = 0;
    let mouseX = 0.5;
    let mouseY = 0.5;

    const applyMountainTransform = () => {
      if (back) {
        back.style.transform = `translate(${(mouseX - 0.5) * -15}px, ${
          scrollY * 0.1
        }px)`;
      }

      if (mid) {
        mid.style.transform = `translate(${(mouseX - 0.5) * -28}px, ${
          scrollY * 0.2
        }px)`;
      }

      if (front) {
        front.style.transform = `translate(${(mouseX - 0.5) * -45}px, ${
          scrollY * 0.35
        }px)`;
      }
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
      applyMountainTransform();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const heroLayers = document.querySelectorAll('.hero-layer');
    const auroraCanvasElement = document.getElementById('auroraCanvas');

    let parallaxTicking = false;
    let pendingPointer = null;

    const handlePointerParallax = (clientX, clientY) => {
      pendingPointer = { clientX, clientY };

      if (parallaxTicking) return;

      parallaxTicking = true;

      requestAnimationFrame(() => {
        if (!pendingPointer) return;

        const { clientX: x, clientY: y } = pendingPointer;

        mouseX = x / window.innerWidth;
        mouseY = y / window.innerHeight;

        const offsetX = mouseX - 0.5;
        const offsetY = mouseY - 0.5;

        heroLayers.forEach((layer) => {
          const depth = parseFloat(layer.dataset.depth) || 0;

          layer.style.transform = `translate(${offsetX * depth}px, ${
            offsetY * depth * 0.6
          }px)`;
        });

        applyMountainTransform();

        const multiplierX = window.innerWidth > 768 ? 20 : 14;
        const multiplierY = window.innerWidth > 768 ? 15 : 10;

        if (auroraCanvasElement) {
          auroraCanvasElement.style.transform = `translate(${
            offsetX * multiplierX
          }px, ${offsetY * multiplierY}px)`;
        }

        parallaxTicking = false;
      });
    };

    const handleMouseMove = (event) => {
      handlePointerParallax(event.clientX, event.clientY);
    };

    const handleTouchMove = (event) => {
      const touch = event.touches[0];

      if (touch) {
        handlePointerParallax(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const tiltCards = document.querySelectorAll('.tilt-card');

    const applyCardTilt = (card, clientX, clientY) => {
      const rect = card.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;

      const multiplier = window.innerWidth > 768 ? 8 : 5;
      const rotateX = (0.5 - py) * multiplier;
      const rotateY = (px - 0.5) * multiplier;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;

      if (card.classList.contains('skill-card')) {
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      }
    };

    const resetCardTilt = (card) => {
      card.style.transform =
        'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    };

    const rafThrottle = (callback) => {
      let ticking = false;
      let lastArgs = null;

      return (...args) => {
        lastArgs = args;

        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
          callback(...lastArgs);
          ticking = false;
        });
      };
    };

    const tiltListeners = [];

    tiltCards.forEach((card) => {
      const throttledTilt = rafThrottle((x, y) =>
        applyCardTilt(card, x, y)
      );

      const mouseMove = (event) => {
        throttledTilt(event.clientX, event.clientY);
      };

      const mouseLeave = () => resetCardTilt(card);

      card.addEventListener('mousemove', mouseMove);
      card.addEventListener('mouseleave', mouseLeave);

      tiltListeners.push({ card, mouseMove, mouseLeave });
    });

    const skillFills = document.querySelectorAll('.skill-bar-fill');

    const fillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.width = `${entry.target.dataset.fill}%`;
            fillObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    skillFills.forEach((fill) => fillObserver.observe(fill));

    const auroraCanvas = document.getElementById('auroraCanvas');
    const snowCanvas = document.getElementById('snowCanvas');

    if (!auroraCanvas || !snowCanvas) {
      return undefined;
    }

    const auroraContext = auroraCanvas.getContext('2d');
    const snowContext = snowCanvas.getContext('2d');

    const resizeCanvases = () => {
      auroraCanvas.width = window.innerWidth;
      auroraCanvas.height = window.innerHeight;
      snowCanvas.width = window.innerWidth;
      snowCanvas.height = window.innerHeight;
    };

    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);

    let time = 0;

    const snowflakes = [];
    const snowflakeCount = window.innerWidth > 768 ? 130 : 70;

    for (let index = 0; index < snowflakeCount; index += 1) {
      snowflakes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 3 + 1,
        speed: Math.random() + 0.5,
      });
    }

    let cursorPixelX = -9999;
    let cursorPixelY = -9999;

    const updateCursor = (event) => {
      cursorPixelX = event.clientX;
      cursorPixelY = event.clientY;
    };

    const resetCursor = () => {
      cursorPixelX = -9999;
      cursorPixelY = -9999;
    };

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mouseleave', resetCursor);

    const drawAurora = () => {
      auroraContext.clearRect(
        0,
        0,
        auroraCanvas.width,
        auroraCanvas.height
      );

      const layers = window.innerWidth > 768 ? 6 : 4;

      for (let layer = 0; layer < layers; layer += 1) {
        const baseHeight = 200 + layer * 70;
        const gradient = auroraContext.createLinearGradient(
          0,
          baseHeight,
          0,
          baseHeight + 300
        );

        gradient.addColorStop(0, 'rgba(0,255,180,0.05)');
        gradient.addColorStop(0.3, 'rgba(0,255,120,0.08)');
        gradient.addColorStop(0.6, 'rgba(0,150,255,0.06)');
        gradient.addColorStop(1, 'rgba(180,0,255,0.04)');

        auroraContext.fillStyle = gradient;
        auroraContext.beginPath();
        auroraContext.moveTo(0, baseHeight);

        for (let x = 0; x < auroraCanvas.width; x += 20) {
          const y =
            baseHeight +
            Math.sin(x * 0.002 + time + layer) * 80 +
            Math.sin(x * 0.01 + time * 2) * 20;

          auroraContext.lineTo(x, y);
        }

        auroraContext.lineTo(auroraCanvas.width, auroraCanvas.height);
        auroraContext.lineTo(0, auroraCanvas.height);
        auroraContext.closePath();
        auroraContext.fill();
      }

      time += 0.0015;
    };

    const drawSnow = () => {
      snowContext.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
      snowContext.fillStyle = 'white';

      snowflakes.forEach((flake) => {
        snowContext.beginPath();
        snowContext.arc(
          flake.x,
          flake.y,
          flake.radius,
          0,
          Math.PI * 2
        );
        snowContext.fill();

        flake.y += flake.speed;
        flake.x += Math.sin(time * 3 + flake.y * 0.01) * 0.4;

        const dx = flake.x - cursorPixelX;
        const dy = flake.y - cursorPixelY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 110) {
          const force = (110 - distance) / 110;

          flake.x += (dx / (distance || 1)) * force * 2.2;
          flake.y += (dy / (distance || 1)) * force * 1.2;
        }

        if (flake.y > snowCanvas.height) {
          flake.y = 0;
          flake.x = Math.random() * snowCanvas.width;
        }

        if (flake.x < -10) flake.x = snowCanvas.width + 10;
        if (flake.x > snowCanvas.width + 10) flake.x = -10;
      });
    };

    let animationFrameId;

    const animate = () => {
      drawAurora();
      drawSnow();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);

      sectionObserver.disconnect();
      fillObserver.disconnect();

      window.removeEventListener('scroll', updateBackToTop);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', resizeCanvases);
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mouseleave', resetCursor);

      tiltListeners.forEach(({ card, mouseMove, mouseLeave }) => {
        card.removeEventListener('mousemove', mouseMove);
        card.removeEventListener('mouseleave', mouseLeave);
      });
    };
  }, []);

  const closeNav = () => setIsNavOpen(false);

  return (
    <div className="text-gray-200">
      <canvas id="auroraCanvas" />
      <canvas id="snowCanvas" />

      <svg className="mountain-layer mountain-back" viewBox="0 0 1440 320">
        <path
          fill="#0f172a"
          d="M0 260 L120 220 L260 260 L420 180 L600 260 L760 200 L900 260 L1100 190 L1260 260 L1440 210 L1440 320 L0 320 Z"
        />
      </svg>

      <svg className="mountain-layer mountain-mid" viewBox="0 0 1440 320">
        <path
          fill="#020617"
          d="M0 280 L150 200 L300 270 L480 160 L650 260 L820 170 L1000 260 L1180 180 L1350 260 L1440 210 L1440 320 L0 320 Z"
        />
      </svg>

      <svg className="mountain-layer mountain-front" viewBox="0 0 1440 320">
        <path
          fill="#01030a"
          d="M0 300 L180 210 L350 280 L520 180 L700 290 L880 200 L1060 300 L1240 210 L1440 280 L1440 320 L0 320 Z"
        />
      </svg>

      <nav id="mainNav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <a
            href="#home"
            className="text-blue-200 font-bold tracking-wide text-base md:text-lg shrink-0"
          >
            Kuro
          </a>

          <div className="hidden md:flex items-center flex-wrap justify-end gap-x-1 gap-y-1">
            <a href="#home" className="nav-link px-3 py-2.5 text-sm" data-section="home">
              Home
            </a>

            <a
              href="#proyectos"
              className="nav-link px-3 py-2.5 text-sm"
              data-section="proyectos"
            >
              Proyectos
            </a>

            <a
              href="#experimentos"
              className="nav-link px-3 py-2.5 text-sm"
              data-section="experimentos"
            >
              Experimentos
            </a>

            <a
              href="#habilidades"
              className="nav-link px-3 py-2.5 text-sm"
              data-section="habilidades"
            >
              Habilidades y Herramientas
            </a>

            <a
              href="#contacto"
              className="nav-link px-3 py-2.5 text-sm"
              data-section="contacto"
            >
              Sobre mí / Contacto
            </a>
          </div>

          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="md:hidden relative w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-lg border border-blue-300/30 text-blue-200"
            aria-label="Abrir menú"
            aria-expanded={isNavOpen}
          >
            <span
              className={`hamburger-line transition-transform ${
                isNavOpen ? 'translate-y-[6.5px] rotate-45' : ''
              }`}
            />

            <span
              className={`hamburger-line transition-opacity ${
                isNavOpen ? 'opacity-0' : ''
              }`}
            />

            <span
              className={`hamburger-line transition-transform ${
                isNavOpen ? '-translate-y-[6.5px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>

        <div
          className={`md:hidden px-4 pb-2 text-base divide-y divide-white/5 flex flex-col overflow-hidden transition-all duration-300 ${
            isNavOpen
              ? 'max-h-[420px] opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <a href="#home" className="nav-link block py-3.5" data-section="home" onClick={closeNav}>
            Home
          </a>

          <a
            href="#proyectos"
            className="nav-link block py-3.5"
            data-section="proyectos"
            onClick={closeNav}
          >
            Proyectos
          </a>

          <a
            href="#experimentos"
            className="nav-link block py-3.5"
            data-section="experimentos"
            onClick={closeNav}
          >
            Experimentos
          </a>

          <a
            href="#habilidades"
            className="nav-link block py-3.5"
            data-section="habilidades"
            onClick={closeNav}
          >
            Habilidades y Herramientas
          </a>

          <a
            href="#contacto"
            className="nav-link block py-3.5"
            data-section="contacto"
            onClick={closeNav}
          >
            Sobre mí / Contacto
          </a>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-250 ${
          isNavOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeNav}
      />

      <section
        id="home"
        className="text-center pt-28 pb-14 md:pt-32 md:pb-20 min-h-[90vh] flex flex-col items-center justify-center px-5"
      >
        <img
          data-depth="30"
          src="mi-portafolio/public/GalleryLogoKuro.jpg"
          className="hero-layer mx-auto mb-5 md:mb-8 w-40 md:w-64 opacity-90 drop-shadow-[0_0_20px_rgba(0,255,200,0.35)]"
          alt="Kuro Logo"
        />

        <h1
          data-depth="15"
          className="hero-layer text-4xl md:text-6xl font-bold text-blue-200 drop-shadow-lg tracking-wide"
        >
          Kuro
        </h1>

        <p
          data-depth="8"
          className="hero-layer mt-4 md:mt-6 text-base md:text-xl text-blue-300"
        >
          Game Developer • Diseñador • Artista
        </p>

        <p
          data-depth="4"
          className="hero-layer mt-3 text-gray-400 text-sm md:text-base"
        >
          Programación de Gameplay • Diseño de Sistemas • Experimentos Interactivos
        </p>

        <a
          href="#proyectos"
          className="inline-block mt-7 md:mt-10 bg-blue-400 hover:bg-blue-300 text-black px-6 py-3 rounded-lg transition"
        >
          Ver Proyectos
        </a>
      </section>

      <section id="proyectos" className="max-w-6xl mx-auto py-12 md:py-24 px-5 md:px-6">
        <p className="eyebrow text-center mb-3">Trabajo terminado</p>

        <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-16">
          Proyectos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 place-items-center mb-12 md:mb-24">
          <ProjectThumbnail
            href="#project1"
            image="/Gallery/GGJ2026.jpg"
            title="MasKeeper"
            description="Videojuego hecho para GGJ-2026"
          />

          <ProjectThumbnail
            href="#project2"
            image="/Gallery/Sprinto.jpg"
            title="Sprinto"
            description="Plataformas / Videojuego Meme"
          />

          <ProjectThumbnail
            href="#project3"
            image="/Gallery/Alta.jpg"
            title="Alta"
            description="AppCenter relajante para automóviles"
          />
        </div>

        <div id="project1" className="glass-card tilt-card mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            MasKeeper
          </h3>

          <p className="text-gray-300 mb-6">
            Videojuego hecho con amigos, proyecto ganador del Global Game Jam
            2026.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
            <img src="/Gallery/GGJ2026.jpg" className="rounded-lg shadow-lg" alt="MasKeeper en Global Game Jam 2026" />
            <img src="/Gallery/Msk1.png" className="rounded-lg shadow-lg" alt="Captura de MasKeeper" />
            <img src="/Gallery/Msk2.png" className="rounded-lg shadow-lg" alt="Otra captura de MasKeeper" />
          </div>

          <div className="flex gap-4 flex-wrap">
            <a
              href="https://jsm269.itch.io/maskeeper"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2 rounded-lg"
            >
              Jugar Online
            </a>

            <a
              href="https://youtu.be/T999Y6quyLg"
              target="_blank"
              rel="noreferrer"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 md:py-2 rounded-lg"
            >
              Trailer
            </a>
          </div>
        </div>

        <div id="project2" className="glass-card tilt-card mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Sprinto
          </h3>

          <p className="text-gray-300 mb-6">
            Videojuego pequeño con 3 niveles y una pelea contra jefe, hecho con
            un par de amigos para un trabajo universitario. Tiene un humor y
            diseño muy “meme”.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
            <img src="/Gallery/Sprinto.jpg" className="rounded-lg shadow-lg" alt="Sprinto" />
            <img src="/Gallery/Spr1.png" className="rounded-lg shadow-lg" alt="Captura de Sprinto" />
            <img src="/Gallery/Spr2.png" className="rounded-lg shadow-lg" alt="Otra captura de Sprinto" />
          </div>

          <div className="flex gap-4 flex-wrap">
            <a
              href="https://github.com/ThomasHyCr/scripting2025"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2 rounded-lg"
            >
              Repositorio
            </a>

            <a
              href="https://www.canva.com/design/DAGfCP2GTj0"
              target="_blank"
              rel="noreferrer"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 md:py-2 rounded-lg"
            >
              Presentación
            </a>
          </div>
        </div>

        <div id="project3" className="glass-card tilt-card">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Alta
          </h3>

          <p className="text-gray-300 mb-6">
            Proyecto de diseño de un AppCenter enfocado en relajación, para uso
            en automóviles.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
            <img src="/Gallery/Alta.jpg" className="rounded-lg shadow-lg" alt="Alta" />
            <img src="/Gallery/Alta1.png" className="rounded-lg shadow-lg" alt="Diseño de Alta" />
            <img src="/Gallery/Alta2.png" className="rounded-lg shadow-lg" alt="Otra pantalla de Alta" />
          </div>

          <div className="flex gap-4 flex-wrap">
            <a
              href="#contacto"
              className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2 rounded-lg"
            >
              Ver Proyecto
            </a>
          </div>
        </div>
      </section>

      <section id="experimentos" className="max-w-6xl mx-auto py-12 md:py-24 px-5 md:px-6">
        <p className="eyebrow text-center mb-3">Exploración técnica</p>

        <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-16">
          Experimentos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 place-items-center mb-12 md:mb-24">
          <ProjectThumbnail
            href="#project4"
            image="/Gallery/Simulacion.jpg"
            title="Simulaciones"
            description="Experimentos narrativos basados en The Nature of Code"
          />

          <ProjectThumbnail
            href="#project5"
            image="/Gallery/VFX.jpg"
            title="VFX & Shaders"
            description="Experimentos de VFX en Unity"
          />
        </div>

        <div id="project4" className="glass-card tilt-card mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Simulaciones
          </h3>

          <p className="text-gray-300 mb-6">
            Varias simulaciones hechas con p5.js. Cada obra tiene una narrativa
            implícita.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
            <img src="/Gallery/Simulacion.jpg" className="rounded-lg shadow-lg" alt="Simulaciones p5.js" />
            <img src="/Gallery/Sim1.png" className="rounded-lg shadow-lg" alt="Simulación p5.js" />
            <img src="/Gallery/Sim2.png" className="rounded-lg shadow-lg" alt="Otra simulación p5.js" />
          </div>

          <div className="flex gap-4 flex-wrap">
            <a
              href="https://editor.p5js.org/ThomasHyCr/sketches/MiOfTFzKC"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2 rounded-lg"
            >
              Tempus Fugit
            </a>

            <a
              href="https://editor.p5js.org/ThomasHyCr/sketches/reOL8vR9h"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2 rounded-lg"
            >
              Rain At Sea
            </a>

            <a
              href="https://editor.p5js.org/ThomasHyCr/sketches/qDTYRA_Vt"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2 rounded-lg"
            >
              Climate Planes
            </a>

            <a
              href="https://editor.p5js.org/ThomasHyCr/sketches/cp5th1pa-"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2 rounded-lg"
            >
              Amoeba Sim
            </a>
          </div>
        </div>

        <div id="project5" className="glass-card tilt-card">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            VFX & Shaders
          </h3>

          <p className="text-gray-300 mb-6">
            Experimentos de VFX y shaders en Unity.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
            <img src="/Gallery/VFX.jpg" className="rounded-lg shadow-lg" alt="VFX y shaders" />
            <img src="/Gallery/VFX1.png" className="rounded-lg shadow-lg" alt="Experimento de VFX" />
            <img src="/Gallery/VFX2.png" className="rounded-lg shadow-lg" alt="Otro experimento de VFX" />
          </div>

          <div className="flex gap-4 flex-wrap">
            <a
              href="https://www.youtube.com/watch?v=w86HKbvUBQM"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2 rounded-lg"
            >
              Water Shader
            </a>

            <a
              href="https://www.youtube.com/watch?v=Y4AgT-_kT5U"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2 rounded-lg"
            >
              Various VFX
            </a>

            <a
              href="https://www.youtube.com/watch?v=VTO-lB86WCM"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-400 hover:bg-blue-300 text-black px-4 py-3 md:py-2 rounded-lg"
            >
              Attack VFX
            </a>
          </div>
        </div>
      </section>

      <section id="habilidades" className="max-w-6xl mx-auto py-12 md:py-24 px-5 md:px-6">
        <p className="eyebrow text-center mb-3">Caja de herramientas</p>

        <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 md:mb-16">
          Habilidades y Herramientas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

      <section id="contacto" className="max-w-3xl mx-auto py-12 md:py-24 px-5 md:px-6">
        <p className="eyebrow text-center mb-3">Quién soy</p>

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10">
          Sobre mí
        </h2>

        <div className="glass-card tilt-card mb-12">
          <p className="text-gray-300 text-center">
            ¡Saludos! Soy Thomas, desarrollador y entusiasta de videojuegos.
            Me fascina todo el proceso de hacer videojuegos y, por supuesto,
            también disfruto jugarlos. Actualmente soy estudiante de Ingeniería
            en Diseño de Entretenimiento Digital en la UPB, en Colombia. Como
            puedes ver en este portafolio, también estoy enamorado de la nieve y
            el invierno.
          </p>
        </div>

        <div className="glass-card tilt-card text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            Contacto
          </h2>

          <a
            href="mailto:thomhoycar@gmail.com"
            className="text-blue-300 text-lg mb-6 inline-block underline decoration-blue-300/40 underline-offset-4"
          >
            thomhoycar@gmail.com
          </a>

          <div className="flex justify-center gap-6 flex-wrap">
            <a
              href="https://github.com/ThomasHyCr"
              target="_blank"
              rel="noreferrer"
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/thomas-hc-62a2383a8/"
              target="_blank"
              rel="noreferrer"
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      <footer className="text-center py-12 text-gray-400">
        <p>© 2026 Thomas HC</p>

        <a
          href="#home"
          className="text-blue-300 hover:text-blue-200 block mt-3"
        >
          Volver arriba
        </a>
      </footer>

      <button
        id="backToTop"
        aria-label="Volver arriba"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-blue-400 text-black flex items-center justify-center shadow-lg"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}

export default App;

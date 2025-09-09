// App interactions: preloader, mobile menu, typing effect, cards hover → boost geo, SW register
(() => {
  // Preloader
  window.addEventListener("load", () => {
    const pre = document.getElementById("preloader");
    // kasih waktu animasi dikit biar smooth
    setTimeout(() => pre.classList.add("hide"), 400);
  });

  // Mobile burger
  const burger = document.querySelector(".hamburger");
  const menu = document.getElementById("nav-menu");
  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      burger.classList.toggle("active", open);
      burger.setAttribute("aria-expanded", String(open));
    });
  }

  // Typing effect (judul) sederhana
  const title = document.querySelector(".hero-title");
  if (title && title.dataset.type) {
    const full = title.dataset.type.trim();
    title.textContent = "";
    let i = 0;
    const tick = () => {
      title.textContent = full.slice(0, i++);
      if (i <= full.length) requestAnimationFrame(tick);
    };
    // delay kecil setelah hero pop
    setTimeout(tick, 250);
  }

  // Micro-interaction: kartu hover → garis geometri boost & follow cursor glow
  const cards = document.querySelectorAll(".tool-card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => window.geoField?.boost(true));
    card.addEventListener("mouseleave", () => window.geoField?.boost(false));
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });

  // Register Service Worker (PWA)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
})();

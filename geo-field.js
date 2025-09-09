// Background geometri abstrak + respons mouse + boost saat hover kartu
(() => {
  const canvas = document.getElementById("geo-canvas");
  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const points = [];
  const numPoints = 75;
  const baseLinkDist = 150;
  let boostFactor = 1; // dinaikkan sementara saat hover card

  const mouse = { x: width / 2, y: height / 2, active: false };

  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.1,
      vy: (Math.random() - 0.5) * 1.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // koneksi garis
    const maxDist = baseLinkDist * boostFactor;
    for (let i = 0; i < numPoints; i++) {
      for (let j = i + 1; j < numPoints; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          ctx.strokeStyle = `rgba(0, 255, 200, ${1 - dist / maxDist})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }

    // update titik
    for (let i = 0; i < numPoints; i++) {
      // efek tarik halus ke mouse
      if (mouse.active) {
        const dx = mouse.x - points[i].x;
        const dy = mouse.y - points[i].y;
        const d = Math.hypot(dx, dy);
        const influence = Math.max(0, 160 - d) / 160; // 0..1
        points[i].vx += (dx / (d || 1)) * 0.04 * influence;
        points[i].vy += (dy / (d || 1)) * 0.04 * influence;
      }

      points[i].x += points[i].vx;
      points[i].y += points[i].vy;

      // gesekan ringan
      points[i].vx *= 0.995;
      points[i].vy *= 0.995;

      // bounce tepi
      if (points[i].x < 0 || points[i].x > width) points[i].vx *= -1;
      if (points[i].y < 0 || points[i].y > height) points[i].vy *= -1;

      // titik
      ctx.fillStyle = "#00ffcc";
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  // resize
  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // mouse move
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener("mouseleave", () => (mouse.active = false));

  // API untuk boost dari kartu
  window.geoField = {
    boost(on) { boostFactor = on ? 1.6 : 1; }
  };

  draw();
})();

/* --------- Inisialisasi --------- */
const canvas = document.getElementById("canvas");
const ctx     = canvas.getContext("2d");

let W, H;
let particles = [];
let targets   = [];

/*  info kursor (mouse / touch)  */
const pointer = { x: 0, y: 0, active: false, radius: 120 };

function resize() {
  W = canvas.width  = innerWidth;
  H = canvas.height = innerHeight;
  createTargets("GALIH");
}
addEventListener("resize", resize);

/* --------- Membangun titik target --------- */
function createTargets(text) {
  // buat canvas offscreen
  const off = document.createElement("canvas");
  off.width = W;
  off.height = H;
  const offCtx = off.getContext("2d");

  offCtx.font = `${Math.min(W, H) * 0.25 | 0}px Arial`;
  offCtx.fillStyle = "#fff";
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillText(text, W / 2, H / 2);

  const data = offCtx.getImageData(0, 0, W, H).data;
  targets = [];
  const gap = 6;

  for (let y = 0; y < H; y += gap)
    for (let x = 0; x < W; x += gap)
      if (data[(y * W + x) * 4 + 3] > 128)
        targets.push({ x, y });

  particles = targets.map(t => ({
    x: Math.random() * W,
    y: Math.random() * H,
    tx: t.x,
    ty: t.y,
    vx: 0,
    vy: 0,
    opacity: 0,
    delay: Math.random() * 60,
    color: "0, 204, 255"
  }));
}


/* --------- Event pointer --------- */
function setPointer(e, state) {
  pointer.active = state;
  if (e.touches) e = e.touches[0];
  pointer.x = e.clientX;
  pointer.y = e.clientY;
}
canvas.addEventListener("mousemove", e => setPointer(e, true));
canvas.addEventListener("touchmove", e => setPointer(e, true), { passive: true });
canvas.addEventListener("mouseleave", () => pointer.active = false);
canvas.addEventListener("touchend",   () => pointer.active = false);

/* --------- Animasi frame --------- */
function animate() {
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, 0, W, H);

  for (const p of particles) {

    /* — delay + fade-in — */
    if (p.delay > 0) { p.delay--; continue; }
    if (p.opacity < 1) p.opacity += 0.02;

    /* — gaya tarik ke target — */
    const ax = (p.tx - p.x) * 0.01;
    const ay = (p.ty - p.y) * 0.01;
    p.vx += ax;
    p.vy += ay;

    /* — repulsi kursor — */
    if (pointer.active) {
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < pointer.radius) {
        const force = (pointer.radius - dist) / pointer.radius; // 0..1
        p.vx += (dx / dist) * force * 2.5;
        p.vy += (dy / dist) * force * 2.5;
      }
    }

    /* — friksi & posisi baru — */
    p.vx *= 0.90;
    p.vy *= 0.90;
    p.x  += p.vx;
    p.y  += p.vy;

    /* — gambar partikel — */
    ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
    ctx.fillRect(p.x, p.y, 1.6, 1.6);
  }

  requestAnimationFrame(animate);
}

/* --------- Mulai --------- */
resize();
animate();

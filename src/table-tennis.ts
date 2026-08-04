/**
 * A small game of table tennis, first to 5.
 *
 * Constraints it respects:
 *  - No dependencies, no assets. Draws with 2D canvas primitives.
 *  - Idle until seen: the loop does not start until the canvas scrolls into
 *    view, and stops when it leaves. A game loop running behind three screens
 *    of text is wasted battery.
 *  - prefers-reduced-motion: never self-animates. The ball only advances while
 *    the player is actively moving, so nothing moves that the user did not.
 *  - Keyboard playable, and the score is announced to screen readers.
 */

type Ctx = CanvasRenderingContext2D;

const W = 640;
const H = 360;
const PADDLE_H = 64;
const PADDLE_W = 8;
const MARGIN = 18;
const BALL = 7;
const WIN = 5;

export function initTableTennis(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const colorScheme = matchMedia("(prefers-color-scheme: dark)");

  // Live region so the score is not purely visual. Visually hidden because the
  // canvas already draws the score — this exists for screen readers only.
  const status = document.createElement("p");
  status.className = "sr-only";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  root.appendChild(status);

  let playerY = H / 2;
  let aiY = H / 2;
  let ballX = W / 2;
  let ballY = H / 2;
  let vx = 4.2;
  let vy = 2.4;
  let playerScore = 0;
  let aiScore = 0;
  let running = false;
  let raf = 0;
  let keyDir = 0;
  let lastAnnounced = "";

  const token = (name: string, fallback: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

  function reset(towardPlayer: boolean) {
    ballX = W / 2;
    ballY = H / 2;
    vx = (towardPlayer ? -1 : 1) * 4.2;
    vy = (Math.random() > 0.5 ? 1 : -1) * (1.8 + Math.random() * 1.6);
  }

  function announce() {
    const msg =
      playerScore >= WIN
        ? `You win, ${playerScore}–${aiScore}. Press R to play again.`
        : aiScore >= WIN
          ? `Table wins, ${aiScore}–${playerScore}. Press R to play again.`
          : `You ${playerScore}, table ${aiScore}.`;
    if (msg !== lastAnnounced) {
      status.textContent = msg;
      lastAnnounced = msg;
    }
  }

  const over = () => playerScore >= WIN || aiScore >= WIN;

  function step() {
    if (over()) return;

    playerY = clamp(playerY + keyDir * 6, PADDLE_H / 2, H - PADDLE_H / 2);

    ballX += vx;
    ballY += vy;

    if (ballY < BALL || ballY > H - BALL) {
      vy *= -1;
      ballY = clamp(ballY, BALL, H - BALL);
    }

    // Player paddle (left)
    if (
      ballX - BALL < MARGIN + PADDLE_W &&
      ballX > MARGIN &&
      Math.abs(ballY - playerY) < PADDLE_H / 2 + BALL
    ) {
      vx = Math.abs(vx) * 1.03;
      vy += (ballY - playerY) * 0.05;
      ballX = MARGIN + PADDLE_W + BALL;
    }

    // Table paddle (right). Eased tracking with a deliberate cap, so it is
    // beatable — an unbeatable opponent is not a toy, it is a wall.
    const target = ballX > W / 2 ? ballY : H / 2;
    aiY += clamp(target - aiY, -4.4, 4.4);
    aiY = clamp(aiY, PADDLE_H / 2, H - PADDLE_H / 2);

    if (
      ballX + BALL > W - MARGIN - PADDLE_W &&
      ballX < W - MARGIN &&
      Math.abs(ballY - aiY) < PADDLE_H / 2 + BALL
    ) {
      vx = -Math.abs(vx) * 1.03;
      vy += (ballY - aiY) * 0.05;
      ballX = W - MARGIN - PADDLE_W - BALL;
    }

    vy = clamp(vy, -6, 6);

    if (ballX < 0) {
      aiScore++;
      announce();
      reset(false);
    } else if (ballX > W) {
      playerScore++;
      announce();
      reset(true);
    }
  }

  function draw() {
    const ink = token("--ink", "#174714");
    const muted = token("--muted", "#505060");
    const surface = token("--surface", "#ecece8");

    ctx!.clearRect(0, 0, W, H);
    ctx!.fillStyle = surface;
    ctx!.fillRect(0, 0, W, H);

    // Net
    ctx!.strokeStyle = muted;
    ctx!.globalAlpha = 0.35;
    ctx!.setLineDash([6, 10]);
    ctx!.beginPath();
    ctx!.moveTo(W / 2, 0);
    ctx!.lineTo(W / 2, H);
    ctx!.stroke();
    ctx!.setLineDash([]);
    ctx!.globalAlpha = 1;

    ctx!.fillStyle = ink;
    roundRect(ctx!, MARGIN, playerY - PADDLE_H / 2, PADDLE_W, PADDLE_H, 4);
    roundRect(ctx!, W - MARGIN - PADDLE_W, aiY - PADDLE_H / 2, PADDLE_W, PADDLE_H, 4);

    ctx!.beginPath();
    ctx!.arc(ballX, ballY, BALL, 0, Math.PI * 2);
    ctx!.fill();

    ctx!.font = "600 34px ui-monospace, SFMono-Regular, Consolas, monospace";
    ctx!.fillStyle = muted;
    ctx!.globalAlpha = 0.45;
    ctx!.textBaseline = "top";
    ctx!.textAlign = "right";
    ctx!.fillText(String(playerScore), W / 2 - 24, 20);
    ctx!.textAlign = "left";
    ctx!.fillText(String(aiScore), W / 2 + 24, 20);
    ctx!.globalAlpha = 1;

    if (over()) {
      ctx!.textAlign = "center";
      ctx!.fillStyle = ink;
      ctx!.font = "500 18px system-ui, sans-serif";
      ctx!.fillText(playerScore > aiScore ? "You win" : "Table wins", W / 2, H - 56);
      ctx!.font = "400 14px system-ui, sans-serif";
      ctx!.fillStyle = muted;
      ctx!.fillText("Press R to play again", W / 2, H - 30);
    }
  }

  function frame() {
    step();
    draw();
    if (running && !over()) raf = requestAnimationFrame(frame);
    else raf = 0;
  }

  function start() {
    if (reduced.matches || running || over()) return;
    running = true;
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /** Reduced motion: advance one frame per input, so motion is never autonomous. */
  function nudge() {
    if (!reduced.matches) return;
    step();
    draw();
  }

  function setPaddleFromPointer(clientY: number) {
    const rect = canvas!.getBoundingClientRect();
    playerY = clamp(((clientY - rect.top) / rect.height) * H, PADDLE_H / 2, H - PADDLE_H / 2);
    nudge();
  }

  canvas.addEventListener("pointermove", (e) => {
    setPaddleFromPointer(e.clientY);
    if (e.pointerType !== "touch") start();
  });

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    setPaddleFromPointer(e.clientY);
    start();
  });

  canvas.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "w") keyDir = -1;
    else if (e.key === "ArrowDown" || e.key === "s") keyDir = 1;
    else if (e.key.toLowerCase() === "r") {
      playerScore = 0;
      aiScore = 0;
      reset(Math.random() > 0.5);
      announce();
      draw();
      start();
      return;
    } else return;

    e.preventDefault(); // stop arrow keys scrolling the page while playing
    start();
    nudge();
  });

  canvas.addEventListener("keyup", (e) => {
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) keyDir = 0;
  });

  canvas.addEventListener("blur", () => { keyDir = 0; stop(); });
  canvas.addEventListener("pointerleave", stop);

  // Idle until scrolled into view.
  const io = new IntersectionObserver(
    ([e]) => { if (!e.isIntersecting) stop(); },
    { threshold: 0 }
  );
  io.observe(canvas);

  reduced.addEventListener("change", () => {
    if (reduced.matches) stop();
    draw();
  });
  colorScheme.addEventListener("change", draw);

  announce();
  draw();
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

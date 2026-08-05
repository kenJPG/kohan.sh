import './style.css';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ── Heading block-break ────────────────────────────────────────────────────
// The heading is painted with a 16x16 block texture. On a timer it fractures
// through the crack stages, throws a burst of shards, and comes back as a
// different block.
//
// Particle colours are sampled from the texture itself rather than hardcoded,
// so adding a texture in generate.mjs needs no change here.

const HOLD_MS = 3200;      // time spent showing a block before it breaks
const CRACK_STEP_MS = 45;  // per destroy_stage frame; 10 frames ~= 0.45s, about
                           // how long a pickaxe takes on stone in-game
const SHARD_COUNT = 16;

function setupBlockBreak(): void {
  const name = document.querySelector<HTMLElement>('.brk[data-textures]');
  const stage = name?.closest<HTMLElement>('.hero__title');
  if (!name || !stage) return;

  const textures = (name.dataset.textures ?? '').split(',').filter(Boolean);
  const cracks = (name.dataset.cracks ?? '').split(',').filter(Boolean);
  if (textures.length === 0) return;

  const url = (src: string) => `url("${src}")`;
  const palettes = new Map<string, string[]>();
  let index = 0;

  // A texture is 16x16, so the whole thing is 256 pixels - cheap to read once
  // and keep. Failure here is not worth breaking the effect over; shards just
  // fall back to a neutral grey.
  async function palette(src: string): Promise<string[]> {
    const cached = palettes.get(src);
    if (cached) return cached;

    try {
      const image = new Image();
      image.src = src;
      await image.decode();

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('no 2d context');

      context.drawImage(image, 0, 0);
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const colours: string[] = [];
      for (let i = 0; i < data.length; i += 4) {
        colours.push(`rgb(${data[i]} ${data[i + 1]} ${data[i + 2]})`);
      }

      palettes.set(src, colours);
      return colours;
    } catch {
      const fallback = ['rgb(127 127 127)'];
      palettes.set(src, fallback);
      return fallback;
    }
  }

  function burst(colours: string[]): void {
    const box = name!.getBoundingClientRect();
    const origin = stage!.getBoundingClientRect();
    const offsetX = box.left - origin.left;
    const offsetY = box.top - origin.top;

    for (let i = 0; i < SHARD_COUNT; i += 1) {
      const shard = document.createElement('span');
      shard.className = 'shard';
      shard.style.background = colours[Math.floor(Math.random() * colours.length)];
      shard.style.transform =
        `translate(${offsetX + Math.random() * box.width}px, ${offsetY + Math.random() * box.height}px)`;
      stage!.append(shard);

      const driftX = (Math.random() - 0.5) * 160;
      const rise = -30 - Math.random() * 50;
      const fall = 90 + Math.random() * 70;

      shard
        .animate(
          [
            { transform: `${shard.style.transform}`, opacity: 1 },
            {
              transform: `${shard.style.transform} translate(${driftX * 0.5}px, ${rise}px) rotate(${Math.random() * 180}deg)`,
              opacity: 1,
              offset: 0.35,
            },
            {
              transform: `${shard.style.transform} translate(${driftX}px, ${fall}px) rotate(${Math.random() * 360}deg)`,
              opacity: 0,
            },
          ],
          { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(0.3, 0.5, 0.6, 1)' }
        )
        .addEventListener('finish', () => shard.remove());
    }
  }

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  async function cycle(): Promise<void> {
    // Pausing while the tab is hidden keeps timers from stacking up and the
    // heading from strobing through textures on return.
    if (document.hidden) return;

    for (const crack of cracks) {
      name!.style.setProperty('--crack', url(crack));
      await wait(CRACK_STEP_MS);
    }

    burst(await palette(textures[index]));

    index = (index + 1) % textures.length;
    name!.style.setProperty('--tex', url(textures[index]));
    name!.style.setProperty('--crack', 'none');
  }

  void palette(textures[0]);
  setInterval(() => void cycle(), HOLD_MS + cracks.length * CRACK_STEP_MS);
}

if (!prefersReducedMotion.matches) {
  document.documentElement.classList.add('motion-safe');

  // Reduced motion still gets the texture - it is set on the element up front -
  // just never the breaking, cracking or shards.
  setupBlockBreak();

  const revealables: HTMLElement[] = [];

  document.querySelectorAll<HTMLElement>('.section').forEach((section) => {
    section.querySelectorAll<HTMLElement>('.entry').forEach((entry, index) => {
      entry.classList.add('reveal');
      entry.style.setProperty('--reveal-index', String(index));
      revealables.push(entry);
    });
  });

  document.querySelectorAll<HTMLElement>('.tags').forEach((tags) => {
    Array.from(tags.children).forEach((item, index) => {
      if (!(item instanceof HTMLElement)) return;
      item.classList.add('reveal');
      item.style.setProperty('--reveal-index', String(index));
      revealables.push(item);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  revealables.forEach((element) => revealObserver.observe(element));
}

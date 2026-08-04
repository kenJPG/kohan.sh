import './style.css';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!prefersReducedMotion.matches) {
  document.documentElement.classList.add('motion-safe');

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

// The game is the only JavaScript on the page, and it is not needed to read
// anything. Loaded lazily and only once the footer is approached, so it costs
// nothing on first paint.
const table = document.querySelector<HTMLElement>('[data-table-tennis]');

if (table) {
  const observer = new IntersectionObserver(
    async ([entry], obs) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const { initTableTennis } = await import('./table-tennis');
      initTableTennis(table);
    },
    { rootMargin: '200px' }
  );

  observer.observe(table);
}

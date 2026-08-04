import './style.css';

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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.animate-enter').forEach((el, i) => {
    (el as HTMLElement).style.setProperty('--animation-delay', `${i * 60}ms`);
  });
});


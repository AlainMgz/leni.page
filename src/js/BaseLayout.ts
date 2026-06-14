document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll<HTMLElement>('.animate-enter');
  const rules = Array.from(elements).map((_, i) =>
    `.animate-enter:nth-child(${i + 1}) { animation-delay: ${i * 60}ms; }`
  ).join('\n');

  const sheet = document.createElement('style');
  sheet.textContent = rules;
  document.head.appendChild(sheet);
});

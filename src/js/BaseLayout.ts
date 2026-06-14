document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.animate-enter');
    elements.forEach((el, i) => {
        (el as HTMLElement).style.animationDelay = `${i * 60}ms`;
    });
});


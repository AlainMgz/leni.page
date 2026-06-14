function dispatchSearchShortcut() {
    window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
    }));
}

document.getElementById('search-trigger')
    ?.addEventListener('click', dispatchSearchShortcut);

document.getElementById('mobile-search-trigger')
    ?.addEventListener('click', () => {
        dispatchSearchShortcut();
        document.getElementById('mobile-menu')?.classList.remove('mobile-menu--open');
        document.getElementById('hamburger')?.setAttribute('aria-expanded', 'false');
    });

document.querySelectorAll<HTMLButtonElement>('.video-embed__play').forEach(btn => {
    btn.addEventListener('click', () => {
        const embed = btn.dataset.embed!;
        const type  = btn.dataset.type!;
        const uid   = btn.dataset.uid!;
        const screen = document.getElementById(`video-${uid}`);
        if (!screen) return;

        if (type === 'youtube') {
            const iframe = document.createElement('iframe');
            iframe.src = embed;
            iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.className = 'video-embed__iframe';
            iframe.title = btn.getAttribute('aria-label') ?? 'Video';
            screen.innerHTML = '';
            screen.appendChild(iframe);
        } else {
            const video = document.createElement('video');
            video.src = embed;
            video.controls = true;
            video.autoplay = true;
            video.className = 'video-embed__iframe';
            if (btn.dataset.poster) video.poster = btn.dataset.poster;
            screen.innerHTML = '';
            screen.appendChild(video);
        }
    });
});

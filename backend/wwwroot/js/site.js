(function () {
    'use strict';

    var FALLBACK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
        '<rect width="400" height="300" fill="#F4F4F5"/>' +
        '<g fill="none" stroke="#A1A1AA" stroke-width="6"><rect x="130" y="90" width="140" height="110" rx="10"/><circle cx="170" cy="125" r="12"/><path d="M138 190l40-38 28 26 22-20 34 32"/></g>' +
        '<text x="200" y="235" font-family="sans-serif" font-size="14" fill="#A1A1AA" text-anchor="middle">Image unavailable</text>' +
        '</svg>');

    document.addEventListener('error', function (e) {
        var img = e.target;
        if (!(img instanceof HTMLImageElement)) return;
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = '1';
        img.src = FALLBACK;
        img.classList.add('object-contain');
    }, true);

    document.addEventListener('load', function (e) {
        var t = e.target;
        if (t instanceof HTMLImageElement) {
            var holder = t.closest('.img-shimmer');
            if (holder) holder.classList.remove('img-shimmer');
        }
    }, true);

    document.addEventListener('DOMContentLoaded', function () {
        var banner = document.querySelector('[data-autohide]');
        if (banner) {
            setTimeout(function () {
                banner.style.transition = 'opacity 0.5s ease';
                banner.style.opacity = '0';
                setTimeout(function () { banner.remove(); }, 500);
            }, 4000);
        }
    });
})();

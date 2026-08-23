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

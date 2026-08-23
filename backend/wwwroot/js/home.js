(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        /* ---------- HERO: random image swap with fade ---------- */
        var heroSlots = Array.prototype.slice.call(document.querySelectorAll('#hero-gallery .hero-slot'));
        if (heroSlots.length >= 2) {
            setInterval(function () {
                var i = Math.floor(Math.random() * heroSlots.length);
                var j = Math.floor(Math.random() * heroSlots.length);
                while (j === i) { j = Math.floor(Math.random() * heroSlots.length); }

                var a = heroSlots[i], b = heroSlots[j];
                [a, b].forEach(function (el) {
                    el.classList.remove('opacity-100', 'scale-100', 'blur-0');
                    el.classList.add('opacity-0', 'scale-95', 'blur-sm');
                });

                setTimeout(function () {
                    var tmp = a.querySelector('img').src;
                    a.querySelector('img').src = b.querySelector('img').src;
                    b.querySelector('img').src = tmp;
                    [a, b].forEach(function (el) {
                        el.classList.remove('opacity-0', 'scale-95', 'blur-sm');
                        el.classList.add('opacity-100', 'scale-100', 'blur-0');
                    });
                }, 600);
            }, 4500);
        }

        /* ---------- FLASH SALE countdown (demo loop from 14:28:59) ---------- */
        var cd = document.getElementById('flash-countdown');
        if (cd) {
            var hEl = document.getElementById('cd-hours');
            var mEl = document.getElementById('cd-minutes');
            var sEl = document.getElementById('cd-seconds');
            var pad = function (n) { return String(n).padStart(2, '0'); };
            var state = { h: 14, m: 28, s: 59 };
            setInterval(function () {
                if (state.s > 0) { state.s--; }
                else if (state.m > 0) { state.m--; state.s = 59; }
                else if (state.h > 0) { state.h--; state.m = 59; state.s = 59; }
                else { state.h = 24; state.m = 0; state.s = 0; }
                hEl.textContent = pad(state.h);
                mEl.textContent = pad(state.m);
                sEl.textContent = pad(state.s);
            }, 1000);
        }

        /* ---------- CATEGORIES: hover circle + ring cursor ---------- */
        var catSection = document.getElementById('categories-section');
        var circle = document.getElementById('cat-circle');
        var circleImg = document.getElementById('cat-circle-img');
        var ring = document.getElementById('cat-cursor');
        if (catSection && circle && ring) {
            catSection.addEventListener('mousemove', function (e) {
                var rect = catSection.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                ring.style.transform = 'translate(' + (x - 20) + 'px,' + (y - 20) + 'px)';
                ring.style.left = '0';
                ring.style.top = '0';
            });

            Array.prototype.forEach.call(catSection.querySelectorAll('.cat-link'), function (link) {
                link.addEventListener('mouseenter', function () {
                    var rx = Math.floor(Math.random() * 60) + 20;
                    var ry = Math.floor(Math.random() * 60) + 20;
                    circle.style.left = rx + '%';
                    circle.style.top = ry + '%';
                    circle.classList.remove('-translate-x-1/2', '-translate-y-1/2', 'opacity-0', 'scale-80');
                    circle.classList.add('-translate-x-1/2', '-translate-y-1/2', 'opacity-100', 'scale-100');
                    circleImg.src = link.getAttribute('data-img');
                    circleImg.classList.remove('opacity-0');
                    circleImg.classList.add('opacity-100');
                    ring.classList.remove('opacity-0');
                    ring.classList.add('opacity-100');
                });
            });

            catSection.addEventListener('mouseleave', function () {
                circle.classList.add('opacity-0', 'scale-80');
                circle.classList.remove('opacity-100', 'scale-100');
                circleImg.classList.add('opacity-0');
                circleImg.classList.remove('opacity-100');
                ring.classList.add('opacity-0');
                ring.classList.remove('opacity-100');
            });
        }

        /* ---------- SUBSCRIPTION PROMO: laser scan reveal ---------- */
        var scanSection = document.getElementById('scan-section');
        var reveal = document.getElementById('scan-reveal');
        var laser = document.getElementById('scan-laser');
        if (scanSection && reveal && laser && 'IntersectionObserver' in window) {
            var scanned = false;

            var observer = new IntersectionObserver(function (entries) {
                if (!entries[0].isIntersecting || scanned) return;
                scanned = true;
                observer.disconnect();

                setTimeout(function () {
                    laser.classList.remove('hidden');
                    var pos = -10;
                    var speed = 0.5;

                    var render = function () {
                        pos += speed;
                        if (pos >= 120) {
                            laser.classList.add('hidden');
                            reveal.style.opacity = '1';
                            reveal.style.maskImage = '';
                            reveal.style.webkitMaskImage = '';
                            return;
                        }
                        var val = pos + '%';
                        var mask = 'linear-gradient(to right, black calc(' + val + ' - 150px), transparent calc(' + val + ' + 50px))';
                        reveal.style.webkitMaskImage = mask;
                        reveal.style.maskImage = mask;
                        laser.style.left = val;
                        requestAnimationFrame(render);
                    };

                    requestAnimationFrame(render);
                }, 600);
            }, { threshold: 0.4 });

            observer.observe(scanSection);
        }
    });
})();

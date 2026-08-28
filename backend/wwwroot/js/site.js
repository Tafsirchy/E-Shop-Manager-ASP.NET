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

    /* ---------- Button loading states on POST forms ---------- */

    function lockSubmitButton(form) {
        var btn = form.querySelector('button[type="submit"]:not([disabled])') ||
                  form.querySelector('button:not([type]):not([disabled])');
        if (!btn || btn.classList.contains('btn-loading')) return;

        // defer so other submit handlers (file-upload guards etc.) settle first
        window.setTimeout(function () {
            if (form.dataset.loadingLocked === 'true') return;
            if (form.querySelector('[data-inflight="true"]')) return;

            // respect client-side validation: don't lock when the form won't submit
            var $f = window.jQuery ? window.jQuery(form) : null;
            if ($f && $f.attr('novalidate') !== undefined && typeof $f.valid === 'function' && !$f.valid()) {
                return;
            }

            form.dataset.loadingLocked = 'true';
            btn.disabled = true;
            btn.classList.add('btn-loading');
            btn.setAttribute('aria-busy', 'true');
        }, 0);
    }

    function resetLoadingButtons() {
        document.querySelectorAll('form[data-loading-locked]').forEach(function (form) {
            form.querySelectorAll('button.btn-loading').forEach(function (btn) {
                btn.disabled = false;
                btn.classList.remove('btn-loading');
                btn.removeAttribute('aria-busy');
            });
            delete form.dataset.loadingLocked;
        });
    }

    document.addEventListener('submit', function (e) {
        var form = e.target;
        if (!(form instanceof HTMLFormElement)) return;
        var method = (form.getAttribute('method') || 'get').toLowerCase();
        if (method !== 'post') return;
        if (form.dataset.noLoading === 'true') return;

        lockSubmitButton(form);
    });

    window.addEventListener('pageshow', function (e) {
        if (e.persisted) resetLoadingButtons();
    });

    /* ---------- Cart badge ---------- */

    function updateCartBadge(count) {
        var badge = document.getElementById('cart-badge');
        if (!badge) return;
        count = parseInt(count, 10);
        if (!isNaN(count) && count > 0) {
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.classList.remove('hidden');
        } else {
            badge.textContent = '0';
            badge.classList.add('hidden');
        }
    }

    function refreshCartBadge() {
        fetch('/Cart/Count', { headers: { 'X-Requested-With': 'fetch' } })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) { if (data) updateCartBadge(data.count); })
            .catch(function () { /* badge stays as-is */ });
    }

    /* ---------- Wishlist badge ---------- */

    function updateWishlistBadge(count) {
        var badge = document.getElementById('wishlist-badge');
        if (!badge) return;
        count = parseInt(count, 10);
        if (!isNaN(count) && count > 0) {
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.classList.remove('hidden');
        } else {
            badge.textContent = '0';
            badge.classList.add('hidden');
        }
    }

    function refreshWishlistBadge() {
        fetch('/Wishlist/Count', { headers: { 'X-Requested-With': 'fetch' } })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) { if (data) updateWishlistBadge(data.count); })
            .catch(function () { /* badge stays as-is */ });
    }

    /* ---------- Search expand / collapse ---------- */

    function initSearchToggle() {
        var openBtn = document.getElementById('search-open');
        var form = document.getElementById('search-form');
        var input = document.getElementById('global-search');
        var closeBtn = document.getElementById('search-close');
        var navItems = document.getElementById('nav-items');
        if (!openBtn || !form || !input || !closeBtn) return;

        function expand() {
            form.classList.remove('hidden');
            form.classList.add('flex');
            navItems.classList.add('hidden');
            openBtn.classList.add('hidden');
            closeBtn.classList.remove('hidden');
            requestAnimationFrame(function () {
                input.style.width = '16rem';
                input.focus();
            });
        }

        function collapse() {
            input.style.width = '0';
            closeBtn.classList.add('hidden');
            navItems.classList.remove('hidden');
            openBtn.classList.remove('hidden');
            setTimeout(function () {
                form.classList.add('hidden');
                form.classList.remove('flex');
            }, 300);
        }

        openBtn.addEventListener('click', expand);
        closeBtn.addEventListener('click', collapse);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && form.classList.contains('flex')) {
                collapse();
            }
        });

        document.addEventListener('click', function (e) {
            if (form.classList.contains('flex') && !form.contains(e.target) && e.target !== openBtn && !openBtn.contains(e.target)) {
                collapse();
            }
        });
    }

    /* ---------- Header search suggestions ---------- */

    function initSearchSuggestions() {
        var input = document.getElementById('global-search');
        var box = document.getElementById('search-suggest');
        if (!input || !box) return;

        var controller = null;
        var debounceTimer = null;
        var MIN_CHARS = 2;

        function hide() {
            box.classList.add('hidden');
            input.setAttribute('aria-expanded', 'false');
        }

        function escapeHtml(s) {
            return s.replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }

        function render(items) {
            if (!items.length) { hide(); return; }
            var html = items.map(function (p) {
                var thumb = p.imageUrl
                    ? '<img src="' + escapeHtml(p.imageUrl) + '" alt="" width="48" height="48" loading="lazy" class="h-12 w-12 rounded-lg object-cover bg-neutral-100 flex-shrink-0" />'
                    : '<span class="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 flex-shrink-0"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></span>';
                return '<a role="option" href="/Products/Details/' + encodeURIComponent(p.id) + '"' +
                    ' class="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50/60 transition-colors">' +
                    thumb +
                    '<span class="min-w-0 flex-1"><span class="block text-sm font-semibold text-foreground truncate">' + escapeHtml(p.name || '') + '</span>' +
                    '<span class="block text-xs text-neutral-500 truncate">' + escapeHtml(p.category || '') + '</span></span>' +
                    '<span class="text-sm font-bold text-foreground whitespace-nowrap">&#2547;' + escapeHtml(String(p.price)) + '</span>' +
                    '</a>';
            }).join('');
            html += '<a href="/Products?search=' + encodeURIComponent(input.value.trim()) + '"' +
                ' class="block border-t border-border px-4 py-2.5 text-center text-xs font-semibold text-primary-600 hover:bg-primary-50/60 transition-colors">See all results</a>';
            box.innerHTML = html;
            box.classList.remove('hidden');
            input.setAttribute('aria-expanded', 'true');
        }

        function showLoading() {
            box.innerHTML = '<div class="px-4 py-3 space-y-2" aria-hidden="true">' +
                '<div class="h-10 rounded-lg shimmer-sweep bg-neutral-100"></div>' +
                '<div class="h-10 rounded-lg shimmer-sweep bg-neutral-100"></div>' +
                '</div>';
            box.classList.remove('hidden');
        }

        function query() {
            var q = input.value.trim();
            if (q.length < MIN_CHARS) { hide(); return; }
            if (controller) controller.abort();
            controller = new AbortController();
            showLoading();
            fetch('/api/products?search=' + encodeURIComponent(q) + '&limit=6',
                    { signal: controller.signal, headers: { 'X-Requested-With': 'fetch' } })
                .then(function (r) { return r.ok ? r.json() : []; })
                .then(render)
                .catch(function (err) {
                    if (err && err.name !== 'AbortError') hide();
                });
        }

        input.addEventListener('input', function () {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(query, 250);
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') hide();
        });

        document.addEventListener('click', function (e) {
            if (!box.contains(e.target) && e.target !== input) hide();
        });
    }

    /* ---------- Hover/touch prefetch of product pages ---------- */

    function initPrefetch() {
        var conn = navigator.connection;
        if (conn && (conn.saveData || /(^|-)2g/.test(conn.effectiveType || ''))) return;

        var prefetched = new Set();
        var timer = null;
        var lastEl = null;

        function prefetch(link) {
            if (!link || link.dataset.prefetched === '1') return;
            if (link.hostname !== location.hostname) return;
            if (!link.pathname.startsWith('/Products/Details/')) return;
            link.dataset.prefetched = '1';
            prefetched.add(link.href);
            fetch(link.href, { priority: 'low', credentials: 'same-origin' })
                .catch(function () { /* navigation will just load normally */ });
        }

        document.addEventListener('pointerover', function (e) {
            var link = e.target.closest ? e.target.closest('a[href]') : null;
            if (!link || link === lastEl) return;
            lastEl = link;
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () { prefetch(link); }, 90);
        });

        document.addEventListener('pointerout', function (e) {
            if (timer && e.target.closest && e.target.closest('a[href]') === lastEl) {
                clearTimeout(timer);
                timer = null;
                lastEl = null;
            }
        }, true);

        document.addEventListener('touchstart', function (e) {
            var link = e.target.closest ? e.target.closest('a[href]') : null;
            if (link) prefetch(link);
        }, { passive: true, capture: true });
    }

    /* ---------- Cart page: quantity stepper, shipping preview, coupon hint ---------- */

    function initCartPage() {
        var totals = document.querySelector('[data-cart-totals]');
        var SHIP_RATES = { free: 0, flat: 60, pickup: 0 };
        var TAKA = '\u09F3';

        function fmt(n) { return TAKA + (Math.round(n * 100) / 100); }

        document.querySelectorAll('[data-qty-form]').forEach(function (form) {
            var input = form.querySelector('input[name="Quantity"]');
            if (!input) return;
            form.querySelectorAll('[data-step]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var current = parseInt(input.value, 10) || 1;
                    input.value = Math.max(1, current + parseInt(btn.dataset.step, 10));
                    form.submit();
                });
            });
            input.addEventListener('change', function () {
                var v = parseInt(input.value, 10);
                if (!v || v < 1) input.value = 1;
                form.submit();
            });
        });

        if (totals) {
            var subtotal = parseFloat(totals.dataset.subtotal) || 0;
            var label = totals.querySelector('[data-shipping-label]');
            var totalEl = totals.querySelector('[data-total-value]');

            totals.querySelectorAll('input[name="ShippingOption"]').forEach(function (radio) {
                radio.addEventListener('change', function () {
                    var rate = SHIP_RATES[radio.value] !== undefined ? SHIP_RATES[radio.value] : 0;
                    if (label) {
                        label.textContent = rate === 0 ? 'Free' : fmt(rate);
                        label.classList.toggle('text-success-600', rate === 0);
                    }
                    if (totalEl) totalEl.textContent = fmt(subtotal + rate);
                });
            });

            var toggle = totals.querySelector('[data-calc-toggle]');
            var panel = totals.querySelector('[data-calc-panel]');
            if (toggle && panel) {
                toggle.addEventListener('click', function () {
                    panel.classList.toggle('hidden');
                    var open = !panel.classList.contains('hidden');
                    toggle.textContent = open ? 'Hide shipping options' : 'Calculate shipping';
                    if (open) {
                        var field = panel.querySelector('input');
                        if (field) field.focus();
                    }
                });
            }
        }

        var couponForm = document.querySelector('[data-coupon-form]');
        if (couponForm) {
            couponForm.addEventListener('submit', function (e) {
                var input = couponForm.querySelector('input[name="CouponCode"]');
                var hint = document.querySelector('[data-coupon-hint]');
                if (input && hint && !input.value.trim()) {
                    e.preventDefault();
                    hint.classList.remove('hidden');
                }
            });
        }

        var updateBtn = document.querySelector('[data-update-cart]');
        if (updateBtn) updateBtn.addEventListener('click', function () { location.reload(); });
    }

    /* ---------- Navbar scroll show/hide + hover reveal ---------- */

    function initNavbar() {
        var nav = document.getElementById('main-nav');
        if (!nav) return;

        var THRESHOLD = 80;
        var IDLE_MS = 1500;
        var isHome = location.pathname === '/' || location.pathname === '/Home';
        var hoverLocked = false;
        var idleTimer = null;

        function showNav() {
            nav.classList.remove('-translate-y-full');
            nav.classList.add('translate-y-0');
        }

        function hideNav() {
            nav.classList.remove('translate-y-0');
            nav.classList.add('-translate-y-full');
        }

        function atTop() {
            return (window.scrollY || window.pageYOffset) <= THRESHOLD;
        }

        function hideIfAllowed() {
            if (!isHome) return;      // only auto-hide on homepage sections
            if (atTop() || hoverLocked) return;
            hideNav();
        }

        function onScroll() {
            if (hoverLocked) return;
            showNav();

            // When scrolling stops, hide the navbar (homepage only)
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(hideIfAllowed, IDLE_MS);
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        showNav();
        if (idleTimer) clearTimeout(idleTimer);

        var hoverZone = document.createElement('div');
        hoverZone.className = 'fixed top-0 left-0 right-0 h-2 z-40';
        hoverZone.setAttribute('aria-hidden', 'true');
        document.body.appendChild(hoverZone);

        hoverZone.addEventListener('mouseenter', function () {
            hoverLocked = true;
            showNav();
            if (idleTimer) clearTimeout(idleTimer);
        });

        nav.addEventListener('mouseenter', function () {
            hoverLocked = true;
            showNav();
            if (idleTimer) clearTimeout(idleTimer);
        });

        nav.addEventListener('mouseleave', function () {
            hoverLocked = false;
            idleTimer = setTimeout(hideIfAllowed, IDLE_MS);
        });
    }

    /* ---------- Auth modal (Sign In / Sign Up) ---------- */

    function initAuthModal() {
        var modal = document.getElementById('auth-modal');
        if (!modal) return;

        var overlay = document.getElementById('auth-overlay');
        var closeBtn = document.getElementById('auth-close');
        var msg = document.getElementById('auth-msg');
        var tabs = document.querySelectorAll('[data-auth-tab]');
        var panelLogin = document.getElementById('auth-panel-login');
        var panelRegister = document.getElementById('auth-panel-register');
        var activeTab = 'login';

        function setTab(tab) {
            activeTab = tab;
            tabs.forEach(function (t) {
                var isActive = t.dataset.authTab === tab;
                t.classList.toggle('border-primary-600', isActive);
                t.classList.toggle('text-primary-600', isActive);
                t.classList.toggle('text-neutral-400', !isActive);
                t.classList.toggle('border-transparent', !isActive);
            });
            panelLogin.classList.toggle('hidden', tab !== 'login');
            panelRegister.classList.toggle('hidden', tab !== 'register');
            hideMsg();
        }

        function open(tab, returnUrl) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            var returnField = modal.querySelector('#auth-panel-login input[name="ReturnUrl"]');
            if (returnField) returnField.value = returnUrl || '';
            setTab(tab || activeTab);
            var first = modal.querySelector('#' + (activeTab === 'login' ? 'login-email' : 'register-name'));
            if (first) setTimeout(function () { first.focus(); }, 100);
        }

        function close() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            hideMsg();
            modal.querySelectorAll('#auth-modal form').forEach(function (f) { f.reset(); });
        }

        function hideMsg() {
            msg.classList.add('hidden');
            msg.textContent = '';
        }

        function showMsg(text, isError) {
            msg.textContent = text;
            msg.classList.remove('hidden');
            msg.classList.toggle('border-l-danger-500', isError);
            msg.classList.toggle('bg-danger-50', isError);
            msg.classList.toggle('text-danger-700', isError);
            msg.classList.toggle('border-l-success-500', !isError);
            msg.classList.toggle('bg-success-50', !isError);
            msg.classList.toggle('text-success-700', !isError);
        }

        // Global triggers: any element with [data-auth-toggle]
        document.addEventListener('click', function (e) {
            var trigger = e.target.closest ? e.target.closest('[data-auth-toggle]') : null;
            if (trigger) {
                e.preventDefault();
                open(trigger.dataset.authToggle === 'signup' ? 'register' : 'login', trigger.dataset.returnUrl);
            }
        });

        // Auto-open from ?auth=login|register query param (fallback link support)
        var params = new URLSearchParams(location.search);
        if (params.get('auth') === 'login' || params.get('auth') === 'register') {
            open(params.get('auth') === 'register' ? 'register' : 'login');
            history.replaceState({}, '', location.pathname);
        }

        tabs.forEach(function (t) {
            t.addEventListener('click', function () { setTab(t.dataset.authTab); });
        });

        if (closeBtn) closeBtn.addEventListener('click', close);
        if (overlay) overlay.addEventListener('click', close);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) close();
        });

        // AJAX submit
        modal.addEventListener('submit', function (e) {
            var form = e.target;
            if (!form.matches('[data-auth-form]')) return;
            e.preventDefault();

            var btn = form.querySelector('button[type="submit"]');
            var spinBtn = btn;
            var btnText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Please wait...';

            var url = form.getAttribute('action');
            var body = new FormData(form);
            body.append('__RequestVerificationToken', '');
            // token comes from the form's hidden field normally; use actual if present
            var tok = form.querySelector('input[name="__RequestVerificationToken"]');
            if (tok) body.set('__RequestVerificationToken', tok.value);

            fetch(url, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'X-Requested-With': 'fetch' },
                body: body
            })
                .then(function (r) {
                    return r.json().then(function (data) { return { ok: r.ok, data: data }; });
                })
                .then(function (res) {
                    if (res.ok && res.data.success) {
                        window.location.href = res.data.redirectUrl || '/';
                    } else if (res.data && res.data.errors) {
                        showMsg(res.data.errors, true);
                        btn.disabled = false;
                        btn.textContent = btnText;
                    } else {
                        showMsg('Unable to process your request.', true);
                        btn.disabled = false;
                        btn.textContent = btnText;
                    }
                })
                .catch(function () {
                    showMsg('Network error. Please try again.', true);
                    btn.disabled = false;
                    btn.textContent = btnText;
                });
        });
    }

    /* ---------- Boot ---------- */

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('#toast').forEach(function (toast) {
            setTimeout(function () {
                toast.style.animation = 'toast-out 0.3s ease forwards';
                setTimeout(function () { toast.remove(); }, 300);
            }, 4000);
        });

        refreshCartBadge();
        refreshWishlistBadge();
        initNavbar();
        initAuthModal();
        initSearchToggle();
        initSearchSuggestions();
        initPrefetch();
        initCartPage();
    });

    window.refreshCartBadge = refreshCartBadge;
    window.refreshWishlistBadge = refreshWishlistBadge;
})();

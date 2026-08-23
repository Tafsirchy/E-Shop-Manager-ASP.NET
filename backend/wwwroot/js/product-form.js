(function () {
    'use strict';

    var MAX_BYTES = 5 * 1024 * 1024;
    var ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    var EXT_BY_TYPE = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

    var dropZone = document.getElementById('drop-zone');
    if (!dropZone) return;

    var fileInput = document.getElementById('file-input');
    var progressBox = document.getElementById('upload-progress');
    var strip = document.getElementById('image-preview-strip');
    var emptyHint = document.getElementById('preview-empty-hint');
    var mainInput = document.querySelector('input[name="ImageUrl"]');
    var mainError = document.getElementById('main-image-error');
    var galleryInput = document.querySelector('textarea[name="galleryInput"]');
    var form = dropZone.closest('form');

    function token() {
        var el = form && form.querySelector('input[name="__RequestVerificationToken"]');
        return el ? el.value : '';
    }

    function inFlightCount() {
        return dropZone.dataset.inflight | 0;
    }
    function setInFlight(delta) {
        dropZone.dataset.inflight = (inFlightCount()) + delta;
        fileInput.disabled = inFlightCount() > 0;
    }
    setInFlight(0);

    function validUrl(u) {
        try {
            var uri = new URL(u);
            return uri.protocol === 'http:' || uri.protocol === 'https:';
        } catch (e) { return false; }
    }

    function allUrls() {
        var urls = [];
        if (mainInput && validUrl(mainInput.value.trim())) urls.push(mainInput.value.trim());
        if (galleryInput) {
            galleryInput.value.split('\n').forEach(function (l) {
                var t = l.trim();
                if (t) urls.push(t);
            });
        }
        return urls.filter(validUrl);
    }

    function renderStrip() {
        strip.innerHTML = '';
        var urls = allUrls();
        emptyHint.classList.toggle('hidden', urls.length > 0);
        urls.forEach(function (u) {
            var cell = document.createElement('div');
            cell.className = 'relative aspect-square overflow-hidden rounded-lg border border-border bg-neutral-100';
            var img = document.createElement('img');
            img.src = u;
            img.alt = 'Image preview';
            img.loading = 'lazy';
            img.className = 'h-full w-full object-cover';
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('aria-label', 'Remove this image');
            btn.className = 'absolute top-1 right-1 h-6 w-6 rounded-full bg-white/95 text-danger-500 shadow flex items-center justify-center text-sm font-bold hover:bg-danger-500 hover:text-white transition';
            btn.textContent = '\u00D7';
            btn.addEventListener('click', function () { removeUrl(u); });
            cell.appendChild(img);
            cell.appendChild(btn);
            strip.appendChild(cell);
        });
        if (mainError && mainInput) {
            var v = mainInput.value.trim();
            var bad = v && !validUrl(v);
            mainError.classList.toggle('hidden', !bad);
            if (bad) mainError.textContent = 'Must be an absolute http(s) URL.';
        }
    }

    function removeUrl(u) {
        if (mainInput && mainInput.value.trim() === u) { mainInput.value = ''; }
        if (galleryInput) {
            var lines = galleryInput.value.split('\n').filter(function (l) { return l.trim() !== u; });
            galleryInput.value = lines.join('\n');
        }
        renderStrip();
    }

    function addUrlToGallery(url) {
        if (!galleryInput) return;
        var lines = galleryInput.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
        if (lines.indexOf(url) === -1) {
            lines.push(url);
            galleryInput.value = lines.join('\n');
        }
    }

    function progressRow(name) {
        var row = document.createElement('div');
        row.className = 'rounded-lg border border-border bg-white px-3 py-2';
        row.innerHTML =
            '<div class="flex items-center justify-between text-xs mb-1">' +
            '<span class="font-medium text-foreground truncate mr-2"></span>' +
            '<span class="pct text-neutral-400 whitespace-ml">0%</span></div>' +
            '<div class="h-1.5 rounded-full bg-neutral-100 overflow-hidden"><div class="bar h-full w-0 rounded-full bg-primary-500 transition-all duration-150"></div></div>';
        row.querySelector('span.font-medium').textContent = name;
        progressBox.appendChild(row);
        progressBox.classList.remove('hidden');
        return {
            set: function (pct) {
                row.querySelector('.bar').style.width = pct + '%';
                row.querySelector('.pct').textContent = pct + '%';
            },
            done: function () {
                row.querySelector('.bar').style.width = '100%';
                row.querySelector('.bar').classList.replace('bg-primary-500', 'bg-success-600');
                setTimeout(function () { row.remove(); if (!progressBox.children.length) progressBox.classList.add('hidden'); }, 800);
            },
            fail: function (msg) {
                row.querySelector('.bar').classList.replace('bg-primary-500', 'bg-danger-500');
                row.querySelector('.pct').textContent = 'failed';
                row.querySelector('.pct').classList.add('text-danger-500');
                if (msg) {
                    var err = document.createElement('p');
                    err.className = 'mt-1 text-xs text-danger-500';
                    err.textContent = msg;
                    row.appendChild(err);
                }
                setTimeout(function () { row.remove(); if (!progressBox.children.length) progressBox.classList.add('hidden'); }, 4000);
            }
        };
    }

    function uploadFile(file) {
        if (ALLOWED.indexOf(file.type) === -1 || !EXT_BY_TYPE[file.type]) {
            window.alert(file.name + ': only JPG, PNG, WebP and GIF images are allowed.');
            return;
        }
        if (file.size > MAX_BYTES) {
            window.alert(file.name + ': exceeds the 5 MB limit.');
            return;
        }

        var fd = new FormData();
        fd.append('file', file);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/Products/UploadImage');
        xhr.setRequestHeader('RequestVerificationToken', token());
        xhr.responseType = 'json';

        var ui = progressRow(file.name);
        setInFlight(1);

        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) ui.set(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = function () {
            setInFlight(-1);
            if (xhr.status >= 200 && xhr.status < 300 && xhr.response && xhr.response.url) {
                ui.done();
                if (mainInput && !mainInput.value.trim()) mainInput.value = xhr.response.url;
                else addUrlToGallery(xhr.response.url);
                renderStrip();
            } else {
                var msg = (xhr.response && xhr.response.error) || ('Upload failed (' + xhr.status + ').');
                ui.fail(msg);
            }
        };
        xhr.onerror = function () { setInFlight(-1); ui.fail('Network error during upload.'); };
        xhr.ontimeout = function () { setInFlight(-1); ui.fail('Upload timed out.'); };
        xhr.send(fd);
    }

    dropZone.addEventListener('click', function () { if (!fileInput.disabled) fileInput.click(); });
    dropZone.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && !fileInput.disabled) { e.preventDefault(); fileInput.click(); }
    });
    fileInput.addEventListener('change', function () {
        Array.prototype.forEach.call(fileInput.files, uploadFile);
        fileInput.value = '';
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
        dropZone.addEventListener(ev, function (e) {
            e.preventDefault(); e.stopPropagation();
            dropZone.classList.add('border-primary-500', 'bg-primary-50');
        });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
        dropZone.addEventListener(ev, function (e) {
            e.preventDefault(); e.stopPropagation();
            dropZone.classList.remove('border-primary-500', 'bg-primary-50');
        });
    });
    dropZone.addEventListener('drop', function (e) {
        if (fileInput.disabled) return;
        var files = e.dataTransfer && e.dataTransfer.files;
        if (files) Array.prototype.forEach.call(files, uploadFile);
    });

    var debounce = null;
    if (galleryInput) {
        galleryInput.addEventListener('input', function () {
            clearTimeout(debounce);
            debounce = setTimeout(renderStrip, 250);
        });
    }
    if (mainInput) {
        mainInput.addEventListener('input', function () {
            clearTimeout(debounce);
            debounce = setTimeout(renderStrip, 250);
        });
    }

    renderStrip();
})();

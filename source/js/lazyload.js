(function () {
    'use strict';

    var lazyloadInstances = [];
    var defaultConfig = {
        rootMargin: '50px 0px',
        threshold: 0.01,
        placeholder: 'blur',
        fadeInDuration: 500,
        blurAmount: 20
    };

    function Lazyload(config) {
        this.config = Object.assign({}, defaultConfig, config);
        this.observer = null;
        this.init();
    }

    Lazyload.prototype.init = function () {
        var self = this;

        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        self.loadImage(entry.target);
                        self.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: this.config.rootMargin,
                threshold: this.config.threshold
            });
        }

        this.processImages();
    };

    Lazyload.prototype.processImages = function () {
        var self = this;
        var images = document.querySelectorAll('img[data-src]:not([data-lazyload-processed])');

        images.forEach(function (img) {
            img.setAttribute('data-lazyload-processed', 'true');
            img.classList.add('lazyload-image');
            self.wrapImage(img);

            if (self.observer) {
                self.observer.observe(img);
            } else {
                self.loadImage(img);
            }
        });
    };

    Lazyload.prototype.wrapImage = function (img) {
        var parent = img.parentNode;
        if (parent.classList.contains('lazyload-wrapper')) {
            return;
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'lazyload-wrapper';

        if (img.classList.contains('medium-zoom-image')) {
            wrapper.classList.add('lazyload-wrapper--zoom');
        }

        var computedStyle = window.getComputedStyle(img);
        if (computedStyle.display === 'inline' || computedStyle.display === 'inline-block') {
            wrapper.classList.add('lazyload-wrapper--inline');
        }

        var skeleton = document.createElement('div');
        skeleton.className = 'lazyload-skeleton';
        wrapper.appendChild(skeleton);

        img.removeAttribute('loading');

        parent.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        var aspectRatio = img.getAttribute('data-aspect-ratio');
        if (aspectRatio) {
            wrapper.style.aspectRatio = aspectRatio;
        } else if (img.getAttribute('width') && img.getAttribute('height')) {
            var width = parseInt(img.getAttribute('width'));
            var height = parseInt(img.getAttribute('height'));
            wrapper.style.aspectRatio = width + '/' + height;
        }
    };

    Lazyload.prototype.loadImage = function (img) {
        var self = this;
        var wrapper = img.closest('.lazyload-wrapper');
        var src = img.getAttribute('data-src');
        var srcset = img.getAttribute('data-srcset');

        if (!src) return;

        var tempImg = new Image();

        tempImg.onload = function () {
            if (srcset) {
                img.srcset = srcset;
            }
            img.src = src;

            img.classList.add('lazyload-loaded');
            if (wrapper) {
                wrapper.classList.add('lazyload-wrapper--loaded');
            }

            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');

            img.dispatchEvent(new CustomEvent('lazyload:loaded', {
                bubbles: true,
                detail: { img: img }
            }));
        };

        tempImg.onerror = function () {
            img.classList.add('lazyload-error');
            if (wrapper) {
                wrapper.classList.add('lazyload-wrapper--error');
                self.showErrorPlaceholder(wrapper, src);
            }

            img.dispatchEvent(new CustomEvent('lazyload:error', {
                bubbles: true,
                detail: { img: img, src: src }
            }));
        };

        tempImg.src = src;
    };

    Lazyload.prototype.showErrorPlaceholder = function (wrapper, src) {
        var existingError = wrapper.querySelector('.lazyload-error-placeholder');
        if (existingError) return;

        var errorPlaceholder = document.createElement('div');
        errorPlaceholder.className = 'lazyload-error-placeholder';
        errorPlaceholder.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><span>图片加载失败</span>';

        wrapper.appendChild(errorPlaceholder);
    };

    Lazyload.prototype.destroy = function () {
        if (this.observer) {
            this.observer.disconnect();
        }
    };

    Lazyload.prototype.refresh = function () {
        this.processImages();
    };

    function initLazyload(config) {
        var instance = new Lazyload(config);
        lazyloadInstances.push(instance);
        return instance;
    }

    function refreshLazyload() {
        lazyloadInstances.forEach(function (instance) {
            instance.refresh();
        });
    }

    function destroyLazyload() {
        lazyloadInstances.forEach(function (instance) {
            instance.destroy();
        });
        lazyloadInstances = [];
    }

    window.initLazyload = initLazyload;
    window.refreshLazyload = refreshLazyload;
    window.destroyLazyload = destroyLazyload;
})();

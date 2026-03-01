(function () {
    'use strict';

    const themeKey = 'theme';
    var header = document.getElementById('header');
    var nav = document.getElementById('nav');
    var menuBtn = document.getElementById('menuBtn');
    var themeToggle = document.getElementById('themeToggle');

    function initNotificationBanner(bannerId) {
        const banner = document.getElementById(bannerId);
        if (!banner) return;

        const content = banner.querySelector('.notification-banner__content');
        const items = banner.querySelectorAll('.notification-banner__item');
        const indicatorsContainer = banner.querySelector('.notification-banner__indicators');
        const indicators = banner.querySelectorAll('.notification-banner__indicator');
        if (items.length <= 1) {
            if (indicatorsContainer) indicatorsContainer.style.display = 'none';
            return;
        }

        const interval = parseInt(banner.dataset.interval) || 5000;
        let currentIndex = 0;
        let autoPlayTimer = null;

        let touchStartX = 0;
        let touchEndX = 0;
        let isSwiping = false;

        function showItem(index, direction = 'next') {
            const prevIndex = currentIndex;
            items.forEach((item, i) => {
                if (i === index) {
                    item.classList.add('is-active');
                    item.style.transform = 'translateX(0)';
                    item.style.opacity = '1';
                } else if (i === prevIndex) {
                    item.classList.remove('is-active');
                    const translateDir = direction === 'next' ? '-20px' : '20px';
                    item.style.transform = `translateX(${translateDir})`;
                    item.style.opacity = '0';
                } else {
                    item.classList.remove('is-active');
                    item.style.transform = 'translateX(20px)';
                    item.style.opacity = '0';
                }
            });

            const activeItem = items[index];
            const height = activeItem.offsetHeight;
            content.style.height = height + 'px';

            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('is-active', i === index);
            });
            currentIndex = index;
        }

        function nextItem() {
            const next = (currentIndex + 1) % items.length;
            showItem(next, 'next');
        }

        function prevItem() {
            const prev = (currentIndex - 1 + items.length) % items.length;
            showItem(prev, 'prev');
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayTimer = setInterval(nextItem, interval);
        }

        function stopAutoPlay() {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = null;
            }
        }

        function handleTouchStart(e) {
            touchStartX = e.touches[0].clientX;
            isSwiping = true;
            stopAutoPlay();
        }

        function handleTouchMove(e) {
            if (!isSwiping) return;
            touchEndX = e.touches[0].clientX;
        }

        function handleTouchEnd() {
            if (!isSwiping) return;
            isSwiping = false;

            const diff = touchStartX - touchEndX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextItem();
                } else {
                    prevItem();
                }
            }

            touchStartX = 0;
            touchEndX = 0;
            startAutoPlay();
        }

        function handleMouseDown(e) {
            touchStartX = e.clientX;
            isSwiping = true;
            stopAutoPlay();
            e.preventDefault();
        }

        function handleMouseMove(e) {
            if (!isSwiping) return;
            touchEndX = e.clientX;
        }

        function handleMouseUp() {
            if (!isSwiping) return;
            isSwiping = false;

            const diff = touchStartX - touchEndX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    nextItem();
                } else {
                    prevItem();
                }
            }

            touchStartX = 0;
            touchEndX = 0;
            startAutoPlay();
        }

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                const direction = index > currentIndex ? 'next' : 'prev';
                showItem(index, direction);
                startAutoPlay();
            });
        });

        content.addEventListener('touchstart', handleTouchStart, { passive: true });
        content.addEventListener('touchmove', handleTouchMove, { passive: true });
        content.addEventListener('touchend', handleTouchEnd);

        content.addEventListener('mousedown', handleMouseDown);
        content.addEventListener('mousemove', handleMouseMove);
        content.addEventListener('mouseup', handleMouseUp);
        content.addEventListener('mouseleave', handleMouseUp);

        banner.addEventListener('mouseenter', stopAutoPlay);
        banner.addEventListener('mouseleave', startAutoPlay);

        const firstItem = items[0];
        if (firstItem) {
            content.style.height = firstItem.offsetHeight + 'px';
        }

        startAutoPlay();
    }

    function initNotifications() {
        initNotificationBanner('notificationBanner');
        initNotificationBanner('notificationBannerMobile');
    }

    function initTheme() {
        const savedTheme = localStorage.getItem(themeKey);
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    function toggleTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem(themeKey, 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem(themeKey, 'dark');
        }
    }

    function toggleMenu() {
        nav.classList.toggle('header__nav--open');
    }

    let lastScrollY = 0;
    let ticking = false;

    function updateHeader() {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }

        if (scrollY > 300 && scrollY > lastScrollY) {
            header.classList.add('header--hidden');
        } else {
            header.classList.remove('header--hidden');
        }

        lastScrollY = scrollY;
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    function setActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.header__nav-item');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath.startsWith(href) && href !== '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function loadHighlightJS(callback) {
        if (window.hljs) {
            callback();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
        script.onload = function () {
            const vueScript = document.createElement('script');
            vueScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/vue.min.js';
            vueScript.onload = callback;
            document.head.appendChild(vueScript);
        };
        document.head.appendChild(script);
    }

    function applyHighlight(element, language) {
        if (!window.hljs) return;

        const codeElement = element.querySelector('code') || element.querySelector('.code pre') || element.querySelector('pre');
        if (!codeElement) return;

        let codeText = codeElement.textContent || codeElement.innerText;

        element.innerHTML = '';

        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.className = language ? `hljs language-${language}` : 'hljs';
        code.textContent = codeText;
        pre.appendChild(code);
        element.appendChild(pre);

        if (language && hljs.getLanguage(language)) {
            hljs.highlightElement(code);
        } else {
            hljs.highlightElement(code);
        }
    }

    function initCodeBlocks() {
        const highlights = document.querySelectorAll('.post-body .highlight');

        highlights.forEach(highlight => {
            if (highlight.closest('.highlight-wrap')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'highlight-wrap';
            highlight.parentNode.insertBefore(wrapper, highlight);
            wrapper.appendChild(highlight);

            const codeElement = highlight.querySelector('code');
            let language = '';
            if (codeElement) {
                const classMatch = codeElement.className.match(/(?:hljs\s+)?(?:language-)?(\w+)/);
                if (classMatch) {
                    language = classMatch[1];
                }
            }

            const figureClass = highlight.className;
            const langMatch = figureClass.match(/highlight\s+(\w+)/);
            if (langMatch && langMatch[1] !== 'plaintext') {
                language = langMatch[1];
            }

            loadHighlightJS(function () {
                applyHighlight(highlight, language);
            });

            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'Copy';
            wrapper.appendChild(copyBtn);

            copyBtn.addEventListener('click', async function () {
                const codeEl = highlight.querySelector('code') || highlight.querySelector('.code');
                let codeText = '';

                if (codeEl) {
                    codeText = codeEl.innerText || codeEl.textContent;
                } else {
                    codeText = highlight.innerText || highlight.textContent;
                }

                try {
                    await navigator.clipboard.writeText(codeText);
                    copyBtn.textContent = 'Copied';
                    copyBtn.classList.add('copied');

                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    const textarea = document.createElement('textarea');
                    textarea.value = codeText;
                    textarea.style.position = 'fixed';
                    textarea.style.left = '-9999px';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);

                    copyBtn.textContent = 'Copied';
                    copyBtn.classList.add('copied');

                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }
            });
        });
    }

    function loadTocbot(callback) {
        if (window.tocbot) {
            callback();
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.28.2/tocbot.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.28.2/tocbot.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    function initToc() {
        const toc = document.getElementById('postToc');
        const postBody = document.getElementById('postBody');
        const tocContent = document.getElementById('tocContent');
        const tocToggle = document.getElementById('tocToggle');

        if (!toc || !postBody || !tocContent) return;

        const headings = postBody.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
            toc.style.display = 'none';
            return;
        }

        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = 'heading-' + index;
            }
        });

        if (window.tocbot && window.tocbot.destroy) {
            window.tocbot.destroy();
        }

        loadTocbot(function () {
            tocbot.init({
                tocSelector: '.js-toc',
                contentSelector: '#postBody',
                headingSelector: 'h1, h2, h3, h4, h5, h6',
                hasInnerContainers: true,
                linkClass: 'toc-link',
                activeLinkClass: 'is-active-link',
                listClass: 'toc-list',
                listItemClass: 'toc-list-item',
                activeListItemClass: 'is-active-li',
                collapseDepth: 0,
                scrollSmooth: false,
                headingsOffset: 80,
                throttleTimeout: 50,
                disableTocScrollSync: false
            });

            initTocBoundaryDetection(toc, postBody);
            initTocToggle(toc, tocToggle);
            initTocSmoothScroll(tocContent);
        });
    }

    function initTocSmoothScroll(tocContent) {
        if (!tocContent) return;

        tocContent.addEventListener('click', function (e) {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const offset = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - offset;
                const startPosition = window.scrollY;
                const distance = targetPosition - startPosition;
                const duration = 400;
                let startTime = null;

                function linearScroll(currentTime) {
                    if (!startTime) startTime = currentTime;
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    window.scrollTo(0, startPosition + distance * progress);

                    if (progress < 1) {
                        requestAnimationFrame(linearScroll);
                    }
                }

                requestAnimationFrame(linearScroll);

                history.pushState(null, null, '#' + targetId);
            }
        });
    }

    function initTocToggle(toc, tocToggle) {
        if (!toc || !tocToggle) return;

        const STORAGE_KEY = 'toc-collapsed';
        const isCollapsed = localStorage.getItem(STORAGE_KEY) === 'true';

        if (isCollapsed) {
            toc.classList.add('post-toc--collapsed');
            tocToggle.setAttribute('aria-expanded', 'false');
            tocToggle.setAttribute('aria-label', '展开目录');
        }

        tocToggle.addEventListener('click', function () {
            const currentlyCollapsed = toc.classList.toggle('post-toc--collapsed');
            tocToggle.setAttribute('aria-expanded', !currentlyCollapsed);
            tocToggle.setAttribute('aria-label', currentlyCollapsed ? '展开目录' : '折叠目录');
            localStorage.setItem(STORAGE_KEY, currentlyCollapsed);
        });

        tocToggle.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tocToggle.click();
            }
        });
    }

    function initTocBoundaryDetection(toc, postBody) {
        const tocInner = toc.querySelector('.post-toc__inner');
        const postBodyWrapper = document.getElementById('postBodyWrapper');
        if (!tocInner || !postBodyWrapper) return;

        const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64;
        const tocTopOffset = headerHeight + 24;

        function updateTocPosition() {
            const viewportWidth = window.innerWidth;

            if (viewportWidth < 1200) {
                toc.classList.add('post-toc--hidden');
                toc.classList.remove('post-toc--visible');
                return;
            }

            toc.classList.remove('post-toc--hidden');

            const scrollY = window.scrollY;
            const wrapperRect = postBodyWrapper.getBoundingClientRect();
            const tocInnerHeight = tocInner.offsetHeight;
            const viewportHeight = window.innerHeight;

            const wrapperTopAbsolute = wrapperRect.top + scrollY;
            const wrapperBottomAbsolute = wrapperRect.bottom + scrollY;

            const maxTocHeight = viewportHeight - tocTopOffset - 24;
            if (tocInnerHeight > maxTocHeight) {
                tocInner.style.maxHeight = maxTocHeight + 'px';
            }

            const tocStartY = wrapperTopAbsolute - tocTopOffset;
            const tocEndY = wrapperBottomAbsolute - tocInnerHeight - tocTopOffset - 24;

            if (scrollY < tocStartY || scrollY > tocEndY) {
                toc.classList.remove('post-toc--visible');
            } else {
                toc.classList.add('post-toc--visible');
            }
        }

        function onScroll() {
            requestAnimationFrame(updateTocPosition);
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });

        updateTocPosition();
        setTimeout(updateTocPosition, 100);
        setTimeout(updateTocPosition, 500);
    }

    function initMediumZoom() {
        if (typeof mediumZoom === 'undefined') return;

        const postBody = document.getElementById('postBody');
        if (!postBody) return;

        const images = postBody.querySelectorAll('.markdown-body img, .post-body img, article img');
        if (images.length === 0) return;

        images.forEach(img => {
            if (img.closest('a')) return;
            if (img.classList.contains('medium-zoom-image')) return;
            img.classList.add('medium-zoom-image');
        });

        document.querySelectorAll('[data-zoomable]').forEach(function (img) {
            if (!img.classList.contains('medium-zoom-image')) {
                img.classList.add('medium-zoom-image');
            }
        });

        mediumZoom('.medium-zoom-image', {
            margin: 24,
            background: getComputedStyle(document.documentElement).getPropertyValue('--bg-color') || '#fff'
        });
    }

    function initPage() {
        header = document.getElementById('header');
        nav = document.getElementById('nav');
        menuBtn = document.getElementById('menuBtn');
        themeToggle = document.getElementById('themeToggle');

        if (themeToggle) {
            themeToggle.removeEventListener('click', toggleTheme);
            themeToggle.addEventListener('click', toggleTheme);
        }

        if (menuBtn) {
            menuBtn.removeEventListener('click', toggleMenu);
            menuBtn.addEventListener('click', toggleMenu);
        }

        setActiveNavLink();
        initCodeBlocks();
        initToc();
        initMediumZoom();
        initNotifications();

        window.scrollTo(0, 0);
    }

    window.initPage = initPage;
    window.initMediumZoom = initMediumZoom;

    function init() {
        initTheme();
        setActiveNavLink();

        if (themeToggle) {
            themeToggle.removeEventListener('click', toggleTheme);
            themeToggle.addEventListener('click', toggleTheme);
        }

        if (menuBtn) {
            menuBtn.removeEventListener('click', toggleMenu);
            menuBtn.addEventListener('click', toggleMenu);
        }

        window.removeEventListener('scroll', onScroll);
        window.addEventListener('scroll', onScroll, { passive: true });

        document.removeEventListener('click', handleOutsideClick);
        document.addEventListener('click', handleOutsideClick);

        const navLinks = document.querySelectorAll('.header__nav-item');
        navLinks.forEach(link => {
            link.removeEventListener('click', handleNavLinkClick);
            link.addEventListener('click', handleNavLinkClick);
        });

        initCodeBlocks();
        initToc();
        initNotifications();
    }

    function handleOutsideClick(e) {
        if (nav && nav.classList.contains('header__nav--open')) {
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                toggleMenu();
            }
        }
    }

    function handleNavLinkClick() {
        if (nav && nav.classList.contains('header__nav--open')) {
            toggleMenu();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

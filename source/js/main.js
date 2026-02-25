(function () {
    'use strict';

    const themeKey = 'theme';
    var header = document.getElementById('header');
    var nav = document.getElementById('nav');
    var menuBtn = document.getElementById('menuBtn');
    var themeToggle = document.getElementById('themeToggle');

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
                scrollSmooth: true,
                scrollSmoothDuration: 420,
                scrollSmoothOffset: -80,
                headingsOffset: 80,
                throttleTimeout: 50,
                disableTocScrollSync: false
            });

            initTocBoundaryDetection(toc, postBody);
            initTocToggle(toc, tocToggle);
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

        window.scrollTo(0, 0);
    }

    window.initPage = initPage;

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

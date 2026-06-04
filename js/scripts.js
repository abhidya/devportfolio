/*!
    Manny Bhidya portfolio scripts.
    Renders generated repo metadata from data/portfolio-data.json.
*/

(function () {
    var state = {
        data: null,
        activeFilter: 'All',
        query: ''
    };

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function icon(name) {
        return '<i class="fa fa-' + name + '" aria-hidden="true"></i>';
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function scrollToSelector(selector) {
        var target = $(selector);
        if (!target) return;
        window.scrollTo({
            top: target.getBoundingClientRect().top + window.pageYOffset,
            behavior: 'smooth'
        });
    }

    function setupNavigation() {
        $all('header a[href^="#"]').forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                scrollToSelector(link.getAttribute('href'));
                $('header').classList.remove('active');
                document.body.classList.remove('active');
            });
        });

        var open = $('#mobile-menu-open');
        var close = $('#mobile-menu-close');
        var header = $('header');

        if (open && header) {
            open.addEventListener('click', function () {
                header.classList.add('active');
                document.body.classList.add('active');
            });
            open.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open.click();
                }
            });
        }

        if (close && header) {
            close.addEventListener('click', function () {
                header.classList.remove('active');
                document.body.classList.remove('active');
            });
        }

        var toTop = $('#to-top');
        if (toTop) {
            toTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        var leadDown = $('#lead-down span');
        if (leadDown) {
            leadDown.addEventListener('click', function () {
                scrollToSelector('#about');
            });
        }
    }

    function setupTimeline() {
        var timeline = $('#experience-timeline');
        if (!timeline || timeline.dataset.enhanced === 'true') return;
        timeline.dataset.enhanced = 'true';

        $all(':scope > div', timeline).forEach(function (item) {
            var point = document.createElement('div');
            point.className = 'vtimeline-point';

            var iconNode = document.createElement('div');
            iconNode.className = 'vtimeline-icon';
            iconNode.innerHTML = icon('map-marker');

            var block = document.createElement('div');
            block.className = 'vtimeline-block';

            var content = document.createElement('div');
            content.className = 'vtimeline-content';
            content.innerHTML = item.innerHTML;

            var date = item.getAttribute('data-date');
            if (date) {
                var dateNode = document.createElement('span');
                dateNode.className = 'vtimeline-date';
                dateNode.textContent = date;
                block.appendChild(dateNode);
            }

            block.appendChild(content);
            point.appendChild(iconNode);
            point.appendChild(block);
            timeline.replaceChild(point, item);
        });
    }

    function updateStats(data) {
        var stats = $('#hero-stats');
        if (!stats) return;
        stats.innerHTML = [
            ['Repos', data.stats.repoCount],
            ['Categories', data.stats.categoryCount],
            ['Demos', data.stats.liveDemoCount],
            ['Case studies', data.stats.featuredCount]
        ].map(function (item) {
            return '<div><dt>' + escapeHtml(item[0]) + '</dt><dd>' + escapeHtml(item[1]) + '</dd></div>';
        }).join('');
    }

    function renderTour(data) {
        var grid = $('#tour-grid');
        if (!grid) return;
        grid.innerHTML = data.tour.map(function (stop) {
            var repos = stop.repos.map(function (name) {
                return '<li>' + escapeHtml(name) + '</li>';
            }).join('');
            return [
                '<article class="tour-stop">',
                '<p class="eyebrow">' + escapeHtml(stop.id.replace('-', ' ')) + '</p>',
                '<h3>' + escapeHtml(stop.title) + '</h3>',
                '<p>' + escapeHtml(stop.copy) + '</p>',
                '<ul>' + repos + '</ul>',
                '</article>'
            ].join('');
        }).join('');
    }

    function chips(items, extraClass) {
        return '<div class="chip-row">' + (items || []).slice(0, 5).map(function (item) {
            return '<span class="chip ' + (extraClass || '') + '">' + escapeHtml(item) + '</span>';
        }).join('') + '</div>';
    }

    function repoLinks(repo) {
        var links = [
            '<a href="' + escapeHtml(repo.githubUrl) + '" target="_blank" rel="noopener">' + icon('github') + ' Code</a>'
        ];
        if (repo.demoUrl) {
            links.unshift('<a href="' + escapeHtml(repo.demoUrl) + '" target="_blank" rel="noopener">' + icon('external-link') + ' Demo</a>');
        }
        return '<div class="card-actions">' + links.join('') + '</div>';
    }

    function renderCaseStudies(data) {
        var grid = $('#case-study-grid');
        if (!grid) return;
        grid.innerHTML = data.caseStudies.map(function (repo) {
            var steps = repo.walkthrough.map(function (step) {
                return '<li>' + escapeHtml(step) + '</li>';
            }).join('');
            return [
                '<article class="case-study">',
                chips(repo.tags),
                '<h3>' + escapeHtml(repo.title) + '</h3>',
                '<p>' + escapeHtml(repo.outcome) + '</p>',
                '<p><strong>Why it matters:</strong> ' + escapeHtml(repo.why) + '</p>',
                '<ol>' + steps + '</ol>',
                '<div class="meta-row">',
                '<span class="chip">' + escapeHtml(repo.demoKind) + '</span>',
                '<span class="chip">' + escapeHtml(repo.category) + '</span>',
                '</div>',
                repoLinks(repo),
                '</article>'
            ].join('');
        }).join('');
    }

    function setupFilters(data) {
        var row = $('#repo-filters');
        var input = $('#repo-search');
        if (!row) return;

        row.innerHTML = data.filters.map(function (filter) {
            var active = filter === state.activeFilter ? ' active' : '';
            return '<button type="button" class="' + active + '" data-filter="' + escapeHtml(filter) + '">' + escapeHtml(filter) + '</button>';
        }).join('');

        $all('button', row).forEach(function (button) {
            button.addEventListener('click', function () {
                state.activeFilter = button.getAttribute('data-filter');
                $all('button', row).forEach(function (other) {
                    other.classList.toggle('active', other === button);
                });
                renderRepoGrid();
            });
        });

        if (input) {
            input.addEventListener('input', function () {
                state.query = input.value;
                renderRepoGrid();
            });
        }
    }

    function filterRepo(repo) {
        var filter = state.activeFilter;
        var searchable = normalize([
            repo.name,
            repo.title,
            repo.description,
            repo.category,
            repo.role,
            repo.demoKind,
            repo.stack.join(' '),
            repo.tags.join(' '),
            repo.riskNotes.join(' ')
        ].join(' '));
        var queryMatches = !state.query || searchable.indexOf(normalize(state.query)) !== -1;
        if (!queryMatches) return false;

        if (filter === 'All') return true;
        if (filter === 'Live Demo') return Boolean(repo.demoUrl || repo.demoKind === 'static-safe' || repo.demoKind === 'multi-device');
        if (filter === 'Featured') return repo.featured;
        if (filter === 'Games') return /game/i.test(repo.category) || repo.demoKind === 'multi-device';
        if (filter === 'AI / ML') return /AI|Machine learning/i.test(repo.category);
        if (filter === 'Automation') return /Automation/i.test(repo.category);
        if (filter === 'Web') return /Web/i.test(repo.category) || repo.stack.indexOf('react') !== -1 || repo.stack.indexOf('vite') !== -1;
        if (filter === 'Backend') return /Backend/i.test(repo.category) || repo.stack.indexOf('docker') !== -1 || repo.stack.indexOf('python') !== -1;
        if (filter === 'Archive') return /archive/i.test(repo.role);
        return true;
    }

    function renderRepoGrid() {
        var grid = $('#repo-grid');
        var count = $('#repo-count');
        if (!grid || !state.data) return;

        var repos = state.data.repos.filter(filterRepo);
        if (count) {
            count.textContent = repos.length + ' of ' + state.data.repos.length + ' repos shown';
        }

        if (!repos.length) {
            grid.innerHTML = '<article class="repo-card"><h3>No repos match</h3><p>Try a broader filter or clear the search box.</p></article>';
            return;
        }

        grid.innerHTML = repos.map(function (repo) {
            var risks = repo.riskNotes && repo.riskNotes.length
                ? '<div class="chip-row"><span class="chip risk-chip">' + escapeHtml(repo.riskNotes[0]) + '</span></div>'
                : '';
            return [
                '<article class="repo-card" data-category="' + escapeHtml(repo.category) + '">',
                chips([repo.role, repo.demoKind].concat(repo.stack.slice(0, 3))),
                '<h3>' + escapeHtml(repo.title) + '</h3>',
                '<p>' + escapeHtml(repo.description) + '</p>',
                risks,
                repoLinks(repo),
                '</article>'
            ].join('');
        }).join('');
    }

    function renderDemos(data) {
        var shelf = $('#demo-shelf');
        if (!shelf) return;
        var copy = {
            'live-hosted': 'Hosted demos and GitHub Pages entries that open directly.',
            'static-safe': 'Frontend-only projects that can be served as static files.',
            'multi-device': 'P2P, QR, or room-based experiences best tried with two tabs or devices.',
            'hardware-gated': 'Roblox, Unity, DLNA, cast, or device-adjacent projects best shown with narrated evidence.',
            'script-install': 'Userscripts, automation tools, or CLI flows that need careful setup notes.',
            narrated: 'Research, notebooks, backend, and archive repos best shown through README, screenshots, or code walkthroughs.'
        };
        var order = ['live-hosted', 'static-safe', 'multi-device', 'hardware-gated', 'script-install', 'narrated'];
        var groups = data.repos.reduce(function (acc, repo) {
            acc[repo.demoKind] = acc[repo.demoKind] || [];
            acc[repo.demoKind].push(repo);
            return acc;
        }, {});

        shelf.innerHTML = order.filter(function (kind) {
            return groups[kind] && groups[kind].length;
        }).map(function (kind) {
            var repoLinksHtml = groups[kind].slice(0, 6).map(function (repo) {
                var href = repo.demoUrl || repo.githubUrl;
                return '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener">' + escapeHtml(repo.name) + '</a>';
            }).join(', ');
            return [
                '<article class="demo-row">',
                '<p class="eyebrow">' + escapeHtml(kind.replace('-', ' ')) + '</p>',
                '<h3>' + groups[kind].length + ' repos</h3>',
                '<p>' + escapeHtml(copy[kind]) + '</p>',
                '<p>' + repoLinksHtml + '</p>',
                '</article>'
            ].join('');
        }).join('');
    }

    function renderError(error) {
        var count = $('#repo-count');
        if (count) {
            count.textContent = 'Portfolio data failed to load. Run a static server from this folder and retry.';
        }
        var grid = $('#repo-grid');
        if (grid) {
            grid.innerHTML = '<article class="repo-card"><h3>Data unavailable</h3><p>' + escapeHtml(error.message) + '</p></article>';
        }
    }

    function loadData() {
        fetch('data/portfolio-data.json')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                state.data = data;
                updateStats(data);
                renderTour(data);
                renderCaseStudies(data);
                setupFilters(data);
                renderRepoGrid();
                renderDemos(data);
            })
            .catch(renderError);
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.documentElement.classList.remove('no-js');
        setupNavigation();
        setupTimeline();
        loadData();
    });
})();

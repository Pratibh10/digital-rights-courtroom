/* ============================================
   DIGITAL RIGHTS COURTROOM — Legal Codex
   Sidebar reference panel for regulatory text
   ============================================ */

   const Codex = {

    isOpen: false,
  
    toggle() {
      this.isOpen = !this.isOpen;
      document.body.classList.toggle('codex-open', this.isOpen);
    },
  
    open() {
      this.isOpen = true;
      document.body.classList.add('codex-open');
    },
  
    close() {
      this.isOpen = false;
      document.body.classList.remove('codex-open');
    },
  
    init() {
      // Toggle button
      const toggleBtn = document.getElementById('codex-toggle-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggle());
      }
  
      // Tab switching
      document.querySelectorAll('.codex-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.codex-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.renderArticles(tab.dataset.framework);
        });
      });
  
      // Search
      const searchInput = document.getElementById('codex-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.search(e.target.value);
        });
      }
  
      // Initial render
      this.renderArticles('all');
    },
  
    renderArticles(framework) {
      const content = document.getElementById('codex-content');
      if (!content) return;
  
      let articles = [];
  
      if (framework === 'all') {
        Object.keys(CODEX).forEach(fw => {
          CODEX[fw].articles.forEach(art => {
            articles.push({ ...art, framework: fw });
          });
        });
      } else if (CODEX[framework]) {
        articles = CODEX[framework].articles.map(art => ({ ...art, framework }));
      }
  
      if (articles.length === 0) {
        content.innerHTML = `
          <p class="text-muted" style="padding: 1rem; font-size: 0.85rem;">
            Codex articles will be populated as cases are developed. 
            Each case adds its referenced articles to this reference library.
          </p>
        `;
        return;
      }
  
      content.innerHTML = articles.map(art => `
        <div class="codex-article ${this._isRelevant(art) ? 'relevant' : ''}" id="codex-${art.id}">
          <div class="codex-article-header" onclick="Codex.toggleArticle('${art.id}')">
            <div class="codex-article-number">${art.number}</div>
            <div class="codex-article-title">${art.title}</div>
          </div>
          <div class="codex-article-body">
            <div class="codex-article-official">${art.officialText}</div>
            <div class="codex-article-plain">${art.plainLanguage}</div>
          </div>
        </div>
      `).join('');
    },
  
    toggleArticle(articleId) {
      const el = document.getElementById(`codex-${articleId}`);
      if (el) {
        el.classList.toggle('expanded');
      }
    },
  
    search(query) {
      const q = query.toLowerCase().trim();
      document.querySelectorAll('.codex-article').forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = q === '' || text.includes(q) ? 'block' : 'none';
      });
    },
  
    _isRelevant(article) {
      // Check if this article is referenced by the current case
      if (!Game.state.currentCase) return false;
      const caseRefs = Game.state.currentCase.codexReferences || [];
      return caseRefs.includes(article.id);
    }
  };
  
  // Initialize codex when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    Codex.init();
  });
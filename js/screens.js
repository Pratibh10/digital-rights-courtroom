/* ============================================
   DIGITAL RIGHTS COURTROOM — Screen Renderers
   Enhanced with document reader & write-before-choose
   ============================================ */

   const Screens = {

    // ========================
    // DASHBOARD
    // ========================
    renderDashboard(container) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      const completedCount = Object.keys(Game.state.completedCases).length;
      const totalCases = CASES.filter(c => c.evidence.length > 0).length;
      const frameworksCovered = new Set(
        Object.keys(Game.state.completedCases)
          .map(id => CASES.find(c => c.id === id))
          .filter(Boolean)
          .map(c => c.framework)
      ).size;
  
      screen.innerHTML = `
        <div class="dashboard-hero">
          <h1>Digital Rights Courtroom</h1>
          <p class="tagline">A Litigation Simulator for EU Digital Law</p>
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-number">${TAXONOMY.length}</span>
              <span class="stat-label">Scenario Types</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">5</span>
              <span class="stat-label">EU Frameworks</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${completedCount}/${totalCases}</span>
              <span class="stat-label">Cases Completed</span>
            </div>
          </div>
        </div>
  
        <div class="divider"></div>
  
        <p class="cases-section-title">Select a Case</p>
        <div class="cases-grid" id="cases-grid"></div>
  
        <div class="divider"></div>
  
        <div class="dashboard-footer">
          <button class="btn btn-ghost" onclick="Game.showScreen('taxonomy')">
            Scenario Library (${TAXONOMY.length} Types)
          </button>
          <button class="btn btn-ghost" onclick="Codex.toggle()">
            Legal Codex
          </button>
          <a href="about.html" class="btn btn-ghost" target="_blank">
            About & Methodology
          </a>
        </div>
      `;
  
      container.appendChild(screen);
  
      const grid = document.getElementById('cases-grid');
      CASES.forEach(caseData => {
        const completion = Game.state.completedCases[caseData.id];
        const hasContent = caseData.evidence.length > 0;
        const card = document.createElement('div');
        card.className = 'case-card' + (completion ? ' completed' : '');
        card.style.opacity = hasContent ? '1' : '0.5';
        card.onclick = () => Game.startCase(caseData.id);
  
        let tagClass = 'tag-ai-act';
        if (caseData.framework === 'gdpr') tagClass = 'tag-gdpr';
        else if (caseData.framework === 'dsa') tagClass = 'tag-dsa';
        else if (caseData.framework === 'dma') tagClass = 'tag-dma';
        else if (caseData.framework === 'data-act') tagClass = 'tag-data-act';
        else if (caseData.framework === 'cross-framework') tagClass = 'tag-gdpr';
  
        card.innerHTML = `
          <div class="case-number">CASE ${String(caseData.number).padStart(2, '0')}</div>
          <div class="case-title">${caseData.title}</div>
          <div class="case-subtitle">${caseData.subtitle}</div>
          <div class="case-meta">
            <span class="tag ${tagClass}">${caseData.frameworkLabel}</span>
            <span class="badge badge-difficulty">${caseData.difficulty}</span>
            <span class="badge-time">${caseData.estimatedMinutes} min</span>
            ${completion ? `<span class="badge badge-score">${completion.score}/100</span>` : ''}
            ${completion ? '<span class="badge badge-completed">Completed</span>' : ''}
            ${!hasContent ? '<span class="badge badge-difficulty">COMING SOON</span>' : ''}
          </div>
        `;
  
        grid.appendChild(card);
      });
    },
  
  
    // ========================
    // BRIEFING
    // ========================
    renderBriefing(container, caseData) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / Case ${String(caseData.number).padStart(2, '0')}
          </div>
          <h1>${caseData.title}</h1>
          <p class="subtitle">${caseData.subtitle}</p>
        </div>
  
        ${this._renderPhaseIndicator('briefing')}
  
        <div class="feedback-box" style="border-left-color: var(--accent-gold); margin-bottom: var(--space-xl);">
          <div class="feedback-title" style="color: var(--accent-gold);">Case Briefing</div>
          <div class="feedback-text" style="line-height: 1.8; font-size: 0.95rem; color: var(--text-primary);">
            ${caseData.briefing.narrative}
          </div>
        </div>
  
        <div style="display: flex; gap: var(--space-lg); margin-bottom: var(--space-xl); flex-wrap: wrap;">
          <div class="feedback-box" style="flex: 1; min-width: 250px;">
            <div class="feedback-title" style="color: var(--accent-blue);">Your Client</div>
            <div class="feedback-text">
              <strong>${caseData.briefing.client.name}</strong><br>
              ${caseData.briefing.client.role}
            </div>
          </div>
          <div class="feedback-box" style="flex: 1; min-width: 250px;">
            <div class="feedback-title" style="color: var(--color-error);">Respondent</div>
            <div class="feedback-text">
              <strong>${caseData.briefing.respondent.name}</strong><br>
              ${caseData.briefing.respondent.type}
            </div>
          </div>
        </div>
  
        <p class="text-muted" style="font-size: 0.85rem; margin-bottom: var(--space-xl);">
          Setting: ${caseData.briefing.setting}
        </p>
  
        <div style="display: flex; gap: var(--space-md);">
          <button class="btn btn-primary btn-large" onclick="Game.showScreen('investigation')">
            Begin Investigation &rarr;
          </button>
          <button class="btn btn-ghost" onclick="Game.goToDashboard()">
            Back to Cases
          </button>
        </div>
      `;
  
      container.appendChild(screen);
    },
  
  
    // ========================
    // INVESTIGATION (Enhanced Document Reader)
    // ========================
    renderInvestigation(container, caseData) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      const totalEvidence = caseData.evidence.length;
      const readCount = Game.state.readEvidence.length;
  
      const evidenceIcons = {
        'internal-email': '\uD83D\uDCE7', 'email': '\uD83D\uDCE7',
        'procurement-document': '\uD83D\uDCCB', 'report': '\uD83D\uDCCB', 'audit-report': '\uD83D\uDCCB',
        'testimony': '\uD83D\uDDE3\uFE0F', 'witness-statement': '\uD83D\uDDE3\uFE0F',
        'data': '\uD83D\uDCCA', 'metrics': '\uD83D\uDCCA', 'statistics': '\uD83D\uDCCA',
        'contract': '\uD83D\uDCDD', 'policy-document': '\uD83D\uDCDD',
        'technical-document': '\u2699\uFE0F', 'client-intake': '\uD83D\uDCC1'
      };
  
      const typeLabels = {
        'internal-email': 'Internal Email', 'email': 'Email Correspondence',
        'procurement-document': 'Procurement Document', 'report': 'Report', 'audit-report': 'Audit Report',
        'testimony': 'Testimony', 'witness-statement': 'Witness Statement',
        'data': 'Data Record', 'metrics': 'Metrics', 'statistics': 'Statistical Analysis',
        'contract': 'Contract', 'policy-document': 'Policy Document',
        'technical-document': 'Technical Document', 'client-intake': 'Client Intake Form'
      };
  
      // Build evidence list HTML
      let listHTML = '';
      caseData.evidence.forEach((ev, i) => {
        const isRead = Game.isEvidenceRead(ev.id);
        const icon = evidenceIcons[ev.type] || '\uD83D\uDCC4';
        listHTML += `
          <div class="evidence-list-item ${i === 0 ? 'active' : ''} ${isRead ? 'read' : ''}" 
               id="ev-item-${ev.id}" 
               onclick="Screens._selectEvidence('${ev.id}', ${i})">
            <span class="evidence-list-icon">${icon}</span>
            <div class="evidence-list-info">
              <div class="evidence-list-title">${ev.title}</div>
              <div class="evidence-list-meta">${typeLabels[ev.type] || ev.type} &middot; ${ev.date}</div>
            </div>
          </div>
        `;
      });
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / 
            <a href="#" onclick="Game.showScreen('briefing'); return false;">${caseData.title}</a> / Investigation
          </div>
          <h1>Investigation Phase</h1>
          <p class="subtitle">Review the case file carefully — critical details may be buried in the documents</p>
        </div>
  
        ${this._renderPhaseIndicator('investigation')}
  
        <div class="progress-bar-container">
          <div class="progress-bar-label">
            <span>Documents Reviewed</span>
            <span id="evidence-count">${readCount} of ${totalEvidence}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" id="evidence-bar" style="width: ${totalEvidence > 0 ? (readCount / totalEvidence) * 100 : 0}%"></div>
          </div>
        </div>
  
        <div class="evidence-viewer">
          <div class="evidence-list">
            ${listHTML}
          </div>
          <div class="evidence-reader" id="evidence-reader">
            <div class="evidence-reader-empty">Select a document from the case file to begin reading.</div>
          </div>
        </div>
  
        <div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg);">
          <button class="btn btn-primary btn-large" id="proceed-analysis-btn" 
                  onclick="Screens._proceedToAnalysis()" ${readCount < Math.min(3, totalEvidence) ? 'disabled' : ''}>
            Proceed to Legal Analysis &rarr;
          </button>
          <button class="btn btn-ghost" onclick="Game.showScreen('briefing')">
            &larr; Back to Briefing
          </button>
        </div>
      `;
  
      container.appendChild(screen);
  
      // Auto-open first evidence
      if (caseData.evidence.length > 0) {
        this._selectEvidence(caseData.evidence[0].id, 0);
      }
    },
  
    _selectEvidence(evidenceId, index) {
      const caseData = Game.state.currentCase;
      const ev = caseData.evidence.find(e => e.id === evidenceId);
      if (!ev) return;
  
      const typeLabels = {
        'internal-email': 'Internal Email', 'email': 'Email Correspondence',
        'procurement-document': 'Procurement Document', 'report': 'Report', 'audit-report': 'Audit Report',
        'testimony': 'Testimony', 'witness-statement': 'Witness Statement',
        'data': 'Data Record', 'metrics': 'Metrics', 'statistics': 'Statistical Analysis',
        'contract': 'Contract', 'policy-document': 'Policy Document',
        'technical-document': 'Technical Document', 'client-intake': 'Client Intake Form'
      };
  
      // Mark as read
      Game.markEvidenceRead(evidenceId);
      Game.collectEvidence(evidenceId);
  
      // Update list item styling
      document.querySelectorAll('.evidence-list-item').forEach(item => {
        item.classList.remove('active');
      });
      const activeItem = document.getElementById(`ev-item-${evidenceId}`);
      if (activeItem) {
        activeItem.classList.add('active', 'read');
      }
  
      // Update progress
      const total = caseData.evidence.length;
      const readCount = Game.state.readEvidence.length;
      const countEl = document.getElementById('evidence-count');
      const barEl = document.getElementById('evidence-bar');
      if (countEl) countEl.textContent = `${readCount} of ${total}`;
      if (barEl) barEl.style.width = `${(readCount / total) * 100}%`;
  
      // Enable proceed button
      const btn = document.getElementById('proceed-analysis-btn');
      if (btn && readCount >= Math.min(3, total)) {
        btn.disabled = false;
      }
  
      // Render document in reader
      const reader = document.getElementById('evidence-reader');
      reader.innerHTML = `
        <div class="evidence-reader-header">
          <div class="evidence-reader-type">${typeLabels[ev.type] || ev.type}</div>
          <div class="evidence-reader-title">${ev.title}</div>
          <div class="evidence-reader-date">${ev.date}</div>
        </div>
        <div class="evidence-reader-body">
          ${ev.content}
        </div>
      `;
  
      reader.scrollTop = 0;
    },
  
    _proceedToAnalysis() {
      const caseData = Game.state.currentCase;
      const total = caseData.evidence.length;
      const readCount = Game.state.readEvidence.length;
  
      if (readCount < total) {
        if (!confirm(`You have reviewed ${readCount} of ${total} documents. Unread evidence may contain critical details. Continue anyway?`)) {
          return;
        }
      }
  
      Game.showScreen('analysis');
    },
  
  
    // ========================
    // ANALYSIS (Write Before You Choose)
    // ========================
    renderAnalysis(container, caseData) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Analysis
          </div>
          <h1>Legal Analysis</h1>
          <p class="subtitle">Identify the applicable legal framework and provision</p>
        </div>
  
        ${this._renderPhaseIndicator('analysis')}
  
        <div id="analysis-content"></div>
      `;
  
      container.appendChild(screen);
  
      if (caseData.analysis.frameworkQuestion) {
        this._renderWriteGate_Framework(caseData);
      } else {
        document.getElementById('analysis-content').innerHTML = `
          <p class="text-muted">Analysis content will be available when case content is complete.</p>
          <button class="btn btn-primary btn-large mt-xl" onclick="Game.showScreen('courtroom')">
            Proceed to Courtroom &rarr;
          </button>
        `;
      }
    },
  
    // --- Framework Write Gate ---
    _renderWriteGate_Framework(caseData) {
      const content = document.getElementById('analysis-content');
      const q = caseData.analysis.frameworkQuestion;
      const writePrompt = q.writePrompt || 'Based on the evidence you reviewed, which EU regulation applies to this case and why? Identify the specific framework and explain your reasoning.';
      const minWords = q.minWords || 20;
  
      content.innerHTML = `
        <div class="write-first-container" id="write-gate-framework">
          <div class="write-first-prompt">${writePrompt}</div>
          <div class="write-first-instruction">
            Write your analysis below. You must demonstrate understanding of the applicable legal framework before seeing the options. Minimum ${minWords} words.
          </div>
          <textarea class="write-first-textarea" id="wf-framework-text" 
                    placeholder="I believe the applicable framework is..." 
                    oninput="Screens._updateWordCount('wf-framework-text', 'wf-framework-count', ${minWords})"></textarea>
          <div id="wf-framework-hint" class="write-first-hint"></div>
          <div class="write-first-footer">
            <span class="write-first-charcount" id="wf-framework-count">0 words</span>
            <button class="btn btn-primary" id="wf-framework-btn" onclick="Screens._submitWriteGate('framework')" disabled>
              Submit My Analysis
            </button>
          </div>
        </div>
  
        <div id="framework-options-container" style="display: none;">
          <h3 style="margin-bottom: var(--space-md); color: var(--text-primary);">${q.prompt}</h3>
          <div class="options-grid" id="framework-options"></div>
          <div id="framework-feedback" style="display: none;"></div>
        </div>
  
        <div id="article-section" style="display: none;"></div>
      `;
    },
  
    _updateWordCount(textareaId, countId, minWords) {
      const textarea = document.getElementById(textareaId);
      const countEl = document.getElementById(countId);
      const btnId = textareaId.replace('-text', '-btn');
      const btn = document.getElementById(btnId);
      
      const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
      countEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
  
      if (words >= minWords) {
        countEl.classList.add('sufficient');
        if (btn) btn.disabled = false;
      } else {
        countEl.classList.remove('sufficient');
        if (btn) btn.disabled = true;
      }
    },
  
    _submitWriteGate(phase) {
      const caseData = Game.state.currentCase;
      let gateId, text, requiredConcepts, textareaId, hintId;
  
      if (phase === 'framework') {
        textareaId = 'wf-framework-text';
        hintId = 'wf-framework-hint';
        gateId = 'gate_analysis_framework';
        text = document.getElementById(textareaId).value;
        requiredConcepts = caseData.analysis.frameworkQuestion.requiredConcepts || [];
        Game.recordWrittenAnswer('analysis_framework', text);
      } else if (phase === 'article') {
        textareaId = 'wf-article-text';
        hintId = 'wf-article-hint';
        gateId = 'gate_analysis_article';
        text = document.getElementById(textareaId).value;
        requiredConcepts = caseData.analysis.articleQuestion.requiredConcepts || [];
        Game.recordWrittenAnswer('analysis_article', text);
      } else if (phase.startsWith('courtroom_')) {
        const idx = phase.split('_')[1];
        textareaId = `wf-court-${idx}-text`;
        hintId = `wf-court-${idx}-hint`;
        gateId = `gate_courtroom_${idx}`;
        text = document.getElementById(textareaId).value;
        const arg = caseData.courtroom.arguments[parseInt(idx)];
        requiredConcepts = arg.requiredConcepts || [];
        Game.recordWrittenAnswer(`courtroom_${idx}`, text);
      }
  
      const attempt = Game.incrementKeywordAttempts(gateId);
      const check = Game.checkKeywords(text, requiredConcepts);
      const hintEl = document.getElementById(hintId);
  
      // After 3 attempts, let them through regardless
      if (check.allFound || attempt >= 3) {
        // Hide write gate, show options
        if (phase === 'framework') {
          document.getElementById('write-gate-framework').style.display = 'none';
          document.getElementById('framework-options-container').style.display = 'block';
          this._populateFrameworkOptions(caseData);
        } else if (phase === 'article') {
          document.getElementById('write-gate-article').style.display = 'none';
          document.getElementById('article-options-container').style.display = 'block';
          this._populateArticleOptions(caseData);
        } else if (phase.startsWith('courtroom_')) {
          const idx = phase.split('_')[1];
          document.getElementById(`write-gate-court-${idx}`).style.display = 'none';
          document.getElementById(`court-options-${idx}`).style.display = 'block';
        }
  
        if (attempt >= 3 && !check.allFound) {
          hintEl.className = 'write-first-hint visible strong-hint';
          hintEl.innerHTML = '<strong>Moving forward.</strong> Review the options below — they may help clarify the legal concepts.';
        }
      } else {
        // Show progressive hints for missing concepts
        const missing = check.results.filter(r => !r.found);
        let hintHTML = '';
  
        if (attempt === 1) {
          hintHTML = '<strong>Not quite there yet.</strong> Your analysis is missing some key legal concepts:<br><br>';
          missing.forEach(m => {
            const hint = m.hints[0] || `Consider: what does "${m.name}" refer to in this context?`;
            hintHTML += `\u2022 ${hint}<br>`;
          });
          hintHTML += '<br>Revise your answer and try again.';
        } else {
          hintHTML = '<strong>Almost there — here are stronger hints:</strong><br><br>';
          missing.forEach(m => {
            const hint = m.hints[1] || m.hints[0] || `You need to reference ${m.name}.`;
            hintHTML += `\u2022 ${hint}<br>`;
          });
          hintHTML += '<br>One more attempt and you can proceed regardless.';
        }
  
        hintEl.className = `write-first-hint visible ${attempt >= 2 ? 'strong-hint' : ''}`;
        hintEl.innerHTML = hintHTML;
  
        // Shake the button briefly
        const btn = document.getElementById(textareaId.replace('-text', '-btn'));
        if (btn) {
          btn.style.transform = 'translateX(-5px)';
          setTimeout(() => btn.style.transform = 'translateX(5px)', 100);
          setTimeout(() => btn.style.transform = '', 200);
        }
      }
    },
  
    _populateFrameworkOptions(caseData) {
      const q = caseData.analysis.frameworkQuestion;
      const grid = document.getElementById('framework-options');
      grid.innerHTML = '';
  
      q.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `<div class="option-label">${opt.label}</div>`;
        card.onclick = () => this._selectFramework(opt, q.correct, caseData);
        grid.appendChild(card);
      });
    },
  
    _selectFramework(chosen, correctId, caseData) {
      const isCorrect = chosen.id === correctId;
      Game.recordAnalysisAnswer('framework', chosen.id, isCorrect);
  
      document.querySelectorAll('#framework-options .option-card').forEach(card => {
        card.classList.add('disabled');
        card.onclick = null;
        if (card.querySelector('.option-label').textContent === chosen.label) {
          card.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
      });
  
      const fb = document.getElementById('framework-feedback');
      fb.style.display = 'block';
      fb.innerHTML = `
        <div class="feedback-box ${isCorrect ? 'success' : 'error'}">
          <div class="feedback-title">${isCorrect ? 'Correct' : 'Incorrect'}</div>
          <div class="feedback-text">${chosen.feedback}</div>
        </div>
      `;
  
      setTimeout(() => {
        if (caseData.analysis.articleQuestion) {
          this._renderWriteGate_Article(caseData);
        }
      }, 800);
    },
  
    // --- Article Write Gate ---
    _renderWriteGate_Article(caseData) {
      const section = document.getElementById('article-section');
      const q = caseData.analysis.articleQuestion;
      const writePrompt = q.writePrompt || 'Now identify the specific article or provision that applies. Explain which part of the regulation is violated and why.';
      const minWords = q.minWords || 15;
      section.style.display = 'block';
  
      section.innerHTML = `
        <div class="divider"></div>
  
        <div class="write-first-container" id="write-gate-article">
          <div class="write-first-prompt">${writePrompt}</div>
          <div class="write-first-instruction">
            Identify the specific provision. Minimum ${minWords} words.
          </div>
          <textarea class="write-first-textarea" id="wf-article-text" 
                    placeholder="The specific provision that applies is..." 
                    oninput="Screens._updateWordCount('wf-article-text', 'wf-article-count', ${minWords})"></textarea>
          <div id="wf-article-hint" class="write-first-hint"></div>
          <div class="write-first-footer">
            <span class="write-first-charcount" id="wf-article-count">0 words</span>
            <button class="btn btn-primary" id="wf-article-btn" onclick="Screens._submitWriteGate('article')" disabled>
              Submit My Analysis
            </button>
          </div>
        </div>
  
        <div id="article-options-container" style="display: none;">
          <h3 style="margin-bottom: var(--space-md); color: var(--text-primary);">${q.prompt}</h3>
          <div class="options-grid" id="article-options"></div>
          <div id="article-feedback" style="display: none;"></div>
          <button class="btn btn-primary btn-large mt-xl" id="proceed-courtroom-btn" style="display: none;" 
                  onclick="Game.showScreen('courtroom')">
            Proceed to Courtroom &rarr;
          </button>
        </div>
      `;
  
      section.scrollIntoView({ behavior: 'smooth' });
    },
  
    _populateArticleOptions(caseData) {
      const q = caseData.analysis.articleQuestion;
      const grid = document.getElementById('article-options');
      grid.innerHTML = '';
  
      q.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `<div class="option-label">${opt.label}</div>`;
        card.onclick = () => this._selectArticle(opt, q.correct);
        grid.appendChild(card);
      });
    },
  
    _selectArticle(chosen, correctId) {
      const isCorrect = chosen.id === correctId;
      Game.recordAnalysisAnswer('article', chosen.id, isCorrect);
  
      document.querySelectorAll('#article-options .option-card').forEach(card => {
        card.classList.add('disabled');
        card.onclick = null;
        if (card.querySelector('.option-label').textContent === chosen.label) {
          card.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
      });
  
      const fb = document.getElementById('article-feedback');
      fb.style.display = 'block';
      fb.innerHTML = `
        <div class="feedback-box ${isCorrect ? 'success' : 'error'}">
          <div class="feedback-title">${isCorrect ? 'Correct' : 'Incorrect'}</div>
          <div class="feedback-text">${chosen.feedback}</div>
        </div>
      `;
  
      document.getElementById('proceed-courtroom-btn').style.display = 'inline-flex';
    },
  
  
    // ========================
    // COURTROOM (Write Before You Choose)
    // ========================
    renderCourtroom(container, caseData) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Courtroom
          </div>
          <h1>Courtroom Phase</h1>
          <p class="subtitle">Present your arguments before the court</p>
        </div>
  
        ${this._renderPhaseIndicator('courtroom')}
  
        <div class="dialogue-container" id="courtroom-dialogue"></div>
      `;
  
      container.appendChild(screen);
  
      if (caseData.courtroom.arguments.length > 0) {
        this._currentArgumentIndex = 0;
        this._renderCourtArgument(caseData, 0);
      } else {
        document.getElementById('courtroom-dialogue').innerHTML = `
          <p class="text-muted">Courtroom content will be available when case content is complete.</p>
          <button class="btn btn-primary btn-large mt-xl" onclick="Game.showScreen('verdict')">
            Proceed to Verdict &rarr;
          </button>
        `;
      }
    },
  
    _currentArgumentIndex: 0,
  
    _renderCourtArgument(caseData, index) {
      const args = caseData.courtroom.arguments;
      if (index >= args.length) {
        const dialogue = document.getElementById('courtroom-dialogue');
        const endDiv = document.createElement('div');
        endDiv.className = 'text-center mt-2xl';
        endDiv.innerHTML = `
          <p class="text-muted mb-lg" style="font-style: italic;">The court will now deliberate...</p>
          <button class="btn btn-primary btn-large" onclick="Game.showScreen('verdict')">
            Hear the Verdict &rarr;
          </button>
        `;
        dialogue.appendChild(endDiv);
        return;
      }
  
      const arg = args[index];
      const dialogue = document.getElementById('courtroom-dialogue');
  
      if (index === 0) dialogue.innerHTML = '';
  
      // Progress
      const progress = document.createElement('p');
      progress.className = 'text-muted mb-lg';
      progress.style.fontSize = '0.8rem';
      progress.textContent = `Argument ${index + 1} of ${args.length}`;
      dialogue.appendChild(progress);
  
      // Judge speaks
      const judgeBubble = document.createElement('div');
      judgeBubble.className = 'dialogue-bubble judge';
      judgeBubble.innerHTML = `
        <div class="speaker-name">${caseData.courtroom.judgeName}</div>
        <div class="speaker-text">${arg.context}</div>
      `;
      dialogue.appendChild(judgeBubble);
  
      // Write-first gate for courtroom
      const writePrompt = arg.writePrompt || 'How would you respond to this question? Draft your argument before seeing the options.';
      const minWords = arg.minWords || 15;
  
      const writeGate = document.createElement('div');
      writeGate.className = 'write-first-container';
      writeGate.id = `write-gate-court-${index}`;
      writeGate.innerHTML = `
        <div class="write-first-prompt">${writePrompt}</div>
        <div class="write-first-instruction">Draft your argument. Minimum ${minWords} words.</div>
        <textarea class="write-first-textarea" id="wf-court-${index}-text" 
                  placeholder="Your Honour, I submit that..."
                  oninput="Screens._updateWordCount('wf-court-${index}-text', 'wf-court-${index}-count', ${minWords})"></textarea>
        <div id="wf-court-${index}-hint" class="write-first-hint"></div>
        <div class="write-first-footer">
          <span class="write-first-charcount" id="wf-court-${index}-count">0 words</span>
          <button class="btn btn-primary" id="wf-court-${index}-btn" onclick="Screens._submitWriteGate('courtroom_${index}')" disabled>
            Submit My Argument
          </button>
        </div>
      `;
      dialogue.appendChild(writeGate);
  
      // Hidden options (revealed after write gate passes)
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'options-grid';
      optionsDiv.id = `court-options-${index}`;
      optionsDiv.style.display = 'none';
  
      const optionsLabel = document.createElement('p');
      optionsLabel.className = 'text-muted mb-md';
      optionsLabel.style.fontSize = '0.85rem';
      optionsLabel.innerHTML = '<em>Now select the argument you want to present to the court:</em>';
      optionsDiv.appendChild(optionsLabel);
  
      arg.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `<div class="option-description">${opt.text}</div>`;
        card.onclick = () => this._selectCourtArgument(caseData, index, opt);
        optionsDiv.appendChild(card);
      });
  
      dialogue.appendChild(optionsDiv);
      window.scrollTo(0, document.body.scrollHeight);
    },
  
    _selectCourtArgument(caseData, argIndex, chosen) {
      Game.recordArgument(chosen.id, chosen.quality);
  
      // Disable options
      const optionsDiv = document.getElementById(`court-options-${argIndex}`);
      optionsDiv.querySelectorAll('.option-card').forEach(card => {
        card.classList.add('disabled');
        card.onclick = null;
      });
  
      const dialogue = document.getElementById('courtroom-dialogue');
  
      // Player bubble
      const playerBubble = document.createElement('div');
      playerBubble.className = 'dialogue-bubble player';
      playerBubble.innerHTML = `
        <div class="speaker-name">You</div>
        <div class="speaker-text">${chosen.text}</div>
      `;
      dialogue.appendChild(playerBubble);
  
      // Judge response
      const responseBubble = document.createElement('div');
      responseBubble.className = 'dialogue-bubble judge';
      responseBubble.innerHTML = `
        <div class="speaker-name">${caseData.courtroom.judgeName}</div>
        <div class="speaker-text">${chosen.judge_response}</div>
      `;
      dialogue.appendChild(responseBubble);
  
      // Reasoning feedback
      let responseClass = 'warning';
      if (chosen.quality === 'strong') responseClass = 'success';
      else if (chosen.quality === 'wrong') responseClass = 'error';
  
      const reasoning = document.createElement('div');
      reasoning.className = `feedback-box ${responseClass}`;
      reasoning.innerHTML = `
        <div class="feedback-title">Legal Reasoning</div>
        <div class="feedback-text">${chosen.legal_reasoning}</div>
      `;
      dialogue.appendChild(reasoning);
  
      // Continue button
      const continueBtn = document.createElement('button');
      continueBtn.className = 'btn btn-secondary mt-lg mb-xl';
      continueBtn.textContent = argIndex < caseData.courtroom.arguments.length - 1
        ? 'Next Argument \u2192'
        : 'Hear the Verdict \u2192';
      continueBtn.onclick = () => {
        continueBtn.remove();
        if (argIndex < caseData.courtroom.arguments.length - 1) {
          this._renderCourtArgument(caseData, argIndex + 1);
        } else {
          Game.showScreen('verdict');
        }
      };
      dialogue.appendChild(continueBtn);
  
      window.scrollTo(0, document.body.scrollHeight);
    },
  
  
    // ========================
    // VERDICT (with Written Answer Comparison)
    // ========================
    renderVerdict(container, caseData, score) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      const verdictLabels = {
        'won': 'CASE WON',
        'won_with_reservations': 'CASE WON WITH RESERVATIONS',
        'lost': 'CASE LOST',
        'dismissed': 'CASE DISMISSED'
      };
  
      const verdictClass = score.verdict.includes('won') ? 'won' : 'lost';
      const verdictText = score.verdict.includes('won')
        ? (caseData.verdict.winText || 'The court rules in your favor.')
        : (caseData.verdict.loseText || 'The court finds against your client.');
  
      // Build written answer sections
      let writtenHTML = '';
      const wa = score.writtenAnswers;
  
      if (wa.analysis_framework || wa.analysis_article) {
        writtenHTML += `
          <div class="your-answer-section">
            <h3>Your Written Analysis vs. Model Analysis</h3>
        `;
  
        if (wa.analysis_framework) {
          writtenHTML += `
            <p class="text-muted" style="font-size: 0.8rem; margin-bottom: var(--space-sm);">Framework Identification</p>
            <div class="your-answer-text">${this._escapeHTML(wa.analysis_framework)}</div>
          `;
        }
  
        if (wa.analysis_article) {
          writtenHTML += `
            <p class="text-muted" style="font-size: 0.8rem; margin-bottom: var(--space-sm);">Article Identification</p>
            <div class="your-answer-text">${this._escapeHTML(wa.analysis_article)}</div>
          `;
        }
  
        writtenHTML += `</div>`;
      }
  
      if (wa.courtroom && wa.courtroom.length > 0) {
        writtenHTML += `
          <div class="your-answer-section">
            <h3>Your Courtroom Arguments (as drafted)</h3>
        `;
  
        wa.courtroom.forEach((text, i) => {
          if (text) {
            writtenHTML += `
              <p class="text-muted" style="font-size: 0.8rem; margin-bottom: var(--space-sm);">Argument ${i + 1}</p>
              <div class="your-answer-text">${this._escapeHTML(text)}</div>
            `;
          }
        });
  
        writtenHTML += `</div>`;
      }
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Verdict
          </div>
        </div>
  
        ${this._renderPhaseIndicator('verdict')}
  
        <div class="verdict-container">
          <div class="verdict-result ${verdictClass}">
            ${verdictLabels[score.verdict]}
          </div>
          <p class="text-muted" style="max-width: 600px; margin: 0 auto var(--space-lg);">
            ${verdictText}
          </p>
          <div class="verdict-score">
            ${score.total}<span class="score-total">/100</span>
          </div>
        </div>
  
        <div class="score-breakdown">
          <div class="score-section">
            <div class="score-section-header">
              <span class="score-section-title">Evidence Collection</span>
              <span class="score-section-points">${score.evidence.earned}/${score.evidence.possible}</span>
            </div>
            <p class="score-section-detail">
              Reviewed ${score.evidence.found} of ${score.evidence.total} documents.
            </p>
          </div>
  
          <div class="score-section">
            <div class="score-section-header">
              <span class="score-section-title">Legal Analysis</span>
              <span class="score-section-points">${score.analysis.earned}/${score.analysis.possible}</span>
            </div>
            <p class="score-section-detail">
              Framework: ${score.analysis.frameworkCorrect ? '\u2713 Correct' : '\u2717 Incorrect'} &nbsp;|&nbsp;
              Article: ${score.analysis.articleCorrect ? '\u2713 Correct' : '\u2717 Incorrect'}
            </p>
          </div>
  
          <div class="score-section">
            <div class="score-section-header">
              <span class="score-section-title">Courtroom Arguments</span>
              <span class="score-section-points">${score.courtroom.earned}/${score.courtroom.possible}</span>
            </div>
            ${score.courtroom.arguments.map((a, i) => `
              <p class="score-section-detail">
                Argument ${i + 1}: 
                ${a.quality === 'strong' ? '<span class="text-success">\u2713 Strong</span>' : ''}
                ${a.quality === 'weak' ? '<span class="text-gold">~ Weak but valid</span>' : ''}
                ${a.quality === 'wrong' ? '<span class="text-error">\u2717 Wrong</span>' : ''}
                (${a.earned}/${a.possible} pts)
              </p>
            `).join('')}
          </div>
        </div>
  
        ${writtenHTML}
  
        ${caseData.verdict.modelAnswer ? `
          <div class="model-answer" id="model-answer-box">
            <div class="model-answer-header" onclick="Screens._toggleModelAnswer()">
              <h3>The Strongest Legal Analysis</h3>
              <span id="model-answer-arrow">\u25BC</span>
            </div>
            <div class="model-answer-body" id="model-answer-body" style="display: none;">
              ${caseData.verdict.modelAnswer}
            </div>
          </div>
        ` : ''}
  
        <div class="text-center mt-2xl" style="display: flex; justify-content: center; gap: var(--space-md); padding-bottom: var(--space-2xl);">
          <button class="btn btn-secondary" onclick="Game.startCase('${caseData.id}')">
            Retry Case
          </button>
          <button class="btn btn-primary" onclick="Game.goToDashboard()">
            Back to Dashboard
          </button>
        </div>
      `;
  
      container.appendChild(screen);
    },
  
    _toggleModelAnswer() {
      const body = document.getElementById('model-answer-body');
      const arrow = document.getElementById('model-answer-arrow');
      if (body.style.display === 'none') {
        body.style.display = 'block';
        arrow.textContent = '\u25B2';
      } else {
        body.style.display = 'none';
        arrow.textContent = '\u25BC';
      }
    },
  
  
    // ========================
    // TAXONOMY / SCENARIO LIBRARY
    // ========================
    renderTaxonomy(container) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      const frameworks = {};
      TAXONOMY.forEach(t => {
        if (!frameworks[t.framework]) frameworks[t.framework] = 0;
        frameworks[t.framework]++;
      });
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / Scenario Library
          </div>
          <h1>Scenario Library</h1>
          <p class="subtitle">${TAXONOMY.length} legal scenario types across 5 EU frameworks</p>
        </div>
  
        <div id="taxonomy-filters" style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-xl); flex-wrap: wrap;">
          <button class="btn btn-ghost" style="border-color: var(--accent-gold); color: var(--accent-gold);" data-filter="all" onclick="Screens._filterTaxonomy('all', this)">All (${TAXONOMY.length})</button>
          <button class="btn btn-ghost" data-filter="ai-act" onclick="Screens._filterTaxonomy('ai-act', this)">AI Act (${frameworks['ai-act'] || 0})</button>
          <button class="btn btn-ghost" data-filter="gdpr" onclick="Screens._filterTaxonomy('gdpr', this)">GDPR (${frameworks['gdpr'] || 0})</button>
          <button class="btn btn-ghost" data-filter="dsa" onclick="Screens._filterTaxonomy('dsa', this)">DSA (${frameworks['dsa'] || 0})</button>
          <button class="btn btn-ghost" data-filter="dma" onclick="Screens._filterTaxonomy('dma', this)">DMA (${frameworks['dma'] || 0})</button>
          <button class="btn btn-ghost" data-filter="data-act" onclick="Screens._filterTaxonomy('data-act', this)">Data Act (${frameworks['data-act'] || 0})</button>
        </div>
  
        <div id="taxonomy-grid" class="cases-grid"></div>
  
        <div class="text-center mt-2xl" style="padding-bottom: var(--space-2xl);">
          <button class="btn btn-secondary" onclick="Game.goToDashboard()">
            &larr; Back to Dashboard
          </button>
        </div>
      `;
  
      container.appendChild(screen);
      this._renderTaxonomyGrid('all');
    },
  
    _renderTaxonomyGrid(filter) {
      const grid = document.getElementById('taxonomy-grid');
      grid.innerHTML = '';
  
      const filtered = filter === 'all'
        ? TAXONOMY
        : TAXONOMY.filter(t => t.framework === filter);
  
      filtered.forEach(t => {
        let tagClass = 'tag-ai-act';
        if (t.framework === 'gdpr') tagClass = 'tag-gdpr';
        else if (t.framework === 'dsa') tagClass = 'tag-dsa';
        else if (t.framework === 'dma') tagClass = 'tag-dma';
        else if (t.framework === 'data-act') tagClass = 'tag-data-act';
  
        const card = document.createElement('div');
        card.className = 'case-card';
        card.style.cursor = t.playable ? 'pointer' : 'default';
        if (t.playable) card.onclick = () => Game.startCase(t.caseId);
  
        card.innerHTML = `
          <div class="case-number" style="display: flex; justify-content: space-between; align-items: center;">
            <span>#${t.id}</span>
            ${t.playable
              ? '<span class="badge badge-completed">PLAYABLE</span>'
              : '<span class="badge badge-difficulty">COMING SOON</span>'}
          </div>
          <div class="case-title" style="font-size: 1rem;">${t.title}</div>
          <div class="case-meta mt-sm">
            <span class="tag ${tagClass}" style="font-size: 0.65rem;">${t.articles}</span>
          </div>
        `;
  
        grid.appendChild(card);
      });
    },
  
    _filterTaxonomy(filter, btn) {
      document.querySelectorAll('#taxonomy-filters .btn').forEach(b => {
        b.style.borderColor = '';
        b.style.color = '';
      });
      btn.style.borderColor = 'var(--accent-gold)';
      btn.style.color = 'var(--accent-gold)';
      this._renderTaxonomyGrid(filter);
    },
  
  
    // ========================
    // HELPERS
    // ========================
    _renderPhaseIndicator(currentPhase) {
      const phases = [
        { id: 'briefing', label: 'Briefing' },
        { id: 'investigation', label: 'Investigation' },
        { id: 'analysis', label: 'Analysis' },
        { id: 'courtroom', label: 'Courtroom' },
        { id: 'verdict', label: 'Verdict' }
      ];
  
      const currentIndex = phases.findIndex(p => p.id === currentPhase);
  
      return `
        <div class="phase-indicator">
          ${phases.map((phase, i) => `
            <div class="phase-step ${i < currentIndex ? 'completed' : ''} ${i === currentIndex ? 'active' : ''}">
              <span class="phase-dot"></span>
              <span>${phase.label}</span>
            </div>
            ${i < phases.length - 1 ? '<div class="phase-connector"></div>' : ''}
          `).join('')}
        </div>
      `;
    },
  
    _escapeHTML(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };
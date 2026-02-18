/* ============================================
   DIGITAL RIGHTS COURTROOM — Screen Renderers
   Each function renders one screen into the #app container
   ============================================ */

   const Screens = {

    // ========================
    // DASHBOARD
    // ========================
    renderDashboard(container) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      // Count stats
      const completedCount = Object.keys(Game.state.completedCases).length;
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
              <span class="stat-number">76</span>
              <span class="stat-label">Scenario Types</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">4</span>
              <span class="stat-label">EU Frameworks</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${completedCount}/5</span>
              <span class="stat-label">Cases Completed</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${frameworksCovered}/4</span>
              <span class="stat-label">Frameworks Explored</span>
            </div>
          </div>
        </div>
  
        <div class="divider"></div>
  
        <p class="cases-section-title">Select a Case</p>
        <div class="cases-grid" id="cases-grid"></div>
  
        <div class="divider"></div>
  
        <div class="dashboard-footer">
          <button class="btn btn-ghost" onclick="Game.showScreen('taxonomy')">
            Scenario Library (76 Types)
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
  
      // Render case cards
      const grid = document.getElementById('cases-grid');
      CASES.forEach(caseData => {
        const completion = Game.state.completedCases[caseData.id];
        const card = document.createElement('div');
        card.className = 'case-card' + (completion ? ' completed' : '');
        card.onclick = () => Game.startCase(caseData.id);
  
        // Framework tag class
        let tagClass = 'tag-ai-act';
        if (caseData.framework === 'gdpr') tagClass = 'tag-gdpr';
        else if (caseData.framework === 'dsa') tagClass = 'tag-dsa';
        else if (caseData.framework === 'dma') tagClass = 'tag-dma';
        else if (caseData.framework === 'cross-framework') tagClass = 'tag-gdpr'; // Uses green for cross
  
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
  
        <div style="display: flex; gap: var(--space-lg); margin-bottom: var(--space-xl);">
          <div class="feedback-box" style="flex: 1;">
            <div class="feedback-title" style="color: var(--accent-blue);">Your Client</div>
            <div class="feedback-text">
              <strong>${caseData.briefing.client.name}</strong><br>
              ${caseData.briefing.client.role}
            </div>
          </div>
          <div class="feedback-box" style="flex: 1;">
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
    // INVESTIGATION
    // ========================
    renderInvestigation(container, caseData) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      const totalEvidence = caseData.evidence.length;
      const collectedCount = Game.state.collectedEvidence.length;
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / 
            <a href="#" onclick="Game.showScreen('briefing'); return false;">${caseData.title}</a> / Investigation
          </div>
          <h1>Investigation Phase</h1>
          <p class="subtitle">Examine the evidence and build your brief</p>
        </div>
  
        ${this._renderPhaseIndicator('investigation')}
  
        <div class="progress-bar-container" id="evidence-progress">
          <div class="progress-bar-label">
            <span>Evidence Collected</span>
            <span id="evidence-count">${collectedCount} of ${totalEvidence}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" id="evidence-bar" style="width: ${totalEvidence > 0 ? (collectedCount / totalEvidence) * 100 : 0}%"></div>
          </div>
        </div>
  
        <div class="evidence-grid" id="evidence-grid"></div>
  
        <div style="display: flex; gap: var(--space-md); margin-top: var(--space-xl);">
          <button class="btn btn-primary btn-large" id="proceed-analysis-btn" 
                  onclick="Screens._proceedToAnalysis()" ${collectedCount < 3 ? 'disabled' : ''}>
            Proceed to Legal Analysis &rarr;
          </button>
          <button class="btn btn-ghost" onclick="Game.showScreen('briefing')">
            &larr; Back to Briefing
          </button>
        </div>
      `;
  
      container.appendChild(screen);
  
      // Render evidence cards
      const grid = document.getElementById('evidence-grid');
      const evidenceIcons = {
        'internal-email': '\uD83D\uDCE7',
        'email': '\uD83D\uDCE7',
        'procurement-document': '\uD83D\uDCCB',
        'report': '\uD83D\uDCCB',
        'audit-report': '\uD83D\uDCCB',
        'testimony': '\uD83D\uDDE3\uFE0F',
        'witness-statement': '\uD83D\uDDE3\uFE0F',
        'data': '\uD83D\uDCCA',
        'metrics': '\uD83D\uDCCA',
        'statistics': '\uD83D\uDCCA',
        'contract': '\uD83D\uDCDD',
        'policy-document': '\uD83D\uDCDD',
        'technical-document': '\u2699\uFE0F'
      };
  
      caseData.evidence.forEach(ev => {
        const isCollected = Game.isEvidenceCollected(ev.id);
        const card = document.createElement('div');
        card.className = 'evidence-card' + (isCollected ? ' collected expanded' : '');
        card.id = `evidence-${ev.id}`;
  
        const icon = evidenceIcons[ev.type] || '\uD83D\uDCC4';
  
        card.innerHTML = `
          <div class="evidence-card-header" onclick="Screens._toggleEvidence('${ev.id}')">
            <span class="evidence-icon">${icon}</span>
            <div class="evidence-info">
              <div class="evidence-title">${ev.title}</div>
              <div class="evidence-date">${ev.date}</div>
            </div>
          </div>
          <div class="evidence-card-body">
            <div class="evidence-content">${ev.content}</div>
          </div>
        `;
  
        grid.appendChild(card);
      });
    },
  
    _toggleEvidence(evidenceId) {
      const card = document.getElementById(`evidence-${evidenceId}`);
      if (!card) return;
  
      const wasExpanded = card.classList.contains('expanded');
      card.classList.toggle('expanded');
  
      if (!wasExpanded) {
        // Mark as collected
        Game.collectEvidence(evidenceId);
        card.classList.add('collected');
  
        // Update progress bar
        const caseData = Game.state.currentCase;
        const total = caseData.evidence.length;
        const collected = Game.state.collectedEvidence.length;
  
        document.getElementById('evidence-count').textContent = `${collected} of ${total}`;
        document.getElementById('evidence-bar').style.width = `${(collected / total) * 100}%`;
  
        // Enable proceed button if enough evidence collected
        const btn = document.getElementById('proceed-analysis-btn');
        if (collected >= 3) {
          btn.disabled = false;
        }
      }
    },
  
    _proceedToAnalysis() {
      const caseData = Game.state.currentCase;
      const total = caseData.evidence.length;
      const collected = Game.state.collectedEvidence.length;
  
      if (collected < total) {
        if (!confirm(`You have reviewed ${collected} of ${total} evidence items. Proceeding without all evidence may weaken your case. Continue anyway?`)) {
          return;
        }
      }
  
      Game.showScreen('analysis');
    },
  
  
    // ========================
    // ANALYSIS
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
  
        <div id="analysis-content">
          <p class="text-muted">Analysis content will be available when case content is complete.</p>
          <button class="btn btn-primary btn-large mt-xl" onclick="Game.showScreen('courtroom')">
            Proceed to Courtroom &rarr;
          </button>
        </div>
      `;
  
      container.appendChild(screen);
  
      // If case has analysis data, render the questions
      if (caseData.analysis.frameworkQuestion) {
        this._renderFrameworkQuestion(caseData);
      }
    },
  
    _renderFrameworkQuestion(caseData) {
      const content = document.getElementById('analysis-content');
      const q = caseData.analysis.frameworkQuestion;
  
      content.innerHTML = `
        <h3 style="margin-bottom: var(--space-md); color: var(--text-primary);">${q.prompt}</h3>
        <div class="options-grid" id="framework-options"></div>
        <div id="framework-feedback" style="display: none;"></div>
        <div id="article-section" style="display: none;"></div>
      `;
  
      const grid = document.getElementById('framework-options');
      q.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `
          <div class="option-label">${opt.label}</div>
        `;
        card.onclick = () => this._selectFramework(opt, q.correct, caseData);
        grid.appendChild(card);
      });
    },
  
    _selectFramework(chosen, correctId, caseData) {
      const isCorrect = chosen.id === correctId;
      Game.recordAnalysisAnswer('framework', chosen.id, isCorrect);
  
      // Disable all options
      document.querySelectorAll('#framework-options .option-card').forEach(card => {
        card.classList.add('disabled');
        card.onclick = null;
        if (card.querySelector('.option-label').textContent === chosen.label) {
          card.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
      });
  
      // Show feedback
      const fb = document.getElementById('framework-feedback');
      fb.style.display = 'block';
      fb.innerHTML = `
        <div class="feedback-box ${isCorrect ? 'success' : 'error'}">
          <div class="feedback-title">${isCorrect ? 'Correct' : 'Incorrect'}</div>
          <div class="feedback-text">${chosen.feedback}</div>
        </div>
      `;
  
      // Show article question after a delay
      setTimeout(() => {
        if (caseData.analysis.articleQuestion) {
          this._renderArticleQuestion(caseData);
        }
      }, 800);
    },
  
    _renderArticleQuestion(caseData) {
      const section = document.getElementById('article-section');
      const q = caseData.analysis.articleQuestion;
      section.style.display = 'block';
  
      section.innerHTML = `
        <div class="divider"></div>
        <h3 style="margin-bottom: var(--space-md); color: var(--text-primary);">${q.prompt}</h3>
        <div class="options-grid" id="article-options"></div>
        <div id="article-feedback" style="display: none;"></div>
        <button class="btn btn-primary btn-large mt-xl" id="proceed-courtroom-btn" style="display: none;" 
                onclick="Game.showScreen('courtroom')">
          Proceed to Courtroom &rarr;
        </button>
      `;
  
      const grid = document.getElementById('article-options');
      q.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `
          <div class="option-label">${opt.label}</div>
        `;
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
    // COURTROOM
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
  
        <div class="dialogue-container" id="courtroom-dialogue">
          <p class="text-muted">Courtroom content will be available when case content is complete.</p>
          <button class="btn btn-primary btn-large mt-xl" onclick="Game.showScreen('verdict')">
            Proceed to Verdict &rarr;
          </button>
        </div>
      `;
  
      container.appendChild(screen);
  
      // If case has courtroom data, start the argument sequence
      if (caseData.courtroom.arguments.length > 0) {
        this._currentArgumentIndex = 0;
        this._renderArgument(caseData, 0);
      }
    },
  
    _currentArgumentIndex: 0,
  
    _renderArgument(caseData, index) {
      const args = caseData.courtroom.arguments;
      if (index >= args.length) {
        // All arguments done — show proceed button
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
  
      // Clear placeholder on first argument
      if (index === 0) dialogue.innerHTML = '';
  
      // Progress indicator
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
  
      // Player options
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'options-grid';
      optionsDiv.id = `arg-options-${index}`;
  
      arg.options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `<div class="option-description">${opt.text}</div>`;
        card.onclick = () => this._selectArgument(caseData, index, opt);
        optionsDiv.appendChild(card);
      });
  
      dialogue.appendChild(optionsDiv);
      window.scrollTo(0, document.body.scrollHeight);
    },
  
    _selectArgument(caseData, argIndex, chosen) {
      Game.recordArgument(chosen.id, chosen.quality);
  
      // Disable options
      const optionsDiv = document.getElementById(`arg-options-${argIndex}`);
      optionsDiv.querySelectorAll('.option-card').forEach(card => {
        card.classList.add('disabled');
        card.onclick = null;
      });
  
      const dialogue = document.getElementById('courtroom-dialogue');
  
      // Player's choice as bubble
      const playerBubble = document.createElement('div');
      playerBubble.className = 'dialogue-bubble player';
      playerBubble.innerHTML = `
        <div class="speaker-name">You</div>
        <div class="speaker-text">${chosen.text}</div>
      `;
      dialogue.appendChild(playerBubble);
  
      // Judge response
      let responseClass = 'warning';
      if (chosen.quality === 'strong') responseClass = 'success';
      else if (chosen.quality === 'wrong') responseClass = 'error';
  
      const responseBubble = document.createElement('div');
      responseBubble.className = 'dialogue-bubble judge';
      responseBubble.innerHTML = `
        <div class="speaker-name">${caseData.courtroom.judgeName}</div>
        <div class="speaker-text">${chosen.judge_response}</div>
      `;
      dialogue.appendChild(responseBubble);
  
      // Legal reasoning feedback
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
          this._renderArgument(caseData, argIndex + 1);
        } else {
          Game.showScreen('verdict');
        }
      };
      dialogue.appendChild(continueBtn);
  
      window.scrollTo(0, document.body.scrollHeight);
    },
  
  
    // ========================
    // VERDICT
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
              Reviewed ${score.evidence.found} of ${score.evidence.total} evidence items.
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
  
          ${caseData.verdict.modelAnswer ? `
            <div class="model-answer">
              <div class="model-answer-header" onclick="this.parentElement.classList.toggle('expanded'); this.querySelector('span').textContent = this.parentElement.classList.contains('expanded') ? '\u25B2' : '\u25BC';">
                <h3>The Strongest Legal Analysis</h3>
                <span>\u25BC</span>
              </div>
              <div class="model-answer-body" style="display: none;">
                ${caseData.verdict.modelAnswer}
              </div>
            </div>
          ` : ''}
        </div>
  
        <div class="text-center mt-2xl" style="display: flex; justify-content: center; gap: var(--space-md);">
          <button class="btn btn-secondary" onclick="Game.startCase('${caseData.id}')">
            Retry Case
          </button>
          <button class="btn btn-primary" onclick="Game.goToDashboard()">
            Back to Dashboard
          </button>
        </div>
      `;
  
      container.appendChild(screen);
  
      // Make model answer toggle work
      const modelAnswer = screen.querySelector('.model-answer');
      if (modelAnswer) {
        modelAnswer.querySelector('.model-answer-header').addEventListener('click', () => {
          const body = modelAnswer.querySelector('.model-answer-body');
          body.style.display = body.style.display === 'none' ? 'block' : 'none';
        });
      }
    },
  
  
    // ========================
    // TAXONOMY / SCENARIO LIBRARY
    // ========================
    renderTaxonomy(container) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      // Group by framework
      const frameworks = {
        'ai-act': { label: 'EU AI Act', items: [] },
        'gdpr': { label: 'GDPR', items: [] },
        'dsa': { label: 'Digital Services Act', items: [] },
        'dma': { label: 'Digital Markets Act', items: [] }
      };
  
      TAXONOMY.forEach(t => {
        if (frameworks[t.framework]) {
          frameworks[t.framework].items.push(t);
        }
      });
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / Scenario Library
          </div>
          <h1>Scenario Library</h1>
          <p class="subtitle">76 legal scenario types across 4 EU frameworks</p>
        </div>
  
        <div id="taxonomy-filters" style="display: flex; gap: var(--space-sm); margin-bottom: var(--space-xl); flex-wrap: wrap;">
          <button class="btn btn-ghost active-filter" data-filter="all" onclick="Screens._filterTaxonomy('all', this)">All (76)</button>
          <button class="btn btn-ghost" data-filter="ai-act" onclick="Screens._filterTaxonomy('ai-act', this)">AI Act (34)</button>
          <button class="btn btn-ghost" data-filter="gdpr" onclick="Screens._filterTaxonomy('gdpr', this)">GDPR (14)</button>
          <button class="btn btn-ghost" data-filter="dsa" onclick="Screens._filterTaxonomy('dsa', this)">DSA (16)</button>
          <button class="btn btn-ghost" data-filter="dma" onclick="Screens._filterTaxonomy('dma', this)">DMA (12)</button>
        </div>
  
        <div id="taxonomy-grid"></div>
  
        <div class="text-center mt-2xl">
          <button class="btn btn-secondary" onclick="Game.goToDashboard()">
            &larr; Back to Dashboard
          </button>
        </div>
      `;
  
      container.appendChild(screen);
  
      // Render all taxonomy items
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
  
        const card = document.createElement('div');
        card.className = 'case-card';
        card.style.cursor = t.playable ? 'pointer' : 'default';
        if (t.playable) {
          card.onclick = () => Game.startCase(t.caseId);
        }
  
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
  
      // Use cases-grid styling
      grid.className = 'cases-grid';
    },
  
    _filterTaxonomy(filter, btn) {
      // Update active filter button
      document.querySelectorAll('#taxonomy-filters .btn').forEach(b => {
        b.classList.remove('active-filter');
        b.style.borderColor = '';
        b.style.color = '';
      });
      btn.classList.add('active-filter');
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
    }
  };
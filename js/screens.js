/* ============================================
   DIGITAL RIGHTS COURTROOM — Screen Renderers v4
   4-option courtroom + evidence citation challenge
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
  
      const classLabel = Game.state.className ? ` \u2022 ${Game.state.className}` : '';
      const studentLabel = Game.state.studentName
        ? `<div class="student-badge">\uD83C\uDF93 ${Game.state.studentName}${classLabel}</div>`
        : '';

      screen.innerHTML = `
        <div class="dashboard-hero">
          <img src="img/uni-vienna-logo.png" alt="University of Vienna" class="dashboard-uni-logo" onerror="this.style.display='none'">
          ${studentLabel}
          <h1>Digital Rights Courtroom</h1>
          <p class="tagline">A Litigation Simulator for EU Digital Law</p>
          <p class="uni-credit">University of Vienna \u2022 Department of Innovation and Digitalisation in Law</p>
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
          <button class="btn btn-ghost" onclick="Game.showScreen('leaderboard')">
            \uD83C\uDFC6 Leaderboard
          </button>
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
  
      // Render case cards
      const grid = screen.querySelector('#cases-grid');
      CASES.forEach(c => {
        const completed = Game.state.completedCases[c.id];
        const isPlayable = c.evidence.length > 0;
  
        const frameworkClass = {
          'ai-act': 'tag-ai-act',
          'gdpr': 'tag-gdpr',
          'dsa': 'tag-dsa',
          'dma': 'tag-dma',
          'data-act': 'tag-data-act',
          'cross-framework': 'tag-cross-framework'
        }[c.framework] || '';
  
        const card = document.createElement('div');
        card.className = `case-card ${!isPlayable ? 'case-card-locked' : ''} ${completed ? 'case-card-completed' : ''}`;
  
        card.innerHTML = `
          <div class="case-card-header">
            <span class="case-number">Case ${String(c.number).padStart(2, '0')}</span>
            <span class="framework-tag ${frameworkClass}">${c.frameworkLabel}</span>
          </div>
          <h3 class="case-title">${c.title}</h3>
          <p class="case-subtitle">${c.subtitle}</p>
          <div class="case-meta">
            <span class="case-difficulty">${c.difficulty}</span>
            <span class="case-time">${c.estimatedMinutes} min</span>
            ${c.primaryArticles ? `<span class="case-articles">${c.primaryArticles.join(', ')}</span>` : ''}
          </div>
          ${completed ? `<div class="case-score-badge">${completed.score}/100</div>` : ''}
          ${!isPlayable ? '<div class="case-locked-badge">Coming Soon</div>' : ''}
        `;
  
        if (isPlayable) {
          card.onclick = () => Game.startCase(c.id);
        }
  
        grid.appendChild(card);
      });
    },
  
  
    // ========================
    // BRIEFING
    // ========================
    renderBriefing(container, caseData) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      const frameworkClass = {
        'ai-act': 'tag-ai-act',
        'gdpr': 'tag-gdpr',
        'dsa': 'tag-dsa',
        'dma': 'tag-dma',
        'data-act': 'tag-data-act',
        'cross-framework': 'tag-cross-framework'
      }[caseData.framework] || '';
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / Case ${String(caseData.number).padStart(2, '0')}: ${caseData.title}
          </div>
          <span class="framework-tag ${frameworkClass}">${caseData.frameworkLabel}</span>
          <div class="case-id-label">Case ${String(caseData.number).padStart(2, '0')}</div>
          <h1>${caseData.title}</h1>
          <p class="subtitle">${caseData.subtitle}</p>
        </div>
  
        ${this._renderPhaseIndicator('briefing')}
  
        <div class="briefing-card">
          <div class="briefing-narrative">${caseData.briefing.narrative}</div>
  
          <div class="briefing-parties">
            <div class="party-card">
              <div class="party-role">Your Client</div>
              <div class="party-name">${caseData.briefing.client.name}</div>
              <div class="party-description">${caseData.briefing.client.role}</div>
            </div>
            <div class="vs-divider">v.</div>
            <div class="party-card">
              <div class="party-role">Respondent</div>
              <div class="party-name">${caseData.briefing.respondent.name}</div>
              <div class="party-description">${caseData.briefing.respondent.type}</div>
            </div>
          </div>
  
          <div class="briefing-setting">
            <strong>Setting:</strong> ${caseData.briefing.setting}
          </div>
        </div>
  
        <div class="text-center mt-xl">
          <button class="btn btn-primary btn-large" onclick="Game.showScreen('investigation')">
            Review the Evidence &rarr;
          </button>
        </div>
      `;
  
      container.appendChild(screen);
    },
  
  
    // ========================
    // INVESTIGATION (Document Reader)
    // ========================
    renderInvestigation(container, caseData) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      const typeLabels = {
        'client-intake': '\u{1F4C1} Client Intake Form',
        'procurement-document': '\u{1F4CB} Official Document',
        'internal-email': '\u{1F4E7} Internal Communication',
        'email': '\u{1F4E7} Correspondence',
        'witness-statement': '\u{1F5E3}\uFE0F Witness Statement',
        'statistics': '\u{1F4CA} Statistical Data',
        'technical-document': '\u2699\uFE0F Technical Document',
        'data': '\u{1F4CA} Data Record',
        'policy-document': '\u{1F4CB} Policy Document'
      };
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Investigation
          </div>
          <h1>Evidence Review</h1>
          <p class="subtitle">Review the case documents carefully. Key details will be critical in cross-examination and courtroom arguments.</p>
        </div>
  
        ${this._renderPhaseIndicator('investigation')}
  
        <div class="evidence-progress">
          <div class="evidence-progress-text">Documents reviewed: <span id="ev-read-count">0</span> of ${caseData.evidence.length}</div>
          <div class="evidence-progress-bar"><div class="evidence-progress-fill" id="ev-progress-bar"></div></div>
        </div>
  
        <div class="evidence-viewer">
          <div class="evidence-list" id="evidence-list"></div>
          <div class="evidence-reader" id="evidence-reader">
            <div class="evidence-reader-placeholder">
              <p>\u2190 Select a document to review</p>
              <p class="text-muted" style="font-size: 0.85rem;">Read each document carefully. You will need to cite specific evidence during the courtroom phase.</p>
            </div>
          </div>
        </div>
  
        <div class="text-center mt-lg">
          <button class="btn btn-primary btn-large" id="proceed-crossexam-btn" onclick="Screens._proceedToCrossExam()" disabled>
            Proceed to Cross-Examination &rarr;
          </button>
        </div>
      `;
  
      container.appendChild(screen);
  
      // Render evidence list
      const list = screen.querySelector('#evidence-list');
      caseData.evidence.forEach((ev, i) => {
        const isRead = Game.isEvidenceRead(ev.id);
        const item = document.createElement('div');
        item.className = `evidence-list-item ${isRead ? 'read' : ''}`;
        item.id = `ev-item-${i}`;
        item.innerHTML = `
          <div class="evidence-list-icon">${(typeLabels[ev.type] || '\u{1F4C4}').split(' ')[0]}</div>
          <div class="evidence-list-info">
            <div class="evidence-list-title">${ev.title}</div>
            <div class="evidence-list-date">${ev.date}</div>
          </div>
          ${isRead ? '<div class="evidence-read-check">\u2713</div>' : ''}
        `;
        item.onclick = () => this._selectEvidence(ev, i, caseData);
        list.appendChild(item);
      });
    },
  
    _selectEvidence(ev, index, caseData) {
      const typeLabels = {
        'client-intake': 'Client Intake Form',
        'procurement-document': 'Official Document',
        'internal-email': 'Internal Communication',
        'email': 'Correspondence',
        'witness-statement': 'Witness Statement',
        'statistics': 'Statistical Data',
        'technical-document': 'Technical Document',
        'data': 'Data Record',
        'policy-document': 'Policy Document'
      };
  
      document.querySelectorAll('.evidence-list-item').forEach(item => item.classList.remove('active'));
      document.getElementById(`ev-item-${index}`).classList.add('active');
  
      Game.markEvidenceRead(ev.id);
      Game.collectEvidence(ev.id);
      const item = document.getElementById(`ev-item-${index}`);
      item.classList.add('read');
      if (!item.querySelector('.evidence-read-check')) {
        item.innerHTML += '<div class="evidence-read-check">\u2713</div>';
      }
  
      const total = caseData.evidence.length;
      const readCount = Game.state.readEvidence.length;
      const countEl = document.getElementById('ev-read-count');
      if (countEl) countEl.textContent = readCount;
      const barEl = document.getElementById('ev-progress-bar');
      if (barEl) barEl.style.width = `${(readCount / total) * 100}%`;
  
      const btn = document.getElementById('proceed-crossexam-btn');
      if (btn && readCount >= Math.min(3, total)) {
        btn.disabled = false;
      }
  
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
  
    _proceedToCrossExam() {
      const caseData = Game.state.currentCase;
      const total = caseData.evidence.length;
      const readCount = Game.state.readEvidence.length;
  
      if (readCount < total) {
        if (!confirm(`You have reviewed ${readCount} of ${total} documents. Unread evidence may contain details critical for cross-examination and courtroom citation. Continue anyway?`)) {
          return;
        }
      }
  
      Game.showScreen('cross-examination');
    },
  
  
    // ========================
    // CROSS-EXAMINATION
    // ========================
    renderCrossExamination(container, caseData) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      const ce = caseData.crossExamination;
  
      if (!ce || !ce.questions || ce.questions.length === 0) {
        screen.innerHTML = `
          <div class="screen-header">
            <div class="breadcrumb">
              <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Cross-Examination
            </div>
            <h1>Cross-Examination</h1>
          </div>
          ${this._renderPhaseIndicator('cross-examination')}
          <p class="text-muted">Cross-examination content is being developed for this case.</p>
          <button class="btn btn-primary btn-large mt-xl" onclick="Game.showScreen('courtroom')">
            Proceed to Courtroom &rarr;
          </button>
        `;
        container.appendChild(screen);
        return;
      }
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Cross-Examination
          </div>
          <h1>Cross-Examination</h1>
          <p class="subtitle">${ce.context || 'Examine the witness to build your case.'}</p>
        </div>
  
        ${this._renderPhaseIndicator('cross-examination')}
  
        <div class="cross-exam-layout">
          <!-- Witness Box -->
          <div class="witness-box">
            <div class="witness-icon">\u{1F9D1}\u200D\u2696\uFE0F</div>
            <div class="witness-name">${ce.witness.name}</div>
            <div class="witness-role">${ce.witness.role}</div>
            <div class="witness-background">${ce.witness.background || ''}</div>
            <div class="questions-remaining" id="questions-remaining">
              Questions remaining: <strong>${ce.maxQuestions}</strong> of ${ce.maxQuestions}
            </div>
          </div>
  
          <!-- Examination Area -->
          <div class="exam-area">
            <div class="exam-dialogue" id="exam-dialogue">
              <div class="exam-intro">
                <div class="dialogue-bubble judge">
                  <div class="speaker-name">${caseData.courtroom.judgeName}</div>
                  <div class="speaker-text">Counsel for the applicant, you may cross-examine the witness. Please proceed.</div>
                </div>
              </div>
            </div>
  
            <div class="exam-questions-label" id="exam-questions-label">Select a question to ask the witness:</div>
            <div class="ce-strategy-tip" id="ce-strategy-tip">
              <strong>Strategy:</strong> Effective questions use specific evidence from the case file to challenge the witness\u2019s claims, forcing admissions that support your legal argument. Risky questions may let the witness deliver a strong defence. Ineffective questions waste your limited turns on irrelevant details.
            </div>
            <div class="exam-questions-grid" id="exam-questions-grid"></div>
          </div>
        </div>
      `;
  
      container.appendChild(screen);
  
      this._ceState = {
        questionsAsked: 0,
        maxQuestions: ce.maxQuestions || 3,
        askedIds: []
      };
  
      this._renderCEQuestions(caseData);
    },
  
    _ceState: {
      questionsAsked: 0,
      maxQuestions: 3,
      askedIds: []
    },
  
    _renderCEQuestions(caseData) {
      const ce = caseData.crossExamination;
      const grid = document.getElementById('exam-questions-grid');
      const label = document.getElementById('exam-questions-label');
      grid.innerHTML = '';

      // Hard-lock: if max questions reached, hide grid entirely
      if (this._ceState.questionsAsked >= this._ceState.maxQuestions) {
        grid.style.display = 'none';
        if (label) label.style.display = 'none';
        return;
      }

      ce.questions.forEach((q, i) => {
        if (this._ceState.askedIds.includes(q.id)) return;

        const card = document.createElement('div');
        card.className = 'ce-question-card';
        card.innerHTML = `
          <div class="ce-question-number">Q${i + 1}</div>
          <div class="ce-question-text">${q.questionText}</div>
        `;
        card.onclick = () => this._askCEQuestion(caseData, q);
        grid.appendChild(card);
      });
    },
  
    _askCEQuestion(caseData, question) {
      // Guard: prevent asking beyond limit (race condition from fast clicks)
      if (this._ceState.questionsAsked >= this._ceState.maxQuestions) return;
      if (this._ceState.askedIds.includes(question.id)) return;

      const ce = caseData.crossExamination;
      const dialogue = document.getElementById('exam-dialogue');

      this._ceState.askedIds.push(question.id);
      this._ceState.questionsAsked++;

      const remaining = this._ceState.maxQuestions - this._ceState.questionsAsked;
      document.getElementById('questions-remaining').innerHTML =
        `Questions remaining: <strong>${remaining}</strong> of ${this._ceState.maxQuestions}`;
  
      const yourQ = document.createElement('div');
      yourQ.className = 'dialogue-bubble player';
      yourQ.innerHTML = `
        <div class="speaker-name">You</div>
        <div class="speaker-text">${question.questionText}</div>
      `;
      dialogue.appendChild(yourQ);
  
      const witnessR = document.createElement('div');
      witnessR.className = 'dialogue-bubble witness';
      witnessR.innerHTML = `
        <div class="speaker-name">${ce.witness.name}</div>
        <div class="speaker-text">${question.witnessResponse}</div>
      `;
      dialogue.appendChild(witnessR);
  
      if (question.followUp && question.followUp.available !== false) {
        const followUpContainer = document.createElement('div');
        followUpContainer.className = 'ce-followup-choice';
        followUpContainer.id = `followup-${question.id}`;
        followUpContainer.innerHTML = `
          <button class="btn btn-secondary btn-sm" onclick="Screens._ceFollowUp('${question.id}', true)">
            Press Further \u2192
          </button>
          <button class="btn btn-ghost btn-sm" onclick="Screens._ceFollowUp('${question.id}', false)">
            Move On
          </button>
        `;
        dialogue.appendChild(followUpContainer);
      } else {
        this._showCEImpact(dialogue, question, false, ce);
      }
  
      this._renderCEQuestions(caseData);
  
      setTimeout(() => {
        yourQ.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    },
  
    _ceFollowUp(questionId, doFollowUp) {
      const caseData = Game.state.currentCase;
      const ce = caseData.crossExamination;
      const question = ce.questions.find(q => q.id === questionId);
      const dialogue = document.getElementById('exam-dialogue');
  
      const choiceEl = document.getElementById(`followup-${questionId}`);
      if (choiceEl) choiceEl.remove();
  
      if (doFollowUp && question.followUp) {
        const followQ = document.createElement('div');
        followQ.className = 'dialogue-bubble player';
        followQ.innerHTML = `
          <div class="speaker-name">You</div>
          <div class="speaker-text">${question.followUp.questionText}</div>
        `;
        dialogue.appendChild(followQ);
  
        const followR = document.createElement('div');
        followR.className = 'dialogue-bubble witness';
        followR.innerHTML = `
          <div class="speaker-name">${ce.witness.name}</div>
          <div class="speaker-text">${question.followUp.witnessResponse}</div>
        `;
        dialogue.appendChild(followR);
  
        setTimeout(() => {
          followQ.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
  
      this._showCEImpact(dialogue, question, doFollowUp, ce);
    },
  
    _showCEImpact(dialogue, question, followedUp, ce) {
      let score = 0;
      if (question.category === 'effective') {
        score = followedUp ? 10 : 8;
      } else if (question.category === 'risky') {
        if (followedUp) {
          score = (question.followUp && question.followUp.followUpImpact === 'positive') ? 8 : 3;
        } else {
          score = 5;
        }
      } else {
        score = followedUp ? 0 : 2;
      }

      Game.recordCrossExamQuestion(question.id, question.impact, followedUp, score);

      const impactClass = question.impact === 'positive' ? 'success'
        : question.impact === 'negative' ? 'error'
        : 'warning';

      const impactLabel = question.impact === 'positive' ? '\u2705 Effective Line of Questioning'
        : question.impact === 'negative' ? '\u274C This Hurt Your Case'
        : '\u26A0\uFE0F Limited Impact';

      // Explain why this category of question had this effect
      const categoryExplain = question.category === 'effective'
        ? 'This question used specific evidence to extract a damaging admission from the witness, directly advancing your legal argument.'
        : question.category === 'risky'
        ? 'This question gave the witness an opportunity to present a strong defence narrative. Risky questions can backfire by letting the witness reframe the issue on their terms.'
        : 'This question addressed peripheral facts (budget, staffing, timeline) that do not establish a legal violation. It used a limited question slot without advancing your case.';

      const impactBox = document.createElement('div');
      impactBox.className = `feedback-box ${impactClass} ce-impact`;
      impactBox.innerHTML = `
        <div class="feedback-title">${impactLabel}</div>
        <div class="feedback-text">${question.impactExplanation}</div>
        <div class="ce-category-explain">${categoryExplain}</div>
      `;
      dialogue.appendChild(impactBox);

      if (this._ceState.questionsAsked >= this._ceState.maxQuestions) {
        this._finishCrossExam(dialogue, Game.state.currentCase);
      }

      setTimeout(() => {
        impactBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    },
  
    _finishCrossExam(dialogue, caseData) {
      const grid = document.getElementById('exam-questions-grid');
      const label = document.getElementById('exam-questions-label');
      const tip = document.getElementById('ce-strategy-tip');
      if (grid) grid.style.display = 'none';
      if (label) label.style.display = 'none';
      if (tip) tip.style.display = 'none';
  
      const dismissal = document.createElement('div');
      dismissal.className = 'judge-ruling';
      dismissal.innerHTML = `
        <div class="judge-ruling-header">
          <span class="judge-gavel">\u2696\uFE0F</span>
          <span class="speaker-name" style="color: var(--accent-gold);">${caseData.courtroom.judgeName}</span>
        </div>
        <div class="ruling-text">Thank you, Counsel. The witness is dismissed. We will now hear oral arguments. Opposing counsel, you may present your case.</div>
      `;
      dialogue.appendChild(dismissal);
  
      const asked = Game.state.crossExamResults.questionsAsked;
      const effectiveCount = asked.filter(q => q.impact === 'positive').length;
  
      const summary = document.createElement('div');
      summary.className = 'ce-summary';
      summary.innerHTML = `
        <div class="ce-summary-title">Cross-Examination Summary</div>
        <div class="ce-summary-stats">
          <div class="ce-stat">
            <span class="ce-stat-number">${asked.length}</span>
            <span class="ce-stat-label">Questions Asked</span>
          </div>
          <div class="ce-stat">
            <span class="ce-stat-number">${effectiveCount}</span>
            <span class="ce-stat-label">Effective Lines</span>
          </div>
          <div class="ce-stat">
            <span class="ce-stat-number">${Game.state.crossExamResults.totalScore}</span>
            <span class="ce-stat-label">Points Earned</span>
          </div>
        </div>
      `;
      dialogue.appendChild(summary);
  
      const proceedBtn = document.createElement('div');
      proceedBtn.className = 'text-center mt-xl';
      proceedBtn.style.paddingBottom = 'var(--space-2xl)';
      proceedBtn.innerHTML = `
        <button class="btn btn-primary btn-large" onclick="Game.showScreen('courtroom')">
          Proceed to Courtroom Arguments &rarr;
        </button>
      `;
      dialogue.appendChild(proceedBtn);
  
      setTimeout(() => {
        dismissal.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    },
  
  
    // ========================
    // COURTROOM (v4: 4 options + evidence citation)
    // ========================
    renderCourtroom(container, caseData) {
      const screen = document.createElement('div');
      screen.className = 'screen';

      // Build evidence summary items for the collapsible panel
      const evidenceItems = caseData.evidence.map((ev, i) => `
        <div class="court-ev-item" onclick="this.classList.toggle('court-ev-expanded')">
          <div class="court-ev-header">
            <span class="court-ev-num">EV${i + 1}</span>
            <span class="court-ev-title">${ev.title}</span>
            <span class="court-ev-toggle">\u25BC</span>
          </div>
          <div class="court-ev-body">${ev.content}</div>
        </div>
      `).join('');

      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Courtroom
          </div>
          <h1>Courtroom Phase</h1>
          <p class="subtitle">Respond to opposing counsel's arguments before ${caseData.courtroom.judgeName}</p>
        </div>

        ${this._renderPhaseIndicator('courtroom')}

        <div class="court-evidence-panel">
          <button class="court-evidence-toggle" onclick="document.getElementById('court-ev-drawer').classList.toggle('open'); this.classList.toggle('open');">
            \uD83D\uDCC2 Review Case Evidence <span class="court-ev-arrow">\u25BC</span>
          </button>
          <div class="court-evidence-drawer" id="court-ev-drawer">
            ${evidenceItems}
          </div>
        </div>

        <div class="courtroom-scene" id="courtroom-dialogue"></div>
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
        endDiv.style.paddingBottom = 'var(--space-2xl)';
        endDiv.innerHTML = `
          <div class="judge-ruling" style="text-align: center;">
            <div class="judge-ruling-header" style="justify-content: center;">
              <span class="judge-gavel">\u2696\uFE0F</span>
              <span class="speaker-name" style="color: var(--accent-gold);">${caseData.courtroom.judgeName}</span>
            </div>
            <p class="ruling-text">The court has heard all arguments from both parties. The bench will now deliberate and deliver its verdict.</p>
          </div>
          <button class="btn btn-primary btn-large mt-xl" onclick="Game.showScreen('verdict')">
            Hear the Verdict &rarr;
          </button>
        `;
        dialogue.appendChild(endDiv);
        return;
      }
  
      const arg = args[index];
      const dialogue = document.getElementById('courtroom-dialogue');
      const oppName = caseData.courtroom.oppositionName || 'Opposing Counsel';
      const oppRole = caseData.courtroom.oppositionRole || 'Counsel for the Respondent';
  
      if (index === 0) dialogue.innerHTML = '';
  
      // Round container
      const round = document.createElement('div');
      round.className = 'courtroom-round';
      round.id = `court-round-${index}`;
  
      round.innerHTML = `<div class="round-label">Round ${index + 1} of ${args.length}</div>`;
  
      // Opposition speaks
      const oppBubble = document.createElement('div');
      oppBubble.className = 'dialogue-bubble opposition';
      oppBubble.innerHTML = `
        <div class="speaker-name">${oppName} <span class="speaker-role">${oppRole}</span></div>
        <div class="speaker-text">${arg.oppositionArgument}</div>
      `;
      round.appendChild(oppBubble);
  
      // Objection prompt
      const prompt = document.createElement('div');
      prompt.className = 'objection-prompt';
      prompt.innerHTML = `<div class="prompt-text">${caseData.courtroom.judgeName}: Counsel for the applicant, you may respond.</div>`;
      round.appendChild(prompt);
  
      // Write-first gate
      const writePrompt = arg.writePrompt || 'How would you respond to opposing counsel\'s argument?';
      const minWords = arg.minWords || 10;
  
      const writeGate = document.createElement('div');
      writeGate.className = 'write-first-container';
      writeGate.id = `write-gate-court-${index}`;
      writeGate.innerHTML = `
        <div class="write-first-prompt">${writePrompt}</div>
        <div class="write-first-instruction">Draft your counter-argument before seeing the response options. Minimum ${minWords} words.</div>
        <textarea class="write-first-textarea" id="wf-court-${index}-text"
                  placeholder="Your Honour, I must object to opposing counsel's characterisation..."
                  oninput="Screens._updateWordCount('wf-court-${index}-text', 'wf-court-${index}-count', ${minWords}, 'wf-court-${index}-btn')"></textarea>
        <div class="write-first-footer">
          <span class="write-first-charcount" id="wf-court-${index}-count">0 words</span>
          <button class="btn btn-primary" id="wf-court-${index}-btn" onclick="Screens._submitCourtWriteGate(${index})" disabled>
            Submit My Response
          </button>
        </div>
      `;
      round.appendChild(writeGate);
  
      // Hidden response options (4 options, shuffled)
      const optionsDiv = document.createElement('div');
      optionsDiv.id = `court-options-${index}`;
      optionsDiv.style.display = 'none';
  
      const optionsLabel = document.createElement('p');
      optionsLabel.className = 'text-muted mb-md';
      optionsLabel.style.fontSize = '0.85rem';
      optionsLabel.style.fontStyle = 'italic';
      optionsLabel.textContent = 'Now select the legal argument you would present to the court:';
      optionsDiv.appendChild(optionsLabel);
  
      const optionsGrid = document.createElement('div');
      optionsGrid.className = 'options-grid';
  
      // Shuffle options so strong isn't always first
      const shuffled = [...arg.options].sort(() => Math.random() - 0.5);
  
      shuffled.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `<div class="option-description">${opt.text}</div>`;
        card.onclick = () => this._selectCourtArgument(caseData, index, opt);
        optionsGrid.appendChild(card);
      });
  
      optionsDiv.appendChild(optionsGrid);
      round.appendChild(optionsDiv);
  
      // Hidden citation challenge
      const citationDiv = document.createElement('div');
      citationDiv.id = `court-citation-${index}`;
      citationDiv.style.display = 'none';
      round.appendChild(citationDiv);
  
      // Hidden feedback
      const feedbackDiv = document.createElement('div');
      feedbackDiv.id = `court-feedback-${index}`;
      feedbackDiv.style.display = 'none';
      round.appendChild(feedbackDiv);
  
      dialogue.appendChild(round);
  
      setTimeout(() => {
        oppBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    },
  
    _updateWordCount(textareaId, countId, minWords, btnId) {
      const textarea = document.getElementById(textareaId);
      const countEl = document.getElementById(countId);
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
  
    // Keyword retry tracking per argument
    _retryUsed: {},

    _submitCourtWriteGate(index) {
      const textareaId = `wf-court-${index}-text`;
      const text = document.getElementById(textareaId).value;
      Game.recordWrittenAnswer(`courtroom_${index}`, text);

      // Check if this argument has requiredConcepts
      const caseData = Game.state.currentCase;
      const arg = caseData.courtroom.arguments[index];
      const reqConcepts = arg.requiredConcepts;

      if (!reqConcepts || reqConcepts.length === 0) {
        // No keywords — proceed directly
        document.getElementById(`write-gate-court-${index}`).style.display = 'none';
        document.getElementById(`court-options-${index}`).style.display = 'block';
        return;
      }

      const result = Game.checkKeywords(text, reqConcepts);

      // Remove any previous feedback
      const oldFeedback = document.getElementById(`kw-feedback-${index}`);
      if (oldFeedback) oldFeedback.remove();

      if (result.passed) {
        // Keywords matched — show success then reveal options
        const gate = document.getElementById(`write-gate-court-${index}`);
        const successDiv = document.createElement('div');
        successDiv.className = 'keyword-feedback kw-feedback-pass';
        successDiv.innerHTML = '<div class="kw-feedback-title">\u2705 Good analysis — your response demonstrates understanding of the key legal concepts.</div>';
        gate.appendChild(successDiv);

        setTimeout(() => {
          gate.style.display = 'none';
          document.getElementById(`court-options-${index}`).style.display = 'block';
        }, 1200);
      } else if (!this._retryUsed[index]) {
        // First failure — show feedback with hints, allow retry
        this._retryUsed[index] = true;
        const gate = document.getElementById(`write-gate-court-${index}`);
        const feedbackDiv = this._buildKeywordFeedback(result, reqConcepts, true);
        feedbackDiv.id = `kw-feedback-${index}`;
        gate.appendChild(feedbackDiv);

        // Change button to "Retry"
        const btn = document.getElementById(`wf-court-${index}-btn`);
        if (btn) btn.textContent = 'Retry My Response';

        setTimeout(() => { feedbackDiv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
      } else {
        // Second failure — show feedback then unlock options anyway
        const gate = document.getElementById(`write-gate-court-${index}`);
        const feedbackDiv = this._buildKeywordFeedback(result, reqConcepts, false);
        feedbackDiv.id = `kw-feedback-${index}`;
        gate.appendChild(feedbackDiv);

        setTimeout(() => {
          gate.style.display = 'none';
          document.getElementById(`court-options-${index}`).style.display = 'block';
        }, 2500);
      }
    },

    _buildKeywordFeedback(result, reqConcepts, canRetry) {
      const div = document.createElement('div');
      div.className = 'keyword-feedback kw-feedback-fail';

      let html = '<div class="kw-feedback-title">\u274C Your response is missing key legal concepts.</div>';

      result.concepts.forEach((c, i) => {
        const concept = reqConcepts[i];
        html += '<div class="concept-feedback-group">';
        html += `<div class="concept-feedback-name">${c.passed ? '\u2705' : '\u274C'} ${c.name}</div>`;
        html += '<div class="keyword-chips">';
        c.matched.forEach(kw => { html += `<span class="keyword-chip matched">${kw}</span>`; });
        c.missed.forEach(kw => { html += `<span class="keyword-chip missed">${kw}</span>`; });
        html += '</div>';
        if (!c.passed && concept.hints && concept.hints.length > 0) {
          const hint = concept.hints[this._retryUsed ? 1 : 0] || concept.hints[0];
          html += `<div class="kw-hint">\uD83D\uDCA1 ${hint}</div>`;
        }
        html += '</div>';
      });

      if (canRetry) {
        html += '<div class="kw-retry-msg">Revise your response above and click <strong>Retry My Response</strong> to try again.</div>';
      } else {
        html += '<div class="kw-retry-msg">Moving to the argument options. Study the concepts above for next time.</div>';
      }

      div.innerHTML = html;
      return div;
    },
  
    // v4: After picking an option, show citation challenge BEFORE feedback
    _selectCourtArgument(caseData, argIndex, chosen) {
      const arg = caseData.courtroom.arguments[argIndex];
      const optionsContainer = document.getElementById(`court-options-${argIndex}`);
  
      // Disable options
      optionsContainer.querySelectorAll('.option-card').forEach(card => {
        card.classList.add('disabled');
        card.onclick = null;
      });
  
      // Store chosen for later
      this._pendingChoice = { caseData, argIndex, chosen };
  
      // Show citation challenge
      const citationDiv = document.getElementById(`court-citation-${argIndex}`);
      citationDiv.style.display = 'block';
  
      citationDiv.innerHTML = `
        <div class="citation-challenge">
          <div class="citation-header">
            <span class="citation-icon">\u{1F4C4}</span>
            <span class="citation-title">Evidence Citation</span>
          </div>
          <div class="citation-prompt">Which document from the case file best supports the argument you selected?</div>
          <div class="citation-grid" id="citation-grid-${argIndex}"></div>
        </div>
      `;
  
      const grid = citationDiv.querySelector(`#citation-grid-${argIndex}`);
      caseData.evidence.forEach(ev => {
        const card = document.createElement('div');
        card.className = 'citation-card';
        card.innerHTML = `
          <div class="citation-card-title">${ev.title}</div>
          <div class="citation-card-date">${ev.date}</div>
        `;
        card.onclick = () => this._submitCitation(argIndex, ev.id);
        grid.appendChild(card);
      });
  
      setTimeout(() => {
        citationDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    },
  
    _submitCitation(argIndex, chosenEvidenceId) {
      const { caseData, chosen } = this._pendingChoice;
      const arg = caseData.courtroom.arguments[argIndex];
      const correctEvidenceId = arg.evidenceId;
      const citationCorrect = (chosenEvidenceId === correctEvidenceId);
  
      // Record in engine
      Game.recordArgument(chosen.id, chosen.quality, citationCorrect);
  
      // Hide citation, disable cards
      const citationDiv = document.getElementById(`court-citation-${argIndex}`);
      citationDiv.querySelectorAll('.citation-card').forEach(card => {
        card.classList.add('disabled');
        card.onclick = null;
      });
  
      // Show full feedback
      this._showCourtFeedback(caseData, argIndex, chosen, citationCorrect, chosenEvidenceId, correctEvidenceId);
    },
  
    _showCourtFeedback(caseData, argIndex, chosen, citationCorrect, chosenEvId, correctEvId) {
      const round = document.getElementById(`court-round-${argIndex}`);
      const feedbackDiv = document.getElementById(`court-feedback-${argIndex}`);
      feedbackDiv.style.display = 'block';
  
      // Quality label
      let qualityLabel = '';
      if (chosen.quality === 'strong') qualityLabel = '<span class="chosen-quality strong">Strong Argument</span>';
      else if (chosen.quality === 'plausible') qualityLabel = '<span class="chosen-quality plausible">Plausible but Flawed</span>';
      else if (chosen.quality === 'weak') qualityLabel = '<span class="chosen-quality weak">Weak Argument</span>';
      else qualityLabel = '<span class="chosen-quality wrong">Fundamentally Flawed</span>';
  
      // Player bubble
      const playerBubble = document.createElement('div');
      playerBubble.className = 'dialogue-bubble player';
      playerBubble.innerHTML = `
        <div class="speaker-name">You ${qualityLabel}</div>
        <div class="speaker-text">${chosen.text}</div>
      `;
      feedbackDiv.appendChild(playerBubble);
  
      // Judge ruling
      const ruling = document.createElement('div');
      ruling.className = 'judge-ruling';
      ruling.innerHTML = `
        <div class="judge-ruling-header">
          <span class="judge-gavel">\u2696\uFE0F</span>
          <span class="speaker-name" style="color: var(--accent-gold);">${caseData.courtroom.judgeName}</span>
        </div>
        <div class="ruling-text">${chosen.judge_response}</div>
      `;
      feedbackDiv.appendChild(ruling);
  
      // Legal reasoning feedback
      let responseClass = 'warning';
      if (chosen.quality === 'strong') responseClass = 'success';
      else if (chosen.quality === 'wrong' || chosen.quality === 'plausible') responseClass = 'error';
  
      const reasoning = document.createElement('div');
      reasoning.className = `feedback-box ${responseClass}`;
      reasoning.innerHTML = `
        <div class="feedback-title">Legal Analysis</div>
        <div class="feedback-text">${chosen.legal_reasoning}</div>
      `;
      feedbackDiv.appendChild(reasoning);
  
      // Citation result
      const correctEv = caseData.evidence.find(e => e.id === correctEvId);
      const chosenEv = caseData.evidence.find(e => e.id === chosenEvId);
  
      const citationResult = document.createElement('div');
      citationResult.className = `feedback-box ${citationCorrect ? 'success' : 'warning'} citation-result`;
      citationResult.innerHTML = `
        <div class="feedback-title">${citationCorrect ? '\u2713 Correct Citation' : '\u2717 Incorrect Citation'}</div>
        <div class="feedback-text">
          ${citationCorrect
            ? `You correctly identified <strong>${correctEv ? correctEv.title : correctEvId}</strong> as the key supporting evidence for this argument.`
            : `You cited <strong>${chosenEv ? chosenEv.title : chosenEvId}</strong>, but the strongest supporting evidence was <strong>${correctEv ? correctEv.title : correctEvId}</strong>. ${citationCorrect ? '' : 'Citing the wrong evidence halves your argument score for this round.'}`
          }
        </div>
      `;
      feedbackDiv.appendChild(citationResult);
  
      // Continue button
      const continueBtn = document.createElement('button');
      continueBtn.className = 'btn btn-secondary mt-lg';
      continueBtn.textContent = argIndex < caseData.courtroom.arguments.length - 1
        ? 'Next Round \u2192'
        : 'Hear the Verdict \u2192';
      continueBtn.onclick = () => {
        continueBtn.remove();
        if (argIndex < caseData.courtroom.arguments.length - 1) {
          this._renderCourtArgument(caseData, argIndex + 1);
        } else {
          Game.showScreen('verdict');
        }
      };
      feedbackDiv.appendChild(continueBtn);
  
      setTimeout(() => {
        playerBubble.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    },
  
  
    // ========================
    // VERDICT
    // ========================
    renderVerdict(container, caseData, score) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      const verdictTitles = {
        'won': 'Case Won \u2014 Judgment in Your Favour',
        'won_with_reservations': 'Case Won with Reservations',
        'lost': 'Case Lost',
        'dismissed': 'Case Dismissed'
      };
  
      const verdictClasses = {
        'won': 'verdict-won',
        'won_with_reservations': 'verdict-partial',
        'lost': 'verdict-lost',
        'dismissed': 'verdict-lost'
      };
  
      const verdictText = (score.verdict === 'won' || score.verdict === 'won_with_reservations')
        ? caseData.verdict.winText
        : caseData.verdict.loseText;
  
      // Count citations
      const citationsCorrect = score.courtroom.arguments.filter(a => a.citationCorrect).length;
      const totalArgs = score.courtroom.arguments.length;
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Verdict
          </div>
          <h1>Verdict</h1>
        </div>
  
        ${this._renderPhaseIndicator('verdict')}
  
        <div class="verdict-card ${verdictClasses[score.verdict]}">
          <div class="verdict-title">${verdictTitles[score.verdict]}</div>
          <div class="verdict-score">${score.total}<span class="verdict-score-max">/100</span></div>
          <div class="verdict-text">${verdictText}</div>
        </div>
  
        <div class="score-breakdown">
          <h3>Score Breakdown</h3>
  
          <div class="score-row">
            <span class="score-label">\u{1F4C4} Evidence Review</span>
            <span class="score-value">${score.evidence.earned}/${score.evidence.possible}</span>
            <span class="score-detail">${score.evidence.found} of ${score.evidence.total} documents reviewed</span>
          </div>
  
          <div class="score-row">
            <span class="score-label">\u{1F9D1}\u200D\u2696\uFE0F Cross-Examination</span>
            <span class="score-value">${score.crossExam.earned}/${score.crossExam.possible}</span>
            <span class="score-detail">${score.crossExam.questionsAsked.length} questions asked, ${score.crossExam.questionsAsked.filter(q => q.impact === 'positive').length} effective</span>
          </div>
  
          <div class="score-row">
            <span class="score-label">\u2696\uFE0F Courtroom Arguments</span>
            <span class="score-value">${score.courtroom.earned}/${score.courtroom.possible}</span>
            <span class="score-detail">${score.courtroom.arguments.filter(a => a.quality === 'strong').length} of ${totalArgs} strong arguments, ${citationsCorrect} of ${totalArgs} correct citations</span>
          </div>

          ${score.elapsedSeconds ? `
          <div class="score-row">
            <span class="score-label">\u23F1\uFE0F Time Taken</span>
            <span class="score-value">${Math.floor(score.elapsedSeconds / 60)}:${String(score.elapsedSeconds % 60).padStart(2, '0')}</span>
            <span class="score-detail">${score.elapsedSeconds < 300 ? 'Quick work!' : score.elapsedSeconds < 600 ? 'Solid pace' : 'Thorough analysis'}</span>
          </div>
          ` : ''}
        </div>

        ${score.achievements && score.achievements.length > 0 ? `
        <div class="achievements-section">
          <h3>\uD83C\uDFC5 Achievements Unlocked</h3>
          <div class="achievements-grid">
            ${score.achievements.map(a => `
              <div class="achievement-badge">
                <span class="achievement-icon">${a.icon}</span>
                <span class="achievement-label">${a.label}</span>
                <span class="achievement-desc">${a.desc}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
  
        <div class="model-answer-section">
          <h3>Model Answer</h3>
          <div class="model-answer-toggle" onclick="this.nextElementSibling.classList.toggle('visible'); this.textContent = this.textContent.includes('Show') ? 'Hide Model Answer' : 'Show Model Answer';">
            Show Model Answer
          </div>
          <div class="model-answer-content">
            ${caseData.verdict.modelAnswer}
          </div>
        </div>
  
        <div class="text-center mt-2xl" style="padding-bottom: var(--space-2xl);">
          <button class="btn btn-primary btn-large" onclick="Game.goToDashboard()">
            Return to Dashboard
          </button>
        </div>
      `;
  
      container.appendChild(screen);
    },
  
  
    // ========================
    // TAXONOMY
    // ========================
    renderTaxonomy(container) {
      const screen = document.createElement('div');
      screen.className = 'screen';
  
      const grouped = {};
      TAXONOMY.forEach(t => {
        const fw = t.framework;
        if (!grouped[fw]) grouped[fw] = [];
        grouped[fw].push(t);
      });
  
      const frameworkMeta = {
        'ai-act': { label: 'EU AI Act', tagClass: 'tag-ai-act' },
        'gdpr': { label: 'GDPR', tagClass: 'tag-gdpr' },
        'dsa': { label: 'Digital Services Act', tagClass: 'tag-dsa' },
        'dma': { label: 'Digital Markets Act', tagClass: 'tag-dma' },
        'data-act': { label: 'Data Act', tagClass: 'tag-data-act' }
      };
  
      let taxonomyHTML = '';
      Object.keys(grouped).forEach(fw => {
        const meta = frameworkMeta[fw] || { label: fw, tagClass: '' };
        taxonomyHTML += `
          <div class="taxonomy-framework">
            <h3><span class="framework-tag ${meta.tagClass}">${meta.label}</span></h3>
            <div class="taxonomy-list">
              ${grouped[fw].map(t => `
                <div class="taxonomy-item ${t.playable ? 'playable' : 'locked'}">
                  <span class="taxonomy-id">${t.id}.</span>
                  <span class="taxonomy-title">${t.title}</span>
                  <span class="taxonomy-articles">${t.articles}</span>
                  ${t.playable ? `<button class="btn btn-ghost btn-sm" onclick="Game.startCase('${t.caseId}')">Play</button>` : '<span class="taxonomy-status">Coming Soon</span>'}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      });
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / Scenario Library
          </div>
          <h1>Scenario Library</h1>
          <p class="subtitle">All ${TAXONOMY.length} scenario types across 5 EU digital law frameworks</p>
        </div>
  
        ${taxonomyHTML}
  
        <div class="text-center mt-xl">
          <button class="btn btn-ghost" onclick="Game.goToDashboard()">
            &larr; Back to Dashboard
          </button>
        </div>
      `;
  
      container.appendChild(screen);
    },
  
  
    // ========================
    // UTILITY: Phase Indicator
    // ========================
    _renderPhaseIndicator(currentPhase) {
      const phases = [
        { id: 'briefing', label: 'Briefing' },
        { id: 'investigation', label: 'Investigation' },
        { id: 'cross-examination', label: 'Cross-Exam' },
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
    },


    // ========================
    // FEEDBACK / FLAG MECHANISM
    // ========================
    initFeedbackButton() {
      // Only create once
      if (document.getElementById('feedback-fab')) return;

      const fab = document.createElement('button');
      fab.id = 'feedback-fab';
      fab.className = 'feedback-fab';
      fab.innerHTML = '\uD83D\uDCE8';
      fab.title = 'Send feedback or flag an issue';
      fab.onclick = () => Screens.openFeedbackModal();
      document.body.appendChild(fab);
    },

    openFeedbackModal() {
      // Remove existing if open
      const existing = document.getElementById('feedback-modal-overlay');
      if (existing) { existing.remove(); return; }

      const currentCase = Game.state.currentCase;
      const caseLabel = currentCase
        ? `Case ${String(currentCase.number).padStart(2, '0')}: ${currentCase.title}`
        : 'General / Dashboard';

      const overlay = document.createElement('div');
      overlay.id = 'feedback-modal-overlay';
      overlay.className = 'feedback-modal-overlay';
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

      overlay.innerHTML = `
        <div class="feedback-modal">
          <div class="feedback-modal-header">
            <h3>\uD83D\uDCE8 Feedback & Flags</h3>
            <button class="feedback-modal-close" onclick="document.getElementById('feedback-modal-overlay').remove()">\u2715</button>
          </div>
          <div class="feedback-modal-body">
            <div class="feedback-context">Regarding: <strong>${caseLabel}</strong></div>
            <label class="feedback-label">Type</label>
            <select id="feedback-type" class="feedback-select">
              <option value="flag-error">Flag a legal error in this case</option>
              <option value="flag-unclear">Something is unclear or confusing</option>
              <option value="flag-bug">Technical bug or display issue</option>
              <option value="suggestion">Suggestion for improvement</option>
              <option value="general">General feedback</option>
            </select>
            <label class="feedback-label">Your feedback</label>
            <textarea id="feedback-text" class="feedback-textarea" rows="4" placeholder="Describe the issue or suggestion..."></textarea>
            <div class="feedback-actions">
              <button class="btn btn-primary" onclick="Screens.submitFeedback()">Submit Feedback</button>
              <button class="btn btn-ghost" onclick="document.getElementById('feedback-modal-overlay').remove()">Cancel</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
    },

    submitFeedback() {
      const type = document.getElementById('feedback-type').value;
      const text = document.getElementById('feedback-text').value.trim();
      if (!text) { alert('Please enter your feedback before submitting.'); return; }

      const currentCase = Game.state.currentCase;
      const entry = {
        timestamp: new Date().toISOString(),
        studentName: Game.state.studentName || 'Unknown',
        caseId: currentCase ? currentCase.id : null,
        caseNumber: currentCase ? currentCase.number : null,
        type: type,
        text: text,
        screen: Game.state.currentScreen || 'unknown'
      };

      // Store in localStorage
      const feedbackLog = JSON.parse(localStorage.getItem('drc_feedback') || '[]');
      feedbackLog.push(entry);
      localStorage.setItem('drc_feedback', JSON.stringify(feedbackLog));

      // Replace modal content with confirmation
      const modal = document.querySelector('.feedback-modal');
      if (modal) {
        modal.innerHTML = `
          <div class="feedback-modal-header">
            <h3>\u2713 Feedback Submitted</h3>
            <button class="feedback-modal-close" onclick="document.getElementById('feedback-modal-overlay').remove()">\u2715</button>
          </div>
          <div class="feedback-modal-body" style="text-align: center; padding: 2rem;">
            <p>Thank you! Your feedback has been saved.</p>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.5rem;">Feedback is stored locally and can be exported by the instructor from the browser console:<br><code>localStorage.getItem('drc_feedback')</code></p>
            <button class="btn btn-ghost mt-lg" onclick="document.getElementById('feedback-modal-overlay').remove()">Close</button>
          </div>
        `;
      }
    },


    // ========================
    // INSTRUCTOR PANEL
    // ========================
    // ========================
    // LEADERBOARD
    // ========================
    renderLeaderboard(container) {
      const lb = Game.getLeaderboard();
      const screen = document.createElement('div');
      screen.className = 'screen';
      const myId = Game.state.studentId;

      // Overall ranking: sum of first-attempt scores per student
      const studentTotals = {};
      lb.forEach(e => {
        const key = e.studentId || e.studentName;
        if (!studentTotals[key]) {
          studentTotals[key] = { name: e.studentName, id: e.studentId, totalScore: 0, casesPlayed: 0, achievements: new Set() };
        }
        studentTotals[key].totalScore += e.score;
        studentTotals[key].casesPlayed++;
        if (e.achievements) e.achievements.forEach(a => studentTotals[key].achievements.add(a));
      });

      const overallRanking = Object.values(studentTotals)
        .sort((a, b) => b.totalScore - a.totalScore || b.casesPlayed - a.casesPlayed);

      // Build overall: top 3 + own position only
      let overallRows = '';
      if (overallRanking.length === 0) {
        overallRows = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);padding:2rem;">No scores yet. Complete a case to appear on the leaderboard!</td></tr>';
      } else {
        const medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
        overallRanking.slice(0, 3).forEach((s, i) => {
          const avg = Math.round(s.totalScore / s.casesPlayed);
          const isMe = s.id === myId;
          const hl = isMe ? 'background:rgba(201,168,76,0.08);' : '';
          overallRows += `<tr style="${hl}">
            <td style="font-size:1.4rem;text-align:center;">${medals[i]}</td>
            <td><strong>${s.name}</strong>${isMe ? ' <span style="color:var(--accent-gold);font-size:0.75rem;">(you)</span>' : ''}</td>
            <td>${s.totalScore}</td>
            <td>${s.casesPlayed} (avg ${avg})</td>
            <td>${s.achievements.size}</td>
          </tr>`;
        });
        // Show own position if not in top 3
        const myRank = overallRanking.findIndex(s => s.id === myId);
        if (myRank >= 3) {
          const me = overallRanking[myRank];
          const avg = Math.round(me.totalScore / me.casesPlayed);
          overallRows += `<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);font-size:0.8rem;padding:0.4rem;">\u22EE</td></tr>`;
          overallRows += `<tr style="background:rgba(201,168,76,0.08);">
            <td style="text-align:center;color:var(--text-secondary);">${myRank + 1}</td>
            <td><strong>${me.name}</strong> <span style="color:var(--accent-gold);font-size:0.75rem;">(you)</span></td>
            <td>${me.totalScore}</td>
            <td>${me.casesPlayed} (avg ${avg})</td>
            <td>${me.achievements.size}</td>
          </tr>`;
        }
      }

      // Per-case: top 3 + own position
      const caseNumbers = [...new Set(lb.map(e => e.caseNumber))].filter(Boolean).sort((a, b) => a - b);
      let caseTabs = '<button class="lb-tab active" data-case="overall" onclick="Screens._switchLBTab(\'overall\')">Overall</button>';
      caseNumbers.forEach(cn => {
        caseTabs += `<button class="lb-tab" data-case="${cn}" onclick="Screens._switchLBTab('${cn}')">Case ${String(cn).padStart(2, '0')}</button>`;
      });

      let casePanels = '';
      caseNumbers.forEach(cn => {
        const caseEntries = lb.filter(e => e.caseNumber === cn).sort((a, b) => b.score - a.score);
        const medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
        let rows = '';
        caseEntries.slice(0, 3).forEach((e, i) => {
          const time = e.elapsedSeconds ? `${Math.floor(e.elapsedSeconds / 60)}:${String(e.elapsedSeconds % 60).padStart(2, '0')}` : '-';
          const vc = e.verdict === 'won' ? '#4ade80' : e.verdict === 'won_with_reservations' ? '#c9a84c' : '#f87171';
          const isMe = e.studentId === myId;
          const hl = isMe ? 'background:rgba(201,168,76,0.08);' : '';
          rows += `<tr style="${hl}">
            <td style="font-size:1.4rem;text-align:center;">${medals[i]}</td>
            <td><strong>${e.studentName}</strong>${isMe ? ' <span style="color:var(--accent-gold);font-size:0.75rem;">(you)</span>' : ''}</td>
            <td>${e.score}/100</td>
            <td style="color:${vc}">${e.verdict}</td>
            <td>${time}</td>
          </tr>`;
        });
        const myIdx = caseEntries.findIndex(e => e.studentId === myId);
        if (myIdx >= 3) {
          const me = caseEntries[myIdx];
          const time = me.elapsedSeconds ? `${Math.floor(me.elapsedSeconds / 60)}:${String(me.elapsedSeconds % 60).padStart(2, '0')}` : '-';
          const vc = me.verdict === 'won' ? '#4ade80' : me.verdict === 'won_with_reservations' ? '#c9a84c' : '#f87171';
          rows += `<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);font-size:0.8rem;padding:0.4rem;">\u22EE</td></tr>`;
          rows += `<tr style="background:rgba(201,168,76,0.08);">
            <td style="text-align:center;color:var(--text-secondary);">${myIdx + 1}</td>
            <td><strong>${me.studentName}</strong> <span style="color:var(--accent-gold);font-size:0.75rem;">(you)</span></td>
            <td>${me.score}/100</td>
            <td style="color:${vc}">${me.verdict}</td>
            <td>${time}</td>
          </tr>`;
        }
        if (!rows) rows = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);">No attempts yet.</td></tr>';
        casePanels += `<div class="lb-case-panel" id="lb-panel-${cn}" style="display:none;">
          <table class="instructor-table"><thead><tr><th>#</th><th>Student</th><th>Score</th><th>Verdict</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table>
        </div>`;
      });

      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / Leaderboard
          </div>
          <h1>\uD83C\uDFC6 Leaderboard</h1>
          <p class="subtitle">Top 3 performers \u2022 First-attempt scores only</p>
        </div>

        <div class="lb-tabs" id="lb-tabs">${caseTabs}</div>

        <div class="lb-panel" id="lb-panel-overall">
          <table class="instructor-table">
            <thead><tr><th>#</th><th>Student</th><th>Total Points</th><th>Cases (Avg)</th><th>Achievements</th></tr></thead>
            <tbody>${overallRows}</tbody>
          </table>
        </div>
        ${casePanels}

        <div class="text-center mt-xl">
          <button class="btn btn-ghost" onclick="Game.goToDashboard()">&larr; Back to Dashboard</button>
        </div>
      `;

      container.appendChild(screen);
    },

    _switchLBTab(caseKey) {
      // Hide all panels
      document.querySelectorAll('.lb-panel, .lb-case-panel').forEach(p => p.style.display = 'none');
      document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));

      if (caseKey === 'overall') {
        document.getElementById('lb-panel-overall').style.display = 'block';
      } else {
        const panel = document.getElementById('lb-panel-' + caseKey);
        if (panel) panel.style.display = 'block';
      }
      
      // Activate tab
      document.querySelector(`.lb-tab[data-case="${caseKey}"]`).classList.add('active');
    },

    // ========================
    // INSTRUCTOR PANEL
    // ========================
    renderInstructorPanel(container) {
      const results = Game.getDetailedResults();
      const screen = document.createElement('div');
      screen.className = 'screen';

      // Detect all classes
      const allClasses = [...new Set(results.map(r => r.className || 'Unassigned'))].sort();

      // Group results by student
      const students = {};
      results.forEach(r => {
        const key = r.studentId || r.studentName || 'Unknown';
        if (!students[key]) {
          students[key] = { name: r.studentName || 'Unknown', id: r.studentId || '', className: r.className || 'Unassigned', attempts: [] };
        }
        students[key].attempts.push(r);
      });

      // Build student summary cards with data-class attribute for filtering
      let studentCards = '';
      const studentKeys = Object.keys(students);

      if (studentKeys.length === 0) {
        studentCards = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No student results yet. Results appear after students complete cases on this device.</p>';
      } else {
        studentKeys.forEach(key => {
          const stu = students[key];
          // Group attempts by case
          const cases = {};
          stu.attempts.forEach(a => {
            const ck = a.caseNumber || a.caseId;
            if (!cases[ck]) cases[ck] = { title: a.caseTitle || '', number: a.caseNumber, attempts: [] };
            cases[ck].attempts.push(a);
          });

          const totalCasesPlayed = Object.keys(cases).length;
          const totalAttempts = stu.attempts.length;
          const avgScore = Math.round(stu.attempts.reduce((s, a) => s + (a.totalScore || 0), 0) / totalAttempts);
          const bestScore = Math.max(...stu.attempts.map(a => a.totalScore || 0));

          // Build per-case rows
          let caseRows = '';
          Object.values(cases).sort((a, b) => (a.number || 0) - (b.number || 0)).forEach(c => {
            const best = c.attempts.reduce((b, a) => (a.totalScore || 0) > (b.totalScore || 0) ? a : b, c.attempts[0]);
            const vc = best.verdict === 'won' ? '#4ade80' : best.verdict === 'won_with_reservations' ? '#c9a84c' : '#f87171';
            caseRows += `<tr>
              <td>Case ${String(c.number || '?').padStart(2, '0')}</td>
              <td>${c.title}</td>
              <td><strong>${best.totalScore}/100</strong></td>
              <td style="color:${vc}">${best.verdict}</td>
              <td>${best.evidence ? best.evidence.earned + '/' + best.evidence.possible : ''} | ${best.crossExam ? best.crossExam.earned + '/' + best.crossExam.possible : ''} | ${best.courtroom ? best.courtroom.earned + '/' + best.courtroom.possible : ''}</td>
              <td>${c.attempts.length}</td>
              <td>${best.timestamp ? new Date(best.timestamp).toLocaleDateString() : ''}</td>
            </tr>`;
          });

          studentCards += `
            <div class="instructor-student-card" data-class="${stu.className}">
              <div class="instructor-student-header" onclick="this.parentElement.classList.toggle('expanded')">
                <div class="instructor-student-info">
                  <span class="instructor-student-name">${stu.name} <span class="instructor-class-tag">${stu.className}</span></span>
                  <span class="instructor-student-meta">${totalCasesPlayed} case${totalCasesPlayed !== 1 ? 's' : ''} \u2022 ${totalAttempts} attempt${totalAttempts !== 1 ? 's' : ''} \u2022 Avg: ${avgScore} \u2022 Best: ${bestScore}</span>
                </div>
                <span class="instructor-expand-icon">\u25BC</span>
              </div>
              <div class="instructor-student-body">
                <table class="instructor-table">
                  <thead><tr><th>Case</th><th>Title</th><th>Best Score</th><th>Verdict</th><th>Ev | CE | Court</th><th>Plays</th><th>Last</th></tr></thead>
                  <tbody>${caseRows}</tbody>
                </table>
              </div>
            </div>`;
        });
      }

      screen.innerHTML = `
        <div class="screen-header">
          <img src="img/uni-vienna-logo.png" alt="" style="height:40px;opacity:0.8;margin-bottom:0.5rem;" onerror="this.style.display='none'">
          <h1>\uD83C\uDF93 Instructor Panel</h1>
          <p class="subtitle">Student performance overview. Access via <code>?instructor=true</code></p>
        </div>

        <div style="display:flex;gap:0.75rem;margin-bottom:2rem;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="Game.downloadExport()">\u2B07 Export All Data (JSON)</button>
          <button class="btn btn-secondary" onclick="Screens._downloadCSV()">Export Results (CSV)</button>
          <button class="btn btn-ghost" onclick="window.location.href=window.location.pathname;">Back to Game</button>
        </div>

        <div style="background:rgba(248,113,113,0.06);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:1rem 1.25rem;margin-bottom:2rem;">
          <h3 style="margin:0 0 0.5rem;color:#f87171;font-size:0.95rem;">\uD83D\uDD12 Session & Class Management</h3>
          <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:0.75rem;">
            Each class has its own access code. To add a new class or change an existing code, generate a SHA-256 hash and update <code>_classCodes</code> in engine.js.
          </p>
          <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.75rem;padding:0.5rem 0.75rem;background:rgba(255,255,255,0.03);border-radius:6px;">
            <strong>Current class codes:</strong><br>
            ${Object.entries(Game._classCodes).map(([h, c]) => `${c}: hash ${h.substr(0, 10)}...`).join('<br>')}
          </div>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
            <input type="text" id="new-class-label" placeholder="Class name (e.g. Class C)" style="padding:0.5rem 0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:var(--text-primary);font-size:0.85rem;width:140px;box-sizing:border-box;">
            <input type="text" id="new-access-code" placeholder="New code (e.g. EUROLAW2026)" style="padding:0.5rem 0.75rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:var(--text-primary);font-size:0.85rem;flex:1;min-width:160px;box-sizing:border-box;">
            <button class="btn btn-secondary" onclick="Screens._addClassCode()" style="white-space:nowrap;">Generate Hash</button>
            <button class="btn btn-ghost" onclick="Screens._revokeAllAccess()" style="white-space:nowrap;color:#f87171;">Revoke All Access</button>
          </div>
          <p id="access-code-msg" style="font-size:0.78rem;margin:0.5rem 0 0;min-height:1rem;color:var(--accent-gold);"></p>
        </div>

        <div class="instructor-summary-bar">
          <div class="instructor-stat"><span class="instructor-stat-num">${studentKeys.length}</span><span class="instructor-stat-label">Students</span></div>
          <div class="instructor-stat"><span class="instructor-stat-num">${results.length}</span><span class="instructor-stat-label">Total Attempts</span></div>
          <div class="instructor-stat"><span class="instructor-stat-num">${results.length > 0 ? Math.round(results.reduce((s,r) => s + (r.totalScore||0), 0) / results.length) : 0}</span><span class="instructor-stat-label">Avg Score</span></div>
          <div class="instructor-stat"><span class="instructor-stat-num">${results.filter(r => r.verdict === 'won').length}</span><span class="instructor-stat-label">Cases Won</span></div>
        </div>

        <h2 style="margin-bottom:0.75rem;">Students (${studentKeys.length})</h2>

        ${allClasses.length > 1 ? `
        <div class="lb-tabs" style="margin-bottom:1rem;">
          <button class="lb-tab active" onclick="Screens._filterByClass('all', this)">All Classes</button>
          ${allClasses.map(c => `<button class="lb-tab" onclick="Screens._filterByClass('${c}', this)">${c}</button>`).join('')}
        </div>
        ` : ''}

        <div id="instructor-students">${studentCards}</div>

        <div style="margin-top:2rem;padding:1rem;background:rgba(255,255,255,0.03);border-radius:8px;">
          <h3 style="margin:0 0 0.5rem;">How to collect data</h3>
          <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;">
            Data is stored in each student\u2019s browser. To collect:<br>
            \u2022 <strong>In class:</strong> Open <code>?instructor=true</code> on their device<br>
            \u2022 <strong>Remote:</strong> Students open <code>?instructor=true</code>, click Export, and email you the file<br>
            \u2022 <strong>Developer feedback:</strong> Available at <code>?dev=true</code> (separate from this panel)
          </p>
        </div>
      `;

      container.appendChild(screen);
    },

    // ========================
    // DEVELOPER PANEL
    // ========================
    renderDeveloperPanel(container) {
      const feedback = Game.getFeedbackLog();
      const results = Game.getDetailedResults();
      const screen = document.createElement('div');
      screen.className = 'screen';

      let feedbackRows = '';
      if (feedback.length === 0) {
        feedbackRows = '<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);">No feedback submitted yet.</td></tr>';
      } else {
        feedback.forEach((f, i) => {
          const typeColors = { 'flag-error': '#f87171', 'flag-unclear': '#fbbf24', 'flag-bug': '#f97316', 'suggestion': '#818cf8', 'general': '#8a8f98' };
          const tc = typeColors[f.type] || '#8a8f98';
          feedbackRows += `<tr>
            <td>${f.studentName || 'Anon'}</td>
            <td>${f.caseNumber ? 'Case ' + String(f.caseNumber).padStart(2, '0') : 'General'}</td>
            <td style="color:${tc}">${f.type || ''}</td>
            <td>${f.screen || ''}</td>
            <td style="max-width:300px;word-wrap:break-word;">${f.text || ''}</td>
            <td>${f.timestamp ? new Date(f.timestamp).toLocaleString() : ''}</td>
          </tr>`;
        });
      }

      screen.innerHTML = `
        <div class="screen-header">
          <h1>\uD83D\uDEE0\uFE0F Developer Panel</h1>
          <p class="subtitle">Bug reports, feedback flags, and raw data. Access via <code>?dev=true</code></p>
        </div>

        <div style="display:flex;gap:0.75rem;margin-bottom:2rem;flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="Game.downloadExport()">\u2B07 Export All Data (JSON)</button>
          <button class="btn btn-ghost" onclick="if(confirm('Clear ALL feedback? This cannot be undone.')){localStorage.removeItem('drc_feedback');location.reload();}">\uD83D\uDDD1 Clear Feedback</button>
          <button class="btn btn-ghost" onclick="if(confirm('Clear ALL student results? This cannot be undone.')){localStorage.removeItem('drc-detailed-results');localStorage.removeItem('drc-progress');location.reload();}">\uD83D\uDDD1 Clear Results</button>
          <button class="btn btn-ghost" onclick="if(confirm('Factory reset? Clears everything including student identity.')){localStorage.clear();location.reload();}">\u26A0\uFE0F Factory Reset</button>
          <button class="btn btn-ghost" onclick="window.location.href=window.location.pathname;">Back to Game</button>
        </div>

        <div class="instructor-summary-bar">
          <div class="instructor-stat"><span class="instructor-stat-num">${feedback.length}</span><span class="instructor-stat-label">Feedback Items</span></div>
          <div class="instructor-stat"><span class="instructor-stat-num">${feedback.filter(f => f.type === 'flag-error').length}</span><span class="instructor-stat-label">Legal Errors</span></div>
          <div class="instructor-stat"><span class="instructor-stat-num">${feedback.filter(f => f.type === 'flag-bug').length}</span><span class="instructor-stat-label">Bug Reports</span></div>
          <div class="instructor-stat"><span class="instructor-stat-num">${results.length}</span><span class="instructor-stat-label">Total Results</span></div>
        </div>

        <h2 style="margin-bottom:0.75rem;">Feedback & Flags (${feedback.length})</h2>
        <div style="overflow-x:auto;margin-bottom:2rem;">
          <table class="instructor-table">
            <thead><tr><th>From</th><th>Case</th><th>Type</th><th>Screen</th><th>Feedback</th><th>Time</th></tr></thead>
            <tbody>${feedbackRows}</tbody>
          </table>
        </div>

        <h2 style="margin-bottom:0.75rem;">Raw localStorage Keys</h2>
        <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:1rem;font-size:0.8rem;color:var(--text-secondary);font-family:monospace;">
          ${Object.keys(localStorage).filter(k => k.startsWith('drc')).map(k => {
            const val = localStorage.getItem(k);
            const size = val ? (val.length / 1024).toFixed(1) + ' KB' : '0 KB';
            return `<div style="margin-bottom:0.3rem;"><strong>${k}</strong> (${size})</div>`;
          }).join('') || '<p>No DRC data found.</p>'}
        </div>
      `;

      container.appendChild(screen);
    },

    async _addClassCode() {
      const labelInput = document.getElementById('new-class-label');
      const codeInput = document.getElementById('new-access-code');
      const msg = document.getElementById('access-code-msg');
      const label = (labelInput.value || '').trim();
      const code = (codeInput.value || '').trim().toUpperCase();
      if (!label) { msg.style.color = '#f87171'; msg.textContent = 'Enter a class name.'; return; }
      if (!code || code.length < 4) { msg.style.color = '#f87171'; msg.textContent = 'Code must be at least 4 characters.'; return; }
      const hash = await Game._sha256(code);
      msg.style.color = '#4ade80';
      msg.textContent = `Hash for "${label}" (code: ${code}): '${hash}': '${label}'  — Add this line to _classCodes in engine.js.`;
      try {
        await navigator.clipboard.writeText(`      '${hash}': '${label}',   // ${code}`);
        msg.textContent += ' Copied to clipboard!';
      } catch(e) {}
      labelInput.value = '';
      codeInput.value = '';
    },

    _filterByClass(className, btn) {
      // Toggle active tab
      document.querySelectorAll('.lb-tabs .lb-tab').forEach(t => t.classList.remove('active'));
      if (btn) btn.classList.add('active');

      // Show/hide student cards
      document.querySelectorAll('.instructor-student-card').forEach(card => {
        if (className === 'all' || card.dataset.class === className) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    },

    _revokeAllAccess() {
      if (!confirm('This will clear the access-granted flag from THIS browser. To lock out all students, you must also change the access code hash in engine.js. Continue?')) return;
      localStorage.removeItem('drc-access-granted');
      const msg = document.getElementById('access-code-msg');
      if (msg) {
        msg.style.color = '#fbbf24';
        msg.textContent = 'Access revoked on this device. Change the code hash in engine.js to lock out all students.';
      }
    },

    _downloadCSV() {
      const results = Game.getDetailedResults();
      if (results.length === 0) { alert('No results to export.'); return; }

      let csv = 'Student,Case Number,Case Title,Total Score,Verdict,Evidence,CrossExam,Courtroom,Date\\n';
      results.forEach(r => {
        csv += [
          '"' + (r.studentName || '') + '"',
          r.caseNumber || '',
          '"' + (r.caseTitle || '') + '"',
          r.totalScore,
          r.verdict,
          r.evidence ? r.evidence.earned + '/' + r.evidence.possible : '',
          r.crossExam ? r.crossExam.earned + '/' + r.crossExam.possible : '',
          r.courtroom ? r.courtroom.earned + '/' + r.courtroom.possible : '',
          r.timestamp ? new Date(r.timestamp).toLocaleDateString() : ''
        ].join(',') + '\\n';
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'drc-results-' + new Date().toISOString().slice(0,10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
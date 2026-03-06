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
            <span class="case-number">#${c.number}</span>
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
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title}
          </div>
          <span class="framework-tag ${frameworkClass}">${caseData.frameworkLabel}</span>
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
      grid.innerHTML = '';
  
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
  
      const impactLabel = question.impact === 'positive' ? 'Effective Line of Questioning'
        : question.impact === 'negative' ? 'This Hurt Your Case'
        : 'Limited Impact';
  
      const impactBox = document.createElement('div');
      impactBox.className = `feedback-box ${impactClass} ce-impact`;
      impactBox.innerHTML = `
        <div class="feedback-title">${impactLabel}</div>
        <div class="feedback-text">${question.impactExplanation}</div>
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
      if (grid) grid.style.display = 'none';
      if (label) label.style.display = 'none';
  
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
  
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb">
            <a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Courtroom
          </div>
          <h1>Courtroom Phase</h1>
          <p class="subtitle">Respond to opposing counsel's arguments before ${caseData.courtroom.judgeName}</p>
        </div>
  
        ${this._renderPhaseIndicator('courtroom')}
  
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
  
      // Write-first gate (v5: hidden keyword validation with retry)
      const writePrompt = arg.writePrompt || 'How would you respond to opposing counsel\'s argument?';
      const minWords = arg.minWords || 15;
      const reqConcepts = arg.requiredConcepts || [];

      if (!this._argConcepts) this._argConcepts = {};
      this._argConcepts[index] = reqConcepts;
      if (!this._retryUsed) this._retryUsed = {};

      const writeGate = document.createElement('div');
      writeGate.className = 'write-first-container';
      writeGate.id = `write-gate-court-${index}`;

      writeGate.innerHTML = `
        <div class="write-first-prompt">${writePrompt}</div>
        <div class="write-first-instruction">Draft your counter-argument before seeing the response options. Minimum ${minWords} words.</div>
        <textarea class="write-first-textarea" id="wf-court-${index}-text"
                  placeholder="Your Honour, I must object to opposing counsel's characterisation..."
                  oninput="Screens._updateWordOnly(${index}, ${minWords})"></textarea>
        <div class="write-first-footer">
          <span class="write-first-charcount" id="wf-court-${index}-count">0 words</span>
          <button class="btn btn-primary" id="wf-court-${index}-btn" onclick="Screens._submitWriteAndCheck(${index})" disabled>
            Submit My Response
          </button>
        </div>
        <div class="keyword-feedback" id="wf-court-${index}-feedback" style="display:none"></div>
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
  
    // v5: Word count only (no keywords shown during writing)
    _updateWordOnly(argIndex, minWords) {
      const textarea = document.getElementById(`wf-court-${argIndex}-text`);
      const countEl = document.getElementById(`wf-court-${argIndex}-count`);
      const btn = document.getElementById(`wf-court-${argIndex}-btn`);
      const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
      countEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
      const wordsOk = words >= minWords;
      if (wordsOk) countEl.classList.add('sufficient');
      else countEl.classList.remove('sufficient');
      if (btn) btn.disabled = !wordsOk;
    },

    // v5: Submit -> check keywords behind the scenes -> feedback or proceed
    _submitWriteAndCheck(index) {
      const text = document.getElementById(`wf-court-${index}-text`).value;
      Game.recordWrittenAnswer(`courtroom_${index}`, text);

      const reqConcepts = (this._argConcepts && this._argConcepts[index]) || [];

      // No keywords defined -> proceed directly
      if (reqConcepts.length === 0) {
        document.getElementById(`write-gate-court-${index}`).style.display = 'none';
        document.getElementById(`court-options-${index}`).style.display = 'block';
        return;
      }

      const result = Game.checkKeywords(text, reqConcepts);

      if (result.passed) {
        // Passed! Show brief success + proceed
        const fb = document.getElementById(`wf-court-${index}-feedback`);
        fb.style.display = 'block';
        fb.innerHTML = `<div class="kw-feedback-pass">
          <div class="kw-feedback-title">✅ Good analysis — you addressed the key legal concepts.</div>
        </div>`;
        setTimeout(() => {
          document.getElementById(`write-gate-court-${index}`).style.display = 'none';
          document.getElementById(`court-options-${index}`).style.display = 'block';
        }, 1200);
        return;
      }

      // Failed - show feedback with concepts revealed
      const isRetry = this._retryUsed && this._retryUsed[index];

      if (isRetry) {
        // Second attempt - unlock options regardless but still show feedback
        const fb = document.getElementById(`wf-court-${index}-feedback`);
        fb.style.display = 'block';
        fb.innerHTML = this._buildKeywordFeedback(result, reqConcepts, false);
        setTimeout(() => {
          document.getElementById(`write-gate-court-${index}`).style.display = 'none';
          document.getElementById(`court-options-${index}`).style.display = 'block';
        }, 2500);
        return;
      }

      // First attempt failed - show feedback + allow retry
      this._retryUsed[index] = true;
      const fb = document.getElementById(`wf-court-${index}-feedback`);
      fb.style.display = 'block';
      fb.innerHTML = this._buildKeywordFeedback(result, reqConcepts, true);

      // Re-enable textarea and button for retry
      const btn = document.getElementById(`wf-court-${index}-btn`);
      btn.textContent = 'Retry My Response';
      btn.disabled = false;

      // Scroll to feedback
      fb.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    _buildKeywordFeedback(result, reqConcepts, canRetry) {
      const conceptHtml = result.concepts.map(c => {
        const chips = [...c.matched.map(kw =>
          `<span class="keyword-chip matched">${kw}</span>`
        ), ...c.missed.map(kw =>
          `<span class="keyword-chip missed">${kw}</span>`
        )].join('');
        const icon = c.passed ? '✅' : '❌';
        return `<div class="concept-feedback-group">
          <div class="concept-feedback-name">${icon} ${c.name} (${c.matched.length}/${c.matched.length + c.missed.length})</div>
          <div class="keyword-chips">${chips}</div>
        </div>`;
      }).join('');

      // Get hints from first failing concept
      let hintHtml = '';
      if (canRetry) {
        const failingConcept = reqConcepts.find((rc, i) => !result.concepts[i].passed);
        if (failingConcept && failingConcept.hints && failingConcept.hints.length > 0) {
          hintHtml = `<div class="kw-hint"><strong>Hint:</strong> ${failingConcept.hints[0]}</div>`;
        }
      }

      const retryMsg = canRetry
        ? '<div class="kw-retry-msg">Revise your answer above and try again. The concepts you missed are shown in red.</div>'
        : '<div class="kw-retry-msg">Moving to the response options. Review the concepts above to strengthen your understanding.</div>';

      return `<div class="kw-feedback-fail">
        <div class="kw-feedback-title">⚠️ Your response missed some key legal concepts (${result.totalMatched}/${result.totalKeywords})</div>
        ${conceptHtml}
        ${hintHtml}
        ${retryMsg}
      </div>`;
    },

    _updateWordCount(textareaId, countId, minWords, btnId) {
      const textarea = document.getElementById(textareaId);
      const countEl = document.getElementById(countId);
      const btn = document.getElementById(btnId);
      const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
      countEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
      if (words >= minWords) { countEl.classList.add('sufficient'); if (btn) btn.disabled = false; }
      else { countEl.classList.remove('sufficient'); if (btn) btn.disabled = true; }
    },

    _submitCourtWriteGate(index) {
      const textareaId = `wf-court-${index}-text`;
      const text = document.getElementById(textareaId).value;
      Game.recordWrittenAnswer(`courtroom_${index}`, text);
      document.getElementById(`write-gate-court-${index}`).style.display = 'none';
      document.getElementById(`court-options-${index}`).style.display = 'block';
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
        </div>
  
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
    }
  };
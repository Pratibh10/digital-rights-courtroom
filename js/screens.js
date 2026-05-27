/* ============================================
   DIGITAL RIGHTS COURTROOM — Screen Renderers v4
   4-option courtroom + evidence citation challenge
   ============================================ */

   const Screens = {

    // ========================
    // DASHBOARD
    // ========================
    renderDashboard(container) {
      this._dashActiveFilters = { fw: 'all', status: 'all' };
      const screen = document.createElement('div');
      screen.className = 'screen';

      const completedCases = Game.state.completedCases;
      const completedIds   = Object.keys(completedCases);
      const completedCount = completedIds.length;
      const totalCases     = CASES.filter(c => c.evidence.length > 0).length;

      const scores    = completedIds.map(id => completedCases[id].score).filter(s => s !== undefined);
      const avgScore  = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
      const bestScore = scores.length ? Math.max(...scores) : 0;
      const winCount  = completedIds.filter(id => completedCases[id].verdict === 'won').length;
      const winRate   = completedCount ? Math.round(100*winCount/completedCount) : 0;

      const fwMeta = [
        {key:'ai-act', label:'AI Act', color:'#4a90d9'},
        {key:'gdpr',   label:'GDPR',   color:'#4a9e6a'},
        {key:'dsa',    label:'DSA',    color:'#d4843a'},
        {key:'dma',    label:'DMA',    color:'#9a6ad9'},
      ];
      const fwStats = fwMeta.map(fw => {
        const total = CASES.filter(c => c.framework===fw.key && c.evidence.length>0).length;
        const done  = completedIds.filter(id => { const c=CASES.find(ca=>ca.id===id); return c&&c.framework===fw.key; }).length;
        return {...fw, total, done, pct: total ? Math.round(100*done/total) : 0};
      });

      const myId = Game.state.studentId, myName = Game.state.studentName;
      const playCounts = {};
      Game.getDetailedResults().forEach(r => {
        if (r.studentId===myId||r.studentName===myName) playCounts[r.caseId]=(playCounts[r.caseId]||0)+1;
      });

      const classLabel = Game.state.className ? ' \u2022 '+Game.state.className : '';

      const statCard = (num, denom, label) => `
        <div style="flex:1;min-width:88px;text-align:center;padding:0.85rem 0.75rem;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);">
          <div style="font-family:var(--font-heading);font-size:1.5rem;font-weight:700;color:var(--accent-gold);line-height:1.1;margin-bottom:0.15rem;">${num}<span style="font-size:0.85rem;color:var(--text-muted);font-weight:400;">${denom}</span></div>
          <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-muted);">${label}</div>
        </div>`;

      const statsHTML = completedCount > 0 ? `
        <div style="display:flex;gap:0.75rem;margin:1.5rem 0 1rem;flex-wrap:wrap;">
          ${statCard(completedCount, '/'+totalCases, 'Cases Done')}
          ${statCard(avgScore, '', 'Avg Score')}
          ${statCard(winRate, '%', 'Win Rate')}
          ${statCard(bestScore, '', 'Best Score')}
          <div style="flex:1;min-width:88px;text-align:center;padding:0.85rem 0.75rem;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);">
            <div id="dash-rank-val" style="font-family:var(--font-heading);font-size:1.5rem;font-weight:700;color:var(--accent-gold);line-height:1.1;margin-bottom:0.15rem;">&mdash;</div>
            <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-muted);">Class Rank</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem 1.5rem;margin-bottom:1.5rem;padding:1rem 1.25rem;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);">
          ${fwStats.map(fw=>`
            <div style="display:flex;align-items:center;gap:0.6rem;">
              <span style="font-size:0.78rem;font-weight:600;color:${fw.color};min-width:44px;">${fw.label}</span>
              <div style="flex:1;height:5px;background:var(--bg-hover);border-radius:100px;overflow:hidden;">
                <div style="height:100%;width:${fw.pct}%;background:${fw.color};border-radius:100px;transition:width 0.6s;"></div>
              </div>
              <span style="font-size:0.72rem;color:var(--text-muted);min-width:32px;text-align:right;">${fw.done}/${fw.total}</span>
            </div>`).join('')}
        </div>` : '';

      const studentBadge = Game.state.studentName
        ? `<div class="student-badge">\uD83C\uDF93 ${Game.state.studentName}${classLabel}</div>`
        : '';

      screen.innerHTML = `
        <div class="dashboard-hero">
          <img src="img/uni-vienna-logo.png" alt="University of Vienna" class="dashboard-uni-logo" onerror="this.style.display='none'">
          ${studentBadge}
          <h1>Digital Rights Courtroom</h1>
          <p class="tagline">A Litigation Simulator for EU Digital Law</p>
          <p class="uni-credit">University of Vienna &bull; Department of Innovation and Digitalisation in Law</p>
        </div>
        ${statsHTML}
        <div class="divider"></div>
        <div style="margin-bottom:1.25rem;">
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:0.5rem;" id="fw-filter-tabs">
            <button class="dash-filter-tab active" data-fw="all" onclick="Screens._dashFilter(this,'fw')">All <span style="font-size:0.7rem;opacity:0.7;">${totalCases}</span></button>
            ${fwStats.map(fw=>`<button class="dash-filter-tab" data-fw="${fw.key}" onclick="Screens._dashFilter(this,'fw')">${fw.label} <span style="font-size:0.7rem;opacity:0.7;">${fw.total}</span></button>`).join('')}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem;" id="status-filter-tabs">
            <button class="dash-filter-tab active" data-status="all" onclick="Screens._dashFilter(this,'status')">All</button>
            <button class="dash-filter-tab" data-status="pending" onclick="Screens._dashFilter(this,'status')">Not started</button>
            <button class="dash-filter-tab" data-status="completed" onclick="Screens._dashFilter(this,'status')">Completed</button>
          </div>
        </div>
        <div class="cases-grid" id="cases-grid"></div>
        <div class="divider"></div>
        <div class="dashboard-footer">
          <button class="btn btn-ghost" onclick="Game.showScreen('leaderboard')">\uD83C\uDFC6 Leaderboard</button>
          <button class="btn btn-ghost" onclick="Game.downloadMyResults()">\uD83D\uDCE5 Export My Results</button>
          <button class="btn btn-ghost" onclick="Game.showScreen('taxonomy')">Scenario Library (${TAXONOMY.length} Types)</button>
          <button class="btn btn-ghost" onclick="Codex.toggle()">Legal Codex</button>
          <a href="about.html" class="btn btn-ghost" target="_blank">About &amp; Methodology</a>
        </div>
      `;

      container.appendChild(screen);
      this._dashRenderCards(playCounts);

      if (completedCount > 0 && Game.state.className) {
        Game.fetchResultsFromSupabase().then(all => {
          const cr = all.filter(r => r.class_name === Game.state.className);
          const st = {};
          cr.forEach(r => {
            const k = r.student_id||r.student_name;
            if (!st[k]) st[k] = {};
            const cn = r.case_number;
            if (!st[k][cn] || r.total_score > st[k][cn]) st[k][cn] = r.total_score;
          });
          const ranked = Object.entries(st)
            .map(([id,cs]) => ({id, total:Object.values(cs).reduce((a,b)=>a+b,0)}))
            .sort((a,b) => b.total - a.total);
          const rank = ranked.findIndex(s => s.id === myId) + 1;
          const el = document.getElementById('dash-rank-val');
          if (el && rank > 0) el.textContent = '#'+rank;
        }).catch(() => {});
      }
    },

    _dashActiveFilters: {fw:'all', status:'all'},

    _dashFilter(btn, type) {
      const gid = type === 'fw' ? 'fw-filter-tabs' : 'status-filter-tabs';
      document.querySelectorAll('#'+gid+' .dash-filter-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      if (type === 'fw') this._dashActiveFilters.fw = btn.dataset.fw;
      else               this._dashActiveFilters.status = btn.dataset.status;
      const pc = {};
      Game.getDetailedResults().forEach(r => {
        if (r.studentId === Game.state.studentId || r.studentName === Game.state.studentName)
          pc[r.caseId] = (pc[r.caseId]||0)+1;
      });
      this._dashRenderCards(pc);
    },

    _dashRenderCards(playCounts) {
      const grid = document.getElementById('cases-grid');
      if (!grid) return;
      grid.innerHTML = '';
      const {fw, status} = this._dashActiveFilters;
      const cc  = Game.state.completedCases;
      const vc  = {won:'#4a9e6a', won_with_reservations:'#d4a843', lost:'#c94a4a', dismissed:'#6a6a80'};
      const vl  = {won:'Won', won_with_reservations:'Partial', lost:'Lost', dismissed:'Dismissed'};
      const ftc = {'ai-act':'tag-ai-act', 'gdpr':'tag-gdpr', 'dsa':'tag-dsa', 'dma':'tag-dma', 'data-act':'tag-data-act'};

      const filtered = CASES.filter(c => {
        if (fw !== 'all' && c.framework !== fw) return false;
        if (status === 'pending'   &&  cc[c.id]) return false;
        if (status === 'completed' && !cc[c.id]) return false;
        return true;
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:2rem;grid-column:1/-1;">No cases match this filter.</p>';
        return;
      }

      filtered.forEach(c => {
        const comp    = cc[c.id];
        const playable = c.evidence.length > 0;
        const plays   = playCounts[c.id] || (comp ? 1 : 0);
        const card    = document.createElement('div');
        card.className = 'case-card' + (playable ? '' : ' case-card-locked') + (comp ? ' case-card-completed' : '');

        if (comp) {
          const color = vc[comp.verdict] || '#6a6a80';
          card.style.cssText = 'border-color:' + color + ';border-top-width:4px;';
          card.innerHTML = `
            <div class="case-card-header">
              <span class="case-number">Case ${String(c.number).padStart(2,'0')}</span>
              <span class="framework-tag ${ftc[c.framework]||''}">${c.frameworkLabel}</span>
            </div>
            <h3 class="case-title">${c.title}</h3>
            <div style="display:flex;align-items:center;gap:8px;margin:0.5rem 0 0.3rem;">
              <span style="font-size:1.5rem;font-weight:700;color:${color};line-height:1;">${comp.score}</span>
              <span style="font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:100px;background:${color}25;color:${color};">${vl[comp.verdict]||comp.verdict}</span>
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${plays > 1 ? plays + ' plays &middot; Best: ' : ''}${comp.score}/100</div>
          `;
        } else {
          card.innerHTML = `
            <div class="case-card-header">
              <span class="case-number">Case ${String(c.number).padStart(2,'0')}</span>
              <span class="framework-tag ${ftc[c.framework]||''}">${c.frameworkLabel}</span>
            </div>
            <h3 class="case-title">${c.title}</h3>
            <p class="case-subtitle">${c.subtitle}</p>
            <div class="case-meta">
              <span class="case-difficulty">${c.difficulty}</span>
              ${c.primaryArticles ? `<span class="case-articles">${c.primaryArticles.join(', ')}</span>` : ''}
            </div>
            ${!playable ? '<div class="case-locked-badge">Coming Soon</div>' : ''}
          `;
        }
        if (playable) card.onclick = () => Game.startCase(c.id);
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
  
        <div class="text-center mt-xl" style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-ghost" onclick="Game.goToDashboard()">&larr; Back to Dashboard</button>
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
        if (!confirm(`You have reviewed ${readCount} of ${total} documents. Unread evidence may affect your score. Continue anyway?`)) {
          return;
        }
      }

      // If the case has a frameworkQuestion in analysis, show it as a quick MCQ
      const fwq = caseData.analysis && caseData.analysis.frameworkQuestion;
      if (!fwq || !fwq.options || fwq.options.length === 0) {
        Game.showScreen('cross-examination');
        return;
      }

      // Replace proceed button area with inline MCQ
      const btn = document.getElementById('proceed-crossexam-btn');
      if (!btn) { Game.showScreen('cross-examination'); return; }

      const parent = btn.parentElement;
      parent.innerHTML = `
        <div id="ev-mcq-panel" style="max-width:680px;margin:0 auto;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:10px;padding:1.5rem;">
          <p style="font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--accent-gold);margin-bottom:0.4rem;">Before you proceed</p>
          <p style="font-size:0.95rem;color:var(--text-primary);margin-bottom:1.25rem;font-family:var(--font-heading);">${fwq.prompt}</p>
          <div style="display:flex;flex-direction:column;gap:0.5rem;" id="ev-mcq-options">
            ${[...fwq.options].sort(() => Math.random() - 0.5).map(opt => `
              <button class="ev-mcq-btn" data-id="${opt.id}" onclick="Screens._submitEvMCQ('${opt.id}')"
                style="text-align:left;padding:0.75rem 1rem;background:var(--bg-primary);border:1.5px solid var(--border-subtle);border-radius:8px;color:var(--text-primary);font-size:0.88rem;cursor:pointer;line-height:1.5;transition:all 0.15s;">
                ${opt.label}
              </button>
            `).join('')}
          </div>
          <div id="ev-mcq-feedback" style="margin-top:1rem;"></div>
        </div>
      `;
    },

    _submitEvMCQ(chosenId) {
      const caseData = Game.state.currentCase;
      const fwq = caseData.analysis.frameworkQuestion;
      const correct = chosenId === fwq.correct;
      const chosenOpt = fwq.options.find(o => o.id === chosenId);

      // Disable all buttons
      document.querySelectorAll('.ev-mcq-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'default';
        if (btn.dataset.id === fwq.correct) {
          btn.style.borderColor = '#4ade80';
          btn.style.background = 'rgba(74,222,128,0.07)';
        } else if (btn.dataset.id === chosenId && !correct) {
          btn.style.borderColor = '#f87171';
          btn.style.background = 'rgba(248,113,113,0.07)';
        } else {
          btn.style.opacity = '0.45';
        }
      });

      // Record a small bonus/penalty in cross-exam results
      Game.state.crossExamResults.totalScore += correct ? 3 : 0;

      const feedback = document.getElementById('ev-mcq-feedback');
      feedback.innerHTML = `
        <div style="padding:0.75rem 1rem;border-radius:7px;border-left:3px solid ${correct ? '#4ade80' : '#f87171'};background:rgba(255,255,255,0.03);font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
          <strong style="color:${correct ? '#4ade80' : '#f87171'};">${correct ? '✅ Correct.' : '❌ Not quite.'}</strong>
          ${chosenOpt ? ' ' + chosenOpt.feedback : ''}
        </div>
        <div class="text-center">
          <button class="btn btn-primary" onclick="Game.showScreen('cross-examination')">
            Proceed to Witness Examination &rarr;
          </button>
        </div>
      `;
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            <div class="breadcrumb"><a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Cross-Examination</div>
            <h1>Witness Examination</h1>
          </div>
          ${this._renderPhaseIndicator('cross-examination')}
          <p class="text-muted">Cross-examination content is being developed for this case.</p>
          <button class="btn btn-primary btn-large mt-xl" onclick="Game.showScreen('courtroom')">Proceed to Courtroom &rarr;</button>
        `;
        container.appendChild(screen);
        return;
      }

      // Shuffle questions so position doesn't give away the answer
      const shuffled = [...ce.questions].sort(() => Math.random() - 0.5);

      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb"><a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / ${caseData.title} / Witness Examination</div>
          <h1>Witness Examination</h1>
          <p class="subtitle">${ce.context || 'Select 3 questions to put to the witness.'}</p>
        </div>

        ${this._renderPhaseIndicator('cross-examination')}

        <div class="cross-exam-layout">
          <div class="witness-box">
            <div class="witness-icon">&#x1F9D1;&#x200D;&#x2696;&#xFE0F;</div>
            <div class="witness-name">${ce.witness.name}</div>
            <div class="witness-role">${ce.witness.role}</div>
            <div class="witness-background">${ce.witness.background || ''}</div>
            <div class="questions-remaining" id="ce-counter">
              Selected: <strong id="ce-count">0</strong> of 3
            </div>
          </div>

          <div class="exam-area">
            <div class="dialogue-bubble judge" style="margin-bottom:1.25rem;opacity:1;">
              <div class="speaker-name">${caseData.courtroom.judgeName}</div>
              <div class="speaker-text">Counsel, you may examine the witness. Select the three questions you wish to put to them.</div>
            </div>

            <div class="ce-strategy-tip">
              <strong>Strategy:</strong> Choose carefully. Effective questions use evidence to force admissions. Risky questions let the witness reframe. Ineffective questions waste your limited turns.
            </div>

            <div id="ce-question-list" style="display:flex;flex-direction:column;gap:0.6rem;margin-bottom:1.5rem;">
              ${shuffled.map((q, i) => `
                <label class="ce-pick-card" id="ce-card-${q.id}" style="display:flex;align-items:flex-start;gap:0.75rem;padding:0.85rem 1rem;background:var(--bg-surface);border:1.5px solid var(--border-subtle);border-radius:10px;cursor:pointer;transition:all 0.15s;">
                  <input type="checkbox" class="ce-checkbox" id="ce-cb-${q.id}" data-id="${q.id}" data-idx="${i}"
                    style="margin-top:3px;flex-shrink:0;width:16px;height:16px;accent-color:var(--accent-gold);"
                    onchange="Screens._cePick(this)">
                  <span class="ce-question-text" style="font-size:0.9rem;line-height:1.5;color:var(--text-primary);">${q.questionText}</span>
                </label>
              `).join('')}
            </div>

            <div class="text-center">
              <button class="btn btn-primary btn-large" id="ce-submit-btn" onclick="Screens._ceSubmit()" disabled>
                Ask These 3 Questions &rarr;
              </button>
            </div>

            <div id="ce-results" style="margin-top:2rem;"></div>
          </div>
        </div>
      `;

      container.appendChild(screen);

      // Store shuffled for result rendering
      this._ceShuffled = shuffled;
      this._ceCase = caseData;
    },

    _cePick(checkbox) {
      const checked = document.querySelectorAll('.ce-checkbox:checked');
      const count = checked.length;

      // Update counter
      document.getElementById('ce-count').textContent = count;

      // Style selected cards
      document.querySelectorAll('.ce-pick-card').forEach(card => {
        const cb = card.querySelector('.ce-checkbox');
        if (cb.checked) {
          card.style.borderColor = 'var(--accent-gold)';
          card.style.background = 'rgba(201,168,76,0.06)';
        } else {
          card.style.borderColor = 'var(--border-subtle)';
          card.style.background = 'var(--bg-surface)';
        }
      });

      // Disable unchosen if 3 already selected
      document.querySelectorAll('.ce-checkbox').forEach(cb => {
        if (!cb.checked) {
          cb.disabled = count >= 3;
          cb.closest('.ce-pick-card').style.opacity = (count >= 3) ? '0.45' : '1';
          cb.closest('.ce-pick-card').style.cursor = (count >= 3) ? 'default' : 'pointer';
        }
      });

      document.getElementById('ce-submit-btn').disabled = (count !== 3);
    },

    _ceSubmit() {
      const caseData = this._ceCase;
      const ce = caseData.crossExamination;
      const checked = [...document.querySelectorAll('.ce-checkbox:checked')].map(cb => cb.dataset.id);

      // Lock UI
      document.querySelectorAll('.ce-checkbox').forEach(cb => cb.disabled = true);
      document.getElementById('ce-submit-btn').style.display = 'none';

      // Score and record
      let totalScore = 0;
      const chosen = checked.map(id => ce.questions.find(q => q.id === id));

      chosen.forEach(q => {
        let score = 0;
        if (q.category === 'effective') score = 10;
        else if (q.category === 'risky') score = 5;
        else score = 2;
        totalScore += score;
        Game.recordCrossExamQuestion(q.id, q.impact, false, score);
      });

      // Render results
      const results = document.getElementById('ce-results');

      // Judge dismissal
      results.innerHTML = `
        <div class="judge-ruling" style="margin-bottom:1.5rem;">
          <div class="judge-ruling-header">
            <span class="judge-gavel">&#x2696;&#xFE0F;</span>
            <span class="speaker-name" style="color:var(--accent-gold);">${caseData.courtroom.judgeName}</span>
          </div>
          <div class="ruling-text">Thank you, Counsel. The witness is dismissed. We will now hear oral arguments.</div>
        </div>
      `;

      // Show each chosen Q+A with impact feedback
      chosen.forEach(q => {
        const impactColor = q.impact === 'positive' ? '#4ade80' : q.impact === 'negative' ? '#f87171' : '#eab308';
        const impactLabel = q.impact === 'positive' ? '&#x2705; Effective' : q.impact === 'negative' ? '&#x274C; Backfired' : '&#x26A0;&#xFE0F; Limited Impact';

        results.innerHTML += `
          <div style="margin-bottom:1.25rem;">
            <div class="dialogue-bubble player" style="opacity:1;margin-bottom:0.5rem;">
              <div class="speaker-name">You</div>
              <div class="speaker-text">${q.questionText}</div>
            </div>
            <div class="dialogue-bubble witness" style="opacity:1;margin-bottom:0.5rem;">
              <div class="speaker-name">${ce.witness.name}</div>
              <div class="speaker-text">${q.witnessResponse}</div>
            </div>
            <div style="padding:0.65rem 0.9rem;border-radius:7px;background:rgba(255,255,255,0.03);border-left:3px solid ${impactColor};font-size:0.83rem;color:var(--text-secondary);">
              <strong style="color:${impactColor};">${impactLabel}</strong> — ${q.impactExplanation}
            </div>
          </div>
        `;
      });

      // Summary + proceed
      const effectiveCount = chosen.filter(q => q.impact === 'positive').length;
      results.innerHTML += `
        <div class="ce-summary" style="margin-top:1.5rem;">
          <div class="ce-summary-title">Examination Summary</div>
          <div class="ce-summary-stats">
            <div class="ce-stat"><span class="ce-stat-number">${effectiveCount}/3</span><span class="ce-stat-label">Effective Lines</span></div>
            <div class="ce-stat"><span class="ce-stat-number">${totalScore}</span><span class="ce-stat-label">Points Earned</span></div>
          </div>
        </div>
        <div class="text-center mt-xl" style="padding-bottom:var(--space-2xl);">
          <button class="btn btn-primary btn-large" onclick="Game.showScreen('courtroom')">
            Proceed to Courtroom &rarr;
          </button>
        </div>
      `;

      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  
      // Spot-the-Issue gate — student identifies the legal issue before seeing options
      const spotGate = document.createElement('div');
      spotGate.className = 'spot-issue-container';
      spotGate.id = `spot-gate-court-${index}`;
      const spotOptions = arg.spotOptions || Screens._defaultSpotOptions(caseData.framework);
      spotGate.innerHTML = `
        <div class="spot-issue-prompt">
          <span class="spot-issue-icon">⚖️</span>
          Before choosing your argument — what is the <strong>core legal issue</strong> in this round?
        </div>
        <div class="spot-issue-options" id="spot-options-${index}">
          ${spotOptions.map((opt, i) => `
            <button class="spot-issue-btn" onclick="Screens._selectSpotOption(${index}, ${i}, ${opt.correct === true})">
              ${opt.text}
            </button>`).join('')}
        </div>
      `;
      round.appendChild(spotGate);
  
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
  
    // Default spot-the-issue options per framework (fallback if case doesn't define them)
    _defaultSpotOptions(framework) {
      const defaults = {
        'ai-act': [
          { text: 'Whether the AI system constitutes a prohibited practice under Art. 5 or a high-risk system under Art. 6', correct: true },
          { text: 'Whether the platform has complied with notice-and-action obligations under the DSA' },
          { text: 'Whether the gatekeeper has breached interoperability obligations under the DMA' }
        ],
        'gdpr': [
          { text: 'Whether the processing satisfies a lawful basis under Art. 6 or Art. 9 GDPR' },
          { text: 'Whether automated decision-making produces legal effects without meaningful human intervention under Art. 22 GDPR', correct: true },
          { text: 'Whether the AI system is classified as high-risk under Annex III of the AI Act' }
        ],
        'dsa': [
          { text: 'Whether the gatekeeper has breached self-preferencing obligations under Art. 6(5) DMA' },
          { text: 'Whether the platform has fulfilled its systemic risk assessment or content moderation obligations under the DSA', correct: true },
          { text: 'Whether the AI system requires a fundamental rights impact assessment under Art. 27 AI Act' }
        ],
        'dma': [
          { text: 'Whether the platform qualifies as a VLOP and whether it has complied with DSA transparency obligations' },
          { text: 'Whether the gatekeeper has complied with its obligations under Art. 5 or Art. 6 of the DMA', correct: true },
          { text: 'Whether automated decision-making violates Art. 22 GDPR' }
        ]
      };
      const opts = defaults[framework] || defaults['ai-act'];
      // Shuffle so correct answer isn't always the same position
      return opts.sort(() => Math.random() - 0.5);
    },

    _selectSpotOption(index, optionIdx, isCorrect) {
      const container = document.getElementById(`spot-options-${index}`);
      if (!container) return;

      // Disable all buttons
      container.querySelectorAll('.spot-issue-btn').forEach((btn, i) => {
        btn.disabled = true;
        if (i === optionIdx) {
          btn.classList.add(isCorrect ? 'spot-correct' : 'spot-wrong');
        } else if (!isCorrect) {
          // Reveal correct one
          const opts = Game.state.currentCase.courtroom.arguments[index].spotOptions
            || this._defaultSpotOptions(Game.state.currentCase.framework);
          const shuffled = document.getElementById(`spot-options-${index}`)._shuffleMap;
          // Just mark them all — show brief feedback then proceed
        }
      });

      const gate = document.getElementById(`spot-gate-court-${index}`);
      const feedback = document.createElement('div');
      feedback.style.cssText = 'margin-top:0.75rem;font-size:0.85rem;padding:0.5rem 0.75rem;border-radius:6px;';

      if (isCorrect) {
        feedback.style.background = 'rgba(74,222,128,0.08)';
        feedback.style.color = '#4ade80';
        feedback.innerHTML = '\u2705 Correct — now choose your strongest legal argument:';
      } else {
        feedback.style.background = 'rgba(248,113,113,0.08)';
        feedback.style.color = '#f87171';
        feedback.innerHTML = '\u274C Not quite — review the case context. Now choose the strongest legal argument:';
      }

      gate.appendChild(feedback);

      // Reveal options after 800ms
      setTimeout(() => {
        gate.style.display = 'none';
        const optionsDiv = document.getElementById(`court-options-${index}`);
        if (optionsDiv) optionsDiv.style.display = 'block';
      }, 800);
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
          <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:0.75rem;">The model answer shows the ideal legal reasoning for this case — compare it with the arguments you chose above.</p>
          <div class="model-answer-toggle" onclick="
            const body = this.nextElementSibling;
            const show = body.style.display === 'none';
            body.style.display = show ? 'block' : 'none';
            this.textContent = show ? 'Hide Model Answer' : 'Show Model Answer';
          ">Show Model Answer</div>
          <div class="model-answer-content" style="display:none;">
            ${caseData.verdict.modelAnswer}
          </div>
        </div>
  
        <div class="text-center mt-2xl" style="padding-bottom: var(--space-2xl);">
          <button class="btn btn-primary btn-large" onclick="Game.goToDashboard()">
            Return to Dashboard
          </button>
          <div style="margin-top:0.75rem;">
            <button class="btn btn-ghost" onclick="Game.downloadMyResults()">\uD83D\uDCE5 Export My Results</button>
          </div>
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
              ${grouped[fw].map(t => {
                const caseData = CASES.find(c => c.number === t.id);
                const hasContent = caseData && caseData.evidence && caseData.evidence.length > 0;
                const caseId = caseData ? caseData.id : null;
                return `
                <div class="taxonomy-item ${hasContent ? 'playable' : 'locked'}">
                  <span class="taxonomy-id">${t.id}.</span>
                  <span class="taxonomy-title">${t.title}</span>
                  <span class="taxonomy-articles">${t.articles}</span>
                  ${hasContent && caseId ? `<button class="btn btn-ghost btn-sm" onclick="Game.startCase('${caseId}')">Play</button>` : '<span class="taxonomy-status">Coming Soon</span>'}
                </div>
              `}).join('')}
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

      // Store locally
      const feedbackLog = JSON.parse(localStorage.getItem('drc_feedback') || '[]');
      feedbackLog.push(entry);
      localStorage.setItem('drc_feedback', JSON.stringify(feedbackLog));

      // Send to Supabase (developer sees it from any device)
      Game.submitFeedbackToSupabase(entry);

      // Replace modal content with confirmation
      const modal = document.querySelector('.feedback-modal');
      if (modal) {
        modal.innerHTML = `
          <div class="feedback-modal-header">
            <h3>\u2713 Feedback Submitted</h3>
            <button class="feedback-modal-close" onclick="document.getElementById('feedback-modal-overlay').remove()">\u2715</button>
          </div>
          <div class="feedback-modal-body" style="text-align: center; padding: 2rem;">
            <p>Thank you! Your feedback has been recorded.</p>
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
      const screen = document.createElement('div');
      screen.className = 'screen';
      const myId = Game.state.studentId;
      const myClass = Game.state.className;

      // Show loading, then fetch from Supabase
      screen.innerHTML = `
        <div class="screen-header">
          <div class="breadcrumb"><a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / Leaderboard</div>
          <h1>\uD83C\uDFC6 Leaderboard</h1>
          <p class="subtitle">Loading scores...</p>
        </div>
      `;
      container.appendChild(screen);

      Game.fetchResultsFromSupabase().then(allResults => {
        // Filter to only the current student's class
        const results = myClass ? allResults.filter(r => r.class_name === myClass) : allResults;

        // Group by student, get BEST score per case (deduplicated)
        const students = {};
        results.forEach(r => {
          const key = r.student_id || r.student_name;
          if (!students[key]) students[key] = { name: r.student_name, id: r.student_id, cases: {} };
          const cn = r.case_number;
          if (!students[key].cases[cn] || r.total_score > students[key].cases[cn].score) {
            students[key].cases[cn] = { score: r.total_score, verdict: r.verdict, title: r.case_title };
          }
        });

        // Build ranking: sum of best scores per case
        const ranking = Object.values(students).map(s => {
          const caseList = Object.values(s.cases);
          return {
            name: s.name, id: s.id,
            totalScore: caseList.reduce((sum, c) => sum + (c.score || 0), 0),
            casesPlayed: caseList.length,
            avgScore: caseList.length ? Math.round(caseList.reduce((sum, c) => sum + (c.score || 0), 0) / caseList.length) : 0
          };
        }).sort((a, b) => b.totalScore - a.totalScore || b.casesPlayed - a.casesPlayed);

        // Top 3 + own position
        const medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
        let overallRows = '';
        if (ranking.length === 0) {
          overallRows = '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);padding:2rem;">No scores yet. Complete a case to appear on the leaderboard!</td></tr>';
        } else {
          ranking.slice(0, 3).forEach((s, i) => {
            const isMe = s.id === myId;
            const hl = isMe ? 'background:rgba(201,168,76,0.08);' : '';
            overallRows += `<tr style="${hl}">
              <td style="font-size:1.4rem;text-align:center;">${medals[i]}</td>
              <td><strong>${s.name}</strong>${isMe ? ' <span style="color:var(--accent-gold);font-size:0.75rem;">(you)</span>' : ''}</td>
              <td>${s.totalScore}</td>
              <td>${s.casesPlayed} cases (avg ${s.avgScore})</td>
            </tr>`;
          });
          const myRank = ranking.findIndex(s => s.id === myId);
          if (myRank >= 3) {
            const me = ranking[myRank];
            overallRows += `<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);font-size:0.8rem;">\u22EE</td></tr>`;
            overallRows += `<tr style="background:rgba(201,168,76,0.08);">
              <td style="text-align:center;color:var(--text-secondary);">${myRank + 1}</td>
              <td><strong>${me.name}</strong> <span style="color:var(--accent-gold);font-size:0.75rem;">(you)</span></td>
              <td>${me.totalScore}</td>
              <td>${me.casesPlayed} cases (avg ${me.avgScore})</td>
            </tr>`;
          }
        }

        screen.innerHTML = `
          <div class="screen-header">
            <div class="breadcrumb"><a href="#" onclick="Game.goToDashboard(); return false;">Dashboard</a> / Leaderboard</div>
            <h1>\uD83C\uDFC6 Leaderboard</h1>
            <p class="subtitle">Top 3 in ${myClass || 'your class'} \u2022 Best scores per case</p>
          </div>

          <div class="lb-panel" id="lb-panel-overall">
            <table class="instructor-table">
              <thead><tr><th>#</th><th>Student</th><th>Total Points</th><th>Performance</th></tr></thead>
              <tbody>${overallRows}</tbody>
            </table>
          </div>

          <div class="text-center mt-xl">
            <button class="btn btn-ghost" onclick="Game.goToDashboard()">&larr; Back to Dashboard</button>
          </div>
        `;
      });
    },


    // ========================
    // INSTRUCTOR PANEL
    // ========================
    // ========================
    // INSTRUCTOR PANEL — Class-Based Dashboard
    // ========================
    renderInstructorPanel(container) {
      const screen = document.createElement('div');
      screen.className = 'screen';

      screen.innerHTML = `
        <div class="screen-header">
          <img src="img/uni-vienna-logo.png" alt="" style="height:40px;opacity:0.8;margin-bottom:0.5rem;" onerror="this.style.display='none'">
          <h1>\uD83C\uDF93 Instructor Dashboard</h1>
          <p class="subtitle">Loading data from database...</p>
        </div>
      `;
      container.appendChild(screen);

      // Fetch all results from Supabase
      Game.fetchResultsFromSupabase().then(supaResults => {
        // Normalize Supabase column names to match what _instrBuildClassData expects
        const results = supaResults.map(r => ({
          studentName: r.student_name,
          studentId: r.student_id,
          className: r.class_name,
          caseNumber: r.case_number,
          caseTitle: r.case_title,
          totalScore: r.total_score,
          verdict: r.verdict,
          evidence: r.evidence,
          crossExam: r.cross_exam,
          courtroom: r.courtroom,
          timestamp: r.submitted_at
        }));

        // Store for use by _instrShowClass
        this._instrResults = results;

        const classNames = Object.values(Game._classCodes);

        screen.innerHTML = `
          <div class="screen-header">
            <img src="img/uni-vienna-logo.png" alt="" style="height:40px;opacity:0.8;margin-bottom:0.5rem;" onerror="this.style.display='none'">
            <h1>\uD83C\uDF93 Instructor Dashboard</h1>
            <p class="subtitle">Live data from Supabase \u2022 ${results.length} total attempts</p>
          </div>

          <div style="display:flex;gap:0.75rem;margin-bottom:1.5rem;flex-wrap:wrap;">
            <button class="btn btn-secondary" onclick="Screens._instrDownloadCSV()">Export All (CSV)</button>
            <button class="btn btn-ghost" onclick="window.location.href=window.location.pathname;">Back to Game</button>
          </div>

          <div class="lb-tabs" id="class-tabs" style="margin-bottom:1.5rem;">
            <button class="lb-tab active" onclick="Screens._instrShowClass('all', this)">All Classes</button>
            ${classNames.map(c => `<button class="lb-tab" onclick="Screens._instrShowClass('${c}', this)">${c}</button>`).join('')}
          </div>

          <div id="instructor-class-content"></div>
        `;

        this._instrShowClass('all');
      });
    },

    _instrBuildClassData(results, className) {
      const filtered = className === 'all' ? results : results.filter(r => r.className === className);

      // Group by student
      const students = {};
      filtered.forEach(r => {
        const key = r.studentId || r.studentName || 'Unknown';
        if (!students[key]) {
          students[key] = { name: r.studentName || 'Unknown', className: r.className || '?', attempts: [] };
        }
        students[key].attempts.push(r);
      });

      // Per-student summary (dedup by case)
      const studentSummaries = Object.values(students).map(stu => {
        const cases = {};
        stu.attempts.forEach(a => {
          const ck = a.caseNumber || a.caseId;
          if (!cases[ck]) cases[ck] = { number: a.caseNumber, title: a.caseTitle || '', scores: [], verdicts: [], timestamps: [] };
          cases[ck].scores.push(a.totalScore || 0);
          cases[ck].verdicts.push(a.verdict);
          cases[ck].timestamps.push(a.timestamp);
        });

        const caseList = Object.values(cases);
        const allScores = caseList.map(c => Math.max(...c.scores));
        const totalAttempts = stu.attempts.length;

        return {
          name: stu.name,
          className: stu.className,
          casesPlayed: caseList.length,
          totalAttempts: totalAttempts,
          avgScore: allScores.length ? Math.round(allScores.reduce((a,b) => a+b, 0) / allScores.length) : 0,
          bestScore: allScores.length ? Math.max(...allScores) : 0,
          worstScore: allScores.length ? Math.min(...allScores) : 0,
          lastActive: stu.attempts.length ? new Date(Math.max(...stu.attempts.map(a => new Date(a.timestamp || 0)))).toLocaleDateString() : '-',
          cases: caseList.map(c => ({
            number: c.number,
            title: c.title,
            best: Math.max(...c.scores),
            worst: Math.min(...c.scores),
            attempts: c.scores.length,
            lastVerdict: c.verdicts[c.verdicts.length - 1]
          })).sort((a,b) => (a.number||0) - (b.number||0))
        };
      }).sort((a,b) => b.avgScore - a.avgScore);

      // Analytics
      const allBestScores = studentSummaries.map(s => s.avgScore);
      const brackets = [0,0,0,0]; // 0-25, 25-50, 50-75, 75-100
      allBestScores.forEach(s => {
        if (s >= 75) brackets[3]++;
        else if (s >= 50) brackets[2]++;
        else if (s >= 25) brackets[1]++;
        else brackets[0]++;
      });

      const totalStudents = studentSummaries.length;
      const totalAttempts = filtered.length;
      const avgScore = totalStudents ? Math.round(allBestScores.reduce((a,b)=>a+b,0)/totalStudents) : 0;
      const winRate = totalAttempts ? Math.round(100 * filtered.filter(r => r.verdict === 'won').length / totalAttempts) : 0;

      return { studentSummaries, brackets, totalStudents, totalAttempts, avgScore, winRate };
    },

    _instrShowClass(className, btn) {
      if (btn) {
        document.querySelectorAll('#class-tabs .lb-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
      }

      const results = this._instrResults || [];
      const data = this._instrBuildClassData(results, className);
      const el = document.getElementById('instructor-class-content');
      const label = className === 'all' ? 'All Classes' : className;
      const maxBar = Math.max(...data.brackets, 1);

      el.innerHTML = `
        <div class="instructor-summary-bar" style="margin-bottom:1.5rem;">
          <div class="instructor-stat"><span class="instructor-stat-num">${data.totalStudents}</span><span class="instructor-stat-label">Students</span></div>
          <div class="instructor-stat"><span class="instructor-stat-num">${data.totalAttempts}</span><span class="instructor-stat-label">Total Plays</span></div>
          <div class="instructor-stat"><span class="instructor-stat-num">${data.avgScore}</span><span class="instructor-stat-label">Avg Score</span></div>
          <div class="instructor-stat"><span class="instructor-stat-num">${data.winRate}%</span><span class="instructor-stat-label">Win Rate</span></div>
        </div>

        ${className === 'all' ? this._instrClassComparison(results) : ''}

        <div style="background:var(--surface-card,#1e1e32);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:1.25rem;margin-bottom:1.5rem;">
          <h3 style="margin:0 0 0.75rem;font-size:0.9rem;color:var(--text-secondary);">Score Distribution — ${label}</h3>
          <div style="display:flex;gap:0.75rem;align-items:flex-end;height:100px;">
            ${['0–24 (Dismissed)', '25–49 (Lost)', '50–74 (Partial)', '75–100 (Won)'].map((lbl, i) => {
              const colors = ['#ef4444', '#f97316', '#eab308', '#4ade80'];
              const h = data.brackets[i] ? Math.max(8, Math.round(90 * data.brackets[i] / maxBar)) : 4;
              return `<div style="flex:1;text-align:center;">
                <div style="font-size:0.82rem;font-weight:700;color:${colors[i]};margin-bottom:0.25rem;">${data.brackets[i]}</div>
                <div style="height:${h}px;background:${colors[i]};border-radius:4px 4px 0 0;opacity:0.7;"></div>
                <div style="font-size:0.65rem;color:var(--text-secondary);margin-top:0.3rem;">${lbl}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <h3 style="margin-bottom:0.75rem;">Students (${data.totalStudents})</h3>
        ${data.totalStudents === 0 ? '<p style="color:var(--text-secondary);text-align:center;padding:2rem;">No student data yet. Ask students to click \u201CExport My Results\u201D and import their files above.</p>' : `
        <table class="instructor-table" style="font-size:0.82rem;">
          <thead>
            <tr>
              <th>Student</th>
              ${className === 'all' ? '<th>Class</th>' : ''}
              <th>Cases</th>
              <th>Avg</th>
              <th>Best</th>
              <th>Worst</th>
              <th>Plays</th>
              <th>Last Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${data.studentSummaries.map((s, i) => {
              const avgColor = s.avgScore >= 75 ? '#4ade80' : s.avgScore >= 50 ? '#eab308' : '#f87171';
              return `<tr id="stu-row-${i}">
                <td><strong>${s.name}</strong></td>
                ${className === 'all' ? `<td><span class="instructor-class-tag">${s.className}</span></td>` : ''}
                <td>${s.casesPlayed}</td>
                <td style="color:${avgColor};font-weight:700;">${s.avgScore}</td>
                <td>${s.bestScore}</td>
                <td>${s.worstScore}</td>
                <td>${s.totalAttempts}</td>
                <td style="font-size:0.75rem;">${s.lastActive}</td>
                <td><button class="btn btn-ghost" style="font-size:0.7rem;padding:0.2rem 0.4rem;" onclick="Screens._instrToggleStudent(${i})">\u25BC</button></td>
              </tr>
              <tr id="stu-detail-${i}" style="display:none;">
                <td colspan="${className === 'all' ? 9 : 8}" style="padding:0;">
                  <div style="background:rgba(255,255,255,0.02);padding:0.75rem;border-top:1px solid rgba(255,255,255,0.05);">
                    <table class="instructor-table" style="font-size:0.78rem;margin:0;">
                      <thead><tr><th>Case</th><th>Title</th><th>Best</th><th>Worst</th><th>Plays</th><th>Last Verdict</th></tr></thead>
                      <tbody>
                        ${s.cases.map(c => {
                          const vc = c.lastVerdict === 'won' ? '#4ade80' : c.lastVerdict === 'won_with_reservations' ? '#eab308' : '#f87171';
                          return `<tr>
                            <td>Case ${String(c.number || '?').padStart(2, '0')}</td>
                            <td>${c.title}</td>
                            <td style="font-weight:700;">${c.best}/100</td>
                            <td>${c.worst}/100</td>
                            <td>${c.attempts}</td>
                            <td style="color:${vc}">${c.lastVerdict || '-'}</td>
                          </tr>`;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`}
      `;
    },

    _instrClassComparison(results) {
      const classNames = Object.values(Game._classCodes);
      const classData = classNames.map(cls => {
        const d = this._instrBuildClassData(results, cls);
        return { name: cls, ...d };
      }).filter(d => d.totalStudents > 0);

      if (classData.length < 2) return '';

      const maxAvg = Math.max(...classData.map(d => d.avgScore), 1);

      return `
        <div style="background:var(--surface-card,#1e1e32);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:1.25rem;margin-bottom:1.5rem;">
          <h3 style="margin:0 0 0.75rem;font-size:0.9rem;color:var(--text-secondary);">Class Comparison</h3>
          <div style="display:flex;gap:1rem;align-items:flex-end;height:120px;">
            ${classData.map(d => {
              const h = Math.max(12, Math.round(100 * d.avgScore / maxAvg));
              const color = d.avgScore >= 75 ? '#4ade80' : d.avgScore >= 50 ? '#eab308' : '#f87171';
              return `<div style="flex:1;text-align:center;">
                <div style="font-size:0.95rem;font-weight:700;color:${color};margin-bottom:0.25rem;">${d.avgScore}</div>
                <div style="height:${h}px;background:${color};border-radius:4px 4px 0 0;opacity:0.6;"></div>
                <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:0.3rem;">${d.name}</div>
                <div style="font-size:0.65rem;color:var(--text-secondary);">${d.totalStudents} students</div>
              </div>`;
            }).join('')}
          </div>
          <table class="instructor-table" style="font-size:0.78rem;margin-top:1rem;">
            <thead><tr><th>Class</th><th>Students</th><th>Avg Score</th><th>Win Rate</th><th>Total Plays</th></tr></thead>
            <tbody>
              ${classData.map(d => `<tr>
                <td><strong>${d.name}</strong></td>
                <td>${d.totalStudents}</td>
                <td>${d.avgScore}</td>
                <td>${d.winRate}%</td>
                <td>${d.totalAttempts}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    _instrToggleStudent(idx) {
      const row = document.getElementById('stu-detail-' + idx);
      const btn = document.querySelector('#stu-row-' + idx + ' button');
      if (row.style.display === 'none') {
        row.style.display = '';
        if (btn) btn.textContent = '\u25B2';
      } else {
        row.style.display = 'none';
        if (btn) btn.textContent = '\u25BC';
      }
    },

    async _instrImportFiles(files) {
      const msg = document.getElementById('import-msg');
      if (!files || files.length === 0) return;
      let totalAdded = 0;
      const names = [];
      for (const file of files) {
        try {
          const result = await Game.importStudentFile(file);
          totalAdded += result.added;
          names.push(result.name);
        } catch(e) {
          msg.style.color = '#f87171';
          msg.innerHTML = '\u274C Error in ' + file.name + ': ' + e;
          return;
        }
      }
      msg.style.color = '#4ade80';
      msg.innerHTML = '\u2705 Imported ' + totalAdded + ' new result(s) from ' + files.length + ' file(s). Refreshing...';
      setTimeout(() => location.reload(), 1200);
    },

    _instrDownloadCSV() {
      const results = this._instrResults || [];
      if (results.length === 0) { alert('No data to export.'); return; }
      const headers = ['Student Name', 'Class', 'Case Number', 'Case Title', 'Score', 'Verdict', 'Evidence', 'Cross-Exam', 'Courtroom', 'Timestamp'];
      const rows = results.map(r => [
        r.studentName, r.className || '', r.caseNumber, r.caseTitle || '',
        r.totalScore, r.verdict,
        r.evidence || '', r.crossExam || '', r.courtroom || '',
        r.timestamp || ''
      ]);
      const csv = [headers, ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'drc-all-results-' + new Date().toISOString().slice(0,10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    // ========================
    // DEVELOPER PANEL
    // ========================
    renderDeveloperPanel(container) {
      const results = Game.getDetailedResults();
      const screen = document.createElement('div');
      screen.className = 'screen';

      // Show loading state, then fetch from Supabase
      screen.innerHTML = `
        <div class="screen-header">
          <h1>\uD83D\uDEE0\uFE0F Developer Panel</h1>
          <p class="subtitle">Bug reports, feedback flags, and system data. Access via <code>?panel=dev</code></p>
        </div>
        <p style="color:var(--text-secondary);padding:2rem;text-align:center;">Loading feedback from database...</p>
      `;
      container.appendChild(screen);

      // Fetch feedback from Supabase (falls back to localStorage)
      Game.fetchAllFeedback().then(feedback => {
        let feedbackRows = '';
        if (!feedback || feedback.length === 0) {
          feedbackRows = '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);">No feedback submitted yet.</td></tr>';
        } else {
          feedback.forEach(f => {
            const name = f.student_name || f.studentName || 'Anon';
            const caseNum = f.case_number || f.caseNumber;
            const type = f.feedback_type || f.type || '';
            const text = f.feedback_text || f.text || '';
            const scr = f.screen || '';
            const cls = f.class_name || f.className || '';
            const ts = f.submitted_at || f.timestamp;
            const typeColors = { 'flag-error': '#f87171', 'flag-unclear': '#fbbf24', 'flag-bug': '#f97316', 'suggestion': '#818cf8', 'general': '#8a8f98' };
            const tc = typeColors[type] || '#8a8f98';
            feedbackRows += `<tr>
              <td>${name}</td>
              <td>${cls}</td>
              <td>${caseNum ? 'Case ' + String(caseNum).padStart(2, '0') : 'General'}</td>
              <td style="color:${tc}">${type}</td>
              <td>${scr}</td>
              <td style="max-width:300px;word-wrap:break-word;">${text}</td>
              <td style="font-size:0.75rem;">${ts ? new Date(ts).toLocaleString() : ''}</td>
            </tr>`;
          });
        }

        const errorCount = feedback.filter(f => (f.feedback_type || f.type) === 'flag-error').length;
        const bugCount = feedback.filter(f => (f.feedback_type || f.type) === 'flag-bug').length;

        screen.innerHTML = `
          <div class="screen-header">
            <h1>\uD83D\uDEE0\uFE0F Developer Panel</h1>
            <p class="subtitle">All feedback from all devices (via Supabase)</p>
          </div>

          <div style="display:flex;gap:0.75rem;margin-bottom:2rem;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="Game.downloadExport()">\u2B07 Export Local Data</button>
            <button class="btn btn-ghost" onclick="window.location.href=window.location.pathname;">Back to Game</button>
          </div>

          <div class="instructor-summary-bar">
            <div class="instructor-stat"><span class="instructor-stat-num">${feedback.length}</span><span class="instructor-stat-label">Total Feedback</span></div>
            <div class="instructor-stat"><span class="instructor-stat-num">${errorCount}</span><span class="instructor-stat-label">Legal Errors</span></div>
            <div class="instructor-stat"><span class="instructor-stat-num">${bugCount}</span><span class="instructor-stat-label">Bug Reports</span></div>
            <div class="instructor-stat"><span class="instructor-stat-num">${results.length}</span><span class="instructor-stat-label">Local Results</span></div>
          </div>

          <h2 style="margin-bottom:0.75rem;">Feedback & Flags (${feedback.length})</h2>
          <div style="overflow-x:auto;margin-bottom:2rem;">
            <table class="instructor-table">
              <thead><tr><th>From</th><th>Class</th><th>Case</th><th>Type</th><th>Screen</th><th>Feedback</th><th>Time</th></tr></thead>
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
      });
    },



  };

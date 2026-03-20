/* ============================================
   DIGITAL RIGHTS COURTROOM — Game Engine v6
   Student ID lock + grouped instructor panel + dev page
   ============================================ */

   const Game = {

    // --- Game State ---
    state: {
      currentScreen: 'dashboard',
      currentCaseId: null,
      currentCase: null,
  
      collectedEvidence: [],
      readEvidence: [],
  
      crossExamResults: {
        questionsAsked: [],
        totalScore: 0
      },
  
      courtroomResults: [],
  
      writtenAnswers: {
        courtroom: []
      },
  
      completedCases: {},
      studentName: null,
      studentId: null,
      className: null
    },
  
    // =====================================================
    // SUPABASE INTEGRATION
    // =====================================================
    _supabaseURL: 'https://rqzckaqipfpajwhvkbdw.supabase.co',
    _supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxemNrYXFpcGZwYWp3aHZrYmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDczMzgsImV4cCI6MjA4OTU4MzMzOH0.9iYJjiZOWKD6uEpGnfF61U0LXjJ1K6uosoriaxih5FY',

    // Fallback codes (used when Supabase is unreachable)
    _fallbackCodes: {
      '7e02c53f3ebd46d24429b7381c5f3356d6599b6cbb5842281c273707d4a94b35': 'Class A',   // CLASSA2026
      'b5c18f39db0a69461123267c3c1bd1d25e3742d3951153381404a288b193b4dd': 'Class B',   // CLASSB2026
      '6ad575bd92bd14bee0529d711d08189aa94edf284eaa15ab39b59eb39cbc396c': 'Class C',   // CLASSC2026
      'b19163f6ee95a35431927dc043db712fc11305fb48d1045e7723bd7cc0ab6951': 'Class D',   // CLASSD2026
    },

    _classCodes: {},
    _classStatus: {},

    _supaHeaders() {
      return {
        'apikey': this._supabaseKey,
        'Authorization': 'Bearer ' + this._supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      };
    },

    // Fetch class config from Supabase
    async loadClassConfig() {
      if (this._supabaseURL) {
        try {
          const resp = await fetch(
            this._supabaseURL + '/rest/v1/class_config?select=class_name,status,access_code',
            { headers: this._supaHeaders(), cache: 'no-store' }
          );
          if (resp.ok) {
            const rows = await resp.json();
            const codes = {};
            const status = {};
            for (const row of rows) {
              if (row.access_code) {
                const hash = await this._sha256(row.access_code.toUpperCase());
                if (row.status === 'ACTIVE') {
                  codes[hash] = row.class_name;
                }
                status[row.class_name] = row.status;
              }
            }
            this._classCodes = codes;
            this._classStatus = status;
            return;
          }
        } catch(e) {
          console.warn('Supabase unreachable, using fallback codes');
        }
      }
      // Fallback
      this._classCodes = { ...this._fallbackCodes };
      Object.values(this._classCodes).forEach(c => { this._classStatus[c] = 'ACTIVE'; });
    },

    // Submit score to Supabase (silent, fire-and-forget)
    submitScore(caseId, score) {
      if (!this._supabaseURL) return;
      const row = {
        student_name: this.state.studentName || '',
        student_id: this.state.studentId || '',
        class_name: this.state.className || '',
        case_number: this.state.currentCase ? this.state.currentCase.number : null,
        case_title: this.state.currentCase ? this.state.currentCase.title : '',
        total_score: score.total,
        verdict: score.verdict,
        evidence: score.evidence ? score.evidence.earned + '/' + score.evidence.possible : '',
        cross_exam: score.crossExam ? score.crossExam.earned + '/' + score.crossExam.possible : '',
        courtroom: score.courtroom ? score.courtroom.earned + '/' + score.courtroom.possible : '',
        submitted_at: new Date().toISOString()
      };
      fetch(this._supabaseURL + '/rest/v1/results', {
        method: 'POST',
        headers: this._supaHeaders(),
        body: JSON.stringify(row)
      }).catch(() => {});
    },

    isClassActive(className) {
      if (!className) return true;
      const status = this._classStatus[className];
      return !status || status === 'ACTIVE';
    },

    async _sha256(text) {
      const data = new TextEncoder().encode(text);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    // --- Offensive Name Filter ---
    _offensivePatterns: [
      /\b(fuck|shit|ass|dick|cock|pussy|bitch|bastard|damn|crap|cunt|whore|slut|fag|nigger|nigga|nazi|hitler|penis|vagina|anus|retard|rape)\b/i,
      /(.)\1{4,}/,  // 5+ repeated characters
      /^[^a-zA-ZÀ-ÿ\s\-']+$/,  // no letters at all
    ],

    _isNameOffensive(name) {
      for (const pattern of this._offensivePatterns) {
        if (pattern.test(name)) return true;
      }
      // Check for "fake" names: all same word repeated, single characters
      const words = name.trim().split(/\s+/);
      if (words.length >= 2 && new Set(words.map(w => w.toLowerCase())).size === 1) return true;
      if (words.some(w => w.length < 2)) return true;
      return false;
    },

    // --- Panel Access Passphrases (SHA-256 hashed) ---
    // Instructor passphrase: EISENBERGER2026DRC
    _instructorHash: '014d027f21fe4c6135f767fce8ee24df5996807544ca67160cd58e6feda1cbdf',
    // Developer passphrase: PRATIBHDEV2026DRC
    _developerHash: '1c727f94e8537246864c94a94bacd4e592aec9e7e96885ea9f7fc792c38f8d9a',

    // --- Initialization ---
    init() {
      this.loadProgress();
      this.loadStudentIdentity();

      const params = new URLSearchParams(window.location.search);

      // Instructor/developer panel
      if (params.has('panel')) {
        this._promptPanelAccess(params.get('panel'));
        return;
      }

      // Load class config from Google Sheet, then proceed
      this.loadClassConfig().then(() => {
        // Check if already-logged-in student's class has been ended
        if (this.state.className && !this.isClassActive(this.state.className)) {
          // Session ended — log student out
          localStorage.removeItem('drc-access-granted');
          this.state.studentName = null;
          this.state.studentId = null;
          this.state.className = null;
        }

        const authed = localStorage.getItem('drc-access-granted');
        if (authed && this.state.studentName) {
          this.showScreen('dashboard');
        } else {
          this.promptAccessAndName(() => { this.showScreen('dashboard'); });
        }
        Screens.initFeedbackButton();
      });
    },

    _promptPanelAccess(panelType) {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
      const label = panelType === 'dev' ? 'Developer' : 'Instructor';
      overlay.innerHTML = `
        <div style="background:var(--surface-card,#1e1e32);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:2rem;max-width:380px;width:100%;text-align:center;">
          <h2 style="margin:0 0 0.75rem;color:var(--text-primary,#e4e4e7);">\uD83D\uDD12 ${label} Panel</h2>
          <p style="color:var(--text-secondary,#8a8f98);font-size:0.85rem;margin-bottom:1.25rem;">Enter the ${label.toLowerCase()} passphrase to continue.</p>
          <input type="password" id="panel-pass-input" placeholder="Passphrase" style="width:100%;padding:0.6rem 0.8rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:var(--text-primary,#e4e4e7);font-size:1rem;margin-bottom:0.5rem;box-sizing:border-box;">
          <p id="panel-pass-error" style="color:#f87171;font-size:0.8rem;min-height:1.2rem;margin:0 0 0.5rem;"></p>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-primary" id="panel-pass-submit" style="flex:1;">Enter</button>
            <button class="btn btn-ghost" onclick="window.location.href=window.location.pathname;" style="flex:1;">Cancel</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const input = document.getElementById('panel-pass-input');
      const error = document.getElementById('panel-pass-error');
      const btn = document.getElementById('panel-pass-submit');

      const submit = async () => {
        const pass = (input.value || '').trim();
        if (!pass) { error.textContent = 'Enter the passphrase.'; input.focus(); return; }
        const hash = await this._sha256(pass.toUpperCase());

        if (panelType === 'dev' && hash === this._developerHash) {
          overlay.remove();
          this.showScreen('developer');
          Screens.initFeedbackButton();
        } else if (panelType !== 'dev' && hash === this._instructorHash) {
          overlay.remove();
          this.showScreen('instructor');
          Screens.initFeedbackButton();
        } else {
          error.textContent = 'Incorrect passphrase.';
          input.value = '';
          input.focus();
        }
      };

      btn.onclick = submit;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
      setTimeout(() => input.focus(), 100);
    },

    // --- Combined Access Code + Student Name Prompt ---
    promptAccessAndName(callback) {
      const needsName = !this.state.studentName;
      const needsCode = !localStorage.getItem('drc-access-granted');

      const overlay = document.createElement('div');
      overlay.id = 'student-name-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
      overlay.innerHTML = `
        <div style="background:var(--surface-card,#1e1e32);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:2rem;max-width:440px;width:100%;text-align:center;">
          <img src="img/uni-vienna-logo.png" alt="University of Vienna" style="height:50px;margin-bottom:1rem;filter:drop-shadow(0 0 12px rgba(100,180,220,0.4));" onerror="this.style.display='none'">
          <h2 style="margin:0 0 0.25rem;color:var(--text-primary,#e4e4e7);">\u2696\uFE0F Digital Rights Courtroom</h2>
          <p style="color:var(--accent-gold,#c9a84c);font-size:0.78rem;margin:0 0 1.25rem;letter-spacing:0.04em;">University of Vienna \u2022 Department of Innovation and Digitalisation in Law</p>

          ${needsCode ? `
          <div style="text-align:left;margin-bottom:1rem;">
            <label style="font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-secondary,#8a8f98);display:block;margin-bottom:0.35rem;">Course Access Code</label>
            <input type="text" id="access-code-input" placeholder="Enter the code provided by your instructor" style="width:100%;padding:0.6rem 0.8rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:var(--text-primary,#e4e4e7);font-size:0.95rem;box-sizing:border-box;letter-spacing:0.1em;">
          </div>
          ` : ''}

          ${needsName ? `
          <div style="text-align:left;margin-bottom:0.5rem;">
            <label style="font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-secondary,#8a8f98);display:block;margin-bottom:0.35rem;">Your Full Name</label>
            <input type="text" id="student-name-input" placeholder="First and last name (e.g. Maria Chen)" style="width:100%;padding:0.6rem 0.8rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:var(--text-primary,#e4e4e7);font-size:0.95rem;box-sizing:border-box;">
            <p style="font-size:0.72rem;color:var(--text-secondary,#8a8f98);margin:0.35rem 0 0;text-align:left;">Your name is linked to your scores and visible on the leaderboard. It cannot be changed later.</p>
          </div>
          ` : ''}

          <p id="access-error" style="color:#f87171;font-size:0.8rem;min-height:1.2rem;margin:0.5rem 0 0.75rem;"></p>
          <button class="btn btn-primary" id="access-submit" style="width:100%;">${needsName ? 'Register & Start Playing' : 'Enter'}</button>
        </div>
      `;
      document.body.appendChild(overlay);

      const codeInput = document.getElementById('access-code-input');
      const nameInput = document.getElementById('student-name-input');
      const btn = document.getElementById('access-submit');
      const errorEl = document.getElementById('access-error');

      const submit = async () => {
        errorEl.textContent = '';

        // Validate access code against class codes
        if (needsCode) {
          const code = (codeInput.value || '').trim().toUpperCase();
          if (!code) { errorEl.textContent = 'Please enter the course access code.'; codeInput.focus(); return; }
          const hash = await this._sha256(code);
          const matchedClass = this._classCodes[hash];
          if (!matchedClass) {
            errorEl.textContent = 'Incorrect access code. Contact your instructor.';
            codeInput.focus();
            return;
          }
          this.state.className = matchedClass;
          localStorage.setItem('drc-access-granted', 'true');
          localStorage.setItem('drc-class-name', matchedClass);
        }

        // Validate student name
        if (needsName) {
          const name = (nameInput.value || '').trim();
          if (!name) { errorEl.textContent = 'Please enter your name.'; nameInput.focus(); return; }
          
          const words = name.split(/\s+/);
          if (words.length < 2) { errorEl.textContent = 'Please enter your full name (first and last).'; nameInput.focus(); return; }
          if (name.length < 5) { errorEl.textContent = 'Name is too short. Enter your real name.'; nameInput.focus(); return; }
          if (name.length > 60) { errorEl.textContent = 'Name is too long.'; nameInput.focus(); return; }
          if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(name)) { errorEl.textContent = 'Name can only contain letters, spaces, hyphens, and apostrophes.'; nameInput.focus(); return; }
          if (this._isNameOffensive(name)) { errorEl.textContent = 'Please enter your real name.'; nameInput.focus(); return; }

          // Capitalise properly
          const formatted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

          const id = 'stu-' + this._hashString(formatted + Date.now()) + '-' + Math.random().toString(36).substr(2, 4);
          this.state.studentName = formatted;
          this.state.studentId = id;
          this.saveStudentIdentity();
        }

        overlay.remove();
        if (callback) callback();
      };

      btn.onclick = submit;
      const firstInput = codeInput || nameInput;
      if (firstInput) {
        firstInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            if (codeInput && nameInput && document.activeElement === codeInput) {
              nameInput.focus();
            } else {
              submit();
            }
          }
        });
        if (nameInput && nameInput !== firstInput) {
          nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
        }
        setTimeout(() => firstInput.focus(), 100);
      }
    },

    _hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + c;
        hash |= 0;
      }
      return Math.abs(hash).toString(36).substr(0, 6);
    },

    saveStudentIdentity() {
      try {
        localStorage.setItem('drc-student-name', this.state.studentName);
        localStorage.setItem('drc-student-id', this.state.studentId);
        if (this.state.className) localStorage.setItem('drc-class-name', this.state.className);
      } catch(e) {}
    },

    loadStudentIdentity() {
      try {
        this.state.studentName = localStorage.getItem('drc-student-name') || null;
        this.state.studentId = localStorage.getItem('drc-student-id') || null;
        this.state.className = localStorage.getItem('drc-class-name') || null;
      } catch(e) {}
    },

    // --- Screen Management ---
    showScreen(screenName, data) {
      const app = document.getElementById('app');
      app.innerHTML = '';
      this.state.currentScreen = screenName;
  
      switch (screenName) {
        case 'dashboard':
          Screens.renderDashboard(app);
          break;
        case 'briefing':
          Screens.renderBriefing(app, this.state.currentCase);
          break;
        case 'investigation':
          Screens.renderInvestigation(app, this.state.currentCase);
          break;
        case 'cross-examination':
          Screens.renderCrossExamination(app, this.state.currentCase);
          break;
        case 'courtroom':
          Screens.renderCourtroom(app, this.state.currentCase);
          break;
        case 'verdict':
          const score = this.calculateFinalScore();
          Screens.renderVerdict(app, this.state.currentCase, score);
          break;
        case 'taxonomy':
          Screens.renderTaxonomy(app);
          break;
        case 'instructor':
          Screens.renderInstructorPanel(app);
          break;
        case 'developer':
          Screens.renderDeveloperPanel(app);
          break;
        case 'leaderboard':
          Screens.renderLeaderboard(app);
          break;
        default:
          app.innerHTML = '<p>Screen not found.</p>';
      }
  
      window.scrollTo(0, 0);
    },
  
    // --- Case Management ---
    startCase(caseId) {
      const caseData = CASES.find(c => c.id === caseId);
      if (!caseData) { console.error('Case not found:', caseId); return; }
  
      if (caseData.evidence.length === 0) {
        alert('This case is coming soon! Content is being developed.');
        return;
      }
  
      this.state.currentCaseId = caseId;
      this.state.currentCase = caseData;
      this.state.caseStartTime = Date.now();
  
      this.state.collectedEvidence = [];
      this.state.readEvidence = [];
      this.state.crossExamResults = { questionsAsked: [], totalScore: 0 };
      this.state.courtroomResults = [];
      this.state.writtenAnswers = { courtroom: [] };
  
      this.showScreen('briefing');
    },
  
    goToDashboard() {
      this.state.currentCaseId = null;
      this.state.currentCase = null;
      this.showScreen('dashboard');
    },
  
    // --- Evidence ---
    collectEvidence(evidenceId) {
      if (!this.state.collectedEvidence.includes(evidenceId)) {
        this.state.collectedEvidence.push(evidenceId);
      }
    },
    markEvidenceRead(evidenceId) {
      if (!this.state.readEvidence.includes(evidenceId)) {
        this.state.readEvidence.push(evidenceId);
      }
    },
    isEvidenceRead(evidenceId) { return this.state.readEvidence.includes(evidenceId); },
    isEvidenceCollected(evidenceId) { return this.state.collectedEvidence.includes(evidenceId); },

    // --- Keyword Validation ---
    checkKeywords(text, requiredConcepts) {
      if (!requiredConcepts || requiredConcepts.length === 0) {
        return { passed: true, totalMatched: 0, totalKeywords: 0, concepts: [] };
      }
      const lowerText = text.toLowerCase();
      let totalMatched = 0;
      let totalKeywords = 0;
      const concepts = [];

      requiredConcepts.forEach(concept => {
        const keywords = concept.keywords || [];
        totalKeywords += keywords.length;
        const matched = [];
        const missed = [];
        keywords.forEach(kw => {
          if (lowerText.includes(kw.toLowerCase())) { matched.push(kw); totalMatched++; }
          else { missed.push(kw); }
        });
        const threshold = Math.ceil(keywords.length / 2);
        concepts.push({
          name: concept.name, passed: matched.length >= threshold,
          matched, missed, threshold, hints: concept.hints || []
        });
      });

      return { passed: concepts.every(c => c.passed), totalMatched, totalKeywords, concepts };
    },
  
    // --- Cross-Examination ---
    recordCrossExamQuestion(questionId, impact, followedUp, score) {
      this.state.crossExamResults.questionsAsked.push({
        id: questionId, impact: impact, followedUp: followedUp, score: score
      });
      this.state.crossExamResults.totalScore += score;
    },
    getCrossExamQuestionsAsked() {
      return this.state.crossExamResults.questionsAsked.map(q => q.id);
    },
  
    // --- Written Answers ---
    recordWrittenAnswer(phase, text) {
      if (phase.startsWith('courtroom_')) {
        const index = parseInt(phase.split('_')[1]);
        this.state.writtenAnswers.courtroom[index] = text;
      }
    },
  
    // --- Courtroom Tracking ---
    recordArgument(argumentId, quality, citationCorrect) {
      this.state.courtroomResults.push({
        argumentId: argumentId, quality: quality, citationCorrect: citationCorrect
      });
    },
  
    // --- Scoring (v5: 10/25/65 split) ---
    calculateFinalScore() {
      const caseData = this.state.currentCase;
      if (!caseData) return null;
  
      // Evidence: 10 points
      const totalEvidence = caseData.evidence.length;
      const readCount = this.state.readEvidence.length;
      const evidenceScore = totalEvidence > 0 ? Math.round((readCount / totalEvidence) * 10) : 0;
  
      // Cross-examination: 25 points
      const ceData = caseData.crossExamination;
      const maxCEScore = ceData ? ceData.maxQuestions * 10 : 30;
      const rawCEScore = this.state.crossExamResults.totalScore;
      const crossExamScore = Math.min(Math.round((rawCEScore / maxCEScore) * 25), 25);
  
      // Courtroom: 65 points
      const totalArguments = caseData.courtroom.arguments.length;
      const pointsPerArgument = totalArguments > 0 ? 65 / totalArguments : 0;
      let courtroomScore = 0;
      const argumentDetails = [];
  
      this.state.courtroomResults.forEach((result) => {
        let baseScore = 0;
        if (result.quality === 'strong') baseScore = 1.0;
        else if (result.quality === 'weak') baseScore = 0.5;
        else baseScore = 0;
        const citationMult = result.citationCorrect ? 1.0 : 0.5;
        let earned = Math.round(pointsPerArgument * baseScore * citationMult);
        courtroomScore += earned;
        argumentDetails.push({ ...result, earned, possible: Math.round(pointsPerArgument) });
      });
  
      const total = evidenceScore + crossExamScore + courtroomScore;
  
      let verdict;
      if (total >= 75) verdict = 'won';
      else if (total >= 50) verdict = 'won_with_reservations';
      else if (total >= 25) verdict = 'lost';
      else verdict = 'dismissed';
  
      const score = {
        total, verdict,
        evidence: { earned: evidenceScore, possible: 10, found: readCount, total: totalEvidence },
        crossExam: { earned: crossExamScore, possible: 25, questionsAsked: this.state.crossExamResults.questionsAsked },
        courtroom: { earned: courtroomScore, possible: 65, arguments: argumentDetails },
        writtenAnswers: { ...this.state.writtenAnswers },
        elapsedSeconds: this.state.caseStartTime ? Math.round((Date.now() - this.state.caseStartTime) / 1000) : 0
      };

      // Determine if this is the student's first attempt at this case
      const isFirstAttempt = !this.state.completedCases[this.state.currentCaseId];

      // Calculate achievements
      score.achievements = [];
      if (score.evidence.found === score.evidence.total) score.achievements.push({ id: 'perfect-evidence', label: 'Thorough Investigator', icon: '\uD83D\uDD0D', desc: 'Reviewed all evidence documents' });
      if (score.crossExam.questionsAsked.filter(q => q.impact === 'positive').length >= 3) score.achievements.push({ id: 'master-cross', label: 'Master Cross-Examiner', icon: '\uD83E\uDDD1\u200D\u2696\uFE0F', desc: 'All effective cross-examination questions' });
      if (score.courtroom.arguments.every(a => a.quality === 'strong')) score.achievements.push({ id: 'legal-eagle', label: 'Legal Eagle', icon: '\uD83E\uDD85', desc: 'Selected the strongest argument every round' });
      if (score.courtroom.arguments.every(a => a.citationCorrect)) score.achievements.push({ id: 'perfect-citation', label: 'Sharp Citation', icon: '\uD83C\uDFAF', desc: 'Cited the correct evidence every round' });
      if (score.elapsedSeconds > 0 && score.elapsedSeconds < 300 && score.total >= 75) score.achievements.push({ id: 'speed-demon', label: 'Speed Demon', icon: '\u26A1', desc: 'Won the case in under 5 minutes' });
      if (score.total === 100) score.achievements.push({ id: 'perfect-score', label: 'Flawless Victory', icon: '\uD83C\uDFC6', desc: 'Achieved a perfect score' });

      this.state.completedCases[this.state.currentCaseId] = {
        completed: true, score: total, verdict: verdict,
        timestamp: new Date().toISOString(),
        studentName: this.state.studentName,
        studentId: this.state.studentId,
        className: this.state.className
      };
      this.saveProgress();
      this.saveDetailedResult(this.state.currentCaseId, score);

      // Auto-submit to Google Sheet (instructor sees it immediately)
      this.submitScore(this.state.currentCaseId, score);

      // Save to leaderboard (first attempt only)
      if (isFirstAttempt) {
        this.saveLeaderboardEntry(this.state.currentCaseId, score);
      }
  
      return score;
    },

    // --- Leaderboard ---
    saveLeaderboardEntry(caseId, score) {
      try {
        const lb = JSON.parse(localStorage.getItem('drc-leaderboard') || '[]');
        lb.push({
          studentName: this.state.studentName,
          studentId: this.state.studentId,
          className: this.state.className,
          caseId: caseId,
          caseNumber: this.state.currentCase ? this.state.currentCase.number : null,
          caseTitle: this.state.currentCase ? this.state.currentCase.title : null,
          score: score.total,
          verdict: score.verdict,
          elapsedSeconds: score.elapsedSeconds,
          achievements: score.achievements.map(a => a.id),
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('drc-leaderboard', JSON.stringify(lb));
      } catch(e) {}
    },

    getLeaderboard() {
      try { return JSON.parse(localStorage.getItem('drc-leaderboard') || '[]'); } catch(e) { return []; }
    },

    // --- Detailed Results for Instructor ---
    saveDetailedResult(caseId, score) {
      try {
        const results = JSON.parse(localStorage.getItem('drc-detailed-results') || '[]');
        results.push({
          studentName: this.state.studentName,
          studentId: this.state.studentId,
          className: this.state.className,
          caseId, caseNumber: this.state.currentCase ? this.state.currentCase.number : null,
          caseTitle: this.state.currentCase ? this.state.currentCase.title : null,
          timestamp: new Date().toISOString(),
          totalScore: score.total, verdict: score.verdict,
          evidence: score.evidence,
          crossExam: { earned: score.crossExam.earned, possible: score.crossExam.possible },
          courtroom: { earned: score.courtroom.earned, possible: score.courtroom.possible, arguments: score.courtroom.arguments },
          writtenAnswers: score.writtenAnswers
        });
        localStorage.setItem('drc-detailed-results', JSON.stringify(results));
      } catch(e) { console.log('Could not save detailed result:', e); }
    },

    getDetailedResults() {
      try { return JSON.parse(localStorage.getItem('drc-detailed-results') || '[]'); } catch(e) { return []; }
    },

    getFeedbackLog() {
      try { return JSON.parse(localStorage.getItem('drc_feedback') || '[]'); } catch(e) { return []; }
    },

    exportAllData() {
      return JSON.stringify({
        exportDate: new Date().toISOString(),
        studentResults: this.getDetailedResults(),
        feedback: this.getFeedbackLog(),
        completedCases: this.state.completedCases
      }, null, 2);
    },

    downloadExport() {
      const json = this.exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'drc-results-' + new Date().toISOString().slice(0,10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    // Student downloads their own results (to send to instructor)
    downloadMyResults() {
      const name = (this.state.studentName || 'student').replace(/\s+/g, '-');
      const cls = (this.state.className || 'no-class').replace(/\s+/g, '-');
      const myResults = this.getDetailedResults().filter(r =>
        r.studentId === this.state.studentId || r.studentName === this.state.studentName
      );
      const data = {
        studentName: this.state.studentName,
        studentId: this.state.studentId,
        className: this.state.className,
        exportDate: new Date().toISOString(),
        results: myResults
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drc-${cls}-${name}-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    // Instructor imports student JSON files into the panel view
    importStudentFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            const results = data.results || data.studentResults || [];
            if (results.length === 0) { reject('No results found in file.'); return; }
            // Merge into drc-detailed-results
            const existing = this.getDetailedResults();
            const existingIds = new Set(existing.map(r => r.studentId + '-' + r.caseId + '-' + r.timestamp));
            let added = 0;
            results.forEach(r => {
              const key = (r.studentId || r.studentName) + '-' + r.caseId + '-' + r.timestamp;
              if (!existingIds.has(key)) {
                existing.push(r);
                added++;
              }
            });
            localStorage.setItem('drc-detailed-results', JSON.stringify(existing));
            // Also merge into leaderboard
            const lb = this.getLeaderboard();
            const lbIds = new Set(lb.map(e => e.studentId + '-' + e.caseId));
            results.forEach(r => {
              const key = (r.studentId || r.studentName) + '-' + r.caseId;
              if (!lbIds.has(key)) {
                lb.push({
                  studentName: r.studentName, studentId: r.studentId,
                  className: r.className || data.className,
                  caseId: r.caseId, caseNumber: r.caseNumber, caseTitle: r.caseTitle,
                  score: r.totalScore, verdict: r.verdict,
                  elapsedSeconds: r.elapsedSeconds, achievements: r.achievements || [],
                  timestamp: r.timestamp
                });
              }
            });
            localStorage.setItem('drc-leaderboard', JSON.stringify(lb));
            resolve({ name: data.studentName || 'Unknown', class: data.className || 'Unknown', added });
          } catch(e) { reject('Invalid file format: ' + e.message); }
        };
        reader.onerror = () => reject('Could not read file.');
        reader.readAsText(file);
      });
    },
  
    // --- Persistence ---
    saveProgress() {
      try { localStorage.setItem('drc-progress', JSON.stringify(this.state.completedCases)); } catch(e) {}
    },
    loadProgress() {
      try {
        const saved = localStorage.getItem('drc-progress');
        if (saved) this.state.completedCases = JSON.parse(saved);
      } catch(e) {}
    },
    clearProgress() {
      this.state.completedCases = {};
      try { localStorage.removeItem('drc-progress'); } catch(e) {}
    }
  };
  
  // --- Start ---
  document.addEventListener('DOMContentLoaded', () => { Game.init(); });

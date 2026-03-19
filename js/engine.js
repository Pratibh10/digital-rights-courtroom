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
  
    // --- Class Access Codes (SHA-256 hashed) ---
    // IMPORTANT: This is the ONLY place class codes are defined.
    // To add a class: use the instructor panel hash generator, then paste the line here.
    // To remove a class: delete or comment out the line.
    // To change a code: delete the old line, add a new one.
    //
    // HOW TO GENERATE A HASH:
    //   1. Open the instructor panel (?panel=instructor)
    //   2. Use the "Generate Hash" tool — it gives you the exact line to paste here
    //   OR: run in terminal: echo -n "YOURCODE" | sha256sum
    //
    _classCodes: {
      'bd23fbda7155631026c89ce45c26c85cc6b74d10237c156dda4d1859ba176813': 'Class A',   // VIENNA2026
      '7f85a8ac20935d4aac3017eeb45edd067d35122a4d38bd5c1786ff708f0efd2d': 'Class B',   // DIGLAW2026
      // To add Class C, paste a new line here like:
      // 'HASH_HERE': 'Class C',   // YOURCODE
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
    // Instructor passphrase: PROF2026
    _instructorHash: '8509bbd7680391aceb4a2ed1ca6ed5685e84d85076b840b8199b1147bb252fb2',
    // Developer passphrase: DEVADMIN2026
    _developerHash: '0f2ebe157878faf335c0b74359afce43c1f16fb9dd149d8a93b2f921249cdef0',

    // --- Initialization ---
    init() {
      this.loadProgress();
      this.loadStudentIdentity();

      const params = new URLSearchParams(window.location.search);

      // Instructor panel — requires passphrase
      if (params.has('panel')) {
        this._promptPanelAccess(params.get('panel'));
        return;
      }

      // Check if already authenticated as student
      const authed = localStorage.getItem('drc-access-granted');
      if (authed && this.state.studentName) {
        this.showScreen('dashboard');
        Screens.initFeedbackButton();
      } else {
        this.promptAccessAndName(() => {
          this.showScreen('dashboard');
          Screens.initFeedbackButton();
        });
      }

      console.log('Digital Rights Courtroom v8 initialized.');
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

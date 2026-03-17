/* ============================================
   DIGITAL RIGHTS COURTROOM — Game Engine v5
   Keywords + student tracking + instructor export
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
      studentName: null
    },
  
    // --- Initialization ---
    init() {
      this.loadProgress();
      this.loadStudentName();

      // Instructor mode via URL param: ?instructor=true
      const params = new URLSearchParams(window.location.search);
      if (params.get('instructor') === 'true') {
        this.showScreen('instructor');
        Screens.initFeedbackButton();
        return;
      }

      // Prompt for student name if not set
      if (!this.state.studentName) {
        this.promptStudentName(() => {
          this.showScreen('dashboard');
        });
      } else {
        this.showScreen('dashboard');
      }

      Screens.initFeedbackButton();
      console.log('Digital Rights Courtroom v5 initialized.');
    },

    // --- Student Identity ---
    promptStudentName(callback) {
      const overlay = document.createElement('div');
      overlay.id = 'student-name-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
      overlay.innerHTML = `
        <div style="background:var(--surface-card,#1e1e32);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:2rem;max-width:420px;width:100%;text-align:center;">
          <h2 style="margin:0 0 0.5rem;color:var(--text-primary,#e4e4e7);">\u2696\uFE0F Digital Rights Courtroom</h2>
          <p style="color:var(--text-secondary,#8a8f98);font-size:0.9rem;margin-bottom:1.5rem;">Enter your name so your instructor can review your results.</p>
          <input type="text" id="student-name-input" placeholder="Your full name (e.g. Maria Chen)" style="width:100%;padding:0.65rem 0.8rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:var(--text-primary,#e4e4e7);font-size:1rem;margin-bottom:1rem;box-sizing:border-box;" autofocus>
          <button class="btn btn-primary" id="student-name-submit" style="width:100%;">Start Playing</button>
        </div>
      `;
      document.body.appendChild(overlay);

      const input = document.getElementById('student-name-input');
      const btn = document.getElementById('student-name-submit');

      const submit = () => {
        const name = input.value.trim();
        if (!name) { input.focus(); return; }
        this.state.studentName = name;
        this.saveStudentName();
        overlay.remove();
        if (callback) callback();
      };

      btn.onclick = submit;
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    },

    saveStudentName() {
      try { localStorage.setItem('drc-student-name', this.state.studentName); } catch(e) {}
    },

    loadStudentName() {
      try {
        this.state.studentName = localStorage.getItem('drc-student-name') || null;
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
        writtenAnswers: { ...this.state.writtenAnswers }
      };
  
      this.state.completedCases[this.state.currentCaseId] = {
        completed: true, score: total, verdict: verdict,
        timestamp: new Date().toISOString(), studentName: this.state.studentName
      };
      this.saveProgress();
      this.saveDetailedResult(this.state.currentCaseId, score);
  
      return score;
    },

    // --- Detailed Results for Instructor ---
    saveDetailedResult(caseId, score) {
      try {
        const results = JSON.parse(localStorage.getItem('drc-detailed-results') || '[]');
        results.push({
          studentName: this.state.studentName,
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
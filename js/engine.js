/* ============================================
   DIGITAL RIGHTS COURTROOM — Game Engine v5
   4-option courtroom + evidence citation challenge
   ============================================ */

   const Game = {

    // --- Game State ---
    state: {
      currentScreen: 'dashboard',
      currentCaseId: null,
      currentCase: null,
  
      // Per-case progress
      collectedEvidence: [],
      readEvidence: [],
  
      // Cross-examination tracking
      crossExamResults: {
        questionsAsked: [],
        totalScore: 0
      },
  
      // Courtroom tracking (v4: includes citation result)
      courtroomResults: [],
  
      // Written answers (courtroom write-before-choose)
      writtenAnswers: {
        courtroom: []
      },
  
      // Persistent progress
      completedCases: {}
    },
  
    // --- Initialization ---
    init() {
      this.loadProgress();
      this.showScreen('dashboard');
      console.log('Digital Rights Courtroom v5 initialized.');
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
        default:
          app.innerHTML = '<p>Screen not found.</p>';
      }
  
      window.scrollTo(0, 0);
    },
  
    // --- Case Management ---
    startCase(caseId) {
      const caseData = CASES.find(c => c.id === caseId);
      if (!caseData) {
        console.error('Case not found:', caseId);
        return;
      }
  
      if (caseData.evidence.length === 0) {
        alert('This case is coming soon! Content is being developed.');
        return;
      }
  
      this.state.currentCaseId = caseId;
      this.state.currentCase = caseData;
  
      // Reset per-case state
      this.state.collectedEvidence = [];
      this.state.readEvidence = [];
      this.state.crossExamResults = {
        questionsAsked: [],
        totalScore: 0
      };
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
  
    isEvidenceRead(evidenceId) {
      return this.state.readEvidence.includes(evidenceId);
    },
  
    isEvidenceCollected(evidenceId) {
      return this.state.collectedEvidence.includes(evidenceId);
    },
  
    // --- Cross-Examination ---
    recordCrossExamQuestion(questionId, impact, followedUp, score) {
      this.state.crossExamResults.questionsAsked.push({
        id: questionId,
        impact: impact,
        followedUp: followedUp,
        score: score
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
  
    // --- Courtroom Tracking (v4: quality + citation) ---
  
  // --- Keyword Validation (v5) ---
  checkKeywords(text, requiredConcepts) {
    if (!requiredConcepts || requiredConcepts.length === 0) {
      return { passed: true, totalMatched: 0, totalKeywords: 0, concepts: [] };
    }
    const lowerText = text.toLowerCase();
    const concepts = [];
    let totalKeywords = 0;
    let totalMatched = 0;
    requiredConcepts.forEach(concept => {
      const kws = concept.keywords || [];
      const matched = kws.filter(kw => lowerText.includes(kw.toLowerCase()));
      const missed = kws.filter(kw => !lowerText.includes(kw.toLowerCase()));
      const threshold = Math.ceil(kws.length / 2);
      totalKeywords += kws.length;
      totalMatched += matched.length;
      concepts.push({ name: concept.name, matched, missed, threshold, passed: matched.length >= threshold });
    });
    return { passed: concepts.every(c => c.passed), totalMatched, totalKeywords, concepts };
  },

  recordArgument(argumentId, quality, citationCorrect) {
      this.state.courtroomResults.push({
        argumentId: argumentId,
        quality: quality,
        citationCorrect: citationCorrect
      });
    },
  
    // --- Scoring ---
    // v4: quality determines base, citation is multiplier
    // strong=full, weak=half, plausible=0, wrong=0
    // correct citation=1.0x, wrong citation=0.5x
    calculateFinalScore() {
      const caseData = this.state.currentCase;
      if (!caseData) return null;
  
      // Evidence: 20 points
      const totalEvidence = caseData.evidence.length;
      const readCount = this.state.readEvidence.length;
      const evidenceScore = totalEvidence > 0
        ? Math.round((readCount / totalEvidence) * 10)
        : 0;
  
      // Cross-examination: 30 points
      const ceData = caseData.crossExamination;
      const maxCEScore = ceData ? ceData.maxQuestions * 10 : 30;
      const rawCEScore = this.state.crossExamResults.totalScore;
      const crossExamScore = Math.min(Math.round((rawCEScore / maxCEScore) * 25), 25);
  
      // Courtroom arguments: 50 points
      const totalArguments = caseData.courtroom.arguments.length;
      const pointsPerArgument = totalArguments > 0 ? 65 / totalArguments : 0;
      let courtroomScore = 0;
      const argumentDetails = [];
  
      this.state.courtroomResults.forEach((result, index) => {
        let baseScore = 0;
        if (result.quality === 'strong') baseScore = 1.0;
        else if (result.quality === 'weak') baseScore = 0.5;
        else baseScore = 0; // plausible or wrong
  
        const citationMult = result.citationCorrect ? 1.0 : 0.5;
        let earned = Math.round(pointsPerArgument * baseScore * citationMult);
        courtroomScore += earned;
  
        argumentDetails.push({
          ...result,
          earned: earned,
          possible: Math.round(pointsPerArgument)
        });
      });
  
      const total = evidenceScore + crossExamScore + courtroomScore;
  
      let verdict;
      if (total >= 75) verdict = 'won';
      else if (total >= 50) verdict = 'won_with_reservations';
      else if (total >= 25) verdict = 'lost';
      else verdict = 'dismissed';
  
      const score = {
        total: total,
        evidence: {
          earned: evidenceScore,
          possible: 10,
          found: readCount,
          total: totalEvidence
        },
        crossExam: {
          earned: crossExamScore,
          possible: 25,
          questionsAsked: this.state.crossExamResults.questionsAsked
        },
        courtroom: {
          earned: courtroomScore,
          possible: 65,
          arguments: argumentDetails
        },
        verdict: verdict,
        writtenAnswers: { ...this.state.writtenAnswers }
      };
  
      this.state.completedCases[this.state.currentCaseId] = {
        completed: true,
        score: total,
        verdict: verdict
      };
      this.saveProgress();
  
      return score;
    },
  
    // --- Persistence ---
    saveProgress() {
      try {
        localStorage.setItem('drc-progress', JSON.stringify(this.state.completedCases));
      } catch (e) {
        console.log('Could not save progress:', e);
      }
    },
  
    loadProgress() {
      try {
        const saved = localStorage.getItem('drc-progress');
        if (saved) {
          this.state.completedCases = JSON.parse(saved);
        }
      } catch (e) {
        console.log('Could not load progress:', e);
      }
    },
  
    clearProgress() {
      this.state.completedCases = {};
      try {
        localStorage.removeItem('drc-progress');
      } catch (e) {}
    }
  };
  
  // --- Start ---
  document.addEventListener('DOMContentLoaded', () => {
    Game.init();
  });
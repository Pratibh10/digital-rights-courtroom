/* ============================================
   DIGITAL RIGHTS COURTROOM — Game Engine
   Screen manager, game state, scoring
   ============================================ */

   const Game = {

    // --- Game State ---
    state: {
      currentScreen: 'dashboard',
      currentCaseId: null,
      currentCase: null,
  
      // Per-case progress (reset when starting a new case)
      collectedEvidence: [],
      analysisAnswers: {
        framework: { chosen: null, correct: false },
        article: { chosen: null, correct: false }
      },
      courtroomResults: [],
  
      // Persistent progress (saved to localStorage)
      completedCases: {}
    },
  
    // --- Initialization ---
    init() {
      this.loadProgress();
      this.showScreen('dashboard');
      console.log('Digital Rights Courtroom initialized.');
    },
  
    // --- Screen Management ---
    showScreen(screenName, data) {
      const app = document.getElementById('app');
      app.innerHTML = '';
      this.state.currentScreen = screenName;
  
      // Call the appropriate render function from screens.js
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
        case 'analysis':
          Screens.renderAnalysis(app, this.state.currentCase);
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
  
      // Scroll to top on screen change
      window.scrollTo(0, 0);
    },
  
    // --- Case Management ---
    startCase(caseId) {
      const caseData = CASES.find(c => c.id === caseId);
      if (!caseData) {
        console.error('Case not found:', caseId);
        return;
      }
  
      // Check if case has content
      if (caseData.evidence.length === 0) {
        alert('This case is coming soon! Content is being developed.');
        return;
      }
  
      this.state.currentCaseId = caseId;
      this.state.currentCase = caseData;
  
      // Reset per-case state
      this.state.collectedEvidence = [];
      this.state.analysisAnswers = {
        framework: { chosen: null, correct: false },
        article: { chosen: null, correct: false }
      };
      this.state.courtroomResults = [];
  
      this.showScreen('briefing');
    },
  
    goToDashboard() {
      this.state.currentCaseId = null;
      this.state.currentCase = null;
      this.showScreen('dashboard');
    },
  
    // --- Evidence Collection ---
    collectEvidence(evidenceId) {
      if (!this.state.collectedEvidence.includes(evidenceId)) {
        this.state.collectedEvidence.push(evidenceId);
      }
    },
  
    isEvidenceCollected(evidenceId) {
      return this.state.collectedEvidence.includes(evidenceId);
    },
  
    // --- Analysis Tracking ---
    recordAnalysisAnswer(questionType, chosenId, isCorrect) {
      this.state.analysisAnswers[questionType] = {
        chosen: chosenId,
        correct: isCorrect
      };
    },
  
    // --- Courtroom Tracking ---
    recordArgument(argumentId, quality) {
      this.state.courtroomResults.push({
        argumentId: argumentId,
        quality: quality  // 'strong', 'weak', or 'wrong'
      });
    },
  
    // --- Scoring ---
    calculateFinalScore() {
      const caseData = this.state.currentCase;
      if (!caseData) return null;
  
      // Evidence: 20 points
      const totalEvidence = caseData.evidence.length;
      const collectedCount = this.state.collectedEvidence.length;
      const evidenceScore = totalEvidence > 0
        ? Math.round((collectedCount / totalEvidence) * 20)
        : 0;
  
      // Framework identification: 15 points
      const frameworkScore = this.state.analysisAnswers.framework.correct ? 15 : 0;
  
      // Article identification: 15 points
      const articleScore = this.state.analysisAnswers.article.correct ? 15 : 0;
  
      // Courtroom arguments: 50 points
      const totalArguments = caseData.courtroom.arguments.length;
      const pointsPerArgument = totalArguments > 0 ? 50 / totalArguments : 0;
      let courtroomScore = 0;
      const argumentDetails = [];
  
      this.state.courtroomResults.forEach((result, index) => {
        let earned = 0;
        if (result.quality === 'strong') earned = pointsPerArgument;
        else if (result.quality === 'weak') earned = pointsPerArgument * 0.5;
        else earned = 0;
  
        earned = Math.round(earned);
        courtroomScore += earned;
        argumentDetails.push({
          ...result,
          earned: earned,
          possible: Math.round(pointsPerArgument)
        });
      });
  
      const total = evidenceScore + frameworkScore + articleScore + courtroomScore;
  
      // Determine verdict
      let verdict;
      if (total >= 80) verdict = 'won';
      else if (total >= 55) verdict = 'won_with_reservations';
      else if (total >= 30) verdict = 'lost';
      else verdict = 'dismissed';
  
      const score = {
        total: total,
        evidence: {
          earned: evidenceScore,
          possible: 20,
          found: collectedCount,
          total: totalEvidence
        },
        analysis: {
          earned: frameworkScore + articleScore,
          possible: 30,
          frameworkCorrect: this.state.analysisAnswers.framework.correct,
          articleCorrect: this.state.analysisAnswers.article.correct
        },
        courtroom: {
          earned: courtroomScore,
          possible: 50,
          arguments: argumentDetails
        },
        verdict: verdict
      };
  
      // Save completion
      this.state.completedCases[this.state.currentCaseId] = {
        completed: true,
        score: total,
        verdict: verdict
      };
      this.saveProgress();
  
      return score;
    },
  
    // --- Persistence (localStorage — game progress only, no personal data) ---
    saveProgress() {
      try {
        localStorage.setItem('drc-progress', JSON.stringify(this.state.completedCases));
      } catch (e) {
        // localStorage might be unavailable — that's fine, progress just won't persist
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
      } catch (e) {
        // Ignore
      }
    }
  };
  
  
  // --- Start the game when the page loads ---
  document.addEventListener('DOMContentLoaded', () => {
    Game.init();
  });
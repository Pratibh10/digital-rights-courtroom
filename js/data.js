/* ============================================
   DIGITAL RIGHTS COURTROOM — Game Data
   All case content, codex articles, and taxonomy
   ============================================ */

// --- Case Data ---
// Each case is a complete game scenario. The engine reads this data
// and renders it — no legal logic lives in the engine code.

const CASES = [
    {
      id: 'helsinki-score',
      number: 1,
      title: 'The Helsinki Score',
      subtitle: 'When Public Services Keep Score',
      framework: 'ai-act',
      frameworkLabel: 'EU AI Act',
      primaryArticles: ['Art. 5(1)(c)'],
      difficulty: 'Medium',
      estimatedMinutes: 20,
  
      briefing: {
        narrative: 'Case content coming soon. This case examines a Finnish municipality that implements a behavioral scoring system for social housing allocation, raising questions about prohibited social scoring under Article 5(1)(c) of the EU AI Act.',
        client: { name: 'Marta Korhonen', role: 'Affected Citizen' },
        respondent: { name: 'City of Helsinki Digital Services Division', type: 'Public Authority' },
        setting: 'Finnish Administrative Court, 2027'
      },
  
      evidence: [],
      analysis: { frameworkQuestion: null, articleQuestion: null },
      courtroom: { judgeName: 'Judge Aaltonen', arguments: [] },
      verdict: { winText: '', loseText: '', modelAnswer: '' }
    },
  
    {
      id: 'algorithm-said-no',
      number: 2,
      title: 'The Algorithm Said No',
      subtitle: 'When Machines Decide Your Coverage',
      framework: 'gdpr',
      frameworkLabel: 'GDPR',
      primaryArticles: ['Art. 22(1)', 'Art. 22(3)'],
      difficulty: 'Medium-Hard',
      estimatedMinutes: 25,
  
      briefing: {
        narrative: 'Case content coming soon. This case examines a pan-European insurance company that uses fully automated decision-making to deny health insurance coverage, with a "human review" process that takes an average of 11 seconds per case.',
        client: { name: 'Elena Vasquez', role: 'Insurance Applicant' },
        respondent: { name: 'EuroSecure Insurance Group', type: 'Private Company' },
        setting: 'Spanish Data Protection Agency Hearing, 2027'
      },
  
      evidence: [],
      analysis: { frameworkQuestion: null, articleQuestion: null },
      courtroom: { judgeName: 'Commissioner Delgado', arguments: [] },
      verdict: { winText: '', loseText: '', modelAnswer: '' }
    },
  
    {
      id: 'the-feed-knows',
      number: 3,
      title: 'The Feed Knows',
      subtitle: 'When Algorithms Target the Vulnerable',
      framework: 'dsa',
      frameworkLabel: 'Digital Services Act',
      primaryArticles: ['Art. 34(1)', 'Art. 35'],
      difficulty: 'Medium',
      estimatedMinutes: 22,
  
      briefing: {
        narrative: 'Case content coming soon. This case examines a major social media platform whose recommendation algorithm systematically amplifies eating disorder content to teenage users, despite internal research showing awareness of the harm.',
        client: { name: 'European Parents Coalition', role: 'Civil Society Organization' },
        respondent: { name: 'PulseMedia Inc.', type: 'Very Large Online Platform' },
        setting: 'National Digital Services Coordinator Hearing, 2027'
      },
  
      evidence: [],
      analysis: { frameworkQuestion: null, articleQuestion: null },
      courtroom: { judgeName: 'Coordinator Van Berg', arguments: [] },
      verdict: { winText: '', loseText: '', modelAnswer: '' }
    },
  
    {
      id: 'gatekeepers-thumb',
      number: 4,
      title: "The Gatekeeper's Thumb",
      subtitle: 'When the Marketplace Plays Favorites',
      framework: 'dma',
      frameworkLabel: 'Digital Markets Act',
      primaryArticles: ['Art. 6(5)'],
      difficulty: 'Medium-Low',
      estimatedMinutes: 18,
  
      briefing: {
        narrative: 'Case content coming soon. This case examines a designated gatekeeper operating both an e-commerce marketplace and its own retail brand, systematically advantaging its private-label products in search rankings.',
        client: { name: 'Independent Sellers Alliance', role: 'Business User Coalition' },
        respondent: { name: 'NovaMart Global', type: 'Designated Gatekeeper' },
        setting: 'European Commission DMA Enforcement Proceeding, 2027'
      },
  
      evidence: [],
      analysis: { frameworkQuestion: null, articleQuestion: null },
      courtroom: { judgeName: 'Commissioner Hartmann', arguments: [] },
      verdict: { winText: '', loseText: '', modelAnswer: '' }
    },
  
    {
      id: 'fired-by-numbers',
      number: 5,
      title: 'Fired by Numbers',
      subtitle: 'When the Algorithm Signs Your Termination',
      framework: 'cross-framework',
      frameworkLabel: 'GDPR + AI Act',
      primaryArticles: ['GDPR Art. 22', 'AI Act Annex III'],
      difficulty: 'Hard',
      estimatedMinutes: 30,
  
      briefing: {
        narrative: 'Case content coming soon. This cross-framework case examines an algorithmic workforce management system that automatically terminates delivery drivers, engaging both GDPR automated decision-making rights and EU AI Act high-risk system obligations.',
        client: { name: 'Thomas Brenner', role: 'Terminated Delivery Driver' },
        respondent: { name: 'SwiftLogistics Europe GmbH', type: 'Private Company' },
        setting: 'German Labor Court + Data Protection Authority Joint Proceeding, 2027'
      },
  
      evidence: [],
      analysis: { frameworkQuestion: null, articleQuestion: null },
      courtroom: { judgeName: 'Judge Weber', arguments: [] },
      verdict: { winText: '', loseText: '', modelAnswer: '' }
    }
  ];
  
  
  // --- Codex Data ---
  // Placeholder — will be populated as cases are written
  const CODEX = {
    'ai-act': {
      name: 'EU AI Act — Regulation (EU) 2024/1689',
      articles: []
    },
    'gdpr': {
      name: 'GDPR — Regulation (EU) 2016/679',
      articles: []
    },
    'dsa': {
      name: 'Digital Services Act — Regulation (EU) 2022/2065',
      articles: []
    },
    'dma': {
      name: 'Digital Markets Act — Regulation (EU) 2022/1925',
      articles: []
    }
  };
  
  
  // --- Taxonomy Data ---
  // All 76 scenario types. 'playable' is true for the 5 launch cases.
  const TAXONOMY = [
    // AI Act — Prohibited Practices (1-12)
    { id: 1, title: 'Social scoring by public authority', framework: 'ai-act', articles: 'Art. 5(1)(c)', playable: true, caseId: 'helsinki-score' },
    { id: 2, title: 'Social scoring by private entity', framework: 'ai-act', articles: 'Art. 5(1)(c)', playable: false },
    { id: 3, title: 'Subliminal manipulation causing harm', framework: 'ai-act', articles: 'Art. 5(1)(a)', playable: false },
    { id: 4, title: 'Exploitation of age vulnerability', framework: 'ai-act', articles: 'Art. 5(1)(b)', playable: false },
    { id: 5, title: 'Exploitation of disability vulnerability', framework: 'ai-act', articles: 'Art. 5(1)(b)', playable: false },
    { id: 6, title: 'Exploitation of economic vulnerability', framework: 'ai-act', articles: 'Art. 5(1)(b)', playable: false },
    { id: 7, title: 'Real-time biometric ID in public spaces', framework: 'ai-act', articles: 'Art. 5(1)(h)', playable: false },
    { id: 8, title: 'Biometric ID — serious crime exception', framework: 'ai-act', articles: 'Art. 5(2)-(3)', playable: false },
    { id: 9, title: 'Emotion recognition in workplace', framework: 'ai-act', articles: 'Art. 5(1)(f)', playable: false },
    { id: 10, title: 'Emotion recognition in education', framework: 'ai-act', articles: 'Art. 5(1)(f)', playable: false },
    { id: 11, title: 'Untargeted facial image scraping', framework: 'ai-act', articles: 'Art. 5(1)(e)', playable: false },
    { id: 12, title: 'Predictive policing based on profiling', framework: 'ai-act', articles: 'Art. 5(1)(d)', playable: false },
  
    // AI Act — High-Risk (13-28)
    { id: 13, title: 'Medical AI with biased training data', framework: 'ai-act', articles: 'Art. 10', playable: false },
    { id: 14, title: 'Medical AI with inadequate oversight', framework: 'ai-act', articles: 'Art. 14', playable: false },
    { id: 15, title: 'Education AI — unfair proctoring', framework: 'ai-act', articles: 'Art. 10, 14', playable: false },
    { id: 16, title: 'Education AI — opaque admissions', framework: 'ai-act', articles: 'Art. 13', playable: false },
    { id: 17, title: 'Employment screening with biased data', framework: 'ai-act', articles: 'Art. 10', playable: false },
    { id: 18, title: 'Employment AI lacking transparency', framework: 'ai-act', articles: 'Art. 13, 50', playable: false },
    { id: 19, title: 'Credit scoring AI with biased data', framework: 'ai-act', articles: 'Art. 10', playable: false },
    { id: 20, title: 'Insurance AI with discriminatory assessment', framework: 'ai-act', articles: 'Art. 9, 10', playable: false },
    { id: 21, title: 'Criminal risk assessment feedback loops', framework: 'ai-act', articles: 'Art. 10, 15', playable: false },
    { id: 22, title: 'Criminal risk overriding judicial discretion', framework: 'ai-act', articles: 'Art. 14', playable: false },
    { id: 23, title: 'Migration risk with nationality bias', framework: 'ai-act', articles: 'Art. 10', playable: false },
    { id: 24, title: 'Migration AI with no meaningful review', framework: 'ai-act', articles: 'Art. 14', playable: false },
    { id: 25, title: 'Critical infrastructure AI failure', framework: 'ai-act', articles: 'Art. 9, 15', playable: false },
    { id: 26, title: 'Biometric categorization by protected traits', framework: 'ai-act', articles: 'Art. 5(1)(g)', playable: false },
    { id: 27, title: 'Election-related AI manipulation', framework: 'ai-act', articles: 'Annex III §8', playable: false },
    { id: 28, title: 'Conformity assessment fraud', framework: 'ai-act', articles: 'Art. 43', playable: false },
  
    // AI Act — Transparency & GPAI (29-34)
    { id: 29, title: 'Chatbot failing to disclose AI nature', framework: 'ai-act', articles: 'Art. 50(1)', playable: false },
    { id: 30, title: 'Deepfake generation without labeling', framework: 'ai-act', articles: 'Art. 50(4)', playable: false },
    { id: 31, title: 'AI-generated journalism without disclosure', framework: 'ai-act', articles: 'Art. 50(4)', playable: false },
    { id: 32, title: 'GPAI provider — missing documentation', framework: 'ai-act', articles: 'Art. 53', playable: false },
    { id: 33, title: 'GPAI with systemic risk — no testing', framework: 'ai-act', articles: 'Art. 55', playable: false },
    { id: 34, title: 'GPAI training data copyright violation', framework: 'ai-act', articles: 'Art. 53(1)(c)-(d)', playable: false },
  
    // GDPR (35-48)
    { id: 35, title: 'Insurance denial — fully automated', framework: 'gdpr', articles: 'Art. 22(1)', playable: true, caseId: 'algorithm-said-no' },
    { id: 36, title: 'Credit rejection — no human review', framework: 'gdpr', articles: 'Art. 22(1), (3)', playable: false },
    { id: 37, title: 'Algorithmic firing — rubber-stamp review', framework: 'gdpr', articles: 'Art. 22(1), (3)', playable: true, caseId: 'fired-by-numbers' },
    { id: 38, title: 'Hiring rejection — no explanation', framework: 'gdpr', articles: 'Art. 22(3), 13-15', playable: false },
    { id: 39, title: 'Welfare eligibility denial — automated', framework: 'gdpr', articles: 'Art. 22(1)', playable: false },
    { id: 40, title: 'Housing application rejection — algorithmic', framework: 'gdpr', articles: 'Art. 22(1)', playable: false },
    { id: 41, title: 'Health triage by algorithm — no opt-out', framework: 'gdpr', articles: 'Art. 22(1), (3)', playable: false },
    { id: 42, title: 'University admission — exception claimed', framework: 'gdpr', articles: 'Art. 22(2)(a)', playable: false },
    { id: 43, title: 'Discriminatory dynamic pricing', framework: 'gdpr', articles: 'Art. 22(1)', playable: false },
    { id: 44, title: 'Content creator demonetization', framework: 'gdpr', articles: 'Art. 22(1)', playable: false },
    { id: 45, title: 'Contract exception — invalid application', framework: 'gdpr', articles: 'Art. 22(2)(a)', playable: false },
    { id: 46, title: 'Consent exception — invalid consent', framework: 'gdpr', articles: 'Art. 22(2)(c)', playable: false },
    { id: 47, title: 'Right to explanation blocked by trade secret', framework: 'gdpr', articles: 'Art. 22(3), 15', playable: false },
    { id: 48, title: 'Performative oversight — 11-second review', framework: 'gdpr', articles: 'Art. 22(1), (3)', playable: false },
  
    // DSA (49-64)
    { id: 49, title: 'Failure to remove notified illegal content', framework: 'dsa', articles: 'Art. 16', playable: false },
    { id: 50, title: 'Over-removal / censorship of legal speech', framework: 'dsa', articles: 'Art. 14(4), 17', playable: false },
    { id: 51, title: 'Algorithmic amplification — eating disorders', framework: 'dsa', articles: 'Art. 34(1)(d), 35', playable: true, caseId: 'the-feed-knows' },
    { id: 52, title: 'Algorithmic amplification — self-harm', framework: 'dsa', articles: 'Art. 34(1)(d), 35', playable: false },
    { id: 53, title: 'Algorithmic amplification — disinformation', framework: 'dsa', articles: 'Art. 34(1)(b)-(c)', playable: false },
    { id: 54, title: 'Dark patterns — cookie consent', framework: 'dsa', articles: 'Art. 25', playable: false },
    { id: 55, title: 'Dark patterns — subscription cancellation', framework: 'dsa', articles: 'Art. 25', playable: false },
    { id: 56, title: 'Dark patterns — children interface', framework: 'dsa', articles: 'Art. 25, 28', playable: false },
    { id: 57, title: 'Recommender system opacity', framework: 'dsa', articles: 'Art. 27', playable: false },
    { id: 58, title: 'Researcher data access denial', framework: 'dsa', articles: 'Art. 40', playable: false },
    { id: 59, title: 'Inadequate VLOP systemic risk assessment', framework: 'dsa', articles: 'Art. 34', playable: false },
    { id: 60, title: 'Cosmetic mitigation measures', framework: 'dsa', articles: 'Art. 35', playable: false },
    { id: 61, title: 'Advertising transparency failures', framework: 'dsa', articles: 'Art. 26', playable: false },
    { id: 62, title: 'Ad targeting minors via profiling', framework: 'dsa', articles: 'Art. 28', playable: false },
    { id: 63, title: 'Failure to appoint EU legal representative', framework: 'dsa', articles: 'Art. 13', playable: false },
    { id: 64, title: 'Notice-and-action mechanism failures', framework: 'dsa', articles: 'Art. 16', playable: false },
  
    // DMA (65-76)
    { id: 65, title: 'Search ranking self-preferencing', framework: 'dma', articles: 'Art. 6(5)', playable: false },
    { id: 66, title: 'Marketplace self-preferencing', framework: 'dma', articles: 'Art. 6(5)', playable: true, caseId: 'gatekeepers-thumb' },
    { id: 67, title: 'App store self-preferencing', framework: 'dma', articles: 'Art. 6(5)', playable: false },
    { id: 68, title: 'Interoperability blocking', framework: 'dma', articles: 'Art. 6(7)', playable: false },
    { id: 69, title: 'Sideloading prevention', framework: 'dma', articles: 'Art. 6(4)', playable: false },
    { id: 70, title: 'Tying services', framework: 'dma', articles: 'Art. 5(8)', playable: false },
    { id: 71, title: 'Anti-steering clauses', framework: 'dma', articles: 'Art. 5(4)', playable: false },
    { id: 72, title: 'Cross-service data combination', framework: 'dma', articles: 'Art. 5(2)', playable: false },
    { id: 73, title: 'Data portability obstruction', framework: 'dma', articles: 'Art. 6(9)', playable: false },
    { id: 74, title: 'MFN/parity clauses', framework: 'dma', articles: 'Art. 5(3)', playable: false },
    { id: 75, title: 'Preventing business user complaints', framework: 'dma', articles: 'Art. 5(6)', playable: false },
    { id: 76, title: 'Advertising transparency data refusal', framework: 'dma', articles: 'Art. 5(9)-(10)', playable: false },
  ];
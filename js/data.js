/* ============================================
   DIGITAL RIGHTS COURTROOM — Game Data
   All case content, codex articles, and taxonomy
   ============================================ */

// --- Case Data ---
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
    codexReferences: ['art5-1c', 'art5-penalties', 'recital-31'],

    briefing: {
      narrative: 'In early 2027, the City of Helsinki launched "CivicTrust," an AI-powered platform designed to streamline access to public housing. The system collects data from multiple municipal sources — library usage, public transport behaviour, community centre attendance, minor administrative fines, and neighbourhood cleanliness reports — to generate a "Community Responsibility Index" (CRI) for each resident. Citizens with higher CRI scores receive priority placement on the social housing waiting list, while those with lower scores are moved down or removed from the list entirely. Your client, Marta Korhonen, is a single mother of two who was removed from the housing waiting list after her CRI score dropped below the eligibility threshold. The score decline was triggered by a combination of overdue library books, irregular public transport usage patterns during a period of illness, and a neighbour\'s cleanliness complaint that was later found to be unsubstantiated. She has asked you to challenge the City\'s use of this scoring system before the Finnish Administrative Court.',
      client: { name: 'Marta Korhonen', role: 'Affected Citizen — removed from housing waiting list' },
      respondent: { name: 'City of Helsinki Digital Services Division', type: 'Public Authority' },
      setting: 'Finnish Administrative Court, Helsinki — March 2027'
    },

    evidence: [
      {
        id: 'ev1-procurement',
        type: 'procurement-document',
        title: 'CivicTrust Procurement Specification',
        date: 'June 2026',
        content: '<strong>City of Helsinki — Digital Services Division</strong><br><br><em>Project: CivicTrust Community Responsibility Platform</em><br><br>The CivicTrust platform shall aggregate citizen data from the following municipal sources to generate a Community Responsibility Index (CRI) on a scale of 0–1000:<br><br>• Helsinki Regional Transport Authority (travel pattern regularity)<br>• Helsinki City Library (borrowing compliance and return timeliness)<br>• Parks & Environment Department (neighbourhood maintenance reports)<br>• Municipal Fine Registry (minor administrative infractions)<br>• Community Centre Network (participation frequency)<br><br>The CRI shall be recalculated weekly and used as a <strong>primary ranking factor</strong> for the Social Housing Allocation Queue. Citizens scoring below 400 shall be flagged for removal from the waiting list pending manual review. The system shall evaluate behaviour over a <strong>rolling 12-month period</strong>.',
        legalSignificance: 'Establishes that the system evaluates citizens over time based on social behaviour from multiple contexts, matching the core elements of Art. 5(1)(c).'
      },
      {
        id: 'ev2-score-breakdown',
        type: 'data',
        title: 'Marta Korhonen — CRI Score Breakdown',
        date: 'January 2027',
        content: '<strong>Citizen: Marta Korhonen | CRI Score: 347/1000</strong><br><br>Score Components:<br>• Transport Regularity: 42/200 (flagged: irregular usage Nov–Dec 2026)<br>• Library Compliance: 68/200 (flagged: 3 overdue returns, avg 12 days late)<br>• Neighbourhood Index: 31/200 (flagged: 1 cleanliness complaint received)<br>• Administrative Record: 156/200 (clean — no fines)<br>• Community Participation: 50/200 (below-average attendance)<br><br><strong>Status: BELOW THRESHOLD — recommended for waiting list removal</strong><br><br><em>Note: Client reports irregular transport usage was due to hospitalisation from Nov 15 – Dec 8, 2026. Cleanliness complaint filed by neighbour was investigated and found unsubstantiated on 14 January 2027.</em>',
        legalSignificance: 'Shows the score is based on social behaviour from contexts unrelated to housing need — library usage, transport patterns, and neighbour complaints have no connection to housing eligibility.'
      },
      {
        id: 'ev3-removal-letter',
        type: 'email',
        title: 'Housing List Removal Notification',
        date: '2 February 2027',
        content: '<strong>From:</strong> Helsinki Housing Authority<br><strong>To:</strong> Marta Korhonen<br><strong>Subject:</strong> Update to Your Housing Application Status<br><br>Dear Ms Korhonen,<br><br>Following the latest assessment cycle of the CivicTrust Community Responsibility Index, your current score of 347 falls below the minimum threshold of 400 required to maintain your position on the social housing waiting list.<br><br>As a result, your application has been <strong>moved to inactive status</strong> effective immediately. You may reapply once your CRI score has risen above the threshold for three consecutive assessment cycles (minimum 3 weeks).<br><br>If you believe this assessment is in error, you may submit a review request within 30 days.<br><br>Regards,<br>Helsinki Housing Authority — Automated Correspondence',
        legalSignificance: 'Demonstrates detrimental treatment (loss of housing queue position) directly caused by the social score, and shows the decision was automated.'
      },
      {
        id: 'ev4-internal-memo',
        type: 'internal-email',
        title: 'Internal Memo: CivicTrust Legal Review',
        date: 'May 2026',
        content: '<strong>From:</strong> Jari Lähteenmäki, Legal Counsel<br><strong>To:</strong> Annika Virtanen, Director of Digital Services<br><strong>Subject:</strong> CivicTrust — Regulatory Compliance Note<br><br>Annika,<br><br>I have reviewed the CivicTrust proposal against the EU AI Act (Regulation 2024/1689). My assessment is that the system <strong>does not constitute prohibited social scoring</strong> under Article 5(1)(c) because:<br><br>1. It serves a specific public policy objective (efficient housing allocation)<br>2. The data sources are all municipal — not private surveillance<br>3. The score is used within a single service domain (housing)<br><br>I note that the European Commission guidelines are not yet finalised on this point, but I believe our interpretation is defensible.<br><br>Recommendation: Proceed, but ensure a manual review step exists for removal decisions.<br><br>— Jari',
        legalSignificance: 'Critical: shows the City was aware of Art. 5(1)(c) risk but adopted a narrow interpretation. Their three defences (specific purpose, municipal data, single domain) can all be challenged. The "manual review" recommendation appears not to have been meaningfully implemented.'
      },
      {
        id: 'ev5-testimony',
        type: 'witness-statement',
        title: 'Witness Statement: Housing Case Worker',
        date: 'February 2027',
        content: '<strong>Statement of Päivi Mäkinen, Senior Housing Case Worker</strong><br><br>"I have been a case worker with Helsinki Housing Authority for 11 years. Since CivicTrust was implemented, my role in housing list decisions has changed significantly.<br><br>Previously, I would assess each application based on need — family size, income, current housing conditions, and urgency. Now, the CRI score is the <strong>primary factor</strong>. I receive a weekly list of applicants flagged for removal. I am expected to review and approve these removals.<br><br>In practice, I process between <strong>40 and 60 removal recommendations per week</strong>. I do not have time to investigate each case individually. I check that the score is below threshold and confirm the removal. I estimate each review takes me <strong>approximately 2 minutes</strong>.<br><br>I was not consulted on the design of the scoring system and do not fully understand how the component scores are calculated."',
        legalSignificance: 'Establishes that the "manual review" is perfunctory — 2 minutes per case, no investigation, case worker does not understand the scoring. This undermines the City\'s defence that human oversight prevents harm.'
      },
      {
        id: 'ev6-statistics',
        type: 'statistics',
        title: 'CivicTrust Impact Data (6 Months)',
        date: 'February 2027',
        content: '<strong>CivicTrust System Statistics — August 2026 to January 2027</strong><br><br>Citizens scored: 23,847<br>Citizens flagged for removal: 1,203 (5.0%)<br>Citizens actually removed after review: 1,187 (98.7% of flagged)<br>Reviews resulting in score override: 16 (1.3%)<br><br>Demographic breakdown of removed citizens:<br>• Single-parent households: 34% (vs 18% of applicant pool)<br>• Citizens born outside Finland: 41% (vs 22% of applicant pool)<br>• Citizens aged 60+: 23% (vs 15% of applicant pool)<br><br><em>Note: The City has not published a formal impact assessment of the CivicTrust system on vulnerable populations.</em>',
        legalSignificance: 'The 98.7% confirmation rate suggests the manual review is a rubber stamp. The disproportionate impact on single parents, immigrants, and elderly citizens strengthens the argument that the scoring produces unjustified detrimental treatment.'
      }
    ],

    analysis: {
      frameworkQuestion: {
        prompt: 'Based on the evidence, which EU regulation is most directly applicable to challenging this scoring system?',
        correct: 'ai-act',
        writePrompt: 'Before seeing the options, write your own analysis: which EU regulation is most relevant to this case, and why? Reference specific aspects of the CivicTrust system that make this regulation applicable.',
        minWords: 25,
        requiredConcepts: [
          {
            name: 'Framework Identification',
            keywords: ['ai act', 'artificial intelligence act', '2024/1689', 'regulation on ai'],
            hints: [
              'Consider which EU regulation specifically addresses the classification and prohibition of AI systems.',
              'The regulation you are looking for entered into force in August 2024 and specifically categorises AI practices by risk level — including outright prohibitions.'
            ]
          },
          {
            name: 'Core Legal Issue',
            keywords: ['prohibited', 'social scoring', 'scoring', 'classification', 'evaluation'],
            hints: [
              'What is the CivicTrust system fundamentally doing? Think about how it uses citizen behaviour data.',
              'The system generates a score based on social behaviour. What does the AI Act call this type of practice?'
            ]
          }
        ],
        options: [
          {
            id: 'ai-act',
            label: 'EU AI Act (Regulation 2024/1689) — Prohibited AI Practices',
            feedback: 'Correct. The CivicTrust system evaluates and classifies citizens over time based on their social behaviour, generating a score that leads to detrimental treatment in a context (housing) unrelated to the contexts where the data was collected (library use, transport, neighbour reports). This falls squarely within the prohibited practice defined in Article 5(1)(c) of the EU AI Act.'
          },
          {
            id: 'gdpr',
            label: 'GDPR (Regulation 2016/679) — Automated Decision-Making',
            feedback: 'Not the strongest choice. While GDPR Article 22 on automated decision-making is relevant as a supplementary argument, the EU AI Act provides a more powerful tool here: Article 5(1)(c) categorically prohibits this type of social scoring system. Under GDPR, you would need to argue the decision lacked adequate human involvement. Under the AI Act, the system itself is prohibited regardless of human oversight.'
          },
          {
            id: 'dsa',
            label: 'Digital Services Act (Regulation 2022/2065)',
            feedback: 'Incorrect. The DSA regulates online intermediary services, platforms, and search engines. The CivicTrust system is a municipal public service tool, not an online platform or intermediary service. The DSA does not apply to this scenario.'
          }
        ]
      },
      articleQuestion: {
        prompt: 'Which specific provision of the EU AI Act is most directly violated by the CivicTrust system?',
        correct: 'art5-1c',
        writePrompt: 'Now identify the specific article. Which provision of the AI Act does this system violate, and what are the two conditions that make the CivicTrust scoring system fall under this prohibition?',
        minWords: 20,
        requiredConcepts: [
          {
            name: 'Specific Article',
            keywords: ['article 5', 'art. 5', 'art 5'],
            hints: [
              'Which article of the AI Act lists the practices that are completely banned?',
              'The prohibited practices are all listed in a single article in the single digits. It is the article that deals with unacceptable risk.'
            ]
          },
          {
            name: 'Detrimental Treatment',
            keywords: ['detrimental', 'unfavourable', 'harmful', 'unrelated context', 'cross-context', 'disproportionate'],
            hints: [
              'What happens to citizens as a result of their CRI score? Think about the consequences.',
              'The prohibition has two limbs: treatment in unrelated contexts, and treatment disproportionate to behaviour. Can you identify either?'
            ]
          }
        ],
        options: [
          {
            id: 'art5-1c',
            label: 'Article 5(1)(c) — Prohibition of social scoring leading to detrimental treatment',
            feedback: 'Correct. Article 5(1)(c) prohibits AI systems that evaluate or classify persons over a period of time based on their social behaviour or personal characteristics, where the resulting social score leads to detrimental treatment in contexts unrelated to where the data was collected, or treatment that is disproportionate to the behaviour. The CivicTrust system meets both criteria: library and transport data used for housing decisions (unrelated contexts), and housing list removal for overdue library books (disproportionate treatment).'
          },
          {
            id: 'art5-1a',
            label: 'Article 5(1)(a) — Prohibition of subliminal manipulation',
            feedback: 'Incorrect. Article 5(1)(a) prohibits AI systems that deploy subliminal techniques beyond a person\'s consciousness to materially distort behaviour. The CivicTrust system does not operate subliminally — citizens are aware their behaviour is being monitored and scored. The issue is not manipulation but rather the use of social scoring for detrimental treatment.'
          },
          {
            id: 'annex-iii',
            label: 'Annex III / Article 6 — High-risk AI system (public services)',
            feedback: 'Not the best answer. While AI systems used in access to essential public services are listed as high-risk under Annex III, this classification requires compliance measures — it does not prohibit the system. Article 5(1)(c) is stronger because it prohibits the system entirely. A prohibited practice cannot be made compliant through conformity assessment; it must be discontinued.'
          }
        ]
      }
    },

    courtroom: {
      judgeName: 'Judge Aaltonen',
      arguments: [
        {
          id: 'arg1',
          context: 'Counsel, the respondent argues that CivicTrust serves a legitimate public interest — efficient allocation of scarce housing resources — and that it evaluates citizens for this specific purpose only. They cite Recital 31 of the AI Act, which states that the prohibition "should not affect lawful evaluation practices of natural persons that are carried out for a specific purpose in accordance with Union and national law." How do you respond?',
          writePrompt: 'The respondent claims this is a lawful, purpose-specific evaluation. How would you counter this argument? What makes the CivicTrust data collection different from a legitimate purpose-specific assessment?',
          minWords: 20,
          requiredConcepts: [
            {
              name: 'Cross-Context Argument',
              keywords: ['unrelated', 'cross-context', 'different context', 'library', 'transport', 'housing'],
              hints: [
                'Think about WHERE the data comes from versus WHERE it is being used. Are those the same context?',
                'Library return behaviour and transport patterns are collected in one context. Housing allocation is a completely different context. What does Article 5(1)(c) say about this?'
              ]
            }
          ],
          options: [
            {
              id: 'arg1-strong',
              quality: 'strong',
              text: 'Your Honour, the Recital 31 exception requires that the evaluation be carried out for a specific purpose using data relevant to that purpose. CivicTrust does the opposite — it aggregates data from library usage, transport patterns, and neighbour complaints to make housing decisions. These data sources have no lawful connection to housing need. The system evaluates social behaviour across multiple unrelated contexts and uses the resulting score to determine access to an essential public service. This is precisely the cross-context detrimental treatment that Article 5(1)(c) was designed to prohibit.',
              judge_response: 'A well-constructed argument, Counsel. You correctly identify the cross-context nature of the data aggregation as the distinguishing factor. The court notes that the legislative intent behind Article 5(1)(c) was to prevent exactly this type of comprehensive social behaviour evaluation.',
              legal_reasoning: 'This is the strongest argument because it directly addresses the respondent\'s defence by turning the Recital 31 exception against them. The key legal test under Article 5(1)(c) requires showing that the social score leads to detrimental treatment "in social contexts that are unrelated to the contexts in which the data was originally generated or collected." Library compliance data used for housing allocation is a textbook example of cross-context use.'
            },
            {
              id: 'arg1-weak',
              quality: 'weak',
              text: 'Your Honour, the CivicTrust system is fundamentally unfair because it punishes people for minor behaviours like returning library books late. Removing someone from a housing waiting list because of overdue library books is disproportionate and unjust, regardless of what the regulation says about specific purposes.',
              judge_response: 'Counsel, while the court sympathises with the fairness concern, I need you to anchor your argument in the specific legal provisions. Can you direct me to the precise element of Article 5(1)(c) that this system violates?',
              legal_reasoning: 'This argument is emotionally compelling but legally weak because it relies on a general fairness claim rather than the specific legal test in Article 5(1)(c). The second limb of the prohibition — "disproportionate to their social behaviour or its gravity" — actually supports this point, but it needs to be explicitly connected to the article text to be effective in court.'
            },
            {
              id: 'arg1-wrong',
              quality: 'wrong',
              text: 'Your Honour, as a public authority, the City of Helsinki should have conducted a conformity assessment and obtained CE marking before deploying CivicTrust. Their failure to comply with the high-risk AI system requirements under Article 6 and Annex III means the system is unlawfully deployed.',
              judge_response: 'Counsel, I must caution you — you appear to be conflating two distinct regulatory categories. If this system falls under Article 5 as a prohibited practice, the question of high-risk conformity assessment under Article 6 does not arise. A prohibited system cannot be made lawful through compliance procedures. Which category are you arguing applies here?',
              legal_reasoning: 'This is wrong because it confuses prohibited practices (Article 5) with high-risk systems (Article 6/Annex III). This is one of the most common mistakes in AI Act analysis. Prohibited practices are categorically banned — no amount of conformity assessment, human oversight, or documentation can make them lawful. Arguing for conformity assessment implicitly concedes that the system could be made compliant, which undermines the stronger argument that it must be shut down entirely.'
            }
          ]
        },
        {
          id: 'arg2',
          context: 'The respondent now argues that the system includes meaningful human oversight — a housing case worker reviews every removal decision before it is finalised. They submit that this prevents any automated detrimental treatment and distinguishes CivicTrust from the type of system contemplated by Article 5(1)(c). What is your response?',
          writePrompt: 'The City says human review makes the system lawful. Draft your counter-argument. Consider: what did the evidence reveal about how the review actually works, and does human oversight matter under Article 5?',
          minWords: 20,
          requiredConcepts: [
            {
              name: 'Oversight Quality',
              keywords: ['rubber stamp', '2 minute', 'two minute', 'perfunctory', '98', 'confirmation rate', 'meaningless', 'superficial', 'illusory'],
              hints: [
                'What did the case worker testimony and the statistics reveal about the quality of the review process?',
                'Remember the numbers: how long did each review take? What percentage of flagged removals were confirmed? What does this tell you?'
              ]
            }
          ],
          options: [
            {
              id: 'arg2-strong',
              quality: 'strong',
              text: 'Your Honour, the evidence demonstrates that human oversight is illusory. The case worker testimony confirms that each review takes approximately 2 minutes, the case worker processes 40 to 60 removals per week, she does not understand how the scoring components are calculated, and the system statistics show a 98.7% confirmation rate. This is not meaningful human oversight — it is a rubber stamp. But more fundamentally, Article 5(1)(c) prohibits the AI system itself: the placing on the market or use of AI systems for evaluation or classification based on social behaviour leading to detrimental treatment. The prohibition attaches to the system, not to individual decisions. Adding a perfunctory human step does not transform a prohibited system into a lawful one.',
              judge_response: 'The court finds this argument compelling. You correctly distinguish between the lawfulness of the system and the lawfulness of individual decisions. The evidence regarding the review process is noted — a 98.7% confirmation rate with 2-minute reviews does raise serious questions about the meaningfulness of oversight. Proceed.',
              legal_reasoning: 'This is the strongest argument because it works on two levels. First, it demolishes the human oversight defence with concrete evidence (2-minute reviews, 98.7% confirmation, lack of understanding). Second, and more importantly, it makes the structural legal point: Article 5(1)(c) prohibits the system itself, not just automated decisions. Human oversight cannot cure a prohibited practice — it can only be relevant for high-risk systems under Article 14.'
            },
            {
              id: 'arg2-weak',
              quality: 'weak',
              text: 'Your Honour, while a human case worker does technically review the decisions, the GDPR requires that automated decisions significantly affecting individuals must involve meaningful human intervention under Article 22. A 2-minute review does not meet this standard, so the decisions are effectively fully automated.',
              judge_response: 'Counsel, the GDPR argument has some merit regarding the quality of human review, but we are primarily examining this system under the AI Act. Can you tell me whether the presence or absence of human oversight changes the analysis under Article 5(1)(c) specifically?',
              legal_reasoning: 'This argument is valid but suboptimal because it relies on GDPR Article 22 rather than the AI Act\'s own framework. Under the AI Act, the critical point is that Article 5 prohibitions apply to the system regardless of oversight arrangements. The GDPR argument about meaningful human intervention is a supplementary point, not the primary one. In this courtroom, the AI Act provides the stronger weapon.'
            },
            {
              id: 'arg2-wrong',
              quality: 'wrong',
              text: 'Your Honour, the fact that a human reviews the decision means this is not really an AI system at all. Since the final decision is made by a person, the AI Act does not apply — the system is merely an advisory tool that supports human decision-making.',
              judge_response: 'Counsel, that argument is not supported by the Act. The AI Act applies to AI systems that are "used" for certain purposes — the definition does not require that the AI system makes the final decision autonomously. An AI system that generates a score which is then routinely adopted by a human decision-maker remains an AI system under Regulation 2024/1689. This argument is rejected.',
              legal_reasoning: 'This is wrong because it misunderstands the AI Act\'s scope. The Act applies to AI systems based on their function, not on whether a human makes the final decision. Article 5(1)(c) prohibits "the use of AI systems for the evaluation or classification" — the prohibited activity is the evaluation and scoring itself, not the downstream decision. The case worker\'s rubber-stamp review does not take the system outside the Act\'s scope.'
            }
          ]
        },
        {
          id: 'arg3',
          context: 'For your final argument, the court would like to hear your position on remedy. If the court finds that CivicTrust violates Article 5(1)(c), what should the appropriate response be? The respondent suggests that modifying the system — for example, reducing the number of data sources or increasing human oversight — would be sufficient to address any concerns.',
          writePrompt: 'What remedy should the court order? Think carefully: if a system is found to be a prohibited practice under Article 5, can it be modified into compliance, or must something more drastic happen? What is the key distinction in the AI Act\'s regulatory architecture?',
          minWords: 20,
          requiredConcepts: [
            {
              name: 'Prohibition vs Compliance',
              keywords: ['cease', 'stop', 'discontinue', 'shut down', 'cannot be modified', 'prohibited', 'cannot be made compliant', 'categorical'],
              hints: [
                'If something is prohibited, can it be fixed with better compliance measures? Or does it need to stop entirely?',
                'Think about the difference between a prohibited practice (Article 5) and a high-risk system (Article 6). One can be made compliant with requirements. The other cannot.'
              ]
            }
          ],
          options: [
            {
              id: 'arg3-strong',
              quality: 'strong',
              text: 'Your Honour, Article 5 is a categorical prohibition, not a compliance framework. Unlike high-risk AI systems under Article 6, which can be made lawful through conformity assessment, risk management, and oversight requirements, a system that falls within Article 5 must be discontinued. The appropriate remedy is threefold: first, an order requiring the City to cease use of CivicTrust immediately; second, reinstatement of Ms Korhonen and all citizens removed from the waiting list on the basis of CRI scores; and third, referral to the Finnish market surveillance authority for enforcement proceedings, noting that Article 99(3) provides for fines of up to 35 million euros or 7% of worldwide annual turnover for prohibited practice violations.',
              judge_response: 'The court appreciates the clarity and precision of this submission. You correctly identify the categorical nature of the prohibition and the distinction between prohibited and high-risk regulatory treatment. The remedy of cessation rather than modification is legally sound. The court will take your submissions under consideration.',
              legal_reasoning: 'This is the strongest argument because it demonstrates understanding of the AI Act\'s regulatory architecture. The distinction between prohibited (Article 5) and high-risk (Articles 6-27) systems is fundamental: prohibited systems cannot be modified into compliance — they must be stopped. The specific fine figure (€35 million or 7% of turnover under Article 99(3)) demonstrates command of the enforcement framework, and requesting reinstatement addresses the immediate harm to the client.'
            },
            {
              id: 'arg3-weak',
              quality: 'weak',
              text: 'Your Honour, while I believe the system should be shut down, perhaps the court could order the City to reduce the number of data sources — for example, using only housing-related criteria — and to implement genuine human oversight. This would address the cross-context concern while preserving the City\'s ability to manage housing allocation efficiently.',
              judge_response: 'Counsel, I appreciate the pragmatism, but are you certain this is the correct legal position? If the court finds a prohibited practice under Article 5, does the regulation permit modification as a remedy, or does it require something more definitive?',
              legal_reasoning: 'This argument is weak because it implicitly accepts the respondent\'s framing that the system can be fixed. If CivicTrust violates Article 5(1)(c), it is prohibited — full stop. Suggesting modifications undermines your own case by implying the system is merely non-compliant (a high-risk issue) rather than fundamentally unlawful (a prohibited practice). A lawyer who has established a prohibition should demand cessation, not compromise.'
            },
            {
              id: 'arg3-wrong',
              quality: 'wrong',
              text: 'Your Honour, I request that the court order the City to conduct a fundamental rights impact assessment under Article 27 and to register CivicTrust in the EU database under Article 71 before continuing to operate the system.',
              judge_response: 'Counsel, Articles 27 and 71 apply to high-risk AI systems, not to prohibited practices. If this court finds that CivicTrust violates Article 5, there is no pathway to continued operation through impact assessments or registration. These are compliance tools for lawful systems, not remedies for unlawful ones. Your submission on remedy is noted but does not appear to follow from your earlier arguments.',
              legal_reasoning: 'This is wrong because Articles 27 (fundamental rights impact assessment) and 71 (EU database registration) are obligations that apply to high-risk AI systems. Requesting these measures for a system you have argued is prohibited under Article 5 is contradictory — it suggests the system could continue operating with additional compliance measures. This fundamentally undermines the entire case and confuses the prohibited/high-risk distinction that is central to the AI Act\'s architecture.'
            }
          ]
        }
      ]
    },

    verdict: {
      winText: 'The Finnish Administrative Court finds that the CivicTrust Community Responsibility Index constitutes a prohibited AI practice under Article 5(1)(c) of Regulation (EU) 2024/1689. The system evaluates and classifies citizens over time based on social behaviour collected across multiple unrelated contexts, and the resulting score leads to detrimental treatment — removal from the social housing waiting list — that is both unrelated to the original data contexts and disproportionate to the behaviours assessed. The City of Helsinki is ordered to cease operation of CivicTrust immediately and to reinstate all affected citizens to the housing waiting list.',
      loseText: 'The court finds that while the CivicTrust system raises significant concerns, the evidence presented was insufficient to establish all elements of the Article 5(1)(c) prohibition. Stronger arguments connecting the specific legal criteria to the facts may have produced a different outcome.',
      modelAnswer: 'The CivicTrust system violates Article 5(1)(c) of the EU AI Act on two independent grounds. First, it produces detrimental treatment in contexts unrelated to the data collection contexts: library borrowing habits, public transport usage patterns, and neighbourhood cleanliness complaints are used to determine access to social housing — a context entirely unrelated to any of these data sources. Second, the detrimental treatment is disproportionate to the gravity of the behaviour: removal from a housing waiting list — affecting a fundamental need — is triggered by minor administrative matters such as overdue library books and an unsubstantiated neighbour complaint. The City\'s three defences all fail: (1) the "specific purpose" defence under Recital 31 requires data relevant to that purpose, which library and transport data are not; (2) the municipal data source argument is irrelevant because Article 5(1)(c) does not distinguish between public and private data sources; (3) the human oversight defence fails because Article 5 prohibits the system itself, and the evidence shows the review was perfunctory (2-minute reviews, 98.7% confirmation rate). The appropriate remedy is mandatory cessation, not modification, because prohibited practices under Article 5 cannot be made compliant through additional safeguards — unlike high-risk systems under Articles 6–27. Enforcement carries penalties of up to €35 million or 7% of worldwide annual turnover under Article 99(3).'
    }
  },

  // --- CASE 2: Placeholder ---
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

  // --- CASE 3: Placeholder ---
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

  // --- CASE 4: Placeholder ---
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

  // --- CASE 5: Placeholder ---
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
const CODEX = {
  'ai-act': {
    name: 'EU AI Act — Regulation (EU) 2024/1689',
    articles: [
      {
        id: 'art5-1c',
        number: 'Art. 5(1)(c)',
        title: 'Prohibition of Social Scoring',
        officialText: 'The following AI practices shall be prohibited: [...] (c) the placing on the market, the putting into service or the use of AI systems for the evaluation or classification of natural persons or groups of persons over a certain period of time based on their social behaviour or known, inferred or predicted personal or personality characteristics, with the social score leading to either or both of the following: (i) detrimental or unfavourable treatment of certain natural persons or groups of persons in social contexts that are unrelated to the contexts in which the data was originally generated or collected; (ii) detrimental or unfavourable treatment of certain natural persons or groups of persons that is unjustified or disproportionate to their social behaviour or its gravity.',
        plainLanguage: 'AI systems that score people based on their social behaviour and then use that score to harm them in unrelated areas of life — or to punish them disproportionately — are completely banned. This applies to both public authorities and private companies.',
        cases: ['helsinki-score']
      },
      {
        id: 'art5-penalties',
        number: 'Art. 99(3)',
        title: 'Penalties for Prohibited Practices',
        officialText: 'Non-compliance with the prohibition of the AI practices referred to in Article 5 shall be subject to administrative fines of up to EUR 35 000 000 or, if the offender is an undertaking, up to 7 % of its total worldwide annual turnover for the preceding financial year, whichever is higher.',
        plainLanguage: 'Deploying a prohibited AI system can result in fines of up to €35 million or 7% of global annual revenue — the highest penalty tier in the AI Act. This is deliberately set higher than GDPR fines to reflect the severity of prohibited practices.',
        cases: ['helsinki-score']
      },
      {
        id: 'recital-31',
        number: 'Recital 31',
        title: 'Social Scoring — Scope and Exceptions',
        officialText: 'AI systems providing social scoring of natural persons by public or private actors may lead to discriminatory outcomes and the exclusion of certain groups. They may violate the right to dignity and non-discrimination and the values of equality and justice. [...] That prohibition should not affect lawful evaluation practices of natural persons that are carried out for a specific purpose in accordance with Union and national law.',
        plainLanguage: 'The social scoring ban has a narrow exception: evaluating people for a specific, lawful purpose is still allowed. But this exception only applies when the data being used is relevant to that specific purpose — not when data from multiple unrelated areas of life is aggregated into a general behaviour score.',
        cases: ['helsinki-score']
      },
      {
        id: 'art5-1a',
        number: 'Art. 5(1)(a)',
        title: 'Prohibition of Subliminal Manipulation',
        officialText: 'The following AI practices shall be prohibited: (a) the placing on the market, the putting into service or the use of an AI system that deploys subliminal techniques beyond a person\'s consciousness or purposefully manipulative or deceptive techniques, with the objective or the effect of materially distorting the behaviour of a person or a group of persons [...].',
        plainLanguage: 'AI systems that manipulate people without their awareness — through hidden techniques or intentional deception — are banned when this manipulation causes or is likely to cause significant harm.',
        cases: []
      },
      {
        id: 'art6-high-risk',
        number: 'Art. 6',
        title: 'Classification Rules for High-Risk AI Systems',
        officialText: '[...] An AI system [...] shall be considered to be high-risk where both of the following conditions are fulfilled: (a) the AI system is intended to be used as a safety component of a product, or the AI system is itself a product [...]; (b) the product whose safety component [...] is the AI system, or the AI system itself as a product, is required to undergo a third-party conformity assessment [...].',
        plainLanguage: 'High-risk AI systems are a separate category from prohibited ones. High-risk systems are legal but must meet strict requirements including risk management, data governance, transparency, human oversight, and conformity assessment. This is fundamentally different from prohibited systems, which cannot be made compliant at all.',
        cases: ['helsinki-score']
      }
    ]
  },
  'gdpr': {
    name: 'GDPR — Regulation (EU) 2016/679',
    articles: [
      {
        id: 'gdpr-art22',
        number: 'Art. 22',
        title: 'Automated Individual Decision-Making, Including Profiling',
        officialText: '1. The data subject shall have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning him or her or similarly significantly affects him or her. 2. Paragraph 1 shall not apply if the decision: (a) is necessary for entering into, or performance of, a contract [...]; (b) is authorised by Union or Member State law [...]; or (c) is based on the data subject\'s explicit consent.',
        plainLanguage: 'People have the right not to have important decisions made about them entirely by machines. There are three exceptions: when it\'s necessary for a contract, when law authorises it, or when the person explicitly consents. Even when exceptions apply, the data subject has the right to obtain human intervention, express their point of view, and contest the decision.',
        cases: ['algorithm-said-no', 'fired-by-numbers']
      }
    ]
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
const TAXONOMY = [
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
  { id: 29, title: 'Chatbot failing to disclose AI nature', framework: 'ai-act', articles: 'Art. 50(1)', playable: false },
  { id: 30, title: 'Deepfake generation without labeling', framework: 'ai-act', articles: 'Art. 50(4)', playable: false },
  { id: 31, title: 'AI-generated journalism without disclosure', framework: 'ai-act', articles: 'Art. 50(4)', playable: false },
  { id: 32, title: 'GPAI provider — missing documentation', framework: 'ai-act', articles: 'Art. 53', playable: false },
  { id: 33, title: 'GPAI with systemic risk — no testing', framework: 'ai-act', articles: 'Art. 55', playable: false },
  { id: 34, title: 'GPAI training data copyright violation', framework: 'ai-act', articles: 'Art. 53(1)(c)-(d)', playable: false },
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
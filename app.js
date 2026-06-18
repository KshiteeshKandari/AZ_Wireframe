/* 
  AZ Companion Application Logic
  Handles State Management, Routing, Dynamic Rendering, 
  Multi-level Chat Suggestions, and Simulated AI Interactions
*/

// --- Application State ---
const state = {
  activePage: 'my-cases',
  cases: [
    {
      id: 'rivera-family',
      name: 'Rivera Family',
      details: 'Intake Completed &bull; Primary: Sophia Rivera',
      patientName: 'Maria Rivera',
      patientAge: 74,
      intakeNotes: `<strong>Patient Name:</strong> Maria Rivera (Age 74).<br><strong>Case Details:</strong> Early-stage ADRD diagnosed Q3 2025. Maria lives with her daughter, Sophia, who acts as primary caregiver. Sophia reports gradual increase in memory loss, word-finding difficulty, and mild anxiety in unfamiliar surroundings. Social support is limited to bi-weekly visits from a cousin.<br><br><strong>Intake Assessment:</strong> Patient shows orientation to self and place but exhibits difficulty with temporal orientation. Sophia requests advice on daily structuring, safety measures at home (wandering mitigation), and caregiver burnout prevention groups.`,
      timeline: [
        { date: 'Oct 12, 2025', label: 'Initial Diagnosis (ADRD)' },
        { date: 'Jan 08, 2026', label: 'Intake Assessment Registered' },
        { date: 'Jun 18, 2026', label: 'Care Plan Review (Active)' }
      ],
      resources: [
        { name: 'ADRD Communication Guide (PDF)', url: '#' },
        { name: 'Home Safety Checklist for Dementia', url: '#' },
        { name: 'Local Support Group Directory', url: '#' }
      ],
      aiSummary: 'Maria Rivera presents with progressive cognitive decline consistent with early ADRD, supported by primary caregiver Sophia. The primary risk profile is moderate, focused on home safety and caregiver exhaustion. Recommended actions include establishing a daily structured routine, installing smart safety monitors, and referring Sophia to the local ADRD Caregiver Support Network.',
      reportStatus: 'Generated',
      reportPeriod: 'Q2 2024',
      reportContent: `
        <h5>1. Assessment Status</h5>
        <p>The patient, Maria Rivera, has completed a full intake cycle. Secondary observations confirm early-stage cognitive adjustments. Support structures (daughter Sophia) are functional but demonstrate elevated fatigue indicators.</p>
        <h5>2. Key Risk Elements</h5>
        <ul>
          <li><strong>Caregiver Burnout Index:</strong> 8/10 (High). Critical need for weekend respite care.</li>
          <li><strong>Spatial Orientation:</strong> Decreased orientation outside immediate home perimeter. Wandering risks remain low-moderate but require preventive attention.</li>
        </ul>
        <h5>3. Care Recommendations</h5>
        <p>Establish a regular local care routine. Enroll Maria in the adult day-enrichment program 2 days a week to provide caregiver relief. Introduce sensory engagement and track sleep cycles to log anomalies.</p>
      `,
      shared: false,
      graphData: 'M0,20 L15,18 L30,22 L45,10 L60,30 L75,15 L90,25 L105,12 L120,20'
    },
    {
      id: 'oklaz-family',
      name: 'Oklaz Family',
      details: 'Awaiting AI Report &bull; Primary: Viktor Oklaz',
      patientName: 'Viktor Oklaz',
      patientAge: 81,
      intakeNotes: `<strong>Patient Name:</strong> Viktor Oklaz (Age 81).<br><strong>Case Details:</strong> Moderate stage Alzheimer's. Managed jointly by his son, Alex Oklaz, and a visiting nurse service twice a week. Viktor exhibits moderate disorientation regarding time and place, as well as periodic agitation in late afternoons ("sundowning").<br><br><strong>Intake Assessment:</strong> Nurse reported heightened safety risks due to Viktor attempting to leave the house unescorted. Alex requested professional respite care resources and behavioral strategies to calm Viktor during Sundowning episodes.`,
      timeline: [
        { date: 'Feb 14, 2024', label: 'Initial Consultation' },
        { date: 'Dec 19, 2025', label: 'Shared Case Registered in Org' },
        { date: 'Jun 05, 2026', label: 'Home Nurse Schedule Updated' }
      ],
      resources: [
        { name: 'Sundowning Management Protocols', url: '#' },
        { name: 'Respite Care Subsidy Options', url: '#' },
        { name: 'GPS Tracking Wristband Providers', url: '#' }
      ],
      aiSummary: 'Viktor Oklaz is an 81-year-old patient experiencing moderate sundowning-related agitation and wandering behavior. Shared case management is active. Recommendation includes immediate exploration of wearable GPS trackers, implementation of sensory light therapies in late afternoons, and facilitating temporary respite care relief for Alex Oklaz.',
      reportStatus: 'Not Generated',
      reportPeriod: 'Q2 2024',
      reportContent: `
        <h5>1. Assessment Status</h5>
        <p>The patient, Viktor Oklaz, is experiencing moderate stage Alzheimer's, which requires intensive daytime and afternoon care coordination. Primary caregiver Alex Oklaz exhibits moderate-high burden markers.</p>
        <h5>2. Key Risk Elements</h5>
        <ul>
          <li><strong>Agitation Profile:</strong> Daily afternoon sundowning episodes from 4 PM - 7 PM.</li>
          <li><strong>Safety Alert:</strong> High risk of wandering. Patient has attempted exit door egress unassisted.</li>
        </ul>
        <h5>3. Recommended Care Actions</h5>
        <p>Deploy sensory lighting adjustments during sundowning periods. Install smart exit door sensors. Request county health respite funding support for visiting assistant nurses.</p>
      `,
      shared: true,
      graphData: 'M0,30 L10,32 L20,25 L35,28 L50,15 L65,35 L80,22 L95,18 L110,8 L120,5'
    },
    {
      id: 'pierre-family',
      name: 'Pierre Family',
      details: 'Pending Intake &bull; Primary: Henri Pierre',
      patientName: 'Henri Pierre',
      patientAge: 79,
      intakeNotes: `<strong>Patient Name:</strong> Henri Pierre (Age 79).<br><strong>Case Details:</strong> Early-stage cognitive impairment with mixed vascular dementia. Living independently with daily checks from his niece, Marcelle Pierre. Focus is on maintaining cognitive engagement, nutrition management, and tracking medical adherence.<br><br><strong>Intake Assessment:</strong> Intake pending full physical exam. Initial screenings show minor short-term recall impairment. Marcelle is requesting support tools to organize medication dosages and ensure Henri receives healthy daily meals.`,
      timeline: [
        { date: 'May 20, 2026', label: 'Vascular Screening Review' },
        { date: 'Jun 25, 2026', label: 'Scheduled Physical Exam (Pending)' }
      ],
      resources: [
        { name: 'Vascular Dementia Lifestyle Guidelines', url: '#' },
        { name: 'Medication Reminder Apps & Dispensers', url: '#' },
        { name: 'Meal Delivery Services for Seniors', url: '#' }
      ],
      aiSummary: 'Henri Pierre is in the initial phases of vascular dementia care. Main support requirements center on dietary adherence and medication scheduling. Recommended strategy includes deploying an automated pill dispenser, enrolling in senior meal programs, and introducing routine memory exercises to preserve cognitive abilities.',
      reportStatus: 'Pending Intake',
      reportPeriod: 'Q2 2024',
      reportContent: `
        <h5>1. Assessment Status</h5>
        <p>Intake Pending physical results. Henri lives independently but requires tracking structures for general medication adherence and nutrition support.</p>
        <h5>2. Clinical Profile</h5>
        <p>Early stage vascular impairment. Heart rate and blood pressure check-ups scheduled monthly. Marcelle Pierre coordinating daily.</p>
      `,
      shared: false,
      graphData: 'M0,15 L20,17 L40,14 L60,18 L80,10 L100,12 L120,8'
    }
  ],
  chatHistory: [
    {
      sender: 'assistant',
      text: 'Hello! I am your AI Companion. I can help summarize case notes, generate local resources, draft family care plans, or analyze trends. Ask me anything about your active families (Rivera, Oklaz, Pierre).',
      time: '15:15'
    },
    {
      sender: 'user',
      text: 'Can you summarize the Rivera Family case and show what action items we should focus on?',
      time: '15:16'
    },
    {
      sender: 'assistant',
      text: 'Certainly! Here is a high-level care summary and action plan for the <strong>Rivera Family</strong> based on Maria\'s clinical intake files:',
      time: '15:16',
      embedCard: {
        title: 'Case Summary: Rivera Family',
        tag: 'Early ADRD',
        caregiver: 'Sophia Rivera (Daughter)',
        focus: 'Memory preservation, wandering anxiety, caregiver burnout.',
        metrics: [
          { label: 'Caregiver Burden Risk', val: 'High', width: '75%', color: '#ef4444' },
          { label: 'Wandering Risk', val: 'Mod', width: '40%', color: '#f59e0b' }
        ]
      },
      additionalText: '<strong>Key Action Items:</strong><ol><li><strong>Caregiver Support:</strong> Schedule Sophia for a local ADRD Support Group consult.</li><li><strong>Daily Structuring:</strong> Set up a visual, predictable schedule board for Maria at home.</li><li><strong>Safety Audit:</strong> Recommend simple wandering safeguards (e.g. chime alarm on exit doors).</li></ol>'
    }
  ]
};

// --- Chat Suggestions Configuration Data ---
const suggestionsData = {
  categories: [
    { id: 'rapport', label: 'First Encounters & Rapport' },
    { id: 'difficult', label: 'Navigating Difficult Conversations' },
    { id: 'expectations', label: 'Expectations & Advocacy' },
    { id: 'hurdles', label: 'Communication Hurdles' }
  ],
  questions: {
    rapport: [
      "How do I build rapport during my first conversation with a new family?",
      "Can we roleplay an approach for a first conversation with a hesitant patient?"
    ],
    difficult: [
      "Help me prepare for a conversation with a family member who is in denial.",
      "What is the best way to bring up transitioning a patient to an old age home?",
      "How can I gently tell a caregiver they need to focus on their own well-being without making them feel guilty?",
      "I need to establish the boundaries of my role. How do I explain what I can and cannot do compared to their doctor?"
    ],
    expectations: [
      "How do I manage a family's unrealistic expectations about the patient's recovery?",
      "What are some strategies I can use to help this family learn to advocate for themselves in medical settings?"
    ],
    hurdles: [
      "I am having difficulty extracting necessary information from a family. How should I approach this?",
      "How do I make sure I am pacing the conversation correctly so I don't overwhelm the family?"
    ]
  }
};

// --- DOM Elements ---
const DOM = {
  navItems: document.querySelectorAll('.nav-item'),
  pageViews: document.querySelectorAll('.page-view'),
  dashboardList: document.getElementById('families-dashboard-list'),
  casesCountStat: document.getElementById('stat-cases-count'),
  familiesBadge: document.getElementById('families-badge'),
  
  // Case cards DOM
  caseCardsContainer: document.getElementById('case-cards-container'),
  tabBtnList: document.getElementById('tab-btn-list'),
  tabBtnNew: document.getElementById('tab-btn-new'),
  subviewList: document.getElementById('subview-cards-list'),
  subviewForm: document.getElementById('subview-create-form'),
  btnCancelCreate: document.getElementById('btn-cancel-create'),
  newCaseForm: document.getElementById('new-case-form'),
  caseNameInput: document.getElementById('case-name'),
  caseDetailsInput: document.getElementById('case-details'),
  caseIntakeInput: document.getElementById('case-intake'),
  
  // Dashboard triggering buttons
  btnNewCaseDashboard: document.getElementById('btn-dashboard-new-case'),
  
  // AI Chat DOM
  chatMessagesBox: document.getElementById('chat-messages-box'),
  chatInput: document.getElementById('chat-input'),
  btnChatGenerate: document.getElementById('btn-chat-generate'),
  modelSelect: document.getElementById('chat-model-select'),
  btnNewChat: document.getElementById('btn-new-chat'),
  chatSuggestionsBox: document.getElementById('chat-suggestions-box'),
  
  // Resources DOM
  resourceSearch: document.getElementById('resource-search'),
  adrdResourcesList: document.getElementById('adrd-resources-list'),
  practicesResourcesList: document.getElementById('practices-resources-list'),
  
  // Reports DOM
  reportsRowsList: document.getElementById('report-rows-list'),
  
  // Modals DOM
  modalReportViewer: document.getElementById('modal-report-viewer'),
  reportModalTitle: document.getElementById('report-modal-title'),
  reportModalTextContent: document.getElementById('report-modal-text-content'),
  btnCloseReportModal: document.getElementById('btn-close-report-modal'),
  btnModalCancel: document.getElementById('btn-modal-cancel'),
  btnModalDownload: document.getElementById('btn-modal-download'),
  btnCloseCaseFromReport: document.getElementById('btn-close-case-from-report'),
  
  modalShareCard: document.getElementById('modal-share-card'),
  shareModalTitle: document.getElementById('share-modal-title'),
  sharePreviewText: document.getElementById('share-preview-text'),
  shareSearchInput: document.getElementById('share-search'),
  btnCloseShareModal: document.getElementById('btn-close-share-modal'),
  btnCancelShare: document.getElementById('btn-cancel-share'),
  btnConfirmShare: document.getElementById('btn-confirm-share'),
  
  // Global elements
  globalSearch: document.getElementById('global-search')
};

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupCaseCardTabs();
  setupReportViewer();
  setupShareModal();
  setupChat();
  setupResourcesFilter();
  setupGlobalSearch();
  
  // Initial renders
  renderAll();
  renderSuggestions(null); // Load main suggestion categories
});

// --- Renders Master Routine ---
function renderAll() {
  renderStats();
  renderDashboard();
  renderCaseCards();
  renderReportsList();
  renderChatHistory();
}

// --- Navigation & Routing ---
function setupNavigation() {
  DOM.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.getAttribute('data-page');
      switchPage(pageId);
    });
  });

  DOM.btnCancelCreate.addEventListener('click', () => {
    showCaseCardsSubview('list');
  });

  DOM.btnNewCaseDashboard.addEventListener('click', () => {
    switchPage('case-cards');
    showCaseCardsSubview('form');
  });
}

function switchPage(pageId) {
  DOM.navItems.forEach(nav => {
    if (nav.getAttribute('data-page') === pageId) {
      nav.classList.add('active');
    } else {
      nav.classList.remove('active');
    }
  });

  DOM.pageViews.forEach(view => {
    if (view.id === `page-${pageId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });
  
  state.activePage = pageId;
  
  if (pageId === 'ai-chat') {
    scrollChatBottom();
  }
}

// --- Case Card Views & Subviews ---
function setupCaseCardTabs() {
  DOM.tabBtnList.addEventListener('click', () => showCaseCardsSubview('list'));
  DOM.tabBtnNew.addEventListener('click', () => showCaseCardsSubview('form'));

  DOM.newCaseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = DOM.caseNameInput.value.trim();
    const details = DOM.caseDetailsInput.value.trim();
    const intake = DOM.caseIntakeInput.value.trim() || 'No initial intake notes entered.';
    
    if (name && details) {
      const id = name.toLowerCase().replace(/\s+/g, '-');
      
      const newCase = {
        id: id,
        name: name,
        details: details,
        patientName: name.replace(' Family', ''),
        patientAge: 70 + Math.floor(Math.random() * 20),
        intakeNotes: `<strong>Patient Name:</strong> ${name.replace(' Family', '')}.<br><strong>Case Details:</strong> ${details}.<br><br><strong>Intake Notes:</strong> ${intake}`,
        timeline: [
          { date: 'Jun 18, 2026', label: 'Intake Registered' }
        ],
        resources: [
          { name: 'Dementia Care Guidelines', url: '#' },
          { name: 'Initial Safety Recommendations', url: '#' }
        ],
        aiSummary: `AI Summary pending. Initial notes: "${intake.substring(0, 120)}..."`,
        reportStatus: 'Not Generated',
        reportPeriod: 'Q2 2024',
        reportContent: `<h5>1. Intake Evaluation</h5><p>${intake}</p>`,
        shared: false,
        graphData: 'M0,20 L30,22 L60,18 L90,25 L120,20'
      };

      state.cases.push(newCase);
      DOM.newCaseForm.reset();
      renderAll();
      showCaseCardsSubview('list');
      
      setTimeout(() => {
        const element = document.getElementById(`card-${id}`);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  });
}

function showCaseCardsSubview(subview) {
  if (subview === 'list') {
    DOM.tabBtnList.classList.add('active');
    DOM.tabBtnNew.classList.remove('active');
    DOM.subviewList.classList.add('active');
    DOM.subviewForm.classList.remove('active');
  } else {
    DOM.tabBtnList.classList.remove('active');
    DOM.tabBtnNew.classList.add('active');
    DOM.subviewList.classList.remove('active');
    DOM.subviewForm.classList.add('active');
  }
}

// --- Dynamic Case Card Tab Switching (Intake/Timeline/etc.) ---
function bindCardTabs(cardElement) {
  const tabs = cardElement.querySelectorAll('.card-tab');
  const panes = cardElement.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabType = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      cardElement.querySelector(`.tab-pane[data-tab="${tabType}"]`).classList.add('active');
    });
  });
}

// --- Render Helper Functions ---
function renderStats() {
  DOM.casesCountStat.textContent = state.cases.length;
  DOM.familiesBadge.textContent = `${state.cases.length} ${state.cases.length === 1 ? 'Family' : 'Families'}`;
}

function renderDashboard() {
  DOM.dashboardList.innerHTML = '';
  
  state.cases.forEach(c => {
    const item = document.createElement('div');
    item.className = `family-item ${c.shared ? 'shared' : ''}`;
    item.setAttribute('data-case-id', c.id);
    
    item.innerHTML = `
      <div class="family-info">
        <div class="name-row">
          <span class="family-name">${c.name}</span>
          ${c.shared ? `
            <span class="status-badge shared-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Shared Case
            </span>
          ` : ''}
        </div>
        <span class="case-meta">${c.details}</span>
      </div>
      <div class="family-visual">
        <svg class="visual-graph" viewBox="0 0 120 40">
          <path d="${c.graphData}" fill="none" stroke="#9C89B8" stroke-width="2" stroke-linecap="round"></path>
        </svg>
      </div>
      <div class="family-action">
        <button class="btn btn-secondary btn-sm btn-view-case" data-id="${c.id}">View Case Card</button>
      </div>
    `;
    
    DOM.dashboardList.appendChild(item);
  });

  document.querySelectorAll('.btn-view-case').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      switchPage('case-cards');
      showCaseCardsSubview('list');
      
      setTimeout(() => {
        const element = document.getElementById(`card-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          element.classList.add('glowing-highlight');
          setTimeout(() => element.classList.remove('glowing-highlight'), 1500);
        }
      }, 200);
    });
  });
}

function renderCaseCards() {
  DOM.caseCardsContainer.innerHTML = '';

  state.cases.forEach(c => {
    const card = document.createElement('div');
    card.className = 'case-card-item';
    card.id = `card-${c.id}`;

    let timelineHTML = `<div class="timeline-flow">`;
    c.timeline.forEach((step, idx) => {
      const isCurrent = idx === c.timeline.length - 1;
      timelineHTML += `
        <div class="timeline-step ${isCurrent ? 'current' : ''}">
          <span class="step-date">${step.date}</span>
          <span class="step-label">${step.label}</span>
        </div>
      `;
    });
    timelineHTML += `</div>`;

    let resourcesHTML = `<ul class="card-resource-list">`;
    c.resources.forEach(res => {
      resourcesHTML += `<li><a href="${res.url}" class="resource-link">${res.name}</a></li>`;
    });
    resourcesHTML += `</ul>`;

    card.innerHTML = `
      <div class="case-card-header">
        <div class="card-title-group">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          <h3>${c.name} Card</h3>
        </div>
        <button class="card-share-btn" data-family="${c.name}" title="Share Case Card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        </button>
      </div>
      
      <div class="case-card-tabs">
        <button class="card-tab active" data-tab="intake">Intake</button>
        <button class="card-tab" data-tab="timeline">Timeline</button>
        <button class="card-tab" data-tab="resources">Resources</button>
        <button class="card-tab" data-tab="summarize">AI Summarize</button>
      </div>

      <div class="card-tab-content">
        <div class="tab-pane active" data-tab="intake">
          <p class="tab-scroll-text">${c.intakeNotes}</p>
        </div>
        <div class="tab-pane" data-tab="timeline">
          ${timelineHTML}
        </div>
        <div class="tab-pane" data-tab="resources">
          ${resourcesHTML}
        </div>
        <div class="tab-pane" data-tab="summarize">
          <div class="ai-summary-box">
            <div class="ai-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="sparkle-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span>AI Companion Summary</span>
            </div>
            <p class="summary-text">${c.aiSummary}</p>
            <button class="btn btn-secondary btn-xs btn-ask-ai-from-card" data-family="${c.name}">Ask AI About Case</button>
          </div>
        </div>
      </div>
    `;

    DOM.caseCardsContainer.appendChild(card);
    bindCardTabs(card);
  });

  document.querySelectorAll('.card-share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const familyName = btn.getAttribute('data-family');
      openShareModal(familyName);
    });
  });

  document.querySelectorAll('.btn-ask-ai-from-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const familyName = btn.getAttribute('data-family');
      switchPage('ai-chat');
      
      DOM.chatInput.value = `Can you provide a detailed care recommendation checklist for the ${familyName}?`;
      DOM.chatInput.focus();
      renderSuggestions(null); // reset suggestions
    });
  });
}

function renderReportsList() {
  DOM.reportsRowsList.innerHTML = '';

  state.cases.forEach(c => {
    const row = document.createElement('div');
    row.className = 'report-row';
    row.setAttribute('data-family', c.name);

    let badgeClass = 'info';
    if (c.reportStatus === 'Generated') badgeClass = 'success';
    else if (c.reportStatus === 'Not Generated') badgeClass = 'warning';

    let actionHTML = '';
    if (c.reportStatus === 'Generated') {
      actionHTML = `
        <button class="btn btn-secondary btn-sm btn-open-report" data-id="${c.id}" data-family="${c.name}" data-period="${c.reportPeriod}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="margin-right: 4px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          View Report
        </button>
      `;
    } else if (c.reportStatus === 'Not Generated') {
      actionHTML = `
        <button class="btn btn-primary btn-sm btn-generate-report-action" data-id="${c.id}">
          <svg class="sparkle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="margin-right: 4px; color: white;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          Generate Report
        </button>
      `;
    } else {
      actionHTML = `
        <button class="btn btn-secondary btn-sm" disabled style="opacity: 0.5; cursor: not-allowed;">
          Pending Setup
        </button>
      `;
    }

    row.innerHTML = `
      <div class="col-family font-semibold">${c.name}</div>
      <div class="col-period">${c.reportPeriod}</div>
      <div class="col-status">
        <span class="status-badge ${badgeClass}">${c.reportStatus}</span>
      </div>
      <div class="col-action">
        ${actionHTML}
      </div>
    `;

    DOM.reportsRowsList.appendChild(row);
  });

  document.querySelectorAll('.btn-open-report').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const caseItem = state.cases.find(c => c.id === id);
      if (caseItem) {
        openReportModal(caseItem);
      }
    });
  });

  document.querySelectorAll('.btn-generate-report-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      generateReportSimulated(id, btn);
    });
  });
}

// --- Report Generation Simulation ---
function generateReportSimulated(caseId, buttonElement) {
  buttonElement.disabled = true;
  buttonElement.style.cursor = 'wait';
  buttonElement.innerHTML = `
    <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12" style="margin-right: 4px; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)"></circle><path d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z" fill="currentColor"></path></svg>
    Generating...
  `;

  setTimeout(() => {
    const caseIndex = state.cases.findIndex(c => c.id === caseId);
    if (caseIndex !== -1) {
      state.cases[caseIndex].reportStatus = 'Generated';
      renderAll();
    }
  }, 1500);
}

// Dynamic styling for highlighting case cards
const styleBypass = document.createElement('style');
styleBypass.innerHTML = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .glowing-highlight {
    box-shadow: 0 0 25px rgba(156, 137, 184, 0.6) !important;
    border-color: var(--color-primary) !important;
    transition: all 0.3s ease;
  }
`;
document.head.appendChild(styleBypass);

// --- Report Viewer Modal ---
function setupReportViewer() {
  const closeModal = () => {
    DOM.modalReportViewer.classList.remove('active');
  };

  DOM.btnCloseReportModal.addEventListener('click', closeModal);
  DOM.btnModalCancel.addEventListener('click', closeModal);
  
  DOM.btnModalDownload.addEventListener('click', () => {
    alert('Report downloaded successfully as PDF!');
    closeModal();
  });

  DOM.btnCloseCaseFromReport.addEventListener('click', () => {
    if (confirm('Are you sure you want to Archive/Close this case? This action removes it from active dashboards.')) {
      alert('Case closed/archived successfully.');
      closeModal();
    }
  });

  document.querySelectorAll('.day:not(.empty):not(.day-name)').forEach(day => {
    day.addEventListener('click', () => {
      document.querySelectorAll('.day').forEach(d => d.classList.remove('active-date'));
      day.classList.add('active-date');
    });
  });
}

function openReportModal(caseItem) {
  DOM.reportModalTitle.textContent = `${caseItem.name} - ${caseItem.reportPeriod} Report`;
  DOM.reportModalTextContent.innerHTML = caseItem.reportContent;
  
  DOM.modalReportViewer.classList.add('active');
}

// --- Share Case Modal ---
function setupShareModal() {
  const closeModal = () => {
    DOM.modalShareCard.classList.remove('active');
    DOM.shareSearchInput.value = '';
    document.querySelectorAll('#share-users-choices input[type="checkbox"]').forEach(c => c.checked = false);
    filterShareUsers('');
  };

  DOM.btnCloseShareModal.addEventListener('click', closeModal);
  DOM.btnCancelShare.addEventListener('click', closeModal);
  
  DOM.btnConfirmShare.addEventListener('click', () => {
    const checkedUsers = [];
    document.querySelectorAll('#share-users-choices input[type="checkbox"]:checked').forEach(c => {
      checkedUsers.push(c.value);
    });

    if (checkedUsers.length === 0) {
      alert('Please select at least one organization user to share this card.');
      return;
    }

    alert('Case Card shared successfully with selected team members!');
    closeModal();
  });

  DOM.shareSearchInput.addEventListener('input', (e) => {
    filterShareUsers(e.target.value.toLowerCase());
  });
}

function openShareModal(familyName) {
  DOM.shareModalTitle.textContent = `Share ${familyName} Card`;
  DOM.sharePreviewText.innerHTML = `<strong>Sharing:</strong> Current Intake assessment &amp; clinical timeline for the <strong>${familyName}</strong>. Sharing gives full editing privileges to the selected recipient's dashboards.`;
  
  DOM.modalShareCard.classList.add('active');
}

function filterShareUsers(query) {
  const rows = document.querySelectorAll('#share-users-choices .user-select-row');
  rows.forEach(row => {
    const searchString = row.getAttribute('data-name').toLowerCase();
    row.style.display = searchString.includes(query) ? 'flex' : 'none';
  });
}

// --- Resources Filter ---
function setupResourcesFilter() {
  DOM.resourceSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    filterResourceList(DOM.adrdResourcesList, query);
    filterResourceList(DOM.practicesResourcesList, query);
  });
}

function filterResourceList(container, query) {
  const cards = container.querySelectorAll('.resource-card-item');
  cards.forEach(card => {
    const keywords = card.getAttribute('data-text').toLowerCase();
    const title = card.querySelector('h3').textContent.toLowerCase();
    const description = card.querySelector('p').textContent.toLowerCase();
    
    if (keywords.includes(query) || title.includes(query) || description.includes(query)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// --- Global Search Filter ---
function setupGlobalSearch() {
  DOM.globalSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (state.activePage === 'my-cases') {
      const items = DOM.dashboardList.querySelectorAll('.family-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
      });
    } else if (state.activePage === 'case-cards') {
      showCaseCardsSubview('list');
      const cards = DOM.caseCardsContainer.querySelectorAll('.case-card-item');
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'flex' : 'none';
      });
    } else if (state.activePage === 'family-report') {
      const rows = DOM.reportsRowsList.querySelectorAll('.report-row');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? 'flex' : 'none';
      });
    }
  });
}

// --- AI Chat Logic & Dynamic Suggestions ---
function setupChat() {
  DOM.btnChatGenerate.addEventListener('click', handleChatSend);

  DOM.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  });
  
  DOM.chatInput.addEventListener('input', () => {
    DOM.chatInput.style.height = 'auto';
    DOM.chatInput.style.height = (DOM.chatInput.scrollHeight) + 'px';
  });

  // "New Chat" clearing event
  DOM.btnNewChat.addEventListener('click', () => {
    state.chatHistory = []; // Clear history
    DOM.chatInput.value = '';
    DOM.chatInput.style.height = 'auto';
    
    renderChatHistory();
    renderSuggestions(null); // Reload parent categories
  });
}

// Render dynamic hierarchical suggestion chips
function renderSuggestions(category = null) {
  DOM.chatSuggestionsBox.innerHTML = '';

  if (category === null) {
    // Render the 4 main suggestion categories
    suggestionsData.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'suggestion-btn category';
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span>${cat.label}</span>
      `;
      btn.addEventListener('click', () => {
        renderSuggestions(cat.id);
      });
      DOM.chatSuggestionsBox.appendChild(btn);
    });
  } else {
    // Render "Back" button
    const backBtn = document.createElement('button');
    backBtn.className = 'suggestion-btn back';
    backBtn.innerHTML = `&larr; Back`;
    backBtn.addEventListener('click', () => {
      renderSuggestions(null);
    });
    DOM.chatSuggestionsBox.appendChild(backBtn);

    // Render child questions for selected category
    const questionsList = suggestionsData.questions[category];
    questionsList.forEach(qText => {
      const qBtn = document.createElement('button');
      qBtn.className = 'suggestion-btn';
      qBtn.textContent = qText;
      qBtn.addEventListener('click', () => {
        // Clear suggestions list
        DOM.chatSuggestionsBox.innerHTML = '';
        
        // Auto input & send
        DOM.chatInput.value = qText;
        handleChatSend();
      });
      DOM.chatSuggestionsBox.appendChild(qBtn);
    });
  }
}

function scrollChatBottom() {
  setTimeout(() => {
    DOM.chatMessagesBox.scrollTop = DOM.chatMessagesBox.scrollHeight;
  }, 50);
}

function renderChatHistory() {
  DOM.chatMessagesBox.innerHTML = '';

  if (state.chatHistory.length === 0) {
    // Empty state welcome box
    const welcomeBox = document.createElement('div');
    welcomeBox.className = 'chat-message assistant';
    welcomeBox.innerHTML = `
      <div class="message-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </div>
      <div class="message-content-wrapper">
        <div class="message-sender">AZ Companion</div>
        <div class="message-bubble">
          <p>Hello! I am your AI Companion. Select one of the conversational suggestions below to start a new chat, or type your own question in the box!</p>
        </div>
      </div>
    `;
    DOM.chatMessagesBox.appendChild(welcomeBox);
    scrollChatBottom();
    return;
  }
  
  state.chatHistory.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.sender}`;
    
    let avatarContent = 'JD';
    if (msg.sender === 'assistant') {
      avatarContent = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    
    let embedHTML = '';
    if (msg.embedCard) {
      let metricsHTML = '';
      msg.embedCard.metrics.forEach(m => {
        metricsHTML += `
          <div class="metric-row">
            <span class="metric-label">${m.label}</span>
            <div class="metric-bar-bg">
              <div class="metric-bar-fill" style="width: ${m.width}; background-color: ${m.color};"></div>
            </div>
            <span class="metric-val">${m.val}</span>
          </div>
        `;
      });

      embedHTML = `
        <div class="chat-embed-card">
          <div class="embed-header">
            <h4>${msg.embedCard.title}</h4>
            <span class="embed-tag">${msg.embedCard.tag}</span>
          </div>
          <div class="embed-body">
            <div class="embed-details">
              <p><strong>Primary Caregiver:</strong> ${msg.embedCard.caregiver}</p>
              <p><strong>Clinical Focus:</strong> ${msg.embedCard.focus}</p>
            </div>
            <div class="embed-metrics">
              ${metricsHTML}
            </div>
          </div>
        </div>
      `;
    }

    msgDiv.innerHTML = `
      <div class="message-avatar">${avatarContent}</div>
      <div class="message-content-wrapper">
        <div class="message-sender">${msg.sender === 'assistant' ? 'AZ Companion' : 'You'}</div>
        <div class="message-bubble">
          <p>${msg.text}</p>
          ${embedHTML}
          ${msg.additionalText ? `<p>${msg.additionalText}</p>` : ''}
        </div>
      </div>
    `;
    
    DOM.chatMessagesBox.appendChild(msgDiv);
  });
  
  scrollChatBottom();
}

function handleChatSend() {
  const query = DOM.chatInput.value.trim();
  if (!query) return;

  DOM.chatInput.value = '';
  DOM.chatInput.style.height = 'auto';

  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.chatHistory.push({
    sender: 'user',
    text: query,
    time: timeNow
  });

  renderChatHistory();
  showChatTypingIndicator();
  
  setTimeout(() => {
    removeChatTypingIndicator();
    generateMockAIResponse(query);
  }, 1500);
}

function showChatTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message assistant typing-indicator-wrapper';
  typingDiv.id = 'chat-typing-indicator';
  
  const avatarContent = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
  
  typingDiv.innerHTML = `
    <div class="message-avatar">${avatarContent}</div>
    <div class="message-content-wrapper">
      <div class="message-sender">AZ Companion</div>
      <div class="message-bubble">
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    </div>
  `;
  
  DOM.chatMessagesBox.appendChild(typingDiv);
  scrollChatBottom();
}

function removeChatTypingIndicator() {
  const indicator = document.getElementById('chat-typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

// Generate context-aware replies for search keywords AND standard suggestion questions
function generateMockAIResponse(userQuery) {
  const queryLower = userQuery.toLowerCase().trim();
  let text = '';
  let embedCard = null;
  let additionalText = '';
  
  const modelType = DOM.modelSelect.value;
  const modelHeadline = modelType === 'deep' ? '<strong>[Deep Analysis Engine Active]</strong> ' : '';

  // --- 1. First Visit / Rapport responses ---
  if (queryLower.includes('build rapport') || queryLower.includes('rapport')) {
    text = `${modelHeadline}Building rapport with families facing an ADRD diagnosis is critical for care compliance. Here is an initial strategy framework:`;
    additionalText = `
      <ol>
        <li><strong>Empathetic Listening:</strong> Let the family voice their narrative first. Validate their grief and exhaustion immediately without jump-starting clinical forms (e.g., <em>"This must be extremely overwhelming for you all."</em>).</li>
        <li><strong>Simplify Clinical Jargon:</strong> Translate clinical labels into everyday behavioral items (e.g., say <em>"adjustments in speech and memory"</em> rather than <em>"aphasia"</em>).</li>
        <li><strong>Partnership Definition:</strong> Frame yourself as a collaborative resource partner working beside them, rather than a clinical evaluator grading them.</li>
      </ol>
      <p>I have prepared a <strong>"First Visit &amp; Rapport Protocol Guide"</strong> in the <em>Approved Practices</em> resources tab for you!</p>
    `;
  }
  else if (queryLower.includes('roleplay') || queryLower.includes('hesitant patient') || queryLower.includes('hesitant')) {
    text = `${modelHeadline}I\\'d be glad to help you roleplay that approach! Let's establish the environment:`;
    additionalText = `
      <p><strong>Patient Scenario:</strong> Arthur (76), refuses to acknowledge his memory shifts and is highly protective of his autonomy.</p>
      <p><strong>Key Strategy:</strong> Avoid identifying as a medical evaluator. Introduce yourself as a "lifestyle and comfort coordinator."</p>
      <p><strong>Sample Opening Line:</strong><br>
      <em>"Hello Arthur, my name is Jane. I collaborate with families to inspect home comfort setups and design daily activity routines so you can stay active and independent in your home for as long as possible."</em></p>
      <p>Would you like to try typing how you'd reply to Arthur's objection: <em>"My memory is fine, I don't need help"</em>? I can play Arthur's response.</p>
    `;
  }
  
  // --- 2. Difficult Conversations responses ---
  else if (queryLower.includes('in denial') || queryLower.includes('denial')) {
    text = `${modelHeadline}Denial is a normal psychological barrier to fear and grief. Let's look at how to navigate it:`;
    additionalText = `
      <ul>
        <li><strong>Avoid Direct Confrontation:</strong> Instead of saying <em>"Maria has severe dementia,"</em> focus on specific safety incidents (e.g., <em>"I noticed Maria left the stove burner on last Tuesday."</em>).</li>
        <li><strong>Utilize Objective Audits:</strong> Walkthrough home safety checklist forms together. Let the score sheets do the heavy lifting of showing risk.</li>
        <li><strong>Start with Tiny Compromises:</strong> Propose one micro-adjustment first (e.g., a simple pill organizer box) rather than an entire nursing schedule.</li>
      </ul>
      <p>Check the <strong>"Denial Mitigation Standard"</strong> sheet under the <em>Approved Practices</em> column for further worksheets.</p>
    `;
  }
  else if (queryLower.includes('transitioning') || queryLower.includes('old age home') || queryLower.includes('transition')) {
    text = `${modelHeadline}Transitioning a family member to a long-term care setting is one of the most emotional processes a caregiver will face. Here is the recommended transition roadmap:`;
    additionalText = `
      <ol>
        <li><strong>Reframe as Safety, Not Abandonment:</strong> Frame the transition as moving to a facility that offers specialized, safe environments that allow the patient to engage in activities safely.</li>
        <li><strong>Protect Caregiver Health:</strong> Remind the caregiver that their own well-being is critical for the patient. A burnt-out caregiver cannot supervise care.</li>
        <li><strong>Emergency Backup Framing:</strong> Tour care facilities early under the pretext of <em>"creating an emergency backup plan in case of sudden illnesses"</em> rather than an immediate move.</li>
      </ol>
      <p>You can locate the complete <strong>"Transition Care Planning Guide"</strong> under the <em>Curated Resources</em> board.</p>
    `;
  }
  else if (queryLower.includes('focus on their own well-being') || queryLower.includes('own well-being') || queryLower.includes('burnout')) {
    text = `${modelHeadline}Caregivers often experience intense guilt when taking time for themselves. We need to help them reframe this perspective:`;
    additionalText = `
      <p><strong>Recommended Phrasing:</strong><br>
      <em>"Sophia, taking care of your own well-being is a core part of taking care of Maria. If you run out of fuel, you will not be physically able to maintain the exit chimes and schedules she depends on."</em></p>
      <p><strong>Steps to take:</strong></p>
      <ul>
        <li>Prescribe respite care as a <strong>medical necessity</strong>, not a luxury.</li>
        <li>Enroll them in the weekly Day-Enrichment Program (which we've added to Sophia Rivera's Rivera Family care plan).</li>
      </ul>
    `;
  }
  else if (queryLower.includes('boundaries of my role') || queryLower.includes('boundaries') || queryLower.includes('explain what i can')) {
    text = `${modelHeadline}Clearly defining your role prevents coordination confusion and protects your professional boundaries:`;
    additionalText = `
      <p><strong>Explanation Template to Family:</strong><br>
      <em>"As your Care Coordinator, my role is to optimize home safety systems, organize scheduling logistics, and connect you with community support grants. I do not issue medical diagnoses, change medication dosages, or prescribe therapies; those tasks are handled by your Primary Neurologist."</em></p>
      <p>Provide them with the **"Role Boundary Handout Sheet"** available in the <em>Approved Practices</em> list to set clear expectations.</p>
    `;
  }

  // --- 3. Expectations & Advocacy responses ---
  else if (queryLower.includes('unrealistic expectations') || queryLower.includes('expectations')) {
    text = `${modelHeadline}When families hold unrealistic expectations about recovery, it often leads to frustration. Align their expectations gently:`;
    additionalText = `
      <ul>
        <li><strong>Emphasize Management, Not Recovery:</strong> Focus goals on maintaining current levels of independence, safety, and emotional comfort, rather than restoring lost memory.</li>
        <li><strong>Promote "Micro-Wins":</strong> Celebrate small successes (e.g., <em>"Maria completed her breakfast routine today without exit wandering"</em>).</li>
        <li><strong>Consistent Education:</strong> Share progressive stage charts to help them prepare for shifts in cognitive behaviors.</li>
      </ul>
    `;
  }
  else if (queryLower.includes('advocate') || queryLower.includes('advocacy') || queryLower.includes('advocate for themselves')) {
    text = `${modelHeadline}Advocacy training builds confidence in caregivers when navigating complex medical appointments:`;
    additionalText = `
      <ol>
        <li><strong>The Log Notebook:</strong> Teach them to keep a log of behavior changes, sleep cycles, and medication side effects.</li>
        <li><strong>Pre-Appointment Questions:</strong> Give them a list of standard questions (e.g., <em>"What is the target effect of this drug? Are there interaction risks?"</em>).</li>
        <li><strong>Advocacy Sheets:</strong> Print out the <strong>"Caregiver Medical Advocacy Kit"</strong> from our <em>Curated Resources</em>.</li>
      </ol>
    `;
  }

  // --- 4. Communication Hurdles responses ---
  else if (queryLower.includes('extracting necessary') || queryLower.includes('extracting') || queryLower.includes('extract information')) {
    text = `${modelHeadline}If a family is reticent to share details, they may fear losing control or being judged. Adjust your questioning style:`;
    additionalText = `
      <ul>
        <li><strong>Ask Indirect Safety Questions:</strong> Instead of asking <em>"Does he wander?"</em>, ask <em>"How do you both manage if Viktor decides to head outside in the afternoon?"</em></li>
        <li><strong>Normalize the Experience:</strong> Pre-phrase questions with <em>"Many caregivers tell me that evening sundowning gets very stressful. Have you noticed any changes in Viktor's afternoon mood?"</em></li>
        <li><strong>Assure Confidentiality:</strong> Emphasize that notes are strictly used to lock in funding subsidies.</li>
      </ul>
    `;
  }
  else if (queryLower.includes('pacing the conversation') || queryLower.includes('pacing') || queryLower.includes('overwhelm')) {
    text = `${modelHeadline}Pacing prevents families from shutting down due to info overload. Follow these pacing protocols:`;
    additionalText = `
      <ol>
        <li><strong>One Critical Topic Per Visit:</strong> Identify the single most critical safety or support need. Address only that during the visit.</li>
        <li><strong>Frequent Comprehension Checks:</strong> Ask: <em>"We\\'ve mapped out a few safety items just now. How does this plan feel to you so far?"</em></li>
        <li><strong>Post-Visit Summaries:</strong> Send a follow-up checklist of only **2 to 3 action steps** maximum.</li>
      </ol>
      <p>I have uploaded a <strong>"Pacing &amp; Visit Layout Template"</strong> in the <em>Approved Practices</em> panel.</p>
    `;
  }

  // --- 5. Context-aware keywords (Cases Rivera, Oklaz, Pierre) ---
  else if (queryLower.includes('oklaz') || queryLower.includes('viktor')) {
    text = `${modelHeadline}For <strong>Viktor Oklaz</strong>, the care profile recommends custom measures addressing late-afternoon agitation (Sundowning) and exit-egress risks.`;
    embedCard = {
      title: 'Care Summary: Viktor Oklaz',
      tag: 'Moderate ADRD',
      caregiver: 'Alex Oklaz (Son) & Visiting Nurse',
      focus: 'Sundowning mitigation, exit safety tracking, respite support.',
      metrics: [
        { label: 'Sundowning Severity', val: 'Mod-High', width: '82%', color: '#f59e0b' },
        { label: 'Exit Egress Risk', val: 'High', width: '90%', color: '#ef4444' }
      ]
    };
    additionalText = `<strong>Immediate Recommended Interventions:</strong>
      <ul>
        <li><strong>Sensory Lighting:</strong> Instruct Alex to implement full-spectrum light panel illumination in Viktor's main living area at 3:30 PM to delay melatonin onset.</li>
        <li><strong>Agitation Calming:</strong> Structure repetitive motor activities (like sorting colored discs) during peak agitation.</li>
        <li><strong>Wandering Safety:</strong> Deploy exits chimes and register for the municipal Alzheimer's Wandering Registry database.</li>
      </ul>`;
  } 
  else if (queryLower.includes('pierre') || queryLower.includes('henri')) {
    text = `${modelHeadline}For <strong>Henri Pierre</strong>, the primary focus centers around vascular dementia adherence safety and nutritional consistency.`;
    embedCard = {
      title: 'Vascular Care: Henri Pierre',
      tag: 'Vascular Screening',
      caregiver: 'Marcelle Pierre (Niece)',
      focus: 'Medication reminders, meal delivery schedules, cognitive exercises.',
      metrics: [
        { label: 'Cognitive Decline Pace', val: 'Low', width: '35%', color: '#10b981' },
        { label: 'Nutrition Adherence', val: 'Mod', width: '60%', color: '#f59e0b' }
      ]
    };
    additionalText = `<strong>Key Care Strategies:</strong>
      <ol>
        <li><strong>Medication Compliance:</strong> Establish an automated audio pill-dispenser reminder system in the home.</li>
        <li><strong>Nutrition Support:</strong> Set up a senior meal coordination delivery rotation twice a week to ease burden on Marcelle.</li>
        <li><strong>Activity Tracking:</strong> Refer to Henri's <em>Timeline</em> tab to track his upcoming physical examination schedules.</li>
      </ol>`;
  } 
  else if (queryLower.includes('rivera') || queryLower.includes('maria')) {
    text = `${modelHeadline}Here is the active care checklist overview for the <strong>Rivera Family</strong>, focusing on Sophia's primary care fatigue indices:`;
    embedCard = {
      title: 'Case Summary: Rivera Family',
      tag: 'Early ADRD',
      caregiver: 'Sophia Rivera (Daughter)',
      focus: 'Memory preservation, wandering anxiety, caregiver burnout.',
      metrics: [
        { label: 'Caregiver Burden Risk', val: 'High', width: '75%', color: '#ef4444' },
        { label: 'Wandering Risk', val: 'Mod', width: '40%', color: '#f59e0b' }
      ]
    };
    additionalText = `<strong>Recommended Actions:</strong>
      <ul>
        <li><strong>Caregiver Support:</strong> Schedule Sophia for a local ADRD Support Group consult.</li>
        <li><strong>Daily Structuring:</strong> Set up a visual, predictable schedule board for Maria at home.</li>
        <li><strong>Safety Audit:</strong> Recommend simple wandering safeguards (e.g. chime alarm on exit doors).</li>
      </ul>`;
  }
  else {
    text = `I am processing your query under the <strong>${modelType.toUpperCase()}</strong> engine. I can help coordinate and detail clinical workflows. Please specify a case name or click one of the suggestion chips below to get tailored insights.`;
  }

  // Save to history
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.chatHistory.push({
    sender: 'assistant',
    text: text,
    time: timeNow,
    embedCard: embedCard,
    additionalText: additionalText
  });

  renderChatHistory();
  renderSuggestions(null); // Return to default parent suggestions list after user interactions
}

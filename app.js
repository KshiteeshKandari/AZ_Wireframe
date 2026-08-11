/* 
  AZ Companion Application Logic
  Handles State Management, Routing, Dynamic Rendering, 
  Notifications, Inline Card Editor, Conversational AI options,
  Close-Case Archiving redirects, and Resource Tag Filters.
*/

// --- Application State ---
const state = {
  activePage: 'my-cases',
  editingCaseId: null, // Tracks case ID currently being edited in maximized editor
  activeEditTab: 'intake',
  
  cases: [
    {
      id: 'rivera-family',
      name: 'Rivera Family',
      details: 'Intake Completed &bull; Primary: Sophia Rivera',
      phase: 'Care Plan Review',
      blurb: 'Early-stage ADRD, daughter Sophia is primary caregiver. Focus on daily structuring and wandering safety.',
      cardStatus: 'Continuing Services',
      patientName: 'Maria Rivera',
      patientAge: 74,
      intakeNotes: `Maria Rivera (Age 74) has early-stage ADRD diagnosed Q3 2025. Maria lives with her daughter, Sophia, who acts as primary caregiver. Sophia reports gradual increase in memory loss, word-finding difficulty, and mild anxiety in unfamiliar surroundings. Social support is limited to bi-weekly visits from a cousin. Sophia requests advice on daily structuring, safety measures at home (wandering mitigation), and caregiver burnout prevention groups.`,
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
      aiSummary: 'Maria Rivera presents with progressive cognitive decline consistent with early ADRD, supported by primary caregiver Sophia. Recommended actions include establishing a daily structured routine, installing smart safety monitors, and referring Sophia to the local ADRD Caregiver Support Network.',
      reportStatus: 'Generated',
      reportPeriod: 'Q2 2024',
      reportContent: `
        <h4>Rivera Family Report</h4>
        <p class="report-meta">Date: 6/18/26<br>Assigned CHW: Jane Doe</p>
        <p class="report-greeting">Hi Sophia,</p>
        <p>It was good talking with you. You're doing the right thing by paying attention to these changes in your mom — noticing them and following up is exactly how families get answers. Here's a short guide to help you at Maria's next appointment so the doctor takes a closer look this time.</p>
        <p><strong>1. Write down what you've noticed.</strong> Before the visit, jot down a few specific examples and roughly when they started — the word-finding difficulty, the anxiety in unfamiliar places. Specific, dated examples are much harder for a doctor to wave off than "she's been more forgetful." Bring the list and hand it over or read it at the start of the appointment.</p>
        <p><strong>2. Ask directly for an evaluation.</strong> You can request this yourself. Try: "I'd like my mom screened for cognitive changes. Can we do a cognitive assessment, or get a referral to a specialist?" Naming exactly what you want makes it harder to brush past.</p>
        <p><strong>3. Enroll Maria in structured daytime support.</strong> The adult day-enrichment program (2 days/week) gives Maria social engagement while giving you, Sophia, room to rest — burnout indicators are currently high.</p>
        <p><strong>4. Add home safety measures.</strong> Wandering risk is low-moderate right now, but door sensors and a consistent daily routine will help keep it that way.</p>
        <p><strong>5. Know that it may take more than one visit.</strong> Getting a proper diagnosis and care plan sometimes takes a few appointments. Keep going, and I'm here to help you through it.</p>
        <h5>Resources</h5>
        <div class="report-resource-group">
          <span class="report-tag healthcare">Healthcare</span>
          <ul class="report-resource-list">
            <li><strong>ADRD Communication Guide (PDF):</strong> tips for talking with Maria as memory changes progress (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
            <li><strong>Local Support Group Directory:</strong> in-person and virtual caregiver support groups near you (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
          </ul>
        </div>
        <div class="report-resource-group">
          <span class="report-tag logistics">Logistics</span>
          <ul class="report-resource-list">
            <li><strong>Home Safety Checklist for Dementia:</strong> practical steps to reduce wandering and fall risk at home (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
          </ul>
        </div>
        <p><strong>Next Check-up:</strong> Care Plan Review scheduled for Jun 18, 2026. We'll follow up shortly after to see how the new routine is going.</p>
      `,
      reportContentEs: `
        <h4>Informe de la Familia Rivera</h4>
        <p class="report-meta">Fecha: 18/6/26<br>Trabajadora de salud asignada: Jane Doe</p>
        <p class="report-greeting">Hola Sophia,</p>
        <p>Fue un gusto hablar contigo. Estás haciendo lo correcto al prestar atención a estos cambios en tu mamá — notarlos y darles seguimiento es exactamente cómo las familias obtienen respuestas. Aquí tienes una breve guía para ayudarte en la próxima cita de Maria, para que el médico le preste más atención esta vez.</p>
        <p><strong>1. Anota lo que has notado.</strong> Antes de la visita, escribe algunos ejemplos específicos y aproximadamente cuándo comenzaron — la dificultad para encontrar palabras, la ansiedad en lugares desconocidos. Los ejemplos específicos y fechados son mucho más difíciles de ignorar para un médico que decir "ha estado más olvidadiza". Lleva la lista o léela al inicio de la cita.</p>
        <p><strong>2. Pide directamente una evaluación.</strong> Puedes solicitarla tú misma. Intenta decir: "Me gustaría que evaluaran a mi mamá por cambios cognitivos. ¿Podemos hacer una evaluación cognitiva o conseguir una referencia a un especialista?" Nombrar exactamente lo que quieres hace más difícil que lo pasen por alto.</p>
        <p><strong>3. Inscribe a Maria en apoyo estructurado durante el día.</strong> El programa de enriquecimiento diurno para adultos (2 días a la semana) le da a Maria interacción social mientras te da a ti, Sophia, tiempo para descansar — los indicadores de agotamiento están altos actualmente.</p>
        <p><strong>4. Agrega medidas de seguridad en el hogar.</strong> El riesgo de deambular es bajo-moderado por ahora, pero los sensores de puerta y una rutina diaria constante ayudarán a mantenerlo así.</p>
        <p><strong>5. Ten en cuenta que puede tomar más de una visita.</strong> Obtener un diagnóstico y un plan de cuidado adecuado a veces toma varias citas. Sigue adelante, y estoy aquí para ayudarte en el proceso.</p>
        <h5>Recursos</h5>
        <div class="report-resource-group">
          <span class="report-tag healthcare">Salud</span>
          <ul class="report-resource-list">
            <li><strong>Guía de Comunicación sobre ADRD (PDF):</strong> consejos para hablar con Maria a medida que avanzan los cambios de memoria (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
            <li><strong>Directorio de Grupos de Apoyo Locales:</strong> grupos de apoyo presenciales y virtuales cerca de ti (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
          </ul>
        </div>
        <div class="report-resource-group">
          <span class="report-tag logistics">Logística</span>
          <ul class="report-resource-list">
            <li><strong>Lista de Seguridad en el Hogar para Demencia:</strong> pasos prácticos para reducir el riesgo de deambular y caídas en casa (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
          </ul>
        </div>
        <p><strong>Próxima Revisión:</strong> Revisión del plan de cuidado programada para el 18 de junio de 2026. Nos comunicaremos contigo poco después para ver cómo va la nueva rutina.</p>
      `,
      shared: false
    },
    {
      id: 'oklaz-family',
      name: 'Oklaz Family',
      details: 'Awaiting AI Report &bull; Primary: Viktor Oklaz',
      phase: 'Home Nurse Scheduling',
      blurb: 'Moderate Alzheimer\'s with sundowning episodes. Son Alex requests respite care and behavioral strategies.',
      cardStatus: 'Continuing Services',
      patientName: 'Viktor Oklaz',
      patientAge: 81,
      intakeNotes: `Viktor Oklaz (Age 81) moderate stage Alzheimer's. Managed jointly by his son, Alex Oklaz, and a visiting nurse service twice a week. Viktor exhibits moderate disorientation regarding time and place, as well as periodic agitation in late afternoons ("sundowning"). Alex requested professional respite care resources and behavioral strategies to calm Viktor during Sundowning episodes.`,
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
      aiSummary: 'Viktor Oklaz is an 81-year-old patient experiencing moderate sundowning-related agitation and wandering behavior. Recommendation includes immediate exploration of wearable GPS trackers, implementation of sensory light therapies in late afternoons, and facilitating temporary respite care relief for Alex Oklaz.',
      reportStatus: 'Not Generated',
      reportPeriod: 'Q2 2024',
      reportContent: `
        <h4>Oklaz Family Report</h4>
        <p class="report-meta">Date: 6/18/26<br>Assigned CHW: Jane Doe</p>
        <p class="report-greeting">Hi Alex,</p>
        <p>Thanks for keeping us updated on your dad's afternoons — the pattern you're seeing between 4 and 7 PM lines up with classic "sundowning," and there's a lot we can do to make that window calmer for both of you.</p>
        <p><strong>1. Track the sundowning window.</strong> Note what time agitation starts, what seems to trigger it (light changes, noise, hunger), and how long it lasts. This helps the visiting nurse adjust his schedule around it.</p>
        <p><strong>2. Use light and routine to your advantage.</strong> Keeping the home brightly lit in the late afternoon and sticking to a consistent dinner/wind-down routine can reduce disorientation before it starts.</p>
        <p><strong>3. Address the wandering risk now.</strong> Viktor has attempted to exit unassisted — this is worth flagging to his care team immediately and pairing with door sensors or a GPS wristband.</p>
        <p><strong>4. Ask about respite care.</strong> You're managing a lot solo between visits. A few hours of respite care a week can make a real difference in how sustainable this is for you.</p>
        <p><strong>5. Loop in the visiting nurse on all of this.</strong> Sharing your notes with the twice-weekly nurse visits keeps everyone working from the same picture.</p>
        <h5>Resources</h5>
        <div class="report-resource-group">
          <span class="report-tag healthcare">Healthcare</span>
          <ul class="report-resource-list">
            <li><strong>Sundowning Management Protocols:</strong> clinical guidance on reducing late-day agitation (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
          </ul>
        </div>
        <div class="report-resource-group">
          <span class="report-tag logistics">Logistics</span>
          <ul class="report-resource-list">
            <li><strong>Respite Care Subsidy Options:</strong> county programs that help cover short-term relief care (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
            <li><strong>GPS Tracking Wristband Providers:</strong> wearable trackers for wandering safety (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
          </ul>
        </div>
        <p><strong>Next Check-up:</strong> Home Nurse Schedule review on Jun 05, 2026. We'll follow up after that visit to see how the sundowning window is trending.</p>
      `,
      reportContentEs: `
        <h4>Informe de la Familia Oklaz</h4>
        <p class="report-meta">Fecha: 18/6/26<br>Trabajador de salud asignado: Jane Doe</p>
        <p class="report-greeting">Hola Alex,</p>
        <p>Gracias por mantenernos al tanto de las tardes de tu papá — el patrón que estás viendo entre las 4 y las 7 PM coincide con el clásico "sundowning", y hay mucho que podemos hacer para que esa hora sea más tranquila para ambos.</p>
        <p><strong>1. Registra la ventana de sundowning.</strong> Anota a qué hora comienza la agitación, qué parece provocarla (cambios de luz, ruido, hambre) y cuánto dura. Esto ayuda a la enfermera visitante a ajustar su horario en torno a eso.</p>
        <p><strong>2. Usa la luz y la rutina a tu favor.</strong> Mantener la casa bien iluminada por la tarde y seguir una rutina constante de cena y relajación puede reducir la desorientación antes de que comience.</p>
        <p><strong>3. Atiende el riesgo de deambular ahora.</strong> Viktor ha intentado salir sin ayuda — esto vale la pena reportarlo de inmediato a su equipo de cuidado y combinarlo con sensores de puerta o una pulsera GPS.</p>
        <p><strong>4. Pregunta sobre cuidado de relevo.</strong> Estás manejando mucho tú solo entre visitas. Unas horas de cuidado de relevo a la semana pueden hacer una gran diferencia en qué tan sostenible es esto para ti.</p>
        <p><strong>5. Comparte todo esto con la enfermera visitante.</strong> Compartir tus notas con las visitas de enfermería dos veces por semana mantiene a todos con la misma información.</p>
        <h5>Recursos</h5>
        <div class="report-resource-group">
          <span class="report-tag healthcare">Salud</span>
          <ul class="report-resource-list">
            <li><strong>Protocolos de Manejo del Sundowning:</strong> guía clínica para reducir la agitación al final del día (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
          </ul>
        </div>
        <div class="report-resource-group">
          <span class="report-tag logistics">Logística</span>
          <ul class="report-resource-list">
            <li><strong>Opciones de Subsidio para Cuidado de Relevo:</strong> programas del condado que ayudan a cubrir el cuidado temporal (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
            <li><strong>Proveedores de Pulseras de Rastreo GPS:</strong> dispositivos portátiles para seguridad ante deambulación (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
          </ul>
        </div>
        <p><strong>Próxima Revisión:</strong> Revisión del horario de enfermería en el hogar el 5 de junio de 2026. Daremos seguimiento después de esa visita para ver cómo evoluciona la ventana de sundowning.</p>
      `,
      shared: true
    },
    {
      id: 'pierre-family',
      name: 'Pierre Family',
      details: 'Pending Intake &bull; Primary: Henri Pierre',
      phase: 'Pending Intake',
      blurb: 'Vascular screening review. Niece Marcelle needs medication tracking and nutrition support tools.',
      cardStatus: 'Waiting Followup',
      patientName: 'Henri Pierre',
      patientAge: 79,
      intakeNotes: `Henri Pierre (Age 79) vascular screening review. Niece Marcelle Pierre daily checks. Focus is on maintaining cognitive engagement, nutrition management, and tracking medical adherence. Intake pending full physical exam. Initial screenings show minor short-term recall impairment. Marcelle is requesting support tools to organize medication dosages and ensure Henri receives healthy daily meals.`,
      timeline: [
        { date: 'May 20, 2026', label: 'Vascular Screening Review' },
        { date: 'Jun 25, 2026', label: 'Scheduled Physical Exam (Pending)' }
      ],
      resources: [
        { name: 'Vascular Dementia Lifestyle Guidelines', url: '#' },
        { name: 'Medication Reminder Apps & Dispensers', url: '#' },
        { name: 'Meal Delivery Services for Seniors', url: '#' }
      ],
      aiSummary: 'Henri Pierre is in the initial phases of vascular dementia care. Main support requirements center on dietary adherence and medication scheduling. Recommended strategy includes deploying an automated pill dispenser, enrolling in senior meal programs, and introducing routine memory exercises.',
      reportStatus: 'Pending Intake',
      reportPeriod: 'Q2 2024',
      reportContent: `
        <h4>Pierre Family Report</h4>
        <p class="report-meta">Date: 6/18/26<br>Assigned CHW: Jane Doe</p>
        <p class="report-greeting">Hi Marcelle,</p>
        <p>Thanks for staying on top of your uncle's daily check-ins. Since Henri's full physical exam is still pending, here's what's helpful to focus on in the meantime.</p>
        <p><strong>1. Keep a simple medication log.</strong> Note what Henri takes and when — this becomes very useful once his physical results come back and dosages may need adjusting.</p>
        <p><strong>2. Bring your recall observations to the exam.</strong> The minor short-term recall impairment you've noticed is worth describing in specific terms (what he forgot, how often) at the June 25th appointment.</p>
        <p><strong>3. Support consistent nutrition.</strong> Vascular health benefits a lot from regular, balanced meals — a meal delivery service can help if daily cooking is hard to keep up with.</p>
        <p><strong>4. Ask about a pill dispenser.</strong> An automated dispenser can reduce missed or doubled doses between your daily check-ins.</p>
        <p><strong>5. We'll follow up after the physical exam.</strong> Once results are in, we'll update this care plan together.</p>
        <h5>Resources</h5>
        <div class="report-resource-group">
          <span class="report-tag healthcare">Healthcare</span>
          <ul class="report-resource-list">
            <li><strong>Vascular Dementia Lifestyle Guidelines:</strong> diet and activity guidance for vascular cognitive health (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
          </ul>
        </div>
        <div class="report-resource-group">
          <span class="report-tag logistics">Logistics</span>
          <ul class="report-resource-list">
            <li><strong>Medication Reminder Apps & Dispensers:</strong> tools to help track daily doses (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
            <li><strong>Meal Delivery Services for Seniors:</strong> options for consistent, healthy daily meals (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
          </ul>
        </div>
        <p><strong>Next Check-up:</strong> Physical exam scheduled for Jun 25, 2026. We'll follow up right after to update this plan with the results.</p>
      `,
      reportContentEs: `
        <h4>Informe de la Familia Pierre</h4>
        <p class="report-meta">Fecha: 18/6/26<br>Trabajadora de salud asignada: Jane Doe</p>
        <p class="report-greeting">Hola Marcelle,</p>
        <p>Gracias por mantenerte al pendiente de las revisiones diarias de tu tío. Como el examen físico completo de Henri sigue pendiente, aquí está en qué enfocarte mientras tanto.</p>
        <p><strong>1. Lleva un registro simple de medicamentos.</strong> Anota qué toma Henri y cuándo — esto será muy útil una vez que lleguen los resultados de su examen físico y sea necesario ajustar las dosis.</p>
        <p><strong>2. Comparte tus observaciones sobre la memoria en el examen.</strong> Vale la pena describir en términos específicos (qué olvidó, con qué frecuencia) el leve deterioro de memoria a corto plazo que has notado, en la cita del 25 de junio.</p>
        <p><strong>3. Apoya una nutrición constante.</strong> La salud vascular se beneficia mucho de comidas regulares y balanceadas — un servicio de entrega de comidas puede ayudar si cocinar a diario es difícil de mantener.</p>
        <p><strong>4. Pregunta sobre un dispensador de pastillas.</strong> Un dispensador automático puede reducir las dosis olvidadas o duplicadas entre tus revisiones diarias.</p>
        <p><strong>5. Daremos seguimiento después del examen físico.</strong> Una vez que tengamos los resultados, actualizaremos este plan de cuidado juntos.</p>
        <h5>Recursos</h5>
        <div class="report-resource-group">
          <span class="report-tag healthcare">Salud</span>
          <ul class="report-resource-list">
            <li><strong>Guía de Estilo de Vida para Demencia Vascular:</strong> orientación de dieta y actividad para la salud cognitiva vascular (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
          </ul>
        </div>
        <div class="report-resource-group">
          <span class="report-tag logistics">Logística</span>
          <ul class="report-resource-list">
            <li><strong>Apps y Dispensadores para Recordatorio de Medicamentos:</strong> herramientas para seguir las dosis diarias (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
            <li><strong>Servicios de Entrega de Comidas para Personas Mayores:</strong> opciones para comidas diarias consistentes y saludables (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
          </ul>
        </div>
        <p><strong>Próxima Revisión:</strong> Examen físico programado para el 25 de junio de 2026. Daremos seguimiento justo después para actualizar este plan con los resultados.</p>
      `,
      shared: false
    }
  ],
  chatHistory: [
    {
      sender: 'assistant',
      text: 'Hello! I am your AI Companion. I can help summarize case notes, generate local resources, draft family care plans, or analyze trends. Ask me anything about your active families (Rivera, Oklaz, Pierre).',
      time: '15:15'
    }
  ],
  notifications: [
    { id: 'noti-shared-case', unread: true }
  ]
};

// --- Chat suggestions child questions configurations ---
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
  statWaitingReferralCount: document.getElementById('stat-waiting-referral-count'),
  statContinuingServicesCount: document.getElementById('stat-continuing-services-count'),
  statWaitingFollowupCount: document.getElementById('stat-waiting-followup-count'),
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
  primaryContactInput: document.getElementById('primary-contact-name'),
  intakeZipInput: document.getElementById('intake-zip-code'),
  intakeMobilityInput: document.getElementById('intake-mobility'),
  intakeEmergencyName: document.getElementById('intake-emergency-name'),
  intakeEmergencyPhone: document.getElementById('intake-emergency-phone'),
  intakeNotesInput: document.getElementById('intake-notes'),
  
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
  resourceTagFilter: document.getElementById('resource-tag-filter'),
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
  btnToggleReportLanguage: document.getElementById('btn-toggle-report-language'),
  btnCloseCaseFromReport: document.getElementById('btn-close-case-from-report'),
  
  modalShareCard: document.getElementById('modal-share-card'),
  shareModalTitle: document.getElementById('share-modal-title'),
  sharePreviewText: document.getElementById('share-preview-text'),
  shareHandoffNotes: document.getElementById('share-handoff-notes'),
  shareSearchInput: document.getElementById('share-search'),
  btnCloseShareModal: document.getElementById('btn-close-share-modal'),
  btnCancelShare: document.getElementById('btn-cancel-share'),
  btnConfirmShare: document.getElementById('btn-confirm-share'),
  
  // Custom Modals (Maximized Editor & Close Archive Options)
  modalCardEditor: document.getElementById('modal-card-editor'),
  editorModalTitle: document.getElementById('editor-modal-title'),
  editIntakeNotes: document.getElementById('edit-intake-notes'),
  editHandoffNotesGroup: document.getElementById('edit-handoff-notes-group'),
  editHandoffNotesText: document.getElementById('edit-handoff-notes-text'),
  editTimelineSteps: document.getElementById('edit-timeline-steps'),
  btnAddTimelineStep: document.getElementById('btn-add-timeline-step'),
  editResourcesItems: document.getElementById('edit-resources-items'),
  btnAddResourceItem: document.getElementById('btn-add-resource-item'),
  editAiSummary: document.getElementById('edit-ai-summary'),
  btnCancelEditor: document.getElementById('btn-cancel-editor'),
  btnSaveEditor: document.getElementById('btn-save-editor'),
  btnCloseEditorModal: document.getElementById('btn-close-editor-modal'),
  editorTabBtns: document.querySelectorAll('.editor-tab-btn'),
  editorPanes: document.querySelectorAll('.editor-pane'),
  
  modalCloseOptions: document.getElementById('modal-close-options'),
  btnCloseArchiveModal: document.getElementById('btn-close-archive-modal'),
  btnArchiveCancel: document.getElementById('btn-archive-cancel'),
  btnArchiveOnly: document.getElementById('btn-archive-only'),
  btnArchivePractices: document.getElementById('btn-archive-practices'),
  btnArchiveResources: document.getElementById('btn-archive-resources'),
  archiveRecommendationsPreview: document.getElementById('archive-recommendations-preview'),
  
  // Notifications Dropdown DOM
  btnNotificationTrigger: document.getElementById('btn-notification-trigger'),
  notificationsMenu: document.getElementById('notifications-menu'),
  notificationBadgeDot: document.getElementById('notification-badge-dot'),
  notiSharedCase: document.getElementById('noti-shared-case'),
  btnClearNotifications: document.getElementById('btn-clear-notifications'),
  
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
  setupNotifications();
  setupMaximizedEditor();
  setupCloseCaseOptions();
  setupDashboardStatClicks();

  // Initial renders
  renderAll();
  renderSuggestions();
});

// --- Renders Master Routine ---
function renderAll() {
  renderStats();
  renderDashboard();
  renderCaseCards();
  renderReportsList();
  renderChatHistory();
  renderNotificationBadge();
}

// --- Navigation & Routing ---
function setupNavigation() {
  DOM.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.getAttribute('data-page');
      switchPage(pageId);
      if (pageId === 'case-cards') {
        clearCaseCardFilter();
      }
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

// Helper functions to get selected values from single and multi-select pill groups
function getSelectedPillValue(fieldId) {
  const group = document.querySelector(`.pill-group[data-field="${fieldId}"]`);
  if (!group) return '';
  const activeBtn = group.querySelector('.pill-btn.active, .pill-badge.active');
  if (activeBtn) return activeBtn.dataset.value || activeBtn.textContent.trim();
  const input = group.querySelector('.pill-input');
  if (input && input.value.trim()) return input.value.trim();
  return '';
}

function getSelectedMultiPillValues(fieldId) {
  const group = document.querySelector(`.pill-group[data-field="${fieldId}"]`);
  if (!group) return [];
  const activeBtns = group.querySelectorAll('.pill-badge.active, .pill-btn.active');
  return Array.from(activeBtns).map(btn => btn.dataset.value || btn.textContent.trim());
}

function setupIntakePillInteractions() {
  document.addEventListener('click', (e) => {
    const pillBtn = e.target.closest('.pill-btn, .pill-badge');
    if (!pillBtn) return;
    
    // Prevent default form behavior on option pill clicks
    e.preventDefault();

    const isMultiSelect = pillBtn.closest('.pill-group.multi-select');
    const singleGroup = pillBtn.closest('.pill-group.single-select');

    if (isMultiSelect) {
      pillBtn.classList.toggle('active');
    } else if (singleGroup) {
      const isAlreadyActive = pillBtn.classList.contains('active');
      singleGroup.querySelectorAll('.pill-btn, .pill-badge').forEach(b => b.classList.remove('active'));
      if (!isAlreadyActive) {
        pillBtn.classList.add('active');
      }
      // Clear custom other language input if a button is selected
      const otherInput = singleGroup.querySelector('#intake-language-other');
      if (otherInput) otherInput.value = '';
    }
  });

  // Handle typing in custom language "Other (specify)..." input
  const langOtherInput = document.getElementById('intake-language-other');
  if (langOtherInput) {
    langOtherInput.addEventListener('input', () => {
      if (langOtherInput.value.trim().length > 0) {
        const group = langOtherInput.closest('.pill-group');
        if (group) {
          group.querySelectorAll('.pill-btn, .pill-badge').forEach(b => b.classList.remove('active'));
        }
      }
    });
  }
}

// --- Case Card Views & Subviews ---
function clearCaseCardFilter() {
  const cards = DOM.caseCardsContainer.querySelectorAll('.case-card-item');
  cards.forEach(cardItem => { cardItem.style.display = 'flex'; });
}

function setupCaseCardTabs() {
  DOM.tabBtnList.addEventListener('click', () => { showCaseCardsSubview('list'); clearCaseCardFilter(); });
  DOM.tabBtnNew.addEventListener('click', () => showCaseCardsSubview('form'));
  if (DOM.btnCancelCreate) {
    DOM.btnCancelCreate.addEventListener('click', () => showCaseCardsSubview('list'));
  }

  setupIntakePillInteractions();

  DOM.newCaseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const familyName = DOM.caseNameInput ? DOM.caseNameInput.value.trim() : '';
    const primaryContact = DOM.primaryContactInput ? DOM.primaryContactInput.value.trim() : '';
    const zipCode = DOM.intakeZipInput ? DOM.intakeZipInput.value.trim() : '';
    const emergencyName = DOM.intakeEmergencyName ? DOM.intakeEmergencyName.value.trim() : '';
    const emergencyPhone = DOM.intakeEmergencyPhone ? DOM.intakeEmergencyPhone.value.trim() : '';
    const notes = DOM.intakeNotesInput ? DOM.intakeNotesInput.value.trim() : '';

    const patientAge = getSelectedPillValue('patient-age') || '65 - 74';
    const patientStage = getSelectedPillValue('patient-stage') || 'Middle-Stage (Moderate)';
    const patientLanguage = getSelectedPillValue('patient-language') || 'English';
    const livingSituation = getSelectedPillValue('living-situation') || 'All adults';
    const patientMobility = DOM.intakeMobilityInput && DOM.intakeMobilityInput.value.trim() ? DOM.intakeMobilityInput.value.trim() : 'No mobility issues';
    
    const caregiverRel = getSelectedPillValue('caregiver-rel') || 'Adult Child';
    const caregiverAge = getSelectedPillValue('caregiver-age') || 'Under 65';
    const caregiverStress = getSelectedPillValue('caregiver-stress') || 'High / Burnout Risk';
    const bestCallTime = getSelectedPillValue('best-call-time') || 'Morning (8am-12pm)';
    
    const focusAreas = getSelectedMultiPillValues('focus-areas');
    const aiGoal = getSelectedPillValue('ai-assist-goal') || 'Find local resources';
    
    if (familyName && primaryContact) {
      const caseTitle = familyName.toLowerCase().includes('family') ? familyName : `${familyName} Family`;
      const id = caseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const detailsSummary = `Intake Active • Primary Contact: ${primaryContact}${zipCode ? ' (' + zipCode + ')' : ''}`;
      
      const fullIntakeText = `
Primary Contact: ${primaryContact}
Zip Code: ${zipCode || 'N/A'}
Emergency Contact: ${emergencyName ? emergencyName + ' (' + emergencyPhone + ')' : 'None listed'}
Best Time to Call: ${bestCallTime}

Patient Profile:
- Age Range: ${patientAge}
- Dementia Stage: ${patientStage}
- Language: ${patientLanguage}
- Living Situation: ${livingSituation}
- Mobility: ${patientMobility}

Caregiver Profile:
- Relationship: ${caregiverRel}
- Age Range: ${caregiverAge}
- Observed Stress Level: ${caregiverStress}

Focus Areas: ${focusAreas.length > 0 ? focusAreas.join(', ') : 'None selected'}
AI Goal: ${aiGoal}
${notes ? '\nNotes & Dynamics: ' + notes : ''}
      `.trim();
      
      const newCase = {
        id: id,
        name: caseTitle,
        details: detailsSummary,
        patientName: familyName.replace(/\s+Family/i, ''),
        patientAge: patientAge,
        phase: 'Intake Submitted',
        blurb: `${patientStage} ADRD case for ${familyName.replace(/\s+Family/i, '')}. Primary caregiver relationship: ${caregiverRel}.`,
        cardStatus: 'Waiting on Referral',
        intakeNotes: fullIntakeText,
        timeline: [
          { date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), label: 'Intake Form Submitted' }
        ],
        resources: [
          { name: `${patientStage} Care Protocols`, url: '#' },
          { name: `Local Resources for ${zipCode || 'Region'}`, url: '#' }
        ],
        aiSummary: `Intake registered for ${caseTitle}. Stage: ${patientStage}. Primary caregiver (${caregiverRel}) reports stress level: ${caregiverStress}. Focus areas identified: ${focusAreas.join(', ') || 'General ADRD care'}. AI goal: ${aiGoal}.`,
        reportStatus: 'Not Generated',
        reportPeriod: 'Q2 2024',
        reportContent: `
          <h4>${caseTitle} Report</h4>
          <p class="report-meta">Date: ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}<br>Assigned CHW: Jane Doe</p>
          <p class="report-greeting">Hi ${primaryContact},</p>
          <p>Thanks for completing the intake for ${familyName.replace(/\s+Family/i, '')}. Here is a starting summary based on what you shared, along with resources to help going forward.</p>
          <h5>Intake Summary</h5>
          <p>${fullIntakeText.replace(/\n/g, '<br>')}</p>
          <h5>Resources</h5>
          <div class="report-resource-group">
            <span class="report-tag healthcare">Healthcare</span>
            <ul class="report-resource-list">
              <li><strong>${patientStage} Care Protocols:</strong> clinical guidance matched to the current care stage (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
            </ul>
          </div>
          <div class="report-resource-group">
            <span class="report-tag logistics">Logistics</span>
            <ul class="report-resource-list">
              <li><strong>Local Resources for ${zipCode || 'Region'}:</strong> nearby support services and programs (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
            </ul>
          </div>
          <p><strong>Next Check-up:</strong> Follow-up to be scheduled based on the initial intake above.</p>
        `,
        reportContentEs: `
          <h4>Informe de ${caseTitle}</h4>
          <p class="report-meta">Fecha: ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}<br>Trabajadora de salud asignada: Jane Doe</p>
          <p class="report-greeting">Hola ${primaryContact},</p>
          <p>Gracias por completar la admisión para ${familyName.replace(/\s+Family/i, '')}. Aquí tienes un resumen inicial basado en lo que compartiste, junto con recursos para ayudarte a seguir adelante.</p>
          <h5>Resumen de Admisión</h5>
          <p>${fullIntakeText.replace(/\n/g, '<br>')}</p>
          <h5>Recursos</h5>
          <div class="report-resource-group">
            <span class="report-tag healthcare">Salud</span>
            <ul class="report-resource-list">
              <li><strong>Protocolos de Cuidado para ${patientStage}:</strong> orientación clínica según la etapa actual de cuidado (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
            </ul>
          </div>
          <div class="report-resource-group">
            <span class="report-tag logistics">Logística</span>
            <ul class="report-resource-list">
              <li><strong>Recursos Locales para ${zipCode || 'la Región'}:</strong> servicios y programas de apoyo cercanos (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
            </ul>
          </div>
          <p><strong>Próxima Revisión:</strong> Se programará un seguimiento según la admisión inicial descrita arriba.</p>
        `,
        shared: false
      };

      state.cases.unshift(newCase);
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

function setupDashboardStatClicks() {
  document.querySelectorAll('.stat-card-clickable').forEach(card => {
    card.addEventListener('click', () => {
      const statusFilter = card.getAttribute('data-status-filter');
      switchPage('case-cards');
      showCaseCardsSubview('list');
      DOM.globalSearch.value = '';
      const cards = DOM.caseCardsContainer.querySelectorAll('.case-card-item');
      cards.forEach(cardItem => {
        cardItem.style.display = cardItem.getAttribute('data-status') === statusFilter ? 'flex' : 'none';
      });
    });
  });
}

// --- Render Dashboard ---
function renderStats() {
  DOM.statWaitingReferralCount.textContent = state.cases.filter(c => c.cardStatus === 'Waiting on Referral').length;
  DOM.statContinuingServicesCount.textContent = state.cases.filter(c => c.cardStatus === 'Continuing Services').length;
  DOM.statWaitingFollowupCount.textContent = state.cases.filter(c => c.cardStatus === 'Waiting Followup').length;
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
              Shared
            </span>
          ` : ''}
        </div>
        <span class="case-meta">${c.details}</span>
      </div>
      <div class="family-action">
        <button class="btn btn-secondary btn-sm btn-view-case" data-id="${c.id}">View Case Card</button>
      </div>
    `;
    
    DOM.dashboardList.appendChild(item);
  });

  document.querySelectorAll('.btn-view-case').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
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

// --- Render Case Cards List ---
function getStatusChipClass(status) {
  if (status === 'Continuing Services') return 'success';
  if (status === 'Waiting Followup') return 'info';
  return 'warning'; // Waiting on Referral
}

function renderCaseCards() {
  DOM.caseCardsContainer.innerHTML = '';

  state.cases.forEach(c => {
    const card = document.createElement('div');
    card.className = 'case-card-item';
    card.id = `card-${c.id}`;
    card.setAttribute('data-status', c.cardStatus);

    const chipClass = getStatusChipClass(c.cardStatus);
    const statusOptions = ['Waiting on Referral', 'Continuing Services', 'Waiting Followup'];

    card.innerHTML = `
      <div class="case-card-header">
        <div class="card-title-group">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          <h3>${c.name}</h3>
        </div>
        <button class="card-share-btn" data-family="${c.name}" title="Share Case Card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        </button>
      </div>

      <p class="card-phase">Phase: ${c.phase}</p>
      <p class="card-blurb">${c.blurb}</p>

      <div class="card-footer-row">
        <select class="status-chip-select ${chipClass}" data-case-id="${c.id}">
          ${statusOptions.map(opt => `<option value="${opt}" ${opt === c.cardStatus ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      </div>

      <button class="btn btn-secondary btn-maximize-card" data-case-id="${c.id}">Maximize Card Editor</button>
    `;

    DOM.caseCardsContainer.appendChild(card);

    // Maximise card on click event
    card.addEventListener('click', () => {
      openMaximizedEditor(c.id);
    });
  });

  // Status dropdown chips: update state + styling without maximizing the card
  document.querySelectorAll('.status-chip-select').forEach(select => {
    select.addEventListener('click', (e) => e.stopPropagation());
    select.addEventListener('change', (e) => {
      const caseId = select.getAttribute('data-case-id');
      const caseItem = state.cases.find(c => c.id === caseId);
      if (caseItem) {
        caseItem.cardStatus = select.value;
        select.className = `status-chip-select ${getStatusChipClass(select.value)}`;
        select.closest('.case-card-item').setAttribute('data-status', select.value);
        renderStats();
      }
    });
  });

  // Stop propagation for share buttons inside cards
  document.querySelectorAll('.card-share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const familyName = btn.getAttribute('data-family');
      openShareModal(familyName);
    });
  });

  // Stop propagation for Ask AI buttons
  document.querySelectorAll('.btn-ask-ai-from-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const familyName = btn.getAttribute('data-family');
      switchPage('ai-chat');
      DOM.chatInput.value = `Can you provide a detailed care recommendation checklist for the ${familyName}?`;
      DOM.chatInput.focus();
    });
  });
}

// --- Render Reports List ---
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

// --- Setup Resources Filters ---
function setupResourcesFilter() {
  const filterHandler = () => {
    const query = DOM.resourceSearch.value.toLowerCase().trim();
    const selectedTag = DOM.resourceTagFilter.value.toLowerCase();
    
    const allCards = document.querySelectorAll('.resource-card-item');
    allCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      const cardTagsAttr = card.getAttribute('data-tags') || '';
      const cardTags = cardTagsAttr.toLowerCase().split(',');
      
      const textMatch = title.includes(query) || desc.includes(query);
      const tagMatch = selectedTag === 'all' || cardTags.includes(selectedTag);
      
      if (textMatch && tagMatch) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  };

  DOM.resourceSearch.addEventListener('input', filterHandler);
  DOM.resourceTagFilter.addEventListener('change', filterHandler);
}

// --- Maximized Card Editor Modal ---
function setupMaximizedEditor() {
  const closeModal = () => {
    DOM.modalCardEditor.classList.remove('active');
    state.editingCaseId = null;
  };

  DOM.btnCloseEditorModal.addEventListener('click', closeModal);
  DOM.btnCancelEditor.addEventListener('click', closeModal);
  
  // Editor tab switching
  DOM.editorTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-edit-tab');
      DOM.editorTabBtns.forEach(b => b.classList.remove('active'));
      DOM.editorPanes.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      DOM.modalCardEditor.querySelector(`.editor-pane[data-edit-tab="${tab}"]`).classList.add('active');
      state.activeEditTab = tab;
    });
  });

  // Timeline add button
  DOM.btnAddTimelineStep.addEventListener('click', () => {
    const container = DOM.editTimelineSteps;
    const row = document.createElement('div');
    row.className = 'edit-row';
    row.innerHTML = `
      <input type="text" placeholder="Date (e.g. Jun 18)" class="edit-timeline-date" style="flex: 1;">
      <input type="text" placeholder="Timeline milestone description" class="edit-timeline-label" style="flex: 2;">
      <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  });

  // Resources add button
  DOM.btnAddResourceItem.addEventListener('click', () => {
    const container = DOM.editResourcesItems;
    const row = document.createElement('div');
    row.className = 'edit-row';
    row.innerHTML = `
      <input type="text" placeholder="Resource Name" class="edit-res-name" style="flex: 1;">
      <input type="text" placeholder="Link URL" class="edit-res-url" style="flex: 1;" value="#">
      <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  });

  // Save changes
  DOM.btnSaveEditor.addEventListener('click', () => {
    const caseIndex = state.cases.findIndex(c => c.id === state.editingCaseId);
    if (caseIndex !== -1) {
      // 1. Save Intake
      state.cases[caseIndex].intakeNotes = DOM.editIntakeNotes.value;
      
      // 2. Save Timeline Steps
      const timelineSteps = [];
      const dateInputs = DOM.editTimelineSteps.querySelectorAll('.edit-timeline-date');
      const labelInputs = DOM.editTimelineSteps.querySelectorAll('.edit-timeline-label');
      
      dateInputs.forEach((input, index) => {
        const dateVal = input.value.trim();
        const labelVal = labelInputs[index].value.trim();
        if (dateVal && labelVal) {
          timelineSteps.push({ date: dateVal, label: labelVal });
        }
      });
      state.cases[caseIndex].timeline = timelineSteps;
      
      // 3. Save Resources Links
      const resourceLinks = [];
      const nameInputs = DOM.editResourcesItems.querySelectorAll('.edit-res-name');
      const urlInputs = DOM.editResourcesItems.querySelectorAll('.edit-res-url');
      
      const previousResourceNames = state.cases[caseIndex].resources.map(r => r.name);
      nameInputs.forEach((input, index) => {
        const nameVal = input.value.trim();
        const urlVal = urlInputs[index].value.trim();
        if (nameVal && urlVal) {
          resourceLinks.push({ name: nameVal, url: urlVal });
          if (!previousResourceNames.includes(nameVal)) {
            addResourceToLibrary(nameVal, urlVal, state.cases[caseIndex].name);
          }
        }
      });
      state.cases[caseIndex].resources = resourceLinks;

      // 4. Save AI Summary
      state.cases[caseIndex].aiSummary = DOM.editAiSummary.value;

      closeModal();
      renderAll();
    }
  });
}

function openMaximizedEditor(caseId) {
  const c = state.cases.find(item => item.id === caseId);
  if (!c) return;

  state.editingCaseId = caseId;
  DOM.editorModalTitle.textContent = `Edit ${c.name} Card`;

  // Show Handoff Notes if this case has any (e.g. cases shared to you)
  if (c.handoffNotes) {
    DOM.editHandoffNotesGroup.style.display = '';
    DOM.editHandoffNotesText.textContent = c.handoffNotes;
  } else {
    DOM.editHandoffNotesGroup.style.display = 'none';
  }

  // Set Intake text
  DOM.editIntakeNotes.value = c.intakeNotes.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
  
  // Load Timeline list
  DOM.editTimelineSteps.innerHTML = '';
  c.timeline.forEach(step => {
    const row = document.createElement('div');
    row.className = 'edit-row';
    row.innerHTML = `
      <input type="text" class="edit-timeline-date" value="${step.date}" style="flex: 1;">
      <input type="text" class="edit-timeline-label" value="${step.label}" style="flex: 2;">
      <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">&times;</button>
    `;
    DOM.editTimelineSteps.appendChild(row);
  });

  // Load Resources list
  DOM.editResourcesItems.innerHTML = '';
  c.resources.forEach(res => {
    const row = document.createElement('div');
    row.className = 'edit-row';
    row.innerHTML = `
      <input type="text" class="edit-res-name" value="${res.name}" style="flex: 1;">
      <input type="text" class="edit-res-url" value="${res.url}" style="flex: 1;">
      <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">&times;</button>
    `;
    DOM.editResourcesItems.appendChild(row);
  });

  // Load AI Summary
  DOM.editAiSummary.value = c.aiSummary;

  // Default to Intake tab
  DOM.editorTabBtns.forEach(btn => btn.classList.remove('active'));
  DOM.editorPanes.forEach(pane => pane.classList.remove('active'));
  DOM.editorTabBtns[0].classList.add('active');
  DOM.editorPanes[0].classList.add('active');
  state.activeEditTab = 'intake';

  DOM.modalCardEditor.classList.add('active');
}

// --- Close Case Archive Options Dialog ---
function setupCloseCaseOptions() {
  const closeAll = () => {
    DOM.modalCloseOptions.classList.remove('active');
    DOM.modalReportViewer.classList.remove('active');
  };

  DOM.btnCloseArchiveModal.addEventListener('click', () => DOM.modalCloseOptions.classList.remove('active'));
  DOM.btnArchiveCancel.addEventListener('click', () => DOM.modalCloseOptions.classList.remove('active'));

  // "No, Just Close Case"
  DOM.btnArchiveOnly.addEventListener('click', () => {
    executeCaseArchiving(false);
    closeAll();
  });

  // "Add to Peer Process Database"
  DOM.btnArchivePractices.addEventListener('click', () => {
    executeCaseArchiving(true, 'practices');
    closeAll();
    switchPage('resources');
  });

  // "Add to ADRD Resources"
  DOM.btnArchiveResources.addEventListener('click', () => {
    executeCaseArchiving(true, 'adrd');
    closeAll();
    switchPage('resources');
  });
}

// Adds a resource (e.g. saved from a case card editor) into the Resources page.
// Lands in ADRD Resources unless the name suggests a protocol/standard, in which case it lands in Peer Process Database.
function addResourceToLibrary(name, url, familyName) {
  const isProcessResource = /protocol|standard|guide|template|checklist/i.test(name);
  const containerId = isProcessResource ? 'practices-resources-list' : 'adrd-resources-list';
  const container = document.getElementById(containerId);
  if (!container) return;

  const card = document.createElement('div');
  card.className = 'resource-card-item';
  card.setAttribute('data-tags', 'case study,coordination');
  card.innerHTML = `
    <h3>${name}</h3>
    <p>Added from the ${familyName} case card.</p>
    <div class="tag-row">
      <span class="mini-tag">Case Study</span>
      <span class="mini-tag">Coordination</span>
    </div>
  `;
  container.appendChild(card);
}

function executeCaseArchiving(addResource = false, targetLibrary = '') {
  const caseId = DOM.btnCloseCaseFromReport.getAttribute('data-case-id');
  const c = state.cases.find(item => item.id === caseId);
  if (!c) return;

  if (addResource) {
    const containerId = targetLibrary === 'adrd' ? 'adrd-resources-list' : 'practices-resources-list';
    const container = document.getElementById(containerId);
    
    if (container) {
      const card = document.createElement('div');
      card.className = 'resource-card-item';
      card.setAttribute('data-tags', 'case study,clinical');
      card.innerHTML = `
        <h3>${c.name} Case Summary</h3>
        <p>${c.aiSummary}</p>
        <div class="tag-row">
          <span class="mini-tag">Case Study</span>
          <span class="mini-tag">Clinical</span>
        </div>
      `;
      container.appendChild(card);
    }
    alert(`Case successfully archived. Resource added to ${targetLibrary === 'adrd' ? 'ADRD Resources' : 'Peer Process Database'}!`);
  } else {
    alert('Case successfully closed and archived.');
  }

  // Remove case from state
  state.cases = state.cases.filter(item => item.id !== caseId);
  renderAll();
}

function openCloseCaseOptionsModal(caseId) {
  const c = state.cases.find(item => item.id === caseId);
  if (!c) return;

  DOM.btnCloseCaseFromReport.setAttribute('data-case-id', caseId);
  DOM.archiveRecommendationsPreview.innerHTML = `
    <strong>Resource Preview:</strong><br>
    <strong>Title:</strong> ${c.name} Case Summary<br>
    <strong>Content:</strong> ${c.aiSummary}
  `;
  DOM.modalCloseOptions.classList.add('active');
}

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

  DOM.btnToggleReportLanguage.addEventListener('click', toggleReportLanguage);

  // Close case trigger triggers our custom options popup modal
  DOM.btnCloseCaseFromReport.addEventListener('click', () => {
    const caseId = DOM.btnCloseCaseFromReport.getAttribute('data-case-id');
    openCloseCaseOptionsModal(caseId);
  });
}

function openReportModal(caseItem) {
  DOM.reportModalTitle.textContent = `${caseItem.name} - ${caseItem.reportPeriod} Report`;
  state.currentReportCaseId = caseItem.id;
  state.reportLangSpanish = false;
  DOM.reportModalTextContent.innerHTML = caseItem.reportContent;
  DOM.btnCloseCaseFromReport.setAttribute('data-case-id', caseItem.id);
  DOM.btnToggleReportLanguage.innerHTML = DOM.btnToggleReportLanguage.innerHTML.replace(/Traducir al español|Translate to English/, 'Traducir al español');

  DOM.modalReportViewer.classList.add('active');
}

function toggleReportLanguage() {
  const caseItem = state.cases.find(c => c.id === state.currentReportCaseId);
  if (!caseItem || !caseItem.reportContentEs) return;

  state.reportLangSpanish = !state.reportLangSpanish;
  DOM.reportModalTextContent.innerHTML = state.reportLangSpanish ? caseItem.reportContentEs : caseItem.reportContent;
  DOM.btnToggleReportLanguage.innerHTML = DOM.btnToggleReportLanguage.innerHTML.replace(
    /Traducir al español|Translate to English/,
    state.reportLangSpanish ? 'Translate to English' : 'Traducir al español'
  );
}

// --- Notifications Dropdown System ---
function setupNotifications() {
  DOM.btnNotificationTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    DOM.notificationsMenu.classList.toggle('active');
  });

  // Close dropdown if clicking outside
  document.addEventListener('click', () => {
    DOM.notificationsMenu.classList.remove('active');
  });

  DOM.notificationsMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Clicking "Marcus Family" notification
  DOM.notiSharedCase.addEventListener('click', () => {
    DOM.notificationsMenu.classList.remove('active');
    
    // Add Marcus Family case
    const id = 'marcus-family';
    const exists = state.cases.some(c => c.id === id);
    
    if (!exists) {
      const marcusCase = {
        id: id,
        name: 'Marcus Family',
        details: 'Shared by: Robert Mercer &bull; Primary: Sarah Marcus',
        patientName: 'Sarah Marcus',
        patientAge: 76,
        phase: 'Case Shared',
        blurb: 'Early cognitive lapses, shared by CHW Robert Mercer to coordinate home safety and daily routines.',
        cardStatus: 'Waiting Followup',
        handoffNotes: 'Sarah responds well to morning visits; avoid late-afternoon check-ins as she tires easily. Family prefers phone calls over email for scheduling.',
        intakeNotes: `Sarah Marcus (Age 76) is experiencing early cognitive lapses. Case shared by CHW Robert Mercer to collaborate on home safety checklists. Family is eager to establish structured daily routine support systems.`,
        timeline: [
          { date: 'Jun 18, 2026', label: 'Case Shared by Robert Mercer' }
        ],
        resources: [
          { name: 'Home Safety Audit Sheet', url: '#' },
          { name: 'Cognitive Exercises Guide', url: '#' }
        ],
        aiSummary: 'Marcus Family case shared by CHW Robert Mercer. Immediate recommended tasks include establishing basic check-in protocols and coordinating on safety wristbands.',
        reportStatus: 'Not Generated',
        reportPeriod: 'Q2 2024',
        reportContent: `
          <h4>Marcus Family Report</h4>
          <p class="report-meta">Date: ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}<br>Assigned CHW: Robert Mercer</p>
          <p class="report-greeting">Hi there,</p>
          <p>This case was shared via the org neurology network. Sarah is experiencing mild temporal adjustments, and we're setting up basic check-in protocols and safety coordination to start.</p>
          <h5>Resources</h5>
          <div class="report-resource-group">
            <span class="report-tag healthcare">Healthcare</span>
            <ul class="report-resource-list">
              <li><strong>Cognitive Exercises Guide:</strong> daily activities to support cognitive engagement (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
            </ul>
          </div>
          <div class="report-resource-group">
            <span class="report-tag logistics">Logistics</span>
            <ul class="report-resource-list">
              <li><strong>Home Safety Audit Sheet:</strong> checklist to review home safety and access points (<a href="#" onclick="event.stopPropagation()">link</a>)</li>
            </ul>
          </div>
          <p><strong>Next Check-up:</strong> Follow-up to be scheduled after initial check-in protocols are established.</p>
        `,
        reportContentEs: `
          <h4>Informe de la Familia Marcus</h4>
          <p class="report-meta">Fecha: ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}<br>Trabajador de salud asignado: Robert Mercer</p>
          <p class="report-greeting">Hola,</p>
          <p>Este caso fue compartido a través de la red de neurología de la organización. Sarah está experimentando ajustes temporales leves, y estamos estableciendo protocolos básicos de seguimiento y coordinación de seguridad para empezar.</p>
          <h5>Recursos</h5>
          <div class="report-resource-group">
            <span class="report-tag healthcare">Salud</span>
            <ul class="report-resource-list">
              <li><strong>Guía de Ejercicios Cognitivos:</strong> actividades diarias para apoyar la actividad cognitiva (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
            </ul>
          </div>
          <div class="report-resource-group">
            <span class="report-tag logistics">Logística</span>
            <ul class="report-resource-list">
              <li><strong>Hoja de Auditoría de Seguridad del Hogar:</strong> lista de verificación para revisar la seguridad y accesos del hogar (<a href="#" onclick="event.stopPropagation()">enlace</a>)</li>
            </ul>
          </div>
          <p><strong>Próxima Revisión:</strong> Se programará un seguimiento después de establecer los protocolos iniciales de contacto.</p>
        `,
        shared: true
      };

      state.cases.push(marcusCase);
    }
    
    // Mark as read
    state.notifications[0].unread = false;
    DOM.notiSharedCase.classList.remove('unread');
    
    // Re-render
    renderAll();
    switchPage('my-cases');

    // Highlight row on dashboard
    setTimeout(() => {
      const row = document.querySelector(`[data-case-id="${id}"]`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth' });
        row.classList.add('glowing-highlight');
        setTimeout(() => row.classList.remove('glowing-highlight'), 1500);
      }
    }, 200);
  });

  DOM.btnClearNotifications.addEventListener('click', () => {
    state.notifications.forEach(n => n.unread = false);
    DOM.notiSharedCase.classList.remove('unread');
    renderNotificationBadge();
  });
}

function renderNotificationBadge() {
  const hasUnread = state.notifications.some(n => n.unread);
  DOM.notificationBadgeDot.style.display = hasUnread ? 'block' : 'none';
}

// --- Share Case Modal ---
function setupShareModal() {
  const closeModal = () => {
    DOM.modalShareCard.classList.remove('active');
    DOM.shareSearchInput.value = '';
    DOM.shareHandoffNotes.value = '';
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

    const handoffNote = DOM.shareHandoffNotes.value.trim();
    if (handoffNote && state.currentShareFamilyName) {
      const sharedCase = state.cases.find(c => c.name === state.currentShareFamilyName);
      if (sharedCase) sharedCase.handoffNotes = handoffNote;
    }

    alert('Case Card shared successfully with selected team members!');
    closeModal();
  });

  DOM.shareSearchInput.addEventListener('input', (e) => {
    filterShareUsers(e.target.value.toLowerCase());
  });
}

function openShareModal(familyName) {
  state.currentShareFamilyName = familyName;
  DOM.shareModalTitle.textContent = `Share ${familyName} Card`;
  DOM.sharePreviewText.innerHTML = `<strong>Sharing:</strong> Current Intake assessment &amp; clinical timeline for the <strong>${familyName}</strong>. Sharing gives full editing privileges to the selected recipient's dashboards.`;
  DOM.shareHandoffNotes.value = '';

  DOM.modalShareCard.classList.add('active');
}

function filterShareUsers(query) {
  const rows = document.querySelectorAll('#share-users-choices .user-select-row');
  rows.forEach(row => {
    const searchString = row.getAttribute('data-name').toLowerCase();
    row.style.display = searchString.includes(query) ? 'flex' : 'none';
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

  DOM.btnNewChat.addEventListener('click', () => {
    state.chatHistory = [];
    DOM.chatInput.value = '';
    DOM.chatInput.style.height = 'auto';
    
    renderChatHistory();
    renderSuggestions();
  });
}

// Render dynamic static parent suggestion chips
function renderSuggestions() {
  DOM.chatSuggestionsBox.innerHTML = '';

  // Render only the 4 main categories above text input
  suggestionsData.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn category';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      <span>${cat.label}</span>
    `;
    btn.addEventListener('click', () => {
      handleCategorySelected(cat);
    });
    DOM.chatSuggestionsBox.appendChild(btn);
  });
}

// Handle Category click: post categories in chat bubble rather than cluttering suggestions
function handleCategorySelected(cat) {
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // 1. Post User Choice
  state.chatHistory.push({
    sender: 'user',
    text: `Let's discuss: ${cat.label}`,
    time: timeNow
  });
  
  renderChatHistory();
  showChatTypingIndicator();
  
  setTimeout(() => {
    removeChatTypingIndicator();
    
    // 2. Post AI response with dynamic buttons inside the bubble
    state.chatHistory.push({
      sender: 'assistant',
      text: `Here are some common questions regarding <strong>${cat.label}</strong>. Select one below to explore:`,
      time: timeNow,
      optionsList: suggestionsData.questions[cat.id] // Dynamic questions list
    });
    
    renderChatHistory();
  }, 1000);
}

function scrollChatBottom() {
  setTimeout(() => {
    DOM.chatMessagesBox.scrollTop = DOM.chatMessagesBox.scrollHeight;
  }, 50);
}

function renderChatHistory() {
  DOM.chatMessagesBox.innerHTML = '';

  if (state.chatHistory.length === 0) {
    const welcomeBox = document.createElement('div');
    welcomeBox.className = 'chat-message assistant';
    welcomeBox.innerHTML = `
      <div class="message-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </div>
      <div class="message-content-wrapper">
        <div class="message-sender">AZ Companion</div>
        <div class="message-bubble">
          <p>Hello! I am your AI Companion. Select one of the conversational categories below to start, or type your own question in the box!</p>
        </div>
      </div>
    `;
    DOM.chatMessagesBox.appendChild(welcomeBox);
    scrollChatBottom();
    return;
  }
  
  state.chatHistory.forEach((msg, msgIndex) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.sender}`;
    
    let avatarContent = 'JD';
    if (msg.sender === 'assistant') {
      avatarContent = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    
    // Embed card logic
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

    // In-Chat Options buttons block logic
    let optionsHTML = '';
    if (msg.optionsList && msg.optionsList.length > 0) {
      optionsHTML = `<div class="chat-options-block" id="msg-opts-${msgIndex}">`;
      msg.optionsList.forEach((opt, optIndex) => {
        optionsHTML += `<button class="chat-option-choice-btn" data-msg-idx="${msgIndex}" data-opt-idx="${optIndex}">${opt}</button>`;
      });
      optionsHTML += `</div>`;
    }

    msgDiv.innerHTML = `
      <div class="message-avatar">${avatarContent}</div>
      <div class="message-content-wrapper">
        <div class="message-sender">${msg.sender === 'assistant' ? 'AZ Companion' : 'You'}</div>
        <div class="message-bubble">
          <p>${msg.text}</p>
          ${embedHTML}
          ${msg.additionalText ? `<p>${msg.additionalText}</p>` : ''}
          ${optionsHTML}
        </div>
      </div>
    `;
    
    DOM.chatMessagesBox.appendChild(msgDiv);

    // Bind event listeners for in-chat dynamic buttons
    if (msg.optionsList && msg.optionsList.length > 0) {
      const container = document.getElementById(`msg-opts-${msgIndex}`);
      if (container) {
        container.querySelectorAll('.chat-option-choice-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const questionText = btn.textContent;
            
            // Disable/clear options block from view
            container.remove();
            msg.optionsList = []; // Remove from state so they don't redraw

            // Send question
            DOM.chatInput.value = questionText;
            handleChatSend();
          });
        });
      }
    }
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
      <p>I have prepared a <strong>"First Visit &amp; Rapport Protocol Guide"</strong> in the <em>Peer Process Database</em> resources tab for you!</p>
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
      <p>Check the <strong>"Denial Mitigation Standard"</strong> sheet under the <em>Peer Process Database</em> column for further worksheets.</p>
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
      <p>Provide them with the **"Role Boundary Handout Sheet"** available in the <em>Peer Process Database</em> list to set clear expectations.</p>
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
      <p>I have uploaded a <strong>"Pacing &amp; Visit Layout Template"</strong> in the <em>Peer Process Database</em> panel.</p>
    `;
  }

  // --- 5. Context-aware keywords (Cases Rivera, Oklaz, Pierre, Marcus) ---
  else if (queryLower.includes('marcus') || queryLower.includes('sarah marcus')) {
    text = `${modelHeadline}Here is the active care summary checklist for the newly added <strong>Marcus Family</strong>:`;
    embedCard = {
      title: 'Care Summary: Marcus Family',
      tag: 'Shared Case',
      caregiver: 'Robert Mercer & Sarah Marcus',
      focus: 'Coordinating events, door locks safety audit, caregiver support.',
      metrics: [
        { label: 'Caregiver Burnout Risk', val: 'Low', width: '25%', color: '#10b981' },
        { label: 'Wandering Risk', val: 'Low', width: '30%', color: '#10b981' }
      ]
    };
    additionalText = `<strong>Recommended initial steps:</strong>
      <ul>
        <li><strong>Home safety audit:</strong> Check exit door locks.</li>
        <li><strong>Event scheduling:</strong> Coordinate with event managers for respite visits.</li>
      </ul>`;
  }
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
    text = `I am processing your query under the <strong>${modelType.toUpperCase()}</strong> engine. I can help coordinate and detail clinical workflows. Please specify a case name or select a suggestion chip below to get tailored insights.`;
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
  renderSuggestions();
}

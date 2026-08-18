/* 
  AZ Companion Application Logic
  Handles State Management, Routing, Dynamic Rendering, 
  Notifications, Inline Card Editor, Conversational AI options,
  Close-Case Archiving redirects, and Resource Tag Filters.
*/

// --- Chat backend config ---
// Set this once the Cloudflare Worker is deployed (task 6). Left blank = chat falls back to mock responses.
const CHAT_WORKER_URL = 'https://az-chat-worker.uicvare.workers.dev';

// Canonical tag set for resources attached to a family's case card (Family Resources tab).
// Capped at 10 so the dropdown stays scannable; doubles later as the practice-vs-resource
// categorization key once the ASI-verified document is added.
const FAMILY_RESOURCE_TAGS = ['Support', 'Caregiver', 'Clinical', 'Safety', 'Behavioral', 'Engagement', 'Intake', 'Coordination', 'Guides', 'Devices'];

// Fallback intake field values for cases that predate structured intakeFields (e.g. hand-authored
// seed cases that only ever had a freeform intakeNotes narrative).
const DEFAULT_INTAKE_FIELDS = {
  primaryContact: '', zipCode: '', mobility: '',
  patientAge: '65 - 74', patientStage: 'Middle-Stage (Moderate)',
  patientLanguage: 'English', livingSituation: 'All adults',
  caregiverRel: 'Adult Child', caregiverAge: 'Under 65', caregiverStress: 'Moderate / Needs Support',
  focusAreas: [], aiGoal: 'Find local resources', otherInfo: '', notes: ''
};

function buildResourceTagOptionsHTML(selectedTag) {
  const options = ['<option value="">No tag</option>'].concat(
    FAMILY_RESOURCE_TAGS.map(t => `<option value="${t}" ${t === selectedTag ? 'selected' : ''}>${t}</option>`)
  );
  return options.join('');
}

// Curated resources (RESOURCES_DATA below) predate the 10-tag taxonomy and use their own
// looser tags - map onto the canonical list where there's a real match, otherwise leave
// untagged rather than forcing a wrong bucket.
function mapToCanonicalResourceTag(tags) {
  if (!tags) return '';
  const match = tags.find(t => FAMILY_RESOURCE_TAGS.some(ft => ft.toLowerCase() === t.toLowerCase()));
  return match ? FAMILY_RESOURCE_TAGS.find(ft => ft.toLowerCase() === match.toLowerCase()) : '';
}

// Mirrors the resource cards on the Resources page (index.html) so chat answers can
// surface a matching one. "verified" = ASI-sourced (from the Verified Resources / Peer
// Practices docs) rather than general reading - these render with an "ASI Approved" badge.
// id fields match the worker's chunk ids so the server-returned resource list can be
// mapped back to full card data without client-side keyword guessing.
const RESOURCES_DATA = [
  // -- Verified Resources doc -> ADRD Resources column --
  { id: 'verified-resources-0', title: 'ASI Caregiver Support Program', tags: ['support', 'caregiver'], desc: "Stressbuster Course (9 weeks), education and training, gap-filling funds for items like grab bars and technology, respite care, and monthly caregiver support groups. Eligibility: age 18+, resident of the city of Chicago, caring for someone with Alzheimer's, dementia, or another chronic condition. Contact: DFSS Senior Services Information & Assistance, aging@cityofchicago.org, 312-744-4016", verified: true },
  { id: 'verified-resources-1', title: "Alzheimer's Association 24/7 Helpline", tags: ['support', 'caregiver'], desc: '225 N. Michigan Ave, Floor 17, Chicago, IL 60601 · 24/7 Helpline (800) 272-3900', verified: true },
  { id: 'verified-resources-2', title: 'Suicide Prevention Lifeline', tags: ['support'], desc: '1-800-273-8255 · 24/7 free and confidential support. Help available in Spanish.', verified: true },
  { id: 'verified-resources-3', title: 'Latino Alzheimer\'s & Memory Disorders Alliance (LAMDA)', tags: ['support', 'caregiver'], desc: "1609 36th Ave, Melrose Park, IL 60160 · (224) 715-4673. Spanish-language caregiver education, support groups, and case management for Latino families affected by Alzheimer's and memory disorders.", verified: true },
  { id: 'verified-resources-4', title: 'Dementia & Driving Guidance', tags: ['home safety', 'guides'], desc: 'wvpersonalinjury.com · 304-345-6789. Guidance on when a person with dementia should stop driving and how to manage the transition.', verified: true },
  { id: 'verified-resources-5', title: 'ASI Senior Health Insurance Program (SHIP)', tags: ['clinical', 'support'], desc: 'Free Medicare and Medicaid benefits counseling for beneficiaries. Main: (773) 278-5130', verified: true },
  { id: 'verified-resources-6', title: 'Legal Aid Chicago', tags: ['coordination'], desc: '120 S. LaSalle St. #900, Chicago, IL 60603 · (312) 341-1070. Free civil legal services for people living in poverty in Cook County.', verified: true },
  // -- Peer Practices doc -> ASI General Recommended Practice column --
  { id: 'peer-practices-0', title: 'Naming the Accusation as a Symptom', tags: ['behavioral', 'caregiver'], desc: 'Caregivers who hear first that an accusation is a known part of the disease, and not about them, are better able to use what comes next. Accusations often cluster at a particular time of day. Keeping a small amount of cash somewhere the person can find it themselves lets the search end without a confrontation.', verified: true },
  { id: 'peer-practices-1', title: 'Reframing a Refused Service', tags: ['caregiver', 'coordination'], desc: "Arguing the merits of a service tends not to work with caregivers who have refused help more than once. Asking what the care recipient would say if they could see how tired the caregiver was can move the conversation from the service to an earlier promise, opening the door to a short trial visit.", verified: true },
  { id: 'peer-practices-2', title: 'Respite Before Support Group', tags: ['support', 'caregiver'], desc: "Caregivers who say they can't leave the person alone are usually right, and offering a group before solving that tends not to land. Raising the respite question first (an adult day program, a neighbor, a grandchild for two hours) makes the group offer usable. Where no respite option exists, a phone or online group has worked better than an in-person one.", verified: true },
  { id: 'peer-practices-3', title: 'Answering the Placement Question', tags: ['coordination', 'caregiver'], desc: 'Declining to answer the placement question directly, while offering to help think it through, has worked better than either answering or deflecting. Asking what a normal day looks like now, and what would have to change to keep going, often leads caregivers to answer their own question.', verified: true },
  { id: 'peer-practices-4', title: "Raising a Caregiver's Own Symptom", tags: ['caregiver', 'clinical'], desc: "Raising a caregiver's own symptom again at a later call, rather than only at the call where they mention it, is what tends to get them to see a doctor. A single suggestion has usually not been enough on its own.", verified: true },
  { id: 'peer-practices-5', title: 'Documenting Changes for the Doctor', tags: ['clinical', 'coordination'], desc: 'Contradicting a family who says the person is just getting old has worked less well than asking what they have noticed that seemed different, and writing the examples down as they talk. Offering the list for them to take to the doctor changes what the visit produces.', verified: true }
];

// Look up a curated resource card by the worker's chunk id (e.g. "verified-resources-0").
function findResourceById(id) {
  return RESOURCES_DATA.find(r => r.id === id) || null;
}

// --- Application State ---
const state = {
  activePage: 'my-cases',
  editingCaseId: null, // Tracks case ID currently being edited in maximized editor
  activeEditTab: 'intake',
  activeChatCaseId: null, // Tracks which family case (if any) the AI Chat is currently scoped to
  
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
      intakeFields: {
        primaryContact: 'Sophia Rivera', zipCode: '', mobility: 'No mobility issues',
        patientAge: '65 - 74', patientStage: 'Early-Stage (Mild)',
        patientLanguage: 'English', livingSituation: 'All adults',
        caregiverRel: 'Adult Child', caregiverAge: 'Under 65', caregiverStress: 'Moderate / Needs Support',
        focusAreas: ['Caregiver Guilt / Self-Care', 'Safety Concerns (Wandering, Falls)'],
        aiGoal: 'Find local resources',
        notes: 'Social support is limited to bi-weekly visits from a cousin.'
      },
      timeline: [
        { date: 'Oct 12, 2025', label: 'Initial Diagnosis (ADRD)' },
        { date: 'Jan 08, 2026', label: 'Intake Assessment Registered' },
        { date: 'Jun 18, 2026', label: 'Care Plan Review (Active)' }
      ],
      resources: [
        { name: 'ADRD Communication Guide (PDF)', url: '#', tag: 'Guides' },
        { name: 'Home Safety Checklist for Dementia', url: '#', tag: 'Safety' },
        { name: 'Local Support Group Directory', url: '#', tag: 'Support' }
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
      intakeFields: {
        primaryContact: 'Alex Oklaz', zipCode: '', mobility: 'No mobility issues',
        patientAge: '75 - 84', patientStage: 'Middle-Stage (Moderate)',
        patientLanguage: 'English', livingSituation: 'All adults',
        caregiverRel: 'Adult Child', caregiverAge: 'Under 65', caregiverStress: 'High / Burnout Risk',
        focusAreas: ['Safety Concerns (Wandering, Falls)'],
        aiGoal: 'Find local resources',
        notes: 'Managed jointly with a visiting nurse service twice a week.'
      },
      timeline: [
        { date: 'Feb 14, 2024', label: 'Initial Consultation' },
        { date: 'Dec 19, 2025', label: 'Shared Case Registered in Org' },
        { date: 'Jun 05, 2026', label: 'Home Nurse Schedule Updated' }
      ],
      resources: [
        { name: 'Sundowning Management Protocols', url: '#', tag: 'Behavioral' },
        { name: 'Respite Care Subsidy Options', url: '#', tag: 'Support' },
        { name: 'GPS Tracking Wristband Providers', url: '#', tag: 'Devices' }
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
        <p><strong>Próxima Revisión:</strong> Revisión del horario de enfermería en el hogar el 5 de junio de 2026. Daremos seguimiento después de esa visita para ver cómo evoluciona la ventana de sundowning.</p>
      `,
      shared: true
    },
    {
      id: 'pierre-family',
      name: 'Pierre Family',
      details: 'Awaiting Physical Exam &bull; Primary: Henri Pierre',
      phase: 'Awaiting Physical Exam',
      blurb: 'Vascular screening review. Niece Marcelle needs medication tracking and nutrition support tools.',
      cardStatus: 'Awaiting Follow Up',
      followUpValue: '2',
      followUpUnit: 'weeks',
      patientName: 'Henri Pierre',
      patientAge: 79,
      intakeNotes: `Henri Pierre (Age 79) vascular screening review. Niece Marcelle Pierre daily checks. Focus is on maintaining cognitive engagement, nutrition management, and tracking medical adherence. Intake pending full physical exam. Initial screenings show minor short-term recall impairment. Marcelle is requesting support tools to organize medication dosages and ensure Henri receives healthy daily meals.`,
      intakeFields: {
        primaryContact: 'Marcelle Pierre', zipCode: '', mobility: 'No mobility issues',
        patientAge: '75 - 84', patientStage: 'Suspected / Undiagnosed',
        patientLanguage: 'English', livingSituation: 'Patient lives alone',
        caregiverRel: 'Other Relative', caregiverAge: 'Under 65', caregiverStress: 'Low / Managing Well',
        focusAreas: ['Medical Advocacy / Doctor Communication'],
        aiGoal: 'Find local resources',
        notes: 'Intake pending full physical exam; initial screenings show minor short-term recall impairment.'
      },
      timeline: [
        { date: 'May 20, 2026', label: 'Vascular Screening Review' },
        { date: 'Jun 25, 2026', label: 'Scheduled Physical Exam (Pending)' }
      ],
      resources: [
        { name: 'Vascular Dementia Lifestyle Guidelines', url: '#', tag: 'Clinical' },
        { name: 'Medication Reminder Apps & Dispensers', url: '#', tag: 'Devices' },
        { name: 'Meal Delivery Services for Seniors', url: '#', tag: 'Coordination' }
      ],
      aiSummary: 'Henri Pierre is in the initial phases of vascular dementia care. Main support requirements center on dietary adherence and medication scheduling. Recommended strategy includes deploying an automated pill dispenser, enrolling in senior meal programs, and introducing routine memory exercises.',
      reportStatus: 'Not Generated',
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
        <p><strong>Próxima Revisión:</strong> Examen físico programado para el 25 de junio de 2026. Daremos seguimiento justo después para actualizar este plan con los resultados.</p>
      `,
      shared: false
    }
  ],
  // General (no family pinned) chat thread. Each case additionally carries its own
  // `chatHistory` array (see getActiveChatArray) so every family's conversation - and the
  // context window built from it - stays separate and switches when the family tag changes.
  generalChatHistory: [
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

// --- Per-Tab Session Persistence ---
// Demo attendees click through simultaneously with no login, so state can't live on a shared
// server - but an accidental refresh shouldn't wipe someone's in-progress edits either.
// sessionStorage is the fit: scoped to this one tab, gone the moment the tab closes, never
// synced or shared with anyone else's tab.
const SESSION_STORAGE_KEY = 'azCompanionState_v1';

function persistState() {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Storage full or unavailable (e.g. private browsing) - session just won't persist.
  }
}

function restoreState() {
  try {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) Object.assign(state, JSON.parse(saved));
  } catch (err) {
    // Corrupt snapshot - ignore and fall back to the seeded defaults.
  }
}

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
  intakeOtherInfo: document.getElementById('intake-other-info'),
  intakeNotesInput: document.getElementById('intake-notes'),
  
  // Dashboard triggering buttons
  btnNewCaseDashboard: document.getElementById('btn-dashboard-new-case'),
  
  // AI Chat DOM
  chatMessagesBox: document.getElementById('chat-messages-box'),
  chatInput: document.getElementById('chat-input'),
  btnChatGenerate: document.getElementById('btn-chat-generate'),
  chatStatusDot: document.getElementById('chat-status-dot'),
  chatStatusText: document.getElementById('chat-status-text'),
  btnNewChat: document.getElementById('btn-new-chat'),
  chatSuggestionsBox: document.getElementById('chat-suggestions-box'),
  chatContextChip: document.getElementById('chat-context-chip'),
  chatContextChipLabel: document.getElementById('chat-context-chip-label'),
  chatContextChipClear: document.getElementById('chat-context-chip-clear'),
  btnAddToNotes: document.getElementById('btn-add-to-notes'),
  
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
  btnModalDownload: document.getElementById('btn-modal-download'),
  btnToggleReportLanguage: document.getElementById('btn-toggle-report-language'),
  btnRegenerateReportModal: document.getElementById('btn-regenerate-report-modal'),
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
  intakeSummaryDisplay: document.getElementById('intake-summary-display'),
  btnUpdateIntakeInfo: document.getElementById('btn-update-intake-info'),
  editHandoffNotesGroup: document.getElementById('edit-handoff-notes-group'),
  editHandoffNotesText: document.getElementById('edit-handoff-notes-text'),
  // Edit Intake page
  editIntakeForm: document.getElementById('edit-intake-form'),
  editIntakeFamilyNameDisplay: document.getElementById('edit-intake-family-name-display'),
  editIntakePrimaryContact: document.getElementById('edit-intake-primary-contact'),
  eiZipCode: document.getElementById('ei-zip-code'),
  eiMobility: document.getElementById('ei-mobility'),
  eiOtherInfo: document.getElementById('ei-other-info'),
  eiNotes: document.getElementById('ei-notes'),
  btnEditIntakeBack: document.getElementById('btn-edit-intake-back'),
  btnCancelEditIntake: document.getElementById('btn-cancel-edit-intake'),
  editTimelineSteps: document.getElementById('edit-timeline-steps'),
  btnAddTimelineStep: document.getElementById('btn-add-timeline-step'),
  editResourcesItems: document.getElementById('edit-resources-items'),
  btnAddResourceItem: document.getElementById('btn-add-resource-item'),
  editAiSummary: document.getElementById('edit-ai-summary'),
  editCaseNotes: document.getElementById('edit-case-notes'),
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
function initApp() {
  restoreState();
  setupNavigation();
  setupCaseCardTabs();
  setupReportViewer();
  setupShareModal();
  setupChat();
  setupResourcesFilter();
  setupGlobalSearch();
  setupNotifications();
  setupMaximizedEditor();
  setupEditIntakePage();
  setupCloseCaseOptions();
  setupDashboardStatClicks();

  // Initial renders
  renderAll();
  renderSuggestions();
  switchPage(state.activePage); // reflects a restored session's page, not just the HTML default
  checkAgentStatus();
}

// --- Login Gate ---
// Lightweight demo-wide password screen. Not real auth - just keeps the public GitHub Pages
// link from being casually browsable. Unlimited attempts, no cooldown, no username.
const LOGIN_GATE_KEY = 'azCompanionUnlocked_v1';
const LOGIN_GATE_PASSWORD = 'azdemo@123';

function setupLoginGate() {
  const overlay = document.getElementById('login-gate-overlay');
  const appContainer = document.querySelector('.app-container');
  const form = document.getElementById('login-gate-form');
  const input = document.getElementById('login-gate-input');
  const errorMsg = document.getElementById('login-gate-error');

  const unlock = () => {
    try {
      sessionStorage.setItem(LOGIN_GATE_KEY, 'true');
    } catch (err) {
      // Storage unavailable - unlock still works for this page load.
    }
    overlay.style.display = 'none';
    appContainer.style.display = '';
    initApp();
  };

  let alreadyUnlocked = false;
  try {
    alreadyUnlocked = sessionStorage.getItem(LOGIN_GATE_KEY) === 'true';
  } catch (err) {
    alreadyUnlocked = false;
  }

  if (alreadyUnlocked) {
    overlay.style.display = 'none';
    appContainer.style.display = '';
    initApp();
    return;
  }

  appContainer.style.display = 'none';
  input.focus();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value === LOGIN_GATE_PASSWORD) {
      errorMsg.style.display = 'none';
      unlock();
    } else {
      errorMsg.style.display = 'block';
      input.value = '';
      input.focus();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupLoginGate();
});

// --- Renders Master Routine ---
function renderAll() {
  renderStats();
  renderDashboard();
  renderCaseCards();
  renderReportsList();
  renderChatHistory();
  renderNotificationBadge();
  persistState();
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

// Helper functions to get selected values from single and multi-select pill groups.
// `root` scopes the lookup - the create-form and the maximized editor's intake pane
// both use the same data-field names, so an unscoped document-wide query would always
// hit whichever copy comes first in the DOM regardless of which form is being read.
function getSelectedPillValue(fieldId, root = document) {
  const group = root.querySelector(`.pill-group[data-field="${fieldId}"]`);
  if (!group) return '';
  const activeBtn = group.querySelector('.pill-btn.active, .pill-badge.active');
  if (activeBtn) return activeBtn.dataset.value || activeBtn.textContent.trim();
  const input = group.querySelector('.pill-input');
  if (input && input.value.trim()) return input.value.trim();
  return '';
}

function getSelectedMultiPillValues(fieldId, root = document) {
  const group = root.querySelector(`.pill-group[data-field="${fieldId}"]`);
  if (!group) return [];
  const activeBtns = group.querySelectorAll('.pill-badge.active, .pill-btn.active');
  return Array.from(activeBtns).map(btn => btn.dataset.value || btn.textContent.trim());
}

// Counterpart setters, used to pre-populate a pill-group from stored data (e.g. when
// opening the maximized editor's Intake tab for an existing case).
function setActivePillValue(fieldId, value, root = document) {
  const group = root.querySelector(`.pill-group[data-field="${fieldId}"]`);
  if (!group) return;
  const buttons = group.querySelectorAll('.pill-btn, .pill-badge');
  buttons.forEach(b => b.classList.remove('active'));
  const target = Array.from(buttons).find(b => (b.dataset.value || b.textContent.trim()) === value);
  if (target) {
    target.classList.add('active');
  } else {
    const input = group.querySelector('.pill-input');
    if (input) input.value = value || '';
  }
}

function setActiveMultiPillValues(fieldId, values, root = document) {
  const group = root.querySelector(`.pill-group[data-field="${fieldId}"]`);
  if (!group) return;
  const list = values || [];
  group.querySelectorAll('.pill-btn, .pill-badge').forEach(b => {
    const val = b.dataset.value || b.textContent.trim();
    b.classList.toggle('active', list.includes(val));
  });
}

// Renders a structured intakeFields object into the same narrative text format used
// by isIntakeIncomplete() and the case card's Intake Info display.
function buildIntakeNotesText(f) {
  return `
Primary Contact: ${f.primaryContact || 'N/A'}
Zip Code: ${f.zipCode || 'N/A'}

Patient Profile:
- Age Range: ${f.patientAge}
- Dementia Stage: ${f.patientStage}
- Language: ${f.patientLanguage}
- Living Situation: ${f.livingSituation}
- Mobility: ${f.mobility || 'No mobility issues'}

Caregiver Profile:
- Relationship: ${f.caregiverRel}
- Age Range: ${f.caregiverAge}
- Observed Stress Level: ${f.caregiverStress}

Focus Areas: ${f.focusAreas && f.focusAreas.length > 0 ? f.focusAreas.join(', ') : 'None selected'}
AI Goal: ${f.aiGoal}
${f.otherInfo ? '\nOther Information: ' + f.otherInfo : ''}
${f.notes ? '\nNotes & Dynamics: ' + f.notes : ''}
  `.trim();
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

  // Handle typing in custom language "Other (specify)..." input - both the create
  // form and the maximized editor's intake pane have their own copy of this input.
  document.querySelectorAll('.pill-input').forEach(langOtherInput => {
    langOtherInput.addEventListener('input', () => {
      if (langOtherInput.value.trim().length > 0) {
        const group = langOtherInput.closest('.pill-group');
        if (group) {
          group.querySelectorAll('.pill-btn, .pill-badge').forEach(b => b.classList.remove('active'));
        }
      }
    });
  });
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
    const otherInfo = DOM.intakeOtherInfo ? DOM.intakeOtherInfo.value.trim() : '';
    const notes = DOM.intakeNotesInput ? DOM.intakeNotesInput.value.trim() : '';

    const patientAge = getSelectedPillValue('patient-age', DOM.newCaseForm) || '65 - 74';
    const patientStage = getSelectedPillValue('patient-stage', DOM.newCaseForm) || 'Middle-Stage (Moderate)';
    const patientLanguage = getSelectedPillValue('patient-language', DOM.newCaseForm) || 'English';
    const livingSituation = getSelectedPillValue('living-situation', DOM.newCaseForm) || 'All adults';
    const patientMobility = DOM.intakeMobilityInput && DOM.intakeMobilityInput.value.trim() ? DOM.intakeMobilityInput.value.trim() : 'No mobility issues';

    const caregiverRel = getSelectedPillValue('caregiver-rel', DOM.newCaseForm) || 'Adult Child';
    const caregiverAge = getSelectedPillValue('caregiver-age', DOM.newCaseForm) || 'Under 65';
    const caregiverStress = getSelectedPillValue('caregiver-stress', DOM.newCaseForm) || 'High / Burnout Risk';
    const bestCallTime = getSelectedPillValue('best-call-time', DOM.newCaseForm) || 'Morning (8am-12pm)';

    const focusAreas = getSelectedMultiPillValues('focus-areas', DOM.newCaseForm);
    const aiGoal = getSelectedPillValue('ai-assist-goal', DOM.newCaseForm) || 'Find local resources';
    
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
${otherInfo ? '\nOther Information: ' + otherInfo : ''}
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
        cardStatus: 'Continuing Services',
        intakeNotes: fullIntakeText,
        intakeFields: {
          primaryContact, zipCode, mobility: patientMobility,
          patientAge, patientStage, patientLanguage, livingSituation,
          caregiverRel, caregiverAge, caregiverStress,
          focusAreas, aiGoal, otherInfo, notes
        },
        timeline: [
          { date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), label: 'Intake Form Submitted' }
        ],
        resources: [
          { name: `${patientStage} Care Protocols`, url: '#', tag: 'Clinical' },
          { name: `Local Resources for ${zipCode || 'Region'}`, url: '#', tag: 'Coordination' }
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
          <p><strong>Next Check-up:</strong> Follow-up to be scheduled based on the initial intake above.</p>
        `,
        reportContentEs: `
          <h4>Informe de ${caseTitle}</h4>
          <p class="report-meta">Fecha: ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}<br>Trabajadora de salud asignada: Jane Doe</p>
          <p class="report-greeting">Hola ${primaryContact},</p>
          <p>Gracias por completar la admisión para ${familyName.replace(/\s+Family/i, '')}. Aquí tienes un resumen inicial basado en lo que compartiste, junto con recursos para ayudarte a seguir adelante.</p>
          <h5>Resumen de Admisión</h5>
          <p>${fullIntakeText.replace(/\n/g, '<br>')}</p>
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
  DOM.statWaitingFollowupCount.textContent = state.cases.filter(c => c.cardStatus === 'Awaiting Follow Up').length;
  DOM.familiesBadge.textContent = `${state.cases.length} ${state.cases.length === 1 ? 'Family' : 'Families'}`;
  persistState();
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
      clearCaseCardFilter();
      openMaximizedEditor(id);
    });
  });
}

// --- Render Case Cards List ---
function getStatusChipClass(status) {
  if (status === 'Continuing Services') return 'success';
  if (status === 'Awaiting Follow Up') return 'info';
  if (status === 'Follow up due') return 'danger';
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
    const statusOptions = ['Waiting on Referral', 'Continuing Services', 'Awaiting Follow Up', 'Follow up due'];

    card.innerHTML = `
      <div class="case-card-header">
        <div class="card-title-group">
          <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          <h3>${c.name}</h3>
        </div>
        <div class="card-header-actions">
          <button class="btn-ask-ai-from-card" data-case-id="${c.id}" title="Ask AI Companion about ${c.name}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
          </button>
          <button class="card-share-btn" data-family="${c.name}" title="Share Case Card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          </button>
        </div>
      </div>

      <p class="card-phase">Phase: ${c.phase}</p>
      <p class="card-blurb">${c.blurb}</p>

      <div class="card-footer-row">
        <select class="status-chip-select ${chipClass}" data-case-id="${c.id}">
          ${statusOptions.map(opt => `<option value="${opt}" ${opt === c.cardStatus ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      </div>

      ${c.cardStatus === 'Awaiting Follow Up' ? `
      <div class="followup-fields" data-case-id="${c.id}">
        <input type="number" min="0" class="followup-number-input" placeholder="e.g. 2" value="${c.followUpValue != null ? c.followUpValue : ''}">
        <select class="followup-unit-select custom-select">
          <option value="days" ${(c.followUpUnit || 'days') === 'days' ? 'selected' : ''}>Days</option>
          <option value="weeks" ${c.followUpUnit === 'weeks' ? 'selected' : ''}>Weeks</option>
          <option value="months" ${c.followUpUnit === 'months' ? 'selected' : ''}>Months</option>
        </select>
      </div>` : ''}

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
        // Awaiting Follow Up reveals/hides the number + unit fields - re-render to reflect it
        renderCaseCards();
      }
    });
  });

  // Follow-up number + unit fields (only rendered when status is "Awaiting Follow Up")
  document.querySelectorAll('.followup-number-input').forEach(input => {
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('input', (e) => {
      const caseId = e.target.closest('.followup-fields').getAttribute('data-case-id');
      const caseItem = state.cases.find(c => c.id === caseId);
      if (caseItem) {
        caseItem.followUpValue = e.target.value;
        persistState();
      }
    });
  });

  document.querySelectorAll('.followup-unit-select').forEach(select => {
    select.addEventListener('click', (e) => e.stopPropagation());
    select.addEventListener('change', (e) => {
      const caseId = e.target.closest('.followup-fields').getAttribute('data-case-id');
      const caseItem = state.cases.find(c => c.id === caseId);
      if (caseItem) {
        caseItem.followUpUnit = e.target.value;
        persistState();
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

  // Ask AI buttons: scope the chat to this family so "Add to Family Report" knows
  // which case.resources to write into, then jump to the chat page
  document.querySelectorAll('.btn-ask-ai-from-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const caseId = btn.getAttribute('data-case-id');
      const caseItem = state.cases.find(c => c.id === caseId);
      state.activeChatCaseId = caseId;
      renderChatHistory();
      persistState();
      switchPage('ai-chat');
      if (caseItem) {
        DOM.chatInput.value = `Can you provide a detailed care recommendation checklist for the ${caseItem.name}?`;
        DOM.chatInput.focus();
      }
    });
  });
}

// --- Render Reports List ---
// Pending Intake should only ever describe missing/empty intake data - not "waiting on
// something external" (a physical exam, a referral, etc). Those are real reasons a report
// isn't ready yet, but they're "Not Generated", not "Pending Intake".
function isIntakeIncomplete(c) {
  return !c.intakeNotes || c.intakeNotes.trim().length < 40;
}

function renderReportsList() {
  DOM.reportsRowsList.innerHTML = '';

  state.cases.forEach(c => {
    const row = document.createElement('div');
    row.className = 'report-row';
    row.setAttribute('data-family', c.name);

    const intakeIncomplete = isIntakeIncomplete(c);
    const displayStatus = intakeIncomplete ? 'Pending Intake' : c.reportStatus;

    let badgeClass = 'info';
    if (displayStatus === 'Generated') badgeClass = 'success';
    else if (displayStatus === 'Not Generated') badgeClass = 'warning';
    else if (displayStatus === 'Pending Intake') badgeClass = 'warning';

    const statusHTML = intakeIncomplete
      ? `<span class="status-badge ${badgeClass}">${displayStatus}</span>
         <span class="tooltip-icon" title="Intake information is missing for this family. Complete the intake form before a report can be generated.">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
         </span>`
      : `<span class="status-badge ${badgeClass}">${displayStatus}</span>`;

    let actionHTML = '';
    if (intakeIncomplete) {
      actionHTML = `
        <button class="btn btn-primary btn-sm btn-complete-intake" data-id="${c.id}">
          Complete Intake
        </button>
      `;
    } else if (c.reportStatus === 'Generated') {
      actionHTML = `
        <button class="btn btn-secondary btn-sm btn-open-report" data-id="${c.id}" data-family="${c.name}" data-period="${c.reportPeriod}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="margin-right: 4px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          View Report
        </button>
        <button class="btn btn-secondary btn-sm btn-regenerate-report-action" data-id="${c.id}" title="Regenerate this report using the latest case info and chat conversation">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="margin-right: 4px;"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
          Regenerate
        </button>
      `;
    } else {
      actionHTML = `
        <button class="btn btn-primary btn-sm btn-generate-report-action" data-id="${c.id}">
          <svg class="sparkle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="margin-right: 4px; color: white;"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
          Generate Report
        </button>
      `;
    }

    row.innerHTML = `
      <div class="col-family font-semibold">${c.name}</div>
      <div class="col-period">${c.reportPeriod}</div>
      <div class="col-status">
        ${statusHTML}
      </div>
      <div class="col-action">
        ${actionHTML}
      </div>
    `;

    DOM.reportsRowsList.appendChild(row);
  });

  document.querySelectorAll('.btn-complete-intake').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openMaximizedEditor(id);
    });
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
      generateReportSimulated(id, btn, false);
    });
  });

  document.querySelectorAll('.btn-regenerate-report-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      generateReportSimulated(id, btn, true);
    });
  });
}

// Generates (or regenerates) a family report. When the worker is reachable, this sends the
// full case context + chat transcript to the worker's `generate_report` action and stores
// the real result back on the case; otherwise it falls back to the pre-baked mock content so
// the demo still works offline.
async function generateReportSimulated(caseId, buttonElement, isRegenerate = false) {
  const originalButtonHTML = buttonElement.innerHTML;
  const restoreButton = () => {
    buttonElement.disabled = false;
    buttonElement.style.cursor = '';
    buttonElement.innerHTML = originalButtonHTML;
  };

  buttonElement.disabled = true;
  buttonElement.style.cursor = 'wait';
  buttonElement.innerHTML = `
    <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12" style="margin-right: 4px; animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.1)"></circle><path d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z" fill="currentColor"></path></svg>
    ${isRegenerate ? 'Regenerating...' : 'Generating...'}
  `;

  const caseIndex = state.cases.findIndex(c => c.id === caseId);
  if (caseIndex === -1) return;
  const caseItem = state.cases[caseIndex];

  if (!CHAT_WORKER_URL) {
    setTimeout(() => {
      state.cases[caseIndex].reportStatus = 'Generated';
      persistState();
      renderAll();
    }, 1500);
    return;
  }

  try {
    const reportContext = buildReportGenerationContext(caseItem);
    const res = await fetch(CHAT_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_report', reportContext })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Report generation failed');

    caseItem.reportContent = data.reportContent;
    caseItem.reportContentEs = data.reportContentEs;
    caseItem.reportStatus = 'Generated';
    caseItem.reportPeriod = caseItem.reportPeriod || 'Q2 2024';
    persistState();
    renderAll();

    // If the report modal for this case is currently open, refresh it in place. renderAll()
    // rebuilds the reports-list buttons fresh, but this button may live in the modal footer
    // (which isn't part of that re-render), so restore it explicitly either way.
    if (state.currentReportCaseId === caseId && DOM.modalReportViewer.classList.contains('active')) {
      openReportModal(caseItem);
    }
    restoreButton();
  } catch (err) {
    restoreButton();
    alert("Couldn't generate the report right now. Please try again in a moment.");
  }
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
      <select class="edit-res-tag custom-select" style="flex: 0 0 130px;">${buildResourceTagOptionsHTML('')}</select>
      <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(row);
    container.scrollTop = container.scrollHeight;
  });

  // Save changes
  DOM.btnSaveEditor.addEventListener('click', () => {
    const caseIndex = state.cases.findIndex(c => c.id === state.editingCaseId);
    if (caseIndex !== -1) {
      // Intake is edited via the dedicated Edit Intake page (btn-update-intake-info) — skip here.

      // 1. Save Timeline Steps
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
      const tagInputs = DOM.editResourcesItems.querySelectorAll('.edit-res-tag');

      const previousResourceNames = state.cases[caseIndex].resources.map(r => r.name);
      nameInputs.forEach((input, index) => {
        const nameVal = input.value.trim();
        const urlVal = urlInputs[index].value.trim();
        const tagVal = tagInputs[index] ? tagInputs[index].value : '';
        if (nameVal && urlVal) {
          resourceLinks.push({ name: nameVal, url: urlVal, tag: tagVal });
          if (!previousResourceNames.includes(nameVal)) {
            addResourceToLibrary(nameVal, urlVal, state.cases[caseIndex].name);
          }
        }
      });
      state.cases[caseIndex].resources = resourceLinks;

      // 4. Save AI Summary
      state.cases[caseIndex].aiSummary = DOM.editAiSummary.value;

      // 5. Save Notes
      state.cases[caseIndex].notes = DOM.editCaseNotes.value;

      closeModal();
      renderAll();
      persistState();
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

  // Populate compact intake summary display
  const fields = Object.assign({}, DEFAULT_INTAKE_FIELDS, c.intakeFields || {});
  const challenges = fields.focusAreas && fields.focusAreas.length > 0
    ? fields.focusAreas.map(f => `<span class="intake-summary-chip">${escapeHTML(f)}</span>`).join(' ')
    : '<span style="color:var(--text-secondary)">None selected</span>';
  DOM.intakeSummaryDisplay.innerHTML = `
    <dl class="intake-summary-grid">
      <div class="intake-summary-row"><dt>Primary Contact</dt><dd>${escapeHTML(fields.primaryContact || '—')}</dd></div>
      <div class="intake-summary-row"><dt>Patient Age</dt><dd>${escapeHTML(fields.patientAge)}</dd></div>
      <div class="intake-summary-row"><dt>Stage</dt><dd>${escapeHTML(fields.patientStage)}</dd></div>
      <div class="intake-summary-row"><dt>Language</dt><dd>${escapeHTML(fields.patientLanguage)}</dd></div>
      <div class="intake-summary-row"><dt>Caregiver</dt><dd>${escapeHTML(fields.caregiverRel)}</dd></div>
      <div class="intake-summary-row intake-summary-row--wide"><dt>Challenges</dt><dd class="intake-summary-chips">${challenges}</dd></div>
    </dl>
  `;

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
      <select class="edit-res-tag custom-select" style="flex: 0 0 130px;">${buildResourceTagOptionsHTML(res.tag || '')}</select>
      <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">&times;</button>
    `;
    DOM.editResourcesItems.appendChild(row);
  });

  // Load AI Summary
  DOM.editAiSummary.value = c.aiSummary;

  // Load Notes
  DOM.editCaseNotes.value = c.notes || '';

  // Default to Intake tab
  DOM.editorTabBtns.forEach(btn => btn.classList.remove('active'));
  DOM.editorPanes.forEach(pane => pane.classList.remove('active'));
  DOM.editorTabBtns[0].classList.add('active');
  DOM.editorPanes[0].classList.add('active');
  state.activeEditTab = 'intake';

  DOM.modalCardEditor.classList.add('active');
}

// --- Edit Intake Page ---
function openEditIntakePage(caseId) {
  const c = state.cases.find(item => item.id === caseId);
  if (!c) return;

  // Close the maximized editor modal directly (closeModal is a local closure inside setupMaximizedEditor)
  DOM.modalCardEditor.classList.remove('active');

  const f = Object.assign({}, DEFAULT_INTAKE_FIELDS, c.intakeFields || {});
  const form = DOM.editIntakeForm;

  DOM.editIntakeFamilyNameDisplay.textContent = c.name;
  DOM.editIntakePrimaryContact.value = f.primaryContact;
  DOM.eiZipCode.value = f.zipCode;
  DOM.eiMobility.value = f.mobility;
  DOM.eiOtherInfo.value = f.otherInfo || '';
  DOM.eiNotes.value = f.notes;

  setActivePillValue('ei-patient-age', f.patientAge, form);
  setActivePillValue('ei-patient-stage', f.patientStage, form);
  setActivePillValue('ei-patient-language', f.patientLanguage, form);
  setActivePillValue('ei-living-situation', f.livingSituation, form);
  setActivePillValue('ei-caregiver-rel', f.caregiverRel, form);
  setActivePillValue('ei-caregiver-age', f.caregiverAge, form);
  setActivePillValue('ei-caregiver-stress', f.caregiverStress, form);
  setActiveMultiPillValues('ei-focus-areas', f.focusAreas, form);
  setActivePillValue('ei-ai-assist-goal', f.aiGoal, form);

  state.editingCaseId = caseId;
  switchPage('edit-intake');
}

function setupEditIntakePage() {
  DOM.btnUpdateIntakeInfo.addEventListener('click', () => {
    openEditIntakePage(state.editingCaseId);
  });

  const goBack = () => {
    switchPage('case-cards');
    showCaseCardsSubview('list');
  };

  DOM.btnEditIntakeBack.addEventListener('click', goBack);
  DOM.btnCancelEditIntake.addEventListener('click', goBack);

  DOM.editIntakeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const caseIndex = state.cases.findIndex(c => c.id === state.editingCaseId);
    if (caseIndex === -1) return;

    const form = DOM.editIntakeForm;
    const updatedFields = {
      primaryContact: DOM.editIntakePrimaryContact.value.trim(),
      zipCode: DOM.eiZipCode.value.trim(),
      mobility: DOM.eiMobility.value.trim(),
      patientAge: getSelectedPillValue('ei-patient-age', form) || '65 - 74',
      patientStage: getSelectedPillValue('ei-patient-stage', form) || 'Middle-Stage (Moderate)',
      patientLanguage: getSelectedPillValue('ei-patient-language', form) || 'English',
      livingSituation: getSelectedPillValue('ei-living-situation', form) || 'All adults',
      caregiverRel: getSelectedPillValue('ei-caregiver-rel', form) || 'Adult Child',
      caregiverAge: getSelectedPillValue('ei-caregiver-age', form) || 'Under 65',
      caregiverStress: getSelectedPillValue('ei-caregiver-stress', form) || 'High / Burnout Risk',
      focusAreas: getSelectedMultiPillValues('ei-focus-areas', form),
      aiGoal: getSelectedPillValue('ei-ai-assist-goal', form) || 'Find local resources',
      otherInfo: DOM.eiOtherInfo.value.trim(),
      notes: DOM.eiNotes.value.trim()
    };

    state.cases[caseIndex].intakeFields = updatedFields;
    state.cases[caseIndex].intakeNotes = buildIntakeNotesText(updatedFields);

    persistState();
    renderAll();
    switchPage('case-cards');
    showCaseCardsSubview('list');
  });
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

// Builds a context string for the close-summary LLM call: the case's structured fields
// plus the full chat transcript so the model has enough to generate a useful case study.
function buildCloseSummaryContext(c) {
  const lines = [
    `Patient: ${c.patientName || 'Unknown'}`,
    `Caregiver: ${c.caregiverName || 'Unknown'}`,
    `Phase: ${c.phase || 'Unknown'}`,
    `Status: ${c.status || 'Unknown'}`,
    `Diagnosis: ${c.diagnosis || 'Not specified'}`,
    `Other info: ${c.otherInfo || 'None'}`,
  ];
  const transcript = (c.chatHistory || []).map(m => `${m.sender === 'user' ? 'CHW' : 'AI'}: ${m.text}`).join('\n');
  if (transcript) lines.push('', 'Chat transcript:', transcript);
  return lines.join('\n');
}

async function renderCloseCaseSummaryPreview(c, previewContainer) {
  previewContainer.innerHTML = `<p style="color:var(--text-secondary);margin:0;">Generating summary...</p>`;
  try {
    const caseContext = buildCloseSummaryContext(c);
    const res = await fetch(CHAT_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_close_summary', caseContext })
    });
    const data = await res.json();
    if (!res.ok || !data.title || !data.content) throw new Error('Bad response');
    previewContainer.innerHTML = `
      <p style="margin: 0 0 10px; color: var(--text-secondary);">AI-generated summary - review and edit before confirming. No names or identifying details will be saved.</p>
      <label class="group-label" for="archive-edit-title">Title</label>
      <input type="text" id="archive-edit-title" value="${escapeHTML(data.title)}" style="width: 100%; margin-bottom: 10px;">
      <label class="group-label" for="archive-edit-content">Content</label>
      <textarea id="archive-edit-content" rows="4" style="width: 100%;">${escapeHTML(data.content)}</textarea>
    `;
  } catch {
    // Fallback to simple phase-based placeholder if worker is unavailable
    previewContainer.innerHTML = `
      <p style="margin: 0 0 10px; color: var(--text-secondary);">Could not generate summary automatically - please fill in manually.</p>
      <label class="group-label" for="archive-edit-title">Title</label>
      <input type="text" id="archive-edit-title" value="${escapeHTML(c.phase + ' Case Study')}" style="width: 100%; margin-bottom: 10px;">
      <label class="group-label" for="archive-edit-content">Content</label>
      <textarea id="archive-edit-content" rows="4" style="width: 100%;"></textarea>
    `;
  }
}

function executeCaseArchiving(addResource = false, targetLibrary = '') {
  const caseId = DOM.btnCloseCaseFromReport.getAttribute('data-case-id');
  const c = state.cases.find(item => item.id === caseId);
  if (!c) return;

  if (addResource) {
    const containerId = targetLibrary === 'adrd' ? 'adrd-resources-list' : 'practices-resources-list';
    const container = document.getElementById(containerId);

    // Use the CHW-reviewed/edited content only - no title on archived user-contributed cards
    // to avoid any risk of identifying information leaking through the title field.
    const contentInput = document.getElementById('archive-edit-content');
    const content = contentInput ? contentInput.value.trim() : '';

    if (container) {
      const card = document.createElement('div');
      card.className = 'resource-card-item';
      card.setAttribute('data-tags', 'case study,clinical');
      card.innerHTML = `
        <p>${escapeHTML(content)}</p>
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

async function openCloseCaseOptionsModal(caseId) {
  const c = state.cases.find(item => item.id === caseId);
  if (!c) return;

  DOM.btnCloseCaseFromReport.setAttribute('data-case-id', caseId);
  DOM.modalCloseOptions.classList.add('active');
  await renderCloseCaseSummaryPreview(c, DOM.archiveRecommendationsPreview);
}

// --- Report Viewer Modal ---
function setupReportViewer() {
  const closeModal = () => {
    DOM.modalReportViewer.classList.remove('active');
  };

  DOM.btnCloseReportModal.addEventListener('click', closeModal);

  DOM.btnModalDownload.addEventListener('click', () => {
    const caseItem = state.cases.find(c => c.id === state.currentReportCaseId);
    const lang = state.reportLangSpanish ? 'es' : 'en';
    const body = caseItem
      ? (state.reportLangSpanish ? caseItem.reportContentEs : caseItem.reportContent) || ''
      : '';
    const resourcesText = caseItem
      ? (caseItem.resources || []).map(r => `- ${r.name}${r.url && r.url !== '#' ? ': ' + r.url : ''}`).join('\n')
      : '';
    const fullText = resourcesText ? `${body}\n\nResources:\n${resourcesText}` : body;
    // Strip HTML tags for plain-text clipboard output
    const tmp = document.createElement('div');
    tmp.innerHTML = fullText;
    const plainText = tmp.textContent || tmp.innerText || '';

    function execCommandFallback(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) {}
      document.body.removeChild(ta);
      return ok;
    }

    const btn = DOM.btnModalDownload;
    const originalLabel = btn.textContent;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(plainText).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = originalLabel; }, 1800);
      }).catch(() => {
        if (execCommandFallback(plainText)) {
          btn.textContent = 'Copied!';
        } else {
          btn.textContent = 'Copy failed';
        }
        setTimeout(() => { btn.textContent = originalLabel; }, 1800);
      });
    } else {
      if (execCommandFallback(plainText)) {
        btn.textContent = 'Copied!';
      } else {
        btn.textContent = 'Copy failed';
      }
      setTimeout(() => { btn.textContent = originalLabel; }, 1800);
    }
  });

  // Calendar date selection (visual only)
  const calendarGrid = document.querySelector('.calendar-grid');
  if (calendarGrid) {
    calendarGrid.addEventListener('click', (e) => {
      const day = e.target.closest('.day');
      if (!day || day.classList.contains('empty') || day.classList.contains('active-date')) return;
      calendarGrid.querySelectorAll('.day.day-selected').forEach(d => d.classList.remove('day-selected'));
      day.classList.add('day-selected');
    });
  }

  DOM.btnToggleReportLanguage.addEventListener('click', toggleReportLanguage);

  if (DOM.btnRegenerateReportModal) {
    DOM.btnRegenerateReportModal.addEventListener('click', () => {
      const caseId = state.currentReportCaseId;
      if (!caseId) return;
      generateReportSimulated(caseId, DOM.btnRegenerateReportModal, true);
    });
  }

  // Close case trigger triggers our custom options popup modal
  DOM.btnCloseCaseFromReport.addEventListener('click', () => {
    const caseId = DOM.btnCloseCaseFromReport.getAttribute('data-case-id');
    openCloseCaseOptionsModal(caseId);
  });
}

// Resources are rendered live from case.resources rather than baked into reportContent,
// so a chat "Add to Family Report" click actually shows up here without regenerating the report.
function buildReportResourcesSectionHTML(caseItem, lang) {
  const resources = caseItem.resources || [];
  if (resources.length === 0) return '';
  const heading = lang === 'es' ? 'Recursos' : 'Resources';
  const linkLabel = lang === 'es' ? 'enlace' : 'link';
  const itemsHTML = resources.map(r => {
    const tagBadge = r.tag ? `<span class="mini-tag">${escapeHTML(r.tag)}</span> ` : '';
    const hasRealUrl = r.url && r.url !== '#';
    const linkPart = hasRealUrl
      ? `<a href="${escapeHTML(r.url)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${linkLabel}</a>`
      : '';
    return `<li>${tagBadge}<strong>${escapeHTML(r.name)}</strong>${linkPart ? ': ' + linkPart : ''}</li>`;
  }).join('');
  return `
    <h5>${heading}</h5>
    <div class="report-resource-group">
      <ul class="report-resource-list">${itemsHTML}</ul>
    </div>
  `;
}

function openReportModal(caseItem) {
  DOM.reportModalTitle.textContent = `${caseItem.name} - ${caseItem.reportPeriod} Report`;
  state.currentReportCaseId = caseItem.id;
  state.reportLangSpanish = false;
  DOM.reportModalTextContent.innerHTML = caseItem.reportContent + buildReportResourcesSectionHTML(caseItem, 'en');
  DOM.btnCloseCaseFromReport.setAttribute('data-case-id', caseItem.id);
  DOM.btnToggleReportLanguage.innerHTML = DOM.btnToggleReportLanguage.innerHTML.replace(/Traducir al español|Translate to English/, 'Traducir al español');

  DOM.modalReportViewer.classList.add('active');
}

function toggleReportLanguage() {
  const caseItem = state.cases.find(c => c.id === state.currentReportCaseId);
  if (!caseItem || !caseItem.reportContentEs) return;

  state.reportLangSpanish = !state.reportLangSpanish;
  const lang = state.reportLangSpanish ? 'es' : 'en';
  const body = state.reportLangSpanish ? caseItem.reportContentEs : caseItem.reportContent;
  DOM.reportModalTextContent.innerHTML = body + buildReportResourcesSectionHTML(caseItem, lang);
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
        cardStatus: 'Follow up due',
        handoffNotes: 'Sarah responds well to morning visits; avoid late-afternoon check-ins as she tires easily. Family prefers phone calls over email for scheduling.',
        intakeNotes: `Sarah Marcus (Age 76) is experiencing early cognitive lapses. Case shared by CHW Robert Mercer to collaborate on home safety checklists. Family is eager to establish structured daily routine support systems.`,
        intakeFields: {
          primaryContact: '', zipCode: '', mobility: 'No mobility issues',
          patientAge: '75 - 84', patientStage: 'Suspected / Undiagnosed',
          patientLanguage: 'English', livingSituation: 'All adults',
          caregiverRel: 'Adult Child', caregiverAge: 'Under 65', caregiverStress: 'Moderate / Needs Support',
          focusAreas: ['Safety Concerns (Wandering, Falls)'],
          aiGoal: 'Find local resources',
          notes: 'Family is eager to establish structured daily routine support systems.'
        },
        timeline: [
          { date: 'Jun 18, 2026', label: 'Case Shared by Robert Mercer' }
        ],
        resources: [
          { name: 'Home Safety Audit Sheet', url: '#', tag: 'Safety' },
          { name: 'Cognitive Exercises Guide', url: '#', tag: 'Engagement' }
        ],
        aiSummary: 'Marcus Family case shared by CHW Robert Mercer. Immediate recommended tasks include establishing basic check-in protocols and coordinating on safety wristbands.',
        reportStatus: 'Not Generated',
        reportPeriod: 'Q2 2024',
        reportContent: `
          <h4>Marcus Family Report</h4>
          <p class="report-meta">Date: ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}<br>Assigned CHW: Robert Mercer</p>
          <p class="report-greeting">Hi there,</p>
          <p>This case was shared via the org neurology network. Sarah is experiencing mild temporal adjustments, and we're setting up basic check-in protocols and safety coordination to start.</p>
          <p><strong>Next Check-up:</strong> Follow-up to be scheduled after initial check-in protocols are established.</p>
        `,
        reportContentEs: `
          <h4>Informe de la Familia Marcus</h4>
          <p class="report-meta">Fecha: ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}<br>Trabajador de salud asignado: Robert Mercer</p>
          <p class="report-greeting">Hola,</p>
          <p>Este caso fue compartido a través de la red de neurología de la organización. Sarah está experimentando ajustes temporales leves, y estamos estableciendo protocolos básicos de seguimiento y coordinación de seguridad para empezar.</p>
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
  persistState();
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
    if (state.currentShareFamilyName) {
      const sharedCase = state.cases.find(c => c.name === state.currentShareFamilyName);
      if (sharedCase) {
        if (handoffNote) sharedCase.handoffNotes = handoffNote;
        sharedCase.cardStatus = 'Follow up due';
        renderCaseCards();
        renderStats();
        persistState();
      }
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
    clearActiveChatArray();
    DOM.chatInput.value = '';
    DOM.chatInput.style.height = 'auto';

    renderChatHistory();
    renderSuggestions();
  });

  if (DOM.chatContextChipClear) {
    DOM.chatContextChipClear.addEventListener('click', () => {
      state.activeChatCaseId = null;
      renderChatContextChip();
      renderChatHistory();
      persistState();
    });
  }

  if (DOM.btnAddToNotes) {
    // Clicking a button normally collapses the page's text selection on mousedown
    // (before the click handler even runs) - preventDefault here keeps the user's
    // highlighted text intact so handleAddHighlightToNotes can still read it.
    DOM.btnAddToNotes.addEventListener('mousedown', (e) => e.preventDefault());
    DOM.btnAddToNotes.addEventListener('click', handleAddHighlightToNotes);
  }

  // Dim the highlight-to-notes button when no text is selected inside the chat pane.
  document.addEventListener('selectionchange', updateAddToNotesButtonLookState);
}

function updateAddToNotesButtonLookState() {
  if (!DOM.btnAddToNotes || !DOM.chatMessagesBox) return;
  const sel = window.getSelection();
  const hasSelection = sel && sel.toString().trim().length > 0 &&
    sel.anchorNode && DOM.chatMessagesBox.contains(sel.anchorNode);
  DOM.btnAddToNotes.classList.toggle('notes-btn-inactive', !hasSelection);
}

// Reads the current text selection (must be inside the chat messages pane), and appends it
// to the notes of whichever family is currently pinned via the chat's family tag
// (state.activeChatCaseId). Surfaces the outcome as a brief inline flash on the button itself
// rather than a blocking alert, since this is meant to be a quick highlight-and-click action.
function flashAddToNotesFeedback(message, isError) {
  if (!DOM.btnAddToNotes) return;
  const original = DOM.btnAddToNotes.getAttribute('data-original-title') || DOM.btnAddToNotes.title;
  DOM.btnAddToNotes.setAttribute('data-original-title', original);
  DOM.btnAddToNotes.title = message;
  DOM.btnAddToNotes.classList.add(isError ? 'notes-btn-flash-error' : 'notes-btn-flash-success');
  clearTimeout(DOM.btnAddToNotes._flashTimeout);
  DOM.btnAddToNotes._flashTimeout = setTimeout(() => {
    DOM.btnAddToNotes.title = original;
    DOM.btnAddToNotes.classList.remove('notes-btn-flash-success', 'notes-btn-flash-error');
  }, 1800);
}

function handleAddHighlightToNotes() {
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString().trim() : '';

  if (!selectedText || !selection.anchorNode || !DOM.chatMessagesBox.contains(selection.anchorNode)) {
    flashAddToNotesFeedback('Highlight text in the chat first', true);
    return;
  }
  if (!state.activeChatCaseId) {
    flashAddToNotesFeedback('Select a family tag first', true);
    return;
  }

  const caseIndex = state.cases.findIndex(c => c.id === state.activeChatCaseId);
  if (caseIndex === -1) {
    flashAddToNotesFeedback('Select a family tag first', true);
    return;
  }

  const existing = state.cases[caseIndex].notes || '';
  state.cases[caseIndex].notes = existing ? `${existing}\n\n${selectedText}` : selectedText;
  persistState();

  flashAddToNotesFeedback('Added to notes ✓', false);
  selection.removeAllRanges();
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
  getActiveChatArray().push({
    sender: 'user',
    text: `Let's discuss: ${cat.label}`,
    time: timeNow
  });
  
  renderChatHistory();
  showChatTypingIndicator();
  
  setTimeout(() => {
    removeChatTypingIndicator();
    
    // 2. Post AI response with dynamic buttons inside the bubble
    getActiveChatArray().push({
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

// Returns the message array for whichever thread is currently active: the pinned family's
// own chatHistory if a family tag is set (state.activeChatCaseId), otherwise the shared
// general thread. Lazily creates a case's chatHistory array the first time it's needed so
// older/seed cases that predate this field still work.
function getActiveChatArray() {
  if (state.activeChatCaseId) {
    const c = state.cases.find(item => item.id === state.activeChatCaseId);
    if (c) {
      if (!c.chatHistory) c.chatHistory = [];
      return c.chatHistory;
    }
  }
  return state.generalChatHistory;
}

// "New Chat" clears only the currently active thread, not every family's history.
function clearActiveChatArray() {
  if (state.activeChatCaseId) {
    const c = state.cases.find(item => item.id === state.activeChatCaseId);
    if (c) c.chatHistory = [];
  } else {
    state.generalChatHistory = [];
  }
}

function stripHTMLTags(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

// Builds the per-family "context window" sent to the worker alongside each question:
// basic case info pulled from the Case Card (patient/caregiver, stage, focus areas, intake
// notes, CHW notes) plus a short tail of the recent conversation, so answers can stay
// grounded in who this family actually is without re-explaining it every message.
const CHAT_CONTEXT_MAX_CHARS = 4000;
function buildChatContextText(caseItem) {
  if (!caseItem) return '';
  const f = Object.assign({}, DEFAULT_INTAKE_FIELDS, caseItem.intakeFields || {});
  const lines = [];
  lines.push(`Family: ${caseItem.name}`);
  if (caseItem.patientName) {
    lines.push(`Patient: ${caseItem.patientName}${caseItem.patientAge ? ' (age ' + caseItem.patientAge + ')' : ''}`);
  }
  if (f.primaryContact) lines.push(`Primary contact/caregiver: ${f.primaryContact} (${f.caregiverRel})`);
  lines.push(`Stage: ${f.patientStage}`);
  if (f.focusAreas && f.focusAreas.length) lines.push(`Focus areas: ${f.focusAreas.join(', ')}`);
  if (caseItem.intakeNotes) lines.push(`Intake notes: ${caseItem.intakeNotes}`);
  if (caseItem.notes) lines.push(`CHW notes: ${caseItem.notes}`);

  const recentMessages = (caseItem.chatHistory || []).slice(-6);
  if (recentMessages.length > 0) {
    const recentText = recentMessages
      .map(m => `${m.sender === 'user' ? 'CHW' : 'Assistant'}: ${stripHTMLTags(m.text).slice(0, 300)}`)
      .join('\n');
    lines.push(`Recent conversation:\n${recentText}`);
  }

  return lines.join('\n').slice(0, CHAT_CONTEXT_MAX_CHARS);
}

// Builds the full context sent to the worker to generate (or regenerate) a family report.
// Unlike buildChatContextText (which trims to a short recent tail to keep chat replies snappy
// and cheap), this pulls the FULL per-family chat transcript plus notes and intake fields,
// since report quality benefits from the whole conversation and this only runs on-demand.
const CHW_NAME = 'Jane Doe';
function buildReportGenerationContext(caseItem) {
  if (!caseItem) return '';
  const f = Object.assign({}, DEFAULT_INTAKE_FIELDS, caseItem.intakeFields || {});
  const lines = [];
  lines.push(`Family: ${caseItem.name}`);
  if (caseItem.patientName) {
    lines.push(`Patient: ${caseItem.patientName}${caseItem.patientAge ? ' (age ' + caseItem.patientAge + ')' : ''}`);
  }
  if (f.primaryContact) lines.push(`Primary contact/caregiver: ${f.primaryContact} (${f.caregiverRel})`);
  lines.push(`Stage: ${f.patientStage}`);
  if (f.focusAreas && f.focusAreas.length) lines.push(`Focus areas: ${f.focusAreas.join(', ')}`);
  if (caseItem.intakeNotes) lines.push(`Intake notes: ${caseItem.intakeNotes}`);
  if (caseItem.notes) lines.push(`CHW notes: ${caseItem.notes}`);
  lines.push(`CHW name: ${CHW_NAME}`);
  lines.push(`Today's date: ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}`);

  if (caseItem.timeline && caseItem.timeline.length) {
    const upcoming = caseItem.timeline[caseItem.timeline.length - 1];
    lines.push(`Next scheduled item: ${upcoming.label} on ${upcoming.date}`);
  }

  const fullHistory = caseItem.chatHistory || [];
  if (fullHistory.length > 0) {
    const transcript = fullHistory
      .map(m => `${m.sender === 'user' ? 'CHW' : 'Assistant'}: ${stripHTMLTags(m.text)}`)
      .join('\n');
    lines.push(`Full conversation so far:\n${transcript}`);
  }

  return lines.join('\n');
}

// Reflects state.activeChatCaseId in the chat header as a small dismissible chip
function renderChatContextChip() {
  if (!DOM.chatContextChip) return;
  const activeCase = state.activeChatCaseId ? state.cases.find(c => c.id === state.activeChatCaseId) : null;
  if (activeCase) {
    DOM.chatContextChip.style.display = '';
    DOM.chatContextChipLabel.textContent = activeCase.name;
  } else {
    DOM.chatContextChip.style.display = 'none';
    DOM.chatContextChipLabel.textContent = '';
  }
}

function renderChatHistory() {
  persistState();
  renderChatContextChip();
  DOM.chatMessagesBox.innerHTML = '';

  const activeChatArray = getActiveChatArray();
  if (activeChatArray.length === 0) {
    const welcomeBox = document.createElement('div');
    welcomeBox.className = 'chat-message assistant';
    welcomeBox.innerHTML = `
      <div class="message-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
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
  
  activeChatArray.forEach((msg, msgIndex) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.sender}`;
    
    let avatarContent = 'JD';
    if (msg.sender === 'assistant') {
      avatarContent = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`;
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

    // Resource cards (one per ASI-flagged retrieval hit) + Add to Family Report action
    let resourceHTML = '';
    if (msg.resources && msg.resources.length > 0) {
      resourceHTML = msg.resources.map((res, resIdx) => {
        const tagsHTML = res.tags.map(t => `<span class="mini-tag">${escapeHTML(t)}</span>`).join('');
        const addToReportBtnHTML = state.activeChatCaseId
          ? `<button class="add-to-report-btn" data-res-idx="${resIdx}" ${res.addedToReport ? 'disabled' : ''}>
              ${res.addedToReport ? '✓ Added to Family Report' : '+ Add to Family Report'}
            </button>`
          : '';
        return `
          <div class="chat-resource-card">
            <div class="chat-resource-header">
              <h4>${escapeHTML(res.title)}</h4>
              ${res.verified ? '<span class="verified-badge">ASI Approved</span>' : ''}
            </div>
            <p>${escapeHTML(res.desc)}</p>
            <div class="tag-row">${tagsHTML}</div>
            ${addToReportBtnHTML}
          </div>
        `;
      }).join('');
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
          ${msg.raw ? formatAssistantAnswer(msg.text) : `<p>${msg.text}</p>`}
          ${embedHTML}
          ${msg.additionalText ? `<p>${msg.additionalText}</p>` : ''}
          ${resourceHTML}
          ${optionsHTML}
        </div>
      </div>
    `;

    DOM.chatMessagesBox.appendChild(msgDiv);

    // Bind Add to Family Report click for each resource card
    if (msg.resources && msg.resources.length > 0) {
      msgDiv.querySelectorAll('.add-to-report-btn').forEach(addBtn => {
        addBtn.addEventListener('click', () => {
          const resIdx = parseInt(addBtn.getAttribute('data-res-idx'), 10);
          const res = msg.resources[resIdx];
          if (!res) return;
          const activeCase = state.activeChatCaseId ? state.cases.find(c => c.id === state.activeChatCaseId) : null;
          if (activeCase) {
            const alreadyExists = activeCase.resources.some(r => r.name === res.title);
            if (!alreadyExists) {
              activeCase.resources.push({
                name: res.title,
                url: res.url || '#',
                tag: mapToCanonicalResourceTag(res.tags)
              });
            }
          }
          res.addedToReport = true;
          addBtn.disabled = true;
          addBtn.textContent = '✓ Added to Family Report';
          persistState();
        });
      });
    }

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
  getActiveChatArray().push({
    sender: 'user',
    text: query,
    time: timeNow
  });

  renderChatHistory();
  showChatTypingIndicator();

  if (!CHAT_WORKER_URL) {
    setTimeout(() => {
      removeChatTypingIndicator();
      generateMockAIResponse(query);
    }, 1500);
    return;
  }

  fetchWorkerChatResponse(query);
}

// Pings the worker's CORS preflight (cheap - no OpenAI call) to show a real Live/Offline
// status instead of a hardcoded "Connected" label.
async function checkAgentStatus() {
  if (!DOM.chatStatusDot || !DOM.chatStatusText) return;
  if (!CHAT_WORKER_URL) {
    DOM.chatStatusDot.className = 'pulse-dot is-offline';
    DOM.chatStatusText.textContent = 'Agent Offline';
    return;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(CHAT_WORKER_URL, { method: 'OPTIONS', signal: controller.signal });
    clearTimeout(timeout);
    const isLive = res.ok;
    DOM.chatStatusDot.className = `pulse-dot ${isLive ? 'is-live' : 'is-offline'}`;
    DOM.chatStatusText.textContent = isLive ? 'Agent Live' : 'Agent Offline';
  } catch (err) {
    DOM.chatStatusDot.className = 'pulse-dot is-offline';
    DOM.chatStatusText.textContent = 'Agent Offline';
  }
}

async function fetchWorkerChatResponse(query) {
  try {
    const activeCase = state.activeChatCaseId ? state.cases.find(c => c.id === state.activeChatCaseId) : null;
    const context = buildChatContextText(activeCase);
    const res = await fetch(CHAT_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: query, context })
    });
    const data = await res.json();
    removeChatTypingIndicator();

    if (!res.ok) {
      appendAssistantChatMessage(data.error || "Something went wrong reaching the assistant.", { raw: true });
      return;
    }
    const resources = (data.resources || [])
      .map(r => findResourceById(r.id))
      .filter(Boolean)
      .map(r => ({ ...r, addedToReport: false }));
    appendAssistantChatMessage(data.answer, { raw: true, resources });
  } catch (err) {
    removeChatTypingIndicator();
    appendAssistantChatMessage("Couldn't reach the assistant right now. Please try again in a moment.", { raw: true });
  }
}

function appendAssistantChatMessage(text, { raw = false, resources = [] } = {}) {
  const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  getActiveChatArray().push({ sender: 'assistant', text, time: timeNow, raw, resources });
  renderChatHistory();
  scrollChatBottom();
}

// Escapes text into safe HTML, then re-applies a small set of formatting affordances
// (paragraphs, bullet lists, **bold**, and manual page citations) that the worker's
// plain-text answers use. Only ever called on raw/untrusted text - never on the
// hand-authored HTML strings used elsewhere in the mock responses.
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatAssistantAnswer(rawText) {
  const escaped = escapeHTML(rawText)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\([^)]*\bp\.?\s*\d+[^)]*\)/gi, (match) => `<span class="citation-page">${match}</span>`);

  const lines = escaped.split('\n').map(l => l.trim());
  const htmlBlocks = [];
  let listBuffer = [];
  let paraBuffer = [];

  const flushList = () => {
    if (listBuffer.length) {
      htmlBlocks.push(`<ul class="chat-answer-list">${listBuffer.map(l => `<li>${l}</li>`).join('')}</ul>`);
      listBuffer = [];
    }
  };
  const flushPara = () => {
    if (paraBuffer.length) {
      htmlBlocks.push(`<p>${paraBuffer.join('<br>')}</p>`);
      paraBuffer = [];
    }
  };

  // Consecutive bullet lines merge into one list (even across blank lines);
  // a blank line otherwise breaks the current paragraph into its own block.
  lines.forEach(line => {
    if (!line) {
      flushPara();
      return;
    }
    const bulletMatch = line.match(/^[-•]\s+(.*)$/);
    if (bulletMatch) {
      flushPara();
      listBuffer.push(bulletMatch[1]);
    } else {
      flushList();
      paraBuffer.push(line);
    }
  });
  flushList();
  flushPara();

  return htmlBlocks.join('') || '<p></p>';
}


function showChatTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message assistant typing-indicator-wrapper';
  typingDiv.id = 'chat-typing-indicator';
  
  const avatarContent = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`;
  
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
  const modelHeadline = '';

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
  getActiveChatArray().push({
    sender: 'assistant',
    text: text,
    time: timeNow,
    embedCard: embedCard,
    additionalText: additionalText
  });

  renderChatHistory();
  renderSuggestions();
}

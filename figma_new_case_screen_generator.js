// FIGMA NEW CASE STRUCTURED SCREEN GENERATOR
// Paste this code into Figma Console (Ctrl + Alt + I / Cmd + Option + I)
(async () => {
  console.log("Loading typography assets...");
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" }),
    figma.loadFontAsync({ family: "Outfit", style: "Bold" })
  ]);

  // COLOR SCHEMES (Sage & Lavender theme matching your styles)
  const colorSage = { r: 0.82, g: 0.83, b: 0.78 };       // #D2D4C8
  const colorCream = { r: 0.88, g: 0.89, b: 0.86 };      // #E0E2DB
  const colorCharcoal = { r: 0.16, g: 0.17, b: 0.16 };   // #2A2B2A
  const colorCharcoalMed = { r: 0.29, g: 0.29, b: 0.29 };// #4A4B4A
  const colorLavender = { r: 0.61, g: 0.54, b: 0.72 };   // #9C89B8
  const colorLavenderGlow = { r: 0.93, g: 0.91, b: 0.96 };// #edeaf4 (Active select light purple bg)
  const colorWhite = { r: 1, g: 1, b: 1 };
  
  // Height extended to 1250px to comfortably fit the structured fields
  const frame = figma.createFrame();
  frame.name = "6. Create New Case View (Structured)";
  frame.resize(1440, 1250);
  frame.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.95 } }];

  // 1. Sidebar Navigation (Left Column)
  const sidebar = figma.createFrame();
  sidebar.name = "Sidebar";
  sidebar.resize(270, 1250);
  sidebar.fills = [{ type: 'SOLID', color: colorSage }];
  sidebar.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  sidebar.strokeAlign = 'INSIDE';
  
  const logoText = figma.createText();
  logoText.x = 24; logoText.y = 24;
  logoText.fontName = { family: "Outfit", style: "Bold" };
  logoText.fontSize = 21; logoText.characters = "AZ Companion";
  logoText.fills = [{ type: 'SOLID', color: colorCharcoal }];
  sidebar.appendChild(logoText);

  const tabs = [
    { name: "My Cases", active: false },
    { name: "Case Card", active: true },
    { name: "AI Chat", active: false },
    { name: "Resources", active: false },
    { name: "Family Report", active: false }
  ];
  tabs.forEach((tab, index) => {
    const item = figma.createFrame();
    item.x = 12; item.y = 96 + (index * 54); item.resize(246, 46); item.cornerRadius = 12;
    item.fills = tab.active ? [{ type: 'SOLID', color: colorWhite, opacity: 0.75 }] : [];
    const text = figma.createText();
    text.x = 48; text.y = 15;
    text.fontName = { family: "Inter", style: tab.active ? "Bold" : "Semi Bold" };
    text.fontSize = 14; text.characters = tab.name;
    text.fills = [{ type: 'SOLID', color: tab.active ? { r: 0.28, g: 0.22, b: 0.38 } : colorCharcoalMed }];
    item.appendChild(text);
    sidebar.appendChild(item);
  });
  frame.appendChild(sidebar);

  // 2. Header
  const header = figma.createFrame();
  header.name = "Header"; header.resize(1170, 70); header.x = 270; header.y = 0;
  header.fills = [{ type: 'SOLID', color: colorCream }];
  header.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  frame.appendChild(header);

  // 3. Screen Title
  const ncTitle = figma.createText();
  ncTitle.x = 300; ncTitle.y = 102;
  ncTitle.fontName = { family: "Outfit", style: "Bold" };
  ncTitle.fontSize = 28; ncTitle.characters = "Create New Case";
  ncTitle.fills = [{ type: 'SOLID', color: colorCharcoal }];
  frame.appendChild(ncTitle);

  // 4. Form Card Container
  const formCard = figma.createFrame();
  formCard.name = "Structured Form Panel";
  formCard.x = 300;
  formCard.y = 164;
  formCard.resize(1110, 1020);
  formCard.cornerRadius = 20;
  formCard.fills = [{ type: 'SOLID', color: colorWhite }];
  formCard.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  // --- TEXT FIELD: Client Family Name ---
  const gFamily = figma.createFrame();
  gFamily.name = "Field: Client Family Name";
  gFamily.x = 40; gFamily.y = 30; gFamily.resize(500, 74); gFamily.fills = [];
  const lblFam = figma.createText();
  lblFam.fontName = { family: "Inter", style: "Bold" };
  lblFam.fontSize = 13; lblFam.characters = "Client Family Name";
  lblFam.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  gFamily.appendChild(lblFam);
  const inpFam = figma.createFrame();
  inpFam.y = 24; inpFam.resize(500, 44); inpFam.cornerRadius = 8;
  inpFam.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
  inpFam.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const inpFamTxt = figma.createText();
  inpFamTxt.x = 16; inpFamTxt.y = 15; inpFamTxt.fontName = { family: "Inter", style: "Regular" };
  inpFamTxt.fontSize = 13; inpFamTxt.characters = "Enter client family name...";
  inpFamTxt.fills = [{ type: 'SOLID', color: { r: 0.59, g: 0.60, b: 0.59 } }];
  inpFam.appendChild(inpFamTxt);
  gFamily.appendChild(inpFam);
  formCard.appendChild(gFamily);

  // --- TEXT FIELD: Primary Caregiver Name ---
  const gCaregiver = figma.createFrame();
  gCaregiver.name = "Field: Primary Caregiver Name";
  gCaregiver.x = 570; gCaregiver.y = 30; gCaregiver.resize(500, 74); gCaregiver.fills = [];
  const lblCare = figma.createText();
  lblCare.fontName = { family: "Inter", style: "Bold" };
  lblCare.fontSize = 13; lblCare.characters = "Primary Caregiver Name";
  lblCare.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  gCaregiver.appendChild(lblCare);
  const inpCare = figma.createFrame();
  inpCare.y = 24; inpCare.resize(500, 44); inpCare.cornerRadius = 8;
  inpCare.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
  inpCare.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const inpCareTxt = figma.createText();
  inpCareTxt.x = 16; inpCareTxt.y = 15; inpCareTxt.fontName = { family: "Inter", style: "Regular" };
  inpCareTxt.fontSize = 13; inpCareTxt.characters = "Enter primary caregiver name...";
  inpCareTxt.fills = [{ type: 'SOLID', color: { r: 0.59, g: 0.60, b: 0.59 } }];
  inpCare.appendChild(inpCareTxt);
  gCaregiver.appendChild(inpCare);
  formCard.appendChild(gCaregiver);

  // --- SECTION 1: PATIENT PROFILE (Single-Select Buttons) ---
  const gPatientProfile = figma.createFrame();
  gPatientProfile.name = "Section 1: Patient Profile";
  gPatientProfile.x = 40; gPatientProfile.y = 134; gPatientProfile.resize(1030, 180); gPatientProfile.fills = [];
  
  const secTitle1 = figma.createText();
  secTitle1.fontName = { family: "Inter", style: "Bold" };
  secTitle1.fontSize = 14; secTitle1.characters = "1. Patient Profile";
  secTitle1.fills = [{ type: 'SOLID', color: colorLavender }];
  gPatientProfile.appendChild(secTitle1);

  // Sub Field: Patient Age Range
  const lblAge = figma.createText();
  lblAge.x = 0; lblAge.y = 26;
  lblAge.fontName = { family: "Inter", style: "Semi Bold" };
  lblAge.fontSize = 12.5; lblAge.characters = "Patient Age Range:";
  lblAge.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  gPatientProfile.appendChild(lblAge);

  const ages = ["Under 65 (Early Onset)", "65 - 74", "75 - 84", "85+"];
  ages.forEach((age, idx) => {
    const btnAge = figma.createFrame();
    btnAge.x = 0 + (idx * 180); btnAge.y = 46; btnAge.resize(170, 36); btnAge.cornerRadius = 6;
    const isSelected = idx === 1; // Default select "65 - 74"
    btnAge.fills = isSelected ? [{ type: 'SOLID', color: colorLavenderGlow }] : [{ type: 'SOLID', color: colorWhite }];
    btnAge.strokes = [{ type: 'SOLID', color: isSelected ? colorLavender : { r: 0.79, g: 0.80, b: 0.76 } }];
    const btnTxt = figma.createText();
    btnTxt.fontName = { family: "Inter", style: isSelected ? "Bold" : "Regular" };
    btnTxt.fontSize = 12; btnTxt.characters = age;
    btnTxt.fills = [{ type: 'SOLID', color: isSelected ? colorCharcoal : colorCharcoalMed }];
    btnTxt.textAlignHorizontal = 'CENTER'; btnTxt.textAlignVertical = 'CENTER';
    btnAge.appendChild(btnTxt); btnTxt.resize(170, 36);
    gPatientProfile.appendChild(btnAge);
  });

  // Sub Field: Dementia Stage
  const lblStage = figma.createText();
  lblStage.x = 0; lblStage.y = 102;
  lblStage.fontName = { family: "Inter", style: "Semi Bold" };
  lblStage.fontSize = 12.5; lblStage.characters = "Current Alzheimer's/Dementia Stage:";
  lblStage.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  gPatientProfile.appendChild(lblStage);

  const stages = ["Suspected / Undiagnosed", "Early-Stage (Mild)", "Middle-Stage (Moderate)", "Late-Stage (Severe)"];
  stages.forEach((stage, idx) => {
    const btnStage = figma.createFrame();
    btnStage.x = 0 + (idx * 210); btnStage.y = 122; btnStage.resize(200, 36); btnStage.cornerRadius = 6;
    const isSelected = idx === 2; // Default select "Middle-Stage (Moderate)"
    btnStage.fills = isSelected ? [{ type: 'SOLID', color: colorLavenderGlow }] : [{ type: 'SOLID', color: colorWhite }];
    btnStage.strokes = [{ type: 'SOLID', color: isSelected ? colorLavender : { r: 0.79, g: 0.80, b: 0.76 } }];
    const btnTxt = figma.createText();
    btnTxt.fontName = { family: "Inter", style: isSelected ? "Bold" : "Regular" };
    btnTxt.fontSize = 12; btnTxt.characters = stage;
    btnTxt.fills = [{ type: 'SOLID', color: isSelected ? colorCharcoal : colorCharcoalMed }];
    btnTxt.textAlignHorizontal = 'CENTER'; btnTxt.textAlignVertical = 'CENTER';
    btnStage.appendChild(btnTxt); btnTxt.resize(200, 36);
    gPatientProfile.appendChild(btnStage);
  });
  formCard.appendChild(gPatientProfile);

  // --- SECTION 2: CAREGIVER PROFILE (Single-Select Buttons) ---
  const gCaregiverProfile = figma.createFrame();
  gCaregiverProfile.name = "Section 2: Caregiver Profile";
  gCaregiverProfile.x = 40; gCaregiverProfile.y = 338; gCaregiverProfile.resize(1030, 180); gCaregiverProfile.fills = [];
  
  const secTitle2 = figma.createText();
  secTitle2.fontName = { family: "Inter", style: "Bold" };
  secTitle2.fontSize = 14; secTitle2.characters = "2. Caregiver Profile";
  secTitle2.fills = [{ type: 'SOLID', color: colorLavender }];
  gCaregiverProfile.appendChild(secTitle2);

  // Sub Field: Relationship
  const lblRel = figma.createText();
  lblRel.x = 0; lblRel.y = 26;
  lblRel.fontName = { family: "Inter", style: "Semi Bold" };
  lblRel.fontSize = 12.5; lblRel.characters = "Relationship to Patient:";
  lblRel.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  gCaregiverProfile.appendChild(lblRel);

  const relations = ["Spouse/Partner", "Adult Child", "Other Relative", "Friend/Neighbor"];
  relations.forEach((rel, idx) => {
    const btnRel = figma.createFrame();
    btnRel.x = 0 + (idx * 160); btnRel.y = 46; btnRel.resize(150, 36); btnRel.cornerRadius = 6;
    const isSelected = idx === 1; // Default select "Adult Child"
    btnRel.fills = isSelected ? [{ type: 'SOLID', color: colorLavenderGlow }] : [{ type: 'SOLID', color: colorWhite }];
    btnRel.strokes = [{ type: 'SOLID', color: isSelected ? colorLavender : { r: 0.79, g: 0.80, b: 0.76 } }];
    const btnTxt = figma.createText();
    btnTxt.fontName = { family: "Inter", style: isSelected ? "Bold" : "Regular" };
    btnTxt.fontSize = 12; btnTxt.characters = rel;
    btnTxt.fills = [{ type: 'SOLID', color: isSelected ? colorCharcoal : colorCharcoalMed }];
    btnTxt.textAlignHorizontal = 'CENTER'; btnTxt.textAlignVertical = 'CENTER';
    btnRel.appendChild(btnTxt); btnTxt.resize(150, 36);
    gCaregiverProfile.appendChild(btnRel);
  });

  // Sub Field: Caregiver Stress Level
  const lblStress = figma.createText();
  lblStress.x = 0; lblStress.y = 102;
  lblStress.fontName = { family: "Inter", style: "Semi Bold" };
  lblStress.fontSize = 12.5; lblStress.characters = "Observed Caregiver Stress Level:";
  lblStress.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  gCaregiverProfile.appendChild(lblStress);

  const stressLevels = ["Low / Managing Well", "Moderate / Needs Support", "High / Burnout Risk"];
  stressLevels.forEach((stress, idx) => {
    const btnStress = figma.createFrame();
    btnStress.x = 0 + (idx * 210); btnStress.y = 122; btnStress.resize(200, 36); btnStress.cornerRadius = 6;
    const isSelected = idx === 2; // Default select "High / Burnout Risk"
    btnStress.fills = isSelected ? [{ type: 'SOLID', color: colorLavenderGlow }] : [{ type: 'SOLID', color: colorWhite }];
    btnStress.strokes = [{ type: 'SOLID', color: isSelected ? colorLavender : { r: 0.79, g: 0.80, b: 0.76 } }];
    const btnTxt = figma.createText();
    btnTxt.fontName = { family: "Inter", style: isSelected ? "Bold" : "Regular" };
    btnTxt.fontSize = 12; btnTxt.characters = stress;
    btnTxt.fills = [{ type: 'SOLID', color: isSelected ? colorCharcoal : colorCharcoalMed }];
    btnTxt.textAlignHorizontal = 'CENTER'; btnTxt.textAlignVertical = 'CENTER';
    btnStress.appendChild(btnTxt); btnTxt.resize(200, 36);
    gCaregiverProfile.appendChild(btnStress);
  });
  formCard.appendChild(gCaregiverProfile);

  // --- SECTION 3: FOCUS AREAS / CHALLENGES (Multi-Select Chips) ---
  const gChallenges = figma.createFrame();
  gChallenges.name = "Section 3: Focus Areas / Challenges";
  gChallenges.x = 40; gChallenges.y = 542; gChallenges.resize(1030, 160); gChallenges.fills = [];
  
  const secTitle3 = figma.createText();
  secTitle3.fontName = { family: "Inter", style: "Bold" };
  secTitle3.fontSize = 14; secTitle3.characters = "3. Primary Focus Areas / Challenges (Select all identified)";
  secTitle3.fills = [{ type: 'SOLID', color: colorLavender }];
  gChallenges.appendChild(secTitle3);

  const challenges = [
    { name: "Patient Denial", active: true },
    { name: "Caregiver Guilt / Self-Care", active: false },
    { name: "Transitioning to Care Facility", active: false },
    { name: "Medical Advocacy / Doctor Communication", active: false },
    { name: "Safety Concerns (Wandering, Falls)", active: true },
    { name: "Setting Role Boundaries", active: false },
    { name: "Unrealistic Expectations", active: false }
  ];

  // Draw chips row 1
  challenges.slice(0, 3).forEach((chal, idx) => {
    const chip = figma.createFrame();
    chip.x = idx * 240; chip.y = 26; chip.resize(230, 32); chip.cornerRadius = 16;
    chip.fills = chal.active ? [{ type: 'SOLID', color: colorLavender }] : [{ type: 'SOLID', color: colorWhite }];
    chip.strokes = [{ type: 'SOLID', color: colorLavender }];
    const cTxt = figma.createText();
    cTxt.fontName = { family: "Inter", style: "Semi Bold" };
    cTxt.fontSize = 11.5; cTxt.characters = chal.name;
    cTxt.fills = [{ type: 'SOLID', color: chal.active ? colorWhite : colorLavender }];
    cTxt.textAlignHorizontal = 'CENTER'; cTxt.textAlignVertical = 'CENTER';
    chip.appendChild(cTxt); cTxt.resize(230, 32);
    gChallenges.appendChild(chip);
  });

  // Draw chips row 2
  challenges.slice(3, 6).forEach((chal, idx) => {
    const chip = figma.createFrame();
    chip.x = idx * 300; chip.y = 66; chip.resize(290, 32); chip.cornerRadius = 16;
    chip.fills = chal.active ? [{ type: 'SOLID', color: colorLavender }] : [{ type: 'SOLID', color: colorWhite }];
    chip.strokes = [{ type: 'SOLID', color: colorLavender }];
    const cTxt = figma.createText();
    cTxt.fontName = { family: "Inter", style: "Semi Bold" };
    cTxt.fontSize = 11.5; cTxt.characters = chal.name;
    cTxt.fills = [{ type: 'SOLID', color: chal.active ? colorWhite : colorLavender }];
    cTxt.textAlignHorizontal = 'CENTER'; cTxt.textAlignVertical = 'CENTER';
    chip.appendChild(cTxt); cTxt.resize(290, 32);
    gChallenges.appendChild(chip);
  });

  // Draw chips row 3
  const lastChal = challenges[6];
  const chipLast = figma.createFrame();
  chipLast.x = 0; chipLast.y = 106; chipLast.resize(220, 32); chipLast.cornerRadius = 16;
  chipLast.fills = lastChal.active ? [{ type: 'SOLID', color: colorLavender }] : [{ type: 'SOLID', color: colorWhite }];
  chipLast.strokes = [{ type: 'SOLID', color: colorLavender }];
  const clTxt = figma.createText();
  clTxt.fontName = { family: "Inter", style: "Semi Bold" };
  clTxt.fontSize = 11.5; clTxt.characters = lastChal.name;
  clTxt.fills = [{ type: 'SOLID', color: lastChal.active ? colorWhite : colorLavender }];
  clTxt.textAlignHorizontal = 'CENTER'; clTxt.textAlignVertical = 'CENTER';
  chipLast.appendChild(clTxt); clTxt.resize(220, 32);
  gChallenges.appendChild(chipLast);

  formCard.appendChild(gChallenges);

  // --- SECTION 4: AI ACTION PROMPT (Single-Select Buttons) ---
  const gAiPrompt = figma.createFrame();
  gAiPrompt.name = "Section 4: AI Action Prompt";
  gAiPrompt.x = 40; gAiPrompt.y = 712; gAiPrompt.resize(1030, 90); gAiPrompt.fills = [];
  
  const secTitle4 = figma.createText();
  secTitle4.fontName = { family: "Inter", style: "Bold" };
  secTitle4.fontSize = 14; secTitle4.characters = "4. How can the AI assist you with this case today?";
  secTitle4.fills = [{ type: 'SOLID', color: colorLavender }];
  gAiPrompt.appendChild(secTitle4);

  const prompts = ["Draft a conversation starter", "Find local resources", "Think through scenario", "No immediate help"];
  prompts.forEach((pr, idx) => {
    const btnPr = figma.createFrame();
    btnPr.x = 0 + (idx * 260); btnPr.y = 26; btnPr.resize(250, 36); btnPr.cornerRadius = 6;
    const isSelected = idx === 1; // Default select "Find local resources"
    btnPr.fills = isSelected ? [{ type: 'SOLID', color: colorLavenderGlow }] : [{ type: 'SOLID', color: colorWhite }];
    btnPr.strokes = [{ type: 'SOLID', color: isSelected ? colorLavender : { r: 0.79, g: 0.80, b: 0.76 } }];
    const btnTxt = figma.createText();
    btnTxt.fontName = { family: "Inter", style: isSelected ? "Bold" : "Regular" };
    btnTxt.fontSize = 12; btnTxt.characters = pr;
    btnTxt.fills = [{ type: 'SOLID', color: isSelected ? colorCharcoal : colorCharcoalMed }];
    btnTxt.textAlignHorizontal = 'CENTER'; btnTxt.textAlignVertical = 'CENTER';
    btnPr.appendChild(btnTxt); btnTxt.resize(250, 36);
    gAiPrompt.appendChild(btnPr);
  });
  formCard.appendChild(gAiPrompt);

  // --- SECTION 5: ADDITIONAL NOTES (Text Box - Optional) ---
  const gNotes = figma.createFrame();
  gNotes.name = "Section 5: Additional Notes";
  gNotes.x = 40; gNotes.y = 812; gNotes.resize(1030, 110); gNotes.fills = [];
  
  const secTitle5 = figma.createText();
  secTitle5.fontName = { family: "Inter", style: "Bold" };
  secTitle5.fontSize = 13; secTitle5.characters = "Any specific cultural, language, or unique family dynamics to note? (Optional)";
  secTitle5.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  gNotes.appendChild(secTitle5);

  const inpNotes = figma.createFrame();
  inpNotes.y = 24; inpNotes.resize(1030, 70); inpNotes.cornerRadius = 8;
  inpNotes.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
  inpNotes.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const inpNotesTxt = figma.createText();
  inpNotesTxt.x = 16; inpNotesTxt.y = 16; inpNotesTxt.resize(990, 40);
  inpNotesTxt.fontName = { family: "Inter", style: "Regular" };
  inpNotesTxt.fontSize = 13; inpNotesTxt.characters = "Enter any unique family values, language needs, or notes...";
  inpNotesTxt.fills = [{ type: 'SOLID', color: { r: 0.59, g: 0.60, b: 0.59 } }];
  inpNotes.appendChild(inpNotesTxt);
  gNotes.appendChild(inpNotes);
  formCard.appendChild(gNotes);

  // --- FOOTER BUTTONS ---
  const btnCancel = figma.createFrame();
  btnCancel.x = 730; btnCancel.y = 946; btnCancel.resize(140, 44); btnCancel.cornerRadius = 8;
  btnCancel.fills = [{ type: 'SOLID', color: colorWhite }];
  btnCancel.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const cancelTxt = figma.createText();
  cancelTxt.fontName = { family: "Inter", style: "Semi Bold" };
  cancelTxt.fontSize = 14; cancelTxt.characters = "Cancel";
  cancelTxt.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  cancelTxt.textAlignHorizontal = 'CENTER'; cancelTxt.textAlignVertical = 'CENTER';
  btnCancel.appendChild(cancelTxt); cancelTxt.resize(140, 44);
  formCard.appendChild(btnCancel);

  const btnSave = figma.createFrame();
  btnSave.x = 890; btnSave.y = 946; btnSave.resize(200, 44); btnSave.cornerRadius = 8;
  btnSave.fills = [{ type: 'SOLID', color: colorLavender }];
  const saveTxt = figma.createText();
  saveTxt.fontName = { family: "Inter", style: "Bold" };
  saveTxt.fontSize = 14; saveTxt.characters = "Save & Add Case";
  saveTxt.fills = [{ type: 'SOLID', color: colorWhite }];
  saveTxt.textAlignHorizontal = 'CENTER'; saveTxt.textAlignVertical = 'CENTER';
  btnSave.appendChild(saveTxt); saveTxt.resize(200, 44);
  formCard.appendChild(btnSave);

  frame.appendChild(formCard);
  figma.viewport.scrollAndZoomIntoView([frame]);
  console.log("Structured Case Registration Screen generated successfully!");
})();

// FIGMA FULLY INTERACTIVE INTAKE GENERATOR (WITH ROW RADIO GROUPS & CAREGIVER AGE 2x2)
// Paste this code into Figma Console (Ctrl + Alt + I / Cmd + Option + I)
(async () => {
  console.log("Loading typography assets...");
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" }),
    figma.loadFontAsync({ family: "Outfit", style: "Bold" })
  ]);

  // COLORS
  const colorSage = { r: 0.82, g: 0.83, b: 0.78 };       // #D2D4C8
  const colorCream = { r: 0.88, g: 0.89, b: 0.86 };      // #E0E2DB
  const colorCharcoal = { r: 0.16, g: 0.17, b: 0.16 };   // #2A2B2A
  const colorCharcoalMed = { r: 0.29, g: 0.29, b: 0.29 };// #4A4B4A
  const colorLavender = { r: 0.61, g: 0.54, b: 0.72 };   // #9C89B8
  const colorLavenderGlow = { r: 0.93, g: 0.91, b: 0.96 };// #edeaf4
  const colorWhite = { r: 1, g: 1, b: 1 };

  const page = figma.currentPage;
  let offscreenY = 0;

  // ----------------------------------------------------
  // RADIO GROUP GRID GENERATOR HELPER
  // Creates a Component Set representing an option group (horizontal row or grid)
  // ----------------------------------------------------
  async function createRadioGroupSet(name, options, btnWidth, btnHeight, spacing, cols = 4) {
    const variants = [];
    const rows = Math.ceil(options.length / cols);
    const containerWidth = (btnWidth * cols) + (spacing * (cols - 1));
    const containerHeight = (btnHeight * rows) + (spacing * (rows - 1));

    // 1. Create a variant component for each possible selection
    for (let selectedIdx = 0; selectedIdx < options.length; selectedIdx++) {
      const variantComp = figma.createComponent();
      variantComp.name = `Active=${options[selectedIdx].replace(/[^a-zA-Z0-9]/g, "_")}`;
      variantComp.resize(containerWidth, containerHeight);
      variantComp.fills = []; // Transparent parent background

      // Draw all options inside this variant
      for (let btnIdx = 0; btnIdx < options.length; btnIdx++) {
        const r = Math.floor(btnIdx / cols);
        const c = btnIdx % cols;
        const isSelected = (selectedIdx === btnIdx);
        
        const btn = figma.createFrame();
        btn.name = `Button_${btnIdx}`;
        btn.x = c * (btnWidth + spacing);
        btn.y = r * (btnHeight + spacing);
        btn.resize(btnWidth, btnHeight);
        btn.cornerRadius = 6;
        btn.fills = isSelected ? [{ type: 'SOLID', color: colorLavenderGlow }] : [{ type: 'SOLID', color: colorWhite }];
        btn.strokes = [{ type: 'SOLID', color: isSelected ? colorLavender : { r: 0.79, g: 0.80, b: 0.76 } }];
        btn.strokeAlign = 'INSIDE';

        const txt = figma.createText();
        txt.fontName = { family: "Inter", style: isSelected ? "Bold" : "Regular" };
        txt.fontSize = 12;
        txt.characters = options[btnIdx];
        txt.fills = [{ type: 'SOLID', color: isSelected ? colorCharcoal : colorCharcoalMed }];
        txt.textAlignHorizontal = 'CENTER';
        txt.textAlignVertical = 'CENTER';
        btn.appendChild(txt);
        txt.resize(btnWidth, btnHeight);

        variantComp.appendChild(btn);
      }
      variants.push(variantComp);
    }

    // 2. Combine variants into a Component Set
    const componentSet = figma.combineAsVariants(variants, page);
    componentSet.name = name;
    componentSet.x = -800; // Place components offscreen
    componentSet.y = offscreenY;
    offscreenY += containerHeight + 100;

    // 3. Programmatically map click transitions between states
    for (let selectedIdx = 0; selectedIdx < options.length; selectedIdx++) {
      const sourceVariant = variants[selectedIdx];
      for (let btnIdx = 0; btnIdx < options.length; btnIdx++) {
        if (selectedIdx === btnIdx) continue; // No click action on the currently active button

        const targetVariant = variants[btnIdx];
        const clickableButton = sourceVariant.children[btnIdx];

        // Click changes the variant state of the parent component set
        await clickableButton.setReactionsAsync([{
          trigger: { type: 'ON_CLICK' },
          actions: [{
            type: 'NODE',
            navigation: 'CHANGE_TO',
            destinationId: targetVariant.id,
            transition: { type: 'SMART_ANIMATE', duration: 0.15, easing: { type: 'EASE_OUT' } }
          }]
        }]);
      }
    }

    return { componentSet, variants };
  }

  // ----------------------------------------------------
  // LANGUAGE GROUP GENERATOR HELPER
  // Creates a Component Set with English, Spanish and an Other text input box
  // ----------------------------------------------------
  async function createLanguageGroupSet() {
    const variants = [];
    const options = ["English", "Spanish", "Other"];
    const containerWidth = 500;
    const btnWidth = 120;
    const spacing = 10;

    // Create 3 states: Active=English, Active=Spanish, Active=Other
    for (let selectedIdx = 0; selectedIdx < 3; selectedIdx++) {
      const variantComp = figma.createComponent();
      variantComp.name = `Active=${options[selectedIdx]}`;
      variantComp.resize(containerWidth, 36);
      variantComp.fills = [];

      // English Button
      const btnEng = figma.createFrame();
      btnEng.name = "Button_0";
      btnEng.x = 0; btnEng.y = 0; btnEng.resize(btnWidth, 36); btnEng.cornerRadius = 6;
      const isEng = selectedIdx === 0;
      btnEng.fills = isEng ? [{ type: 'SOLID', color: colorLavenderGlow }] : [{ type: 'SOLID', color: colorWhite }];
      btnEng.strokes = [{ type: 'SOLID', color: isEng ? colorLavender : { r: 0.79, g: 0.80, b: 0.76 } }];
      btnEng.strokeAlign = 'INSIDE';
      const txtEng = figma.createText();
      txtEng.fontName = { family: "Inter", style: isEng ? "Bold" : "Regular" };
      txtEng.fontSize = 12; txtEng.characters = "English";
      txtEng.fills = [{ type: 'SOLID', color: isEng ? colorCharcoal : colorCharcoalMed }];
      txtEng.textAlignHorizontal = 'CENTER'; txtEng.textAlignVertical = 'CENTER';
      btnEng.appendChild(txtEng); txtEng.resize(btnWidth, 36);
      variantComp.appendChild(btnEng);

      // Spanish Button
      const btnSpa = figma.createFrame();
      btnSpa.name = "Button_1";
      btnSpa.x = btnWidth + spacing; btnSpa.y = 0; btnSpa.resize(btnWidth, 36); btnSpa.cornerRadius = 6;
      const isSpa = selectedIdx === 1;
      btnSpa.fills = isSpa ? [{ type: 'SOLID', color: colorLavenderGlow }] : [{ type: 'SOLID', color: colorWhite }];
      btnSpa.strokes = [{ type: 'SOLID', color: isSpa ? colorLavender : { r: 0.79, g: 0.80, b: 0.76 } }];
      btnSpa.strokeAlign = 'INSIDE';
      const txtSpa = figma.createText();
      txtSpa.fontName = { family: "Inter", style: isSpa ? "Bold" : "Regular" };
      txtSpa.fontSize = 12; txtSpa.characters = "Spanish";
      txtSpa.fills = [{ type: 'SOLID', color: isSpa ? colorCharcoal : colorCharcoalMed }];
      txtSpa.textAlignHorizontal = 'CENTER'; txtSpa.textAlignVertical = 'CENTER';
      btnSpa.appendChild(txtSpa); txtSpa.resize(btnWidth, 36);
      variantComp.appendChild(btnSpa);

      // Other Text Box Input
      const inpOther = figma.createFrame();
      inpOther.name = "Button_2";
      inpOther.x = (btnWidth + spacing) * 2; inpOther.y = 0; inpOther.resize(230, 36); inpOther.cornerRadius = 6;
      const isOther = selectedIdx === 2;
      inpOther.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
      inpOther.strokes = [{ type: 'SOLID', color: isOther ? colorLavender : { r: 0.79, g: 0.80, b: 0.76 } }];
      inpOther.strokeAlign = 'INSIDE';
      const txtOther = figma.createText();
      txtOther.x = 12; txtOther.y = 10;
      txtOther.fontName = { family: "Inter", style: "Regular" };
      txtOther.fontSize = 12; txtOther.characters = isOther ? "Other: (type here)" : "Other (specify)...";
      txtOther.fills = [{ type: 'SOLID', color: isOther ? colorCharcoal : { r: 0.59, g: 0.60, b: 0.59 } }];
      inpOther.appendChild(txtOther);
      variantComp.appendChild(inpOther);

      variants.push(variantComp);
    }

    const componentSet = figma.combineAsVariants(variants, page);
    componentSet.name = "Language Group Set";
    componentSet.x = -800;
    componentSet.y = offscreenY;
    offscreenY += 150;

    // Wire transitions
    for (let selectedIdx = 0; selectedIdx < 3; selectedIdx++) {
      const sourceVariant = variants[selectedIdx];
      for (let btnIdx = 0; btnIdx < 3; btnIdx++) {
        if (selectedIdx === btnIdx) continue;
        const targetVariant = variants[btnIdx];
        const clickableButton = sourceVariant.children[btnIdx];

        await clickableButton.setReactionsAsync([{
          trigger: { type: 'ON_CLICK' },
          actions: [{
            type: 'NODE',
            navigation: 'CHANGE_TO',
            destinationId: targetVariant.id,
            transition: { type: 'SMART_ANIMATE', duration: 0.15, easing: { type: 'EASE_OUT' } }
          }]
        }]);
      }
    }

    return { componentSet, variants };
  }

  // ----------------------------------------------------
  // MULTI-SELECT CHIP MASTER COMPONENT
  // ----------------------------------------------------
  console.log("Creating Challenge Chip Interactive Component Set...");
  const v1Chip = figma.createComponent();
  v1Chip.name = "Selected=False";
  v1Chip.resize(250, 32);
  v1Chip.cornerRadius = 16;
  v1Chip.fills = [{ type: 'SOLID', color: colorWhite }];
  v1Chip.strokes = [{ type: 'SOLID', color: colorLavender }];
  v1Chip.strokeAlign = 'INSIDE';
  
  const chipTxt1 = figma.createText();
  chipTxt1.fontName = { family: "Inter", style: "Semi Bold" };
  chipTxt1.fontSize = 11.5;
  chipTxt1.characters = "Placeholder Chip";
  chipTxt1.fills = [{ type: 'SOLID', color: colorLavender }];
  chipTxt1.textAlignHorizontal = 'CENTER';
  chipTxt1.textAlignVertical = 'CENTER';
  v1Chip.appendChild(chipTxt1);
  chipTxt1.resize(250, 32);

  const v2Chip = figma.createComponent();
  v2Chip.name = "Selected=True";
  v2Chip.resize(250, 32);
  v2Chip.cornerRadius = 16;
  v2Chip.fills = [{ type: 'SOLID', color: colorLavender }];
  v2Chip.strokes = [{ type: 'SOLID', color: colorLavender }];
  v2Chip.strokeAlign = 'INSIDE';
  
  const chipTxt2 = figma.createText();
  chipTxt2.fontName = { family: "Inter", style: "Semi Bold" };
  chipTxt2.fontSize = 11.5;
  chipTxt2.characters = "Placeholder Chip";
  chipTxt2.fills = [{ type: 'SOLID', color: colorWhite }];
  chipTxt2.textAlignHorizontal = 'CENTER';
  chipTxt2.textAlignVertical = 'CENTER';
  v2Chip.appendChild(chipTxt2);
  chipTxt2.resize(250, 32);

  const chipComponentSet = figma.combineAsVariants([v1Chip, v2Chip], page);
  chipComponentSet.name = "Challenge Chip Set";
  chipComponentSet.x = -500;
  chipComponentSet.y = offscreenY;
  offscreenY += 150;

  // Toggle reactions on chips (independent multi-select)
  await v1Chip.setReactionsAsync([{
    trigger: { type: 'ON_CLICK' },
    actions: [{
      type: 'NODE',
      navigation: 'CHANGE_TO',
      destinationId: v2Chip.id,
      transition: { type: 'SMART_ANIMATE', duration: 0.15, easing: { type: 'EASE_OUT' } }
    }]
  }]);

  await v2Chip.setReactionsAsync([{
    trigger: { type: 'ON_CLICK' },
    actions: [{
      type: 'NODE',
      navigation: 'CHANGE_TO',
      destinationId: v1Chip.id,
      transition: { type: 'SMART_ANIMATE', duration: 0.15, easing: { type: 'EASE_OUT' } }
    }]
  }]);

  function instantiateChip(label, x, y, width, isSelected = false) {
    const defaultComp = chipComponentSet.defaultVariant || chipComponentSet.children[0];
    const inst = defaultComp.createInstance();
    inst.resize(width, 32);
    inst.x = x;
    inst.y = y;
    inst.setProperties({ "Selected": isSelected ? "True" : "False" });
    
    const textElements = inst.findAll(node => node.type === "TEXT");
    textElements.forEach(el => {
      el.characters = label;
      el.resize(width, 32);
    });
    return inst;
  }

  // ----------------------------------------------------
  // GENERATE SCREEN FRAME (Extended height to 1500px)
  // ----------------------------------------------------
  console.log("Generating Structured intake view frame...");
  const frame = figma.createFrame();
  frame.name = "6. Create New Case View (Structured)";
  frame.resize(1440, 1500);
  frame.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.95 } }];

  // Sidebar Build
  const sidebar = figma.createFrame();
  sidebar.name = "Sidebar"; sidebar.resize(270, 1500);
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

  // Header Build
  const header = figma.createFrame();
  header.name = "Header"; header.resize(1170, 70); header.x = 270; header.y = 0;
  header.fills = [{ type: 'SOLID', color: colorCream }];
  header.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  frame.appendChild(header);

  // Screen Title
  const ncTitle = figma.createText();
  ncTitle.x = 300; ncTitle.y = 102;
  ncTitle.fontName = { family: "Outfit", style: "Bold" };
  ncTitle.fontSize = 28; ncTitle.characters = "Create New Case";
  ncTitle.fills = [{ type: 'SOLID', color: colorCharcoal }];
  frame.appendChild(ncTitle);

  // Form Container Card
  const formCard = figma.createFrame();
  formCard.name = "Form Body Container";
  formCard.x = 300;
  formCard.y = 164;
  formCard.resize(1110, 1280);
  formCard.cornerRadius = 20;
  formCard.fills = [{ type: 'SOLID', color: colorWhite }];
  formCard.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  // 1. Text Field: Client Family Name
  const lblFam = figma.createText();
  lblFam.x = 40; lblFam.y = 30;
  lblFam.fontName = { family: "Inter", style: "Bold" };
  lblFam.fontSize = 13; lblFam.characters = "Client Family Name";
  lblFam.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  formCard.appendChild(lblFam);
  const inpFam = figma.createFrame();
  inpFam.x = 40; inpFam.y = 54; inpFam.resize(500, 44); inpFam.cornerRadius = 8;
  inpFam.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
  inpFam.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const inpFamTxt = figma.createText();
  inpFamTxt.x = 16; inpFamTxt.y = 15; inpFamTxt.fontName = { family: "Inter", style: "Regular" };
  inpFamTxt.fontSize = 13; inpFamTxt.characters = "Enter client family name...";
  inpFamTxt.fills = [{ type: 'SOLID', color: { r: 0.59, g: 0.60, b: 0.59 } }];
  inpFam.appendChild(inpFamTxt);
  formCard.appendChild(inpFam);

  // 2. Text Field: Primary Contact Name (Caregiver)
  const lblCare = figma.createText();
  lblCare.x = 570; lblCare.y = 30;
  lblCare.fontName = { family: "Inter", style: "Bold" };
  lblCare.fontSize = 13; lblCare.characters = "Primary Contact Name";
  lblCare.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  formCard.appendChild(lblCare);
  const inpCare = figma.createFrame();
  inpCare.x = 570; inpCare.y = 54; inpCare.resize(500, 44); inpCare.cornerRadius = 8;
  inpCare.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
  inpCare.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const inpCareTxt = figma.createText();
  inpCareTxt.x = 16; inpCareTxt.y = 15; inpCareTxt.fontName = { family: "Inter", style: "Regular" };
  inpCareTxt.fontSize = 13; inpCareTxt.characters = "Enter primary contact name...";
  inpCareTxt.fills = [{ type: 'SOLID', color: { r: 0.59, g: 0.60, b: 0.59 } }];
  inpCare.appendChild(inpCareTxt);
  formCard.appendChild(inpCare);

  // --- SECTION 1: PATIENT PROFILE ---
  const lblS1 = figma.createText();
  lblS1.x = 40; lblS1.y = 134;
  lblS1.fontName = { family: "Inter", style: "Bold" };
  lblS1.fontSize = 14; lblS1.characters = "1. Patient Profile";
  lblS1.fills = [{ type: 'SOLID', color: colorLavender }];
  formCard.appendChild(lblS1);

  // 1.1 Age Range (2x2 Grid option)
  const lblAge = figma.createText();
  lblAge.x = 40; lblAge.y = 160;
  lblAge.fontName = { family: "Inter", style: "Semi Bold" };
  lblAge.fontSize = 12.5; lblAge.characters = "Patient Age Range:";
  lblAge.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  formCard.appendChild(lblAge);

  console.log("Generating Age Range 2x2 radio grid...");
  const ageGroupData = await createRadioGroupSet(
    "Age Range 2x2 Grid Set",
    ["Under 65 (Early Onset)", "65 - 74", "75 - 84", "85+"],
    200, 36, 10, 2 // cols = 2 for 2x2 layout
  );
  // Default selected is "65 - 74" (index 1)
  const ageInstance = ageGroupData.variants[1].createInstance();
  ageInstance.x = 40; ageInstance.y = 180;
  formCard.appendChild(ageInstance);

  // 1.2 Dementia Stage (1x4 horizontal row)
  const lblStage = figma.createText();
  lblStage.x = 40; lblStage.y = 276;
  lblStage.fontName = { family: "Inter", style: "Semi Bold" };
  lblStage.fontSize = 12.5; lblStage.characters = "Current Alzheimer's/Dementia Stage:";
  lblStage.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  formCard.appendChild(lblStage);

  console.log("Generating Dementia Stage radio row...");
  const stageGroupData = await createRadioGroupSet(
    "Dementia Stage Group Set",
    ["Suspected / Undiagnosed", "Early-Stage (Mild)", "Middle-Stage (Moderate)", "Late-Stage (Severe)"],
    200, 36, 10, 4
  );
  // Default selected is "Middle-Stage (Moderate)" (index 2)
  const stageInstance = stageGroupData.variants[2].createInstance();
  stageInstance.x = 40; stageInstance.y = 296;
  formCard.appendChild(stageInstance);

  // 1.3 Language Used (English, Spanish, and other text box input)
  const lblLang = figma.createText();
  lblLang.x = 40; lblLang.y = 352;
  lblLang.fontName = { family: "Inter", style: "Semi Bold" };
  lblLang.fontSize = 12.5; lblLang.characters = "Language Used by Patient & Caregiver:";
  lblLang.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  formCard.appendChild(lblLang);

  console.log("Generating Language option row (with text box)...");
  const langGroupData = await createLanguageGroupSet();
  // Default selected is English (index 0)
  const langInstance = langGroupData.variants[0].createInstance();
  langInstance.x = 40; langInstance.y = 372;
  formCard.appendChild(langInstance);

  // 1.4 Family Dynamics (Patient lives alone, kids, all adults)
  const lblDynamics = figma.createText();
  lblDynamics.x = 40; lblDynamics.y = 428;
  lblDynamics.fontName = { family: "Inter", style: "Semi Bold" };
  lblDynamics.fontSize = 12.5; lblDynamics.characters = "Family Dynamics / Living Situation:";
  lblDynamics.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  formCard.appendChild(lblDynamics);

  console.log("Generating Family Dynamics radio row...");
  const dynamicsGroupData = await createRadioGroupSet(
    "Family Dynamics Group Set",
    ["Patient lives alone", "There are kids", "All adults"],
    180, 36, 10, 3
  );
  // Default selected is "All adults" (index 2)
  const dynamicsInstance = dynamicsGroupData.variants[2].createInstance();
  dynamicsInstance.x = 40; dynamicsInstance.y = 448;
  formCard.appendChild(dynamicsInstance);

  // --- SECTION 2: CAREGIVER PROFILE ---
  const lblS2 = figma.createText();
  lblS2.x = 40; lblS2.y = 514;
  lblS2.fontName = { family: "Inter", style: "Bold" };
  lblS2.fontSize = 14; lblS2.characters = "2. Caregiver Profile";
  lblS2.fills = [{ type: 'SOLID', color: colorLavender }];
  formCard.appendChild(lblS2);

  // 2.1 Relationship Group
  const lblRel = figma.createText();
  lblRel.x = 40; lblRel.y = 540;
  lblRel.fontName = { family: "Inter", style: "Semi Bold" };
  lblRel.fontSize = 12.5; lblRel.characters = "Relationship to Patient:";
  lblRel.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  formCard.appendChild(lblRel);

  console.log("Generating Caregiver Relationship radio group...");
  const relGroupData = await createRadioGroupSet(
    "Relationship Group Set",
    ["Spouse/Partner", "Adult Child", "Other Relative", "Friend/Neighbor"],
    150, 36, 10, 4
  );
  // Default selected is "Adult Child" (index 1)
  const relInstance = relGroupData.variants[1].createInstance();
  relInstance.x = 40; relInstance.y = 560;
  formCard.appendChild(relInstance);

  // 2.2 Caregiver Age Range (New: 2x2 Grid option similar to Patient Age)
  const lblCareAge = figma.createText();
  lblCareAge.x = 40; lblCareAge.y = 614;
  lblCareAge.fontName = { family: "Inter", style: "Semi Bold" };
  lblCareAge.fontSize = 12.5; lblCareAge.characters = "Caregiver Age Range:";
  lblCareAge.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  formCard.appendChild(lblCareAge);

  console.log("Generating Caregiver Age 2x2 radio grid...");
  const careAgeGroupData = await createRadioGroupSet(
    "Caregiver Age 2x2 Grid Set",
    ["Under 65", "65 - 74", "75 - 84", "85+"],
    200, 36, 10, 2
  );
  // Default selected is "Under 65" (index 0)
  const careAgeInstance = careAgeGroupData.variants[0].createInstance();
  careAgeInstance.x = 40; careAgeInstance.y = 634;
  formCard.appendChild(careAgeInstance);

  // 2.3 Observed Stress Level Group
  const lblStress = figma.createText();
  lblStress.x = 40; lblStress.y = 734;
  lblStress.fontName = { family: "Inter", style: "Semi Bold" };
  lblStress.fontSize = 12.5; lblStress.characters = "Observed Caregiver Stress Level:";
  lblStress.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  formCard.appendChild(lblStress);

  console.log("Generating Caregiver Stress radio group...");
  const stressGroupData = await createRadioGroupSet(
    "Stress Level Group Set",
    ["Low / Managing Well", "Moderate / Needs Support", "High / Burnout Risk"],
    200, 36, 10, 3
  );
  // Default selected is "High / Burnout Risk" (index 2)
  const stressInstance = stressGroupData.variants[2].createInstance();
  stressInstance.x = 40; stressInstance.y = 754;
  formCard.appendChild(stressInstance);

  // --- SECTION 3: FOCUS AREAS / CHALLENGES (Chips) ---
  const lblS3 = figma.createText();
  lblS3.x = 40; lblS3.y = 816;
  lblS3.fontName = { family: "Inter", style: "Bold" };
  lblS3.fontSize = 14; lblS3.characters = "3. Primary Focus Areas / Challenges (Select all identified)";
  lblS3.fills = [{ type: 'SOLID', color: colorLavender }];
  formCard.appendChild(lblS3);

  const chipsData = [
    { label: "Patient Denial", x: 40, y: 842, w: 230, active: true },
    { label: "Caregiver Guilt / Self-Care", x: 285, y: 842, w: 230, active: false },
    { label: "Transitioning to Care Facility", x: 530, y: 842, w: 230, active: false },
    { label: "Medical Advocacy / Doctor Communication", x: 40, y: 882, w: 290, active: false },
    { label: "Safety Concerns (Wandering, Falls)", x: 345, y: 882, w: 290, active: true },
    { label: "Setting Role Boundaries", x: 650, y: 882, w: 290, active: false },
    { label: "Unrealistic Expectations", x: 40, y: 922, w: 220, active: false }
  ];

  chipsData.forEach(c => {
    const chip = instantiateChip(c.label, c.x, c.y, c.w, c.active);
    formCard.appendChild(chip);
  });

  // --- SECTION 4: AI ACTION PROMPT ---
  const lblS4 = figma.createText();
  lblS4.x = 40; lblS4.y = 986;
  lblS4.fontName = { family: "Inter", style: "Bold" };
  lblS4.fontSize = 14; lblS4.characters = "4. How can the AI assist you with this case today?";
  lblS4.fills = [{ type: 'SOLID', color: colorLavender }];
  formCard.appendChild(lblS4);

  console.log("Generating AI Action Prompt radio group...");
  const promptGroupData = await createRadioGroupSet(
    "AI Action Prompt Group Set",
    ["Draft a conversation starter", "Find local resources", "Think through scenario", "No immediate help"],
    250, 36, 10, 4
  );
  // Default selected is "Find local resources" (index 1)
  const promptInstance = promptGroupData.variants[1].createInstance();
  promptInstance.x = 40; promptInstance.y = 1012;
  formCard.appendChild(promptInstance);

  // --- SECTION 5: ADDITIONAL NOTES ---
  const lblS5 = figma.createText();
  lblS5.x = 40; lblS5.y = 1076;
  lblS5.fontName = { family: "Inter", style: "Bold" };
  lblS5.fontSize = 13; lblS5.characters = "Any specific cultural, language, or unique family dynamics to note? (Optional)";
  lblS5.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  formCard.appendChild(lblS5);

  const inpNotes = figma.createFrame();
  inpNotes.x = 40; inpNotes.y = 1102; inpNotes.resize(1030, 70); inpNotes.cornerRadius = 8;
  inpNotes.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
  inpNotes.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const inpNotesTxt = figma.createText();
  inpNotesTxt.x = 16; inpNotesTxt.y = 16; inpNotesTxt.resize(990, 40);
  inpNotesTxt.fontName = { family: "Inter", style: "Regular" };
  inpNotesTxt.fontSize = 13; inpNotesTxt.characters = "Enter any unique family values, language needs, or notes...";
  inpNotesTxt.fills = [{ type: 'SOLID', color: { r: 0.59, g: 0.60, b: 0.59 } }];
  inpNotes.appendChild(inpNotesTxt);
  formCard.appendChild(inpNotes);

  // --- FOOTER BUTTONS ---
  const btnCancel = figma.createFrame();
  btnCancel.x = 730; btnCancel.y = 1210; btnCancel.resize(140, 44); btnCancel.cornerRadius = 8;
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
  btnSave.x = 890; btnSave.y = 1210; btnSave.resize(200, 44); btnSave.cornerRadius = 8;
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
  console.log("Structured Prototyped Intake Screen with 2x2 grid and caregiver age generated successfully!");
})();

// FIGMA PROGRAMMATIC ALL SCREENS GENERATOR
// Paste this code into Figma Console (Ctrl + Alt + I / Cmd + Option + I)
(async () => {
  console.log("Loading typography assets...");
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" }),
    figma.loadFontAsync({ family: "Outfit", style: "Bold" })
  ]);

  const screens = [];
  const screenSpacing = 1600;

  // COLOR SCHEMES
  const colorSage = { r: 0.82, g: 0.83, b: 0.78 };       // #D2D4C8
  const colorCream = { r: 0.88, g: 0.89, b: 0.86 };      // #E0E2DB
  const colorCharcoal = { r: 0.16, g: 0.17, b: 0.16 };   // #2A2B2A
  const colorCharcoalMed = { r: 0.29, g: 0.29, b: 0.29 };// #4A4B4A
  const colorLavender = { r: 0.61, g: 0.54, b: 0.72 };   // #9C89B8
  const colorPeriwinkle = { r: 0.66, g: 0.59, b: 0.87 }; // #A997DF
  const colorWhite = { r: 1, g: 1, b: 1 };
  
  // ----------------------------------------------------
  // HELPER: CREATE SIDEBAR NAVIGATION
  // ----------------------------------------------------
  function buildSidebar(activePage) {
    const sidebar = figma.createFrame();
    sidebar.name = "Sidebar";
    sidebar.resize(270, 1024);
    sidebar.fills = [{ type: 'SOLID', color: colorSage }];
    sidebar.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
    sidebar.strokeAlign = 'INSIDE';

    // Logo
    const logoGroup = figma.createFrame();
    logoGroup.name = "Logo";
    logoGroup.resize(220, 40);
    logoGroup.x = 24;
    logoGroup.y = 24;
    logoGroup.fills = [];
    
    const logoText = figma.createText();
    logoText.fontName = { family: "Outfit", style: "Bold" };
    logoText.fontSize = 21;
    logoText.characters = "AZ Companion";
    logoText.fills = [{ type: 'SOLID', color: colorCharcoal }];
    logoGroup.appendChild(logoText);
    sidebar.appendChild(logoGroup);

    // Nav list
    const tabs = [
      { name: "My Cases", key: "my-cases" },
      { name: "Case Card", key: "case-cards" },
      { name: "AI Chat", key: "ai-chat" },
      { name: "Resources", key: "resources" },
      { name: "Family Report", key: "family-report" }
    ];

    tabs.forEach((tab, index) => {
      const item = figma.createFrame();
      item.name = "Nav Item: " + tab.name;
      item.x = 12;
      item.y = 96 + (index * 54);
      item.resize(246, 46);
      item.cornerRadius = 12;

      const isActive = tab.key === activePage;
      item.fills = isActive ? [{ type: 'SOLID', color: colorWhite, opacity: 0.75 }] : [];
      
      if (isActive) {
        const accent = figma.createFrame();
        accent.resize(4, 30);
        accent.cornerRadius = 2;
        accent.x = 0;
        accent.y = 8;
        accent.fills = [{ type: 'SOLID', color: colorLavender }];
        item.appendChild(accent);
      }

      const text = figma.createText();
      text.x = 48;
      text.y = 15;
      text.fontName = { family: "Inter", style: isActive ? "Bold" : "Semi Bold" };
      text.fontSize = 14;
      text.characters = tab.name;
      text.fills = [{ type: 'SOLID', color: isActive ? { r: 0.28, g: 0.22, b: 0.38 } : colorCharcoalMed }];
      item.appendChild(text);
      sidebar.appendChild(item);
    });

    // Profile at bottom
    const profile = figma.createFrame();
    profile.name = "Profile Footer";
    profile.x = 16;
    profile.y = 940;
    profile.resize(238, 50);
    profile.fills = [];

    const divider = figma.createLine();
    divider.x = 0;
    divider.y = -10;
    divider.resize(238, 0);
    divider.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
    profile.appendChild(divider);

    const avatar = figma.createFrame();
    avatar.resize(38, 38);
    avatar.cornerRadius = 19;
    avatar.fills = [{ type: 'SOLID', color: colorLavender }];
    const avText = figma.createText();
    avText.fontName = { family: "Inter", style: "Bold" };
    avText.fontSize = 14;
    avText.characters = "JD";
    avText.fills = [{ type: 'SOLID', color: colorWhite }];
    avText.textAlignHorizontal = 'CENTER';
    avText.textAlignVertical = 'CENTER';
    avatar.appendChild(avText);
    avText.resize(38, 38);
    profile.appendChild(avatar);

    const pName = figma.createText();
    pName.x = 48;
    pName.y = 4;
    pName.fontName = { family: "Inter", style: "Bold" };
    pName.fontSize = 14;
    pName.characters = "Jane Doe";
    pName.fills = [{ type: 'SOLID', color: colorCharcoal }];
    profile.appendChild(pName);

    const pRole = figma.createText();
    pRole.x = 48;
    pRole.y = 22;
    pRole.fontName = { family: "Inter", style: "Regular" };
    pRole.fontSize = 12;
    pRole.characters = "Case Manager";
    pRole.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
    profile.appendChild(pRole);

    sidebar.appendChild(profile);
    return sidebar;
  }

  // ----------------------------------------------------
  // HELPER: CREATE HEADER
  // ----------------------------------------------------
  function buildHeader() {
    const header = figma.createFrame();
    header.name = "Header";
    header.resize(1170, 70);
    header.x = 270;
    header.y = 0;
    header.fills = [{ type: 'SOLID', color: colorCream }];
    header.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
    header.strokeAlign = 'INSIDE';

    // Search bar
    const search = figma.createFrame();
    search.name = "Search Bar";
    search.x = 30;
    search.y = 15;
    search.resize(340, 40);
    search.cornerRadius = 12;
    search.fills = [{ type: 'SOLID', color: colorWhite, opacity: 0.7 }];
    search.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

    const sText = figma.createText();
    sText.x = 20;
    sText.y = 13;
    sText.fontName = { family: "Inter", style: "Regular" };
    sText.fontSize = 13;
    sText.characters = "Search families, cases, templates...";
    sText.fills = [{ type: 'SOLID', color: { r: 0.47, g: 0.48, b: 0.47 } }];
    search.appendChild(sText);
    header.appendChild(search);

    // Date
    const date = figma.createFrame();
    date.name = "Date Badge";
    date.x = 920;
    date.y = 15;
    date.resize(140, 40);
    date.cornerRadius = 12;
    date.fills = [{ type: 'SOLID', color: colorWhite, opacity: 0.7 }];
    date.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

    const dText = figma.createText();
    dText.x = 15;
    dText.y = 13;
    dText.fontName = { family: "Inter", style: "Semi Bold" };
    dText.fontSize = 13;
    dText.characters = "June 18, 2026";
    dText.fills = [{ type: 'SOLID', color: colorCharcoal }];
    date.appendChild(dText);
    header.appendChild(date);

    // Notifications
    const bell = figma.createFrame();
    bell.name = "Notification Bell";
    bell.x = 1084;
    bell.y = 15;
    bell.resize(40, 40);
    bell.cornerRadius = 20;
    bell.fills = [{ type: 'SOLID', color: colorWhite, opacity: 0.7 }];
    bell.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

    const dot = figma.createFrame();
    dot.name = "Unread Badge Dot";
    dot.x = 26;
    dot.y = 6;
    dot.resize(10, 10);
    dot.cornerRadius = 5;
    dot.fills = [{ type: 'SOLID', color: colorLavender }];
    bell.appendChild(dot);
    header.appendChild(bell);

    return header;
  }

  // ----------------------------------------------------
  // SCREEN 1: MY CASES (DASHBOARD)
  // ----------------------------------------------------
  console.log("Generating Screen 1: My Cases Dashboard...");
  const scrDashboard = figma.createFrame();
  scrDashboard.name = "1. Dashboard View";
  scrDashboard.resize(1440, 1024);
  scrDashboard.x = 0;
  scrDashboard.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.95 } }];

  scrDashboard.appendChild(buildSidebar("my-cases"));
  scrDashboard.appendChild(buildHeader());

  // Page Title
  const dTitle = figma.createText();
  dTitle.x = 300;
  dTitle.y = 102;
  dTitle.fontName = { family: "Outfit", style: "Bold" };
  dTitle.fontSize = 28;
  dTitle.characters = "Dashboard";
  dTitle.fills = [{ type: 'SOLID', color: colorCharcoal }];
  scrDashboard.appendChild(dTitle);

  // New Case Button
  const btnNewCase = figma.createFrame();
  btnNewCase.name = "New Case Button";
  btnNewCase.x = 1250;
  btnNewCase.y = 96;
  btnNewCase.resize(130, 38);
  btnNewCase.cornerRadius = 6;
  btnNewCase.fills = [{ type: 'SOLID', color: colorLavender }];
  
  const btnText = figma.createText();
  btnText.fontName = { family: "Inter", style: "Bold" };
  btnText.fontSize = 13;
  btnText.characters = "+ New Case";
  btnText.fills = [{ type: 'SOLID', color: colorWhite }];
  btnText.textAlignHorizontal = 'CENTER';
  btnText.textAlignVertical = 'CENTER';
  btnNewCase.appendChild(btnText);
  btnText.resize(130, 38);
  scrDashboard.appendChild(btnNewCase);

  // 3 Stats cards
  for (let i = 0; i < 3; i++) {
    const card = figma.createFrame();
    card.name = `Stat Card ${i+1}`;
    card.x = 300 + (i * 378);
    card.y = 164;
    card.resize(354, 110);
    card.cornerRadius = 12;
    card.fills = [{ type: 'SOLID', color: colorWhite }];
    card.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

    const cardLbl = figma.createText();
    cardLbl.x = 20;
    cardLbl.y = 20;
    cardLbl.fontName = { family: "Inter", style: "Semi Bold" };
    cardLbl.fontSize = 13;
    cardLbl.characters = ["Active Cases", "Completed Reports", "Pending Reports"][i];
    cardLbl.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
    card.appendChild(cardLbl);

    const cardVal = figma.createText();
    cardVal.x = 20;
    cardVal.y = 52;
    cardVal.fontName = { family: "Outfit", style: "Bold" };
    cardVal.fontSize = 32;
    cardVal.characters = ["8", "1", "1"][i];
    cardVal.fills = [{ type: 'SOLID', color: colorCharcoal }];
    card.appendChild(cardVal);
    scrDashboard.appendChild(card);
  }

  // Families Container
  const famSection = figma.createFrame();
  famSection.name = "Families Card Section";
  famSection.x = 300;
  famSection.y = 298;
  famSection.resize(1100, 680);
  famSection.cornerRadius = 20;
  famSection.fills = [{ type: 'SOLID', color: colorWhite }];
  famSection.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  const sHeader = figma.createText();
  sHeader.x = 24;
  sHeader.y = 24;
  sHeader.fontName = { family: "Outfit", style: "Bold" };
  sHeader.fontSize = 18;
  sHeader.characters = "Families Under Care";
  sHeader.fills = [{ type: 'SOLID', color: colorCharcoal }];
  famSection.appendChild(sHeader);

  // List family row items
  const mockFamilies = [
    { name: "Rivera Family", meta: "Intake Completed • Caregivers: 2 • Case Manager Assigned", shared: false },
    { name: "Marcus Family", meta: "Shared by: Robert Mercer • Assessment Phase", shared: true }
  ];

  mockFamilies.forEach((fam, idx) => {
    const row = figma.createFrame();
    row.name = `Row: ${fam.name}`;
    row.x = 24;
    row.y = 76 + (idx * 88);
    row.resize(1052, 72);
    row.cornerRadius = 12;
    row.fills = [{ type: 'SOLID', color: colorWhite }];
    row.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

    if (fam.shared) {
      const leftBorder = figma.createFrame();
      leftBorder.resize(4, 72);
      leftBorder.fills = [{ type: 'SOLID', color: colorPeriwinkle }];
      row.appendChild(leftBorder);
    }

    const fName = figma.createText();
    fName.x = 20;
    fName.y = 16;
    fName.fontName = { family: "Outfit", style: "Bold" };
    fName.fontSize = 15;
    fName.characters = fam.name;
    fName.fills = [{ type: 'SOLID', color: colorCharcoal }];
    row.appendChild(fName);

    const fMeta = figma.createText();
    fMeta.x = 20;
    fMeta.y = 38;
    fMeta.fontName = { family: "Inter", style: "Regular" };
    fMeta.fontSize = 12;
    fMeta.characters = fam.meta;
    fMeta.fills = [{ type: 'SOLID', color: { r: 0.47, g: 0.48, b: 0.47 } }];
    row.appendChild(fMeta);

    // View button
    const vBtn = figma.createFrame();
    vBtn.name = "View Button";
    vBtn.x = 900;
    vBtn.y = 17;
    vBtn.resize(130, 38);
    vBtn.cornerRadius = 6;
    vBtn.fills = [{ type: 'SOLID', color: colorWhite }];
    vBtn.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
    
    const vText = figma.createText();
    vText.fontName = { family: "Inter", style: "Semi Bold" };
    vText.fontSize = 12;
    vText.characters = "View Case Card";
    vText.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
    vText.textAlignHorizontal = 'CENTER';
    vText.textAlignVertical = 'CENTER';
    vBtn.appendChild(vText);
    vText.resize(130, 38);
    row.appendChild(vBtn);

    famSection.appendChild(row);
  });
  
  scrDashboard.appendChild(famSection);
  screens.push(scrDashboard);

  // ----------------------------------------------------
  // SCREEN 2: CASE CARDS (KANBAN BOARD)
  // ----------------------------------------------------
  console.log("Generating Screen 2: Case Cards Board...");
  const scrCards = figma.createFrame();
  scrCards.name = "2. Case Cards View";
  scrCards.resize(1440, 1024);
  scrCards.x = screenSpacing;
  scrCards.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.95 } }];

  scrCards.appendChild(buildSidebar("case-cards"));
  scrCards.appendChild(buildHeader());

  const cTitle = figma.createText();
  cTitle.x = 300;
  cTitle.y = 102;
  cTitle.fontName = { family: "Outfit", style: "Bold" };
  cTitle.fontSize = 28;
  cTitle.characters = "Case Cards Library";
  cTitle.fills = [{ type: 'SOLID', color: colorCharcoal }];
  scrCards.appendChild(cTitle);

  // Draw 2 Kanban cards side-by-side
  const mockCards = [
    { name: "Rivera Family", phase: "Phase: Intake Protocol", detail: "Active caregivers fatigued. Seeking home safety recommendations and cognitive training links." },
    { name: "Marcus Family", phase: "Phase: Assessment Mode", detail: "Initial screening done. Scheduling consultation with community health worker team next week." }
  ];

  mockCards.forEach((cItem, index) => {
    const card = figma.createFrame();
    card.name = "Card Item: " + cItem.name;
    card.x = 300 + (index * 380);
    card.y = 164;
    card.resize(350, 340);
    card.cornerRadius = 16;
    card.fills = [{ type: 'SOLID', color: colorWhite }];
    card.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

    const nameText = figma.createText();
    nameText.x = 24;
    nameText.y = 24;
    nameText.fontName = { family: "Outfit", style: "Bold" };
    nameText.fontSize = 18;
    nameText.characters = cItem.name;
    nameText.fills = [{ type: 'SOLID', color: colorCharcoal }];
    card.appendChild(nameText);

    const phaseText = figma.createText();
    phaseText.x = 24;
    phaseText.y = 54;
    phaseText.fontName = { family: "Inter", style: "Bold" };
    phaseText.fontSize = 11;
    phaseText.characters = cItem.phase;
    phaseText.fills = [{ type: 'SOLID', color: colorLavender }];
    card.appendChild(phaseText);

    const descText = figma.createText();
    descText.x = 24;
    descText.y = 86;
    descText.resize(302, 100);
    descText.fontName = { family: "Inter", style: "Regular" };
    descText.fontSize = 13;
    descText.characters = cItem.detail;
    descText.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
    card.appendChild(descText);

    // Edit button inside card
    const edtBtn = figma.createFrame();
    edtBtn.x = 24;
    edtBtn.y = 270;
    edtBtn.resize(302, 40);
    edtBtn.cornerRadius = 8;
    edtBtn.fills = [{ type: 'SOLID', color: colorWhite }];
    edtBtn.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
    
    const edtText = figma.createText();
    edtText.fontName = { family: "Inter", style: "Semi Bold" };
    edtText.fontSize = 12;
    edtText.characters = "Maximize Card Editor";
    edtText.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
    edtText.textAlignHorizontal = 'CENTER';
    edtText.textAlignVertical = 'CENTER';
    edtBtn.appendChild(edtText);
    edtText.resize(302, 40);
    card.appendChild(edtBtn);

    scrCards.appendChild(card);
  });

  screens.push(scrCards);

  // ----------------------------------------------------
  // SCREEN 3: AI CHAT COMPANION
  // ----------------------------------------------------
  console.log("Generating Screen 3: AI Chat Companion...");
  const scrChat = figma.createFrame();
  scrChat.name = "3. AI Chat View";
  scrChat.resize(1440, 1024);
  scrChat.x = screenSpacing * 2;
  scrChat.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.95 } }];

  scrChat.appendChild(buildSidebar("ai-chat"));
  scrChat.appendChild(buildHeader());

  // Chat layout container
  const chatLayout = figma.createFrame();
  chatLayout.name = "Chat Container Panel";
  chatLayout.x = 300;
  chatLayout.y = 100;
  chatLayout.resize(1100, 880);
  chatLayout.cornerRadius = 20;
  chatLayout.fills = [{ type: 'SOLID', color: colorWhite }];
  chatLayout.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  // Chat bubbles
  const bubble1 = figma.createFrame();
  bubble1.name = "AI Bubble";
  bubble1.x = 24;
  bubble1.y = 24;
  bubble1.resize(600, 90);
  bubble1.cornerRadius = 12;
  bubble1.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.98 } }];

  const b1Text = figma.createText();
  b1Text.x = 16;
  b1Text.y = 16;
  b1Text.resize(568, 60);
  b1Text.fontName = { family: "Inter", style: "Regular" };
  b1Text.fontSize = 13;
  b1Text.characters = "Welcome Jane! Select a guideline below to begin or ask me anything regarding Alzheimer's community care.";
  b1Text.fills = [{ type: 'SOLID', color: colorCharcoal }];
  bubble1.appendChild(b1Text);
  chatLayout.appendChild(bubble1);

  // In-Chat Choices Box
  const choiceBox = figma.createFrame();
  choiceBox.name = "In-Chat Choice Buttons";
  choiceBox.x = 24;
  choiceBox.y = 130;
  choiceBox.resize(500, 100);
  choiceBox.fills = [];

  const choiceBtn = figma.createFrame();
  choiceBtn.resize(450, 38);
  choiceBtn.cornerRadius = 8;
  choiceBtn.fills = [{ type: 'SOLID', color: colorWhite }];
  choiceBtn.strokes = [{ type: 'SOLID', color: colorLavender }];
  const cbText = figma.createText();
  cbText.fontName = { family: "Inter", style: "Semi Bold" };
  cbText.fontSize = 12.5;
  cbText.characters = "How do I build rapport during first caregiver intake?";
  cbText.fills = [{ type: 'SOLID', color: colorCharcoal }];
  cbText.textAlignVertical = 'CENTER';
  cbText.x = 16;
  choiceBtn.appendChild(cbText);
  cbText.resize(420, 38);
  choiceBox.appendChild(choiceBtn);
  chatLayout.appendChild(choiceBox);

  // Message input bar at bottom
  const inputFrame = figma.createFrame();
  inputFrame.name = "Chat Input Field";
  inputFrame.x = 24;
  inputFrame.y = 800;
  inputFrame.resize(1052, 54);
  inputFrame.cornerRadius = 12;
  inputFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.96 } }];
  inputFrame.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  const inText = figma.createText();
  inText.x = 20;
  inText.y = 19;
  inText.fontName = { family: "Inter", style: "Regular" };
  inText.fontSize = 13;
  inText.characters = "Ask AZ Companion a question...";
  inText.fills = [{ type: 'SOLID', color: { r: 0.59, g: 0.60, b: 0.59 } }];
  inputFrame.appendChild(inText);
  chatLayout.appendChild(inputFrame);

  scrChat.appendChild(chatLayout);
  screens.push(scrChat);

  // ----------------------------------------------------
  // SCREEN 4: CURATED RESOURCES (2-COLUMN GRID)
  // ----------------------------------------------------
  console.log("Generating Screen 4: Curated Resources Grid...");
  const scrResources = figma.createFrame();
  scrResources.name = "4. Curated Resources View";
  scrResources.resize(1440, 1024);
  scrResources.x = screenSpacing * 3;
  scrResources.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.95 } }];

  scrResources.appendChild(buildSidebar("resources"));
  scrResources.appendChild(buildHeader());

  const rTitle = figma.createText();
  rTitle.x = 300;
  rTitle.y = 102;
  rTitle.fontName = { family: "Outfit", style: "Bold" };
  rTitle.fontSize = 28;
  rTitle.characters = "Curated Resources Library";
  rTitle.fills = [{ type: 'SOLID', color: colorCharcoal }];
  scrResources.appendChild(rTitle);

  // Columns Titles (Left: ADRD Resources, Right: Approved Practices)
  const cols = ["ADRD Resources", "Approved Practices"];
  cols.forEach((colTitle, idx) => {
    const colFrame = figma.createFrame();
    colFrame.name = "Column: " + colTitle;
    colFrame.x = 300 + (idx * 560);
    colFrame.y = 164;
    colFrame.resize(520, 800);
    colFrame.fills = [];

    const colHeader = figma.createText();
    colHeader.fontName = { family: "Outfit", style: "Bold" };
    colHeader.fontSize = 18;
    colHeader.characters = colTitle;
    colHeader.fills = [{ type: 'SOLID', color: colorCharcoal }];
    colFrame.appendChild(colHeader);

    // Add mock resource card
    const card = figma.createFrame();
    card.name = "Resource Item";
    card.y = 40;
    card.resize(520, 130);
    card.cornerRadius = 12;
    card.fills = [{ type: 'SOLID', color: colorWhite }];
    card.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

    const hText = figma.createText();
    hText.x = 20;
    hText.y = 18;
    hText.fontName = { family: "Outfit", style: "Bold" };
    hText.fontSize = 15;
    hText.characters = idx === 0 ? "Caregiver Support Directory" : "Approved Intake Protocols";
    hText.fills = [{ type: 'SOLID', color: colorCharcoal }];
    card.appendChild(hText);

    const pText = figma.createText();
    pText.x = 20;
    pText.y = 42;
    pText.resize(480, 50);
    pText.fontName = { family: "Inter", style: "Regular" };
    pText.fontSize = 13;
    pText.characters = idx === 0 ? "Comprehensive catalog of local networks for family primary care fatigue." : "Official organization instructions on initial assessments.";
    pText.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
    card.appendChild(pText);

    // Tags
    const tag = figma.createFrame();
    tag.x = 20;
    tag.y = 96;
    tag.resize(70, 18);
    tag.cornerRadius = 10;
    tag.fills = [{ type: 'SOLID', color: colorCream }];
    const tTxt = figma.createText();
    tTxt.fontName = { family: "Inter", style: "Bold" };
    tTxt.fontSize = 9;
    tTxt.characters = idx === 0 ? "SUPPORT" : "STANDARD";
    tTxt.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
    tTxt.textAlignHorizontal = 'CENTER';
    tTxt.textAlignVertical = 'CENTER';
    tag.appendChild(tTxt);
    tTxt.resize(70, 18);
    card.appendChild(tag);

    colFrame.appendChild(card);
    scrResources.appendChild(colFrame);
  });

  screens.push(scrResources);

  // ----------------------------------------------------
  // SCREEN 5: FAMILY REPORT TABLE
  // ----------------------------------------------------
  console.log("Generating Screen 5: Family Reports Table...");
  const scrReports = figma.createFrame();
  scrReports.name = "5. Family Reports View";
  scrReports.resize(1440, 1024);
  scrReports.x = screenSpacing * 4;
  scrReports.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.95 } }];

  scrReports.appendChild(buildSidebar("family-report"));
  scrReports.appendChild(buildHeader());

  const repTitle = figma.createText();
  repTitle.x = 300;
  repTitle.y = 102;
  repTitle.fontName = { family: "Outfit", style: "Bold" };
  repTitle.fontSize = 28;
  repTitle.characters = "Generated Quarterly Reports";
  repTitle.fills = [{ type: 'SOLID', color: colorCharcoal }];
  scrReports.appendChild(repTitle);

  // Table Card
  const tableCard = figma.createFrame();
  tableCard.name = "Reports Table Panel";
  tableCard.x = 300;
  tableCard.y = 164;
  tableCard.resize(1100, 400);
  tableCard.cornerRadius = 16;
  tableCard.fills = [{ type: 'SOLID', color: colorWhite }];
  tableCard.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  // Table Header Row
  const tHeader = figma.createFrame();
  tHeader.name = "Table Header";
  tHeader.resize(1100, 48);
  tHeader.fills = [{ type: 'SOLID', color: colorCream, opacity: 0.4 }];
  tHeader.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  const colsDef = [
    { name: "Family Name", x: 24 },
    { name: "Active Period", x: 260 },
    { name: "Status", x: 500 },
    { name: "Action", x: 800 }
  ];

  colsDef.forEach(cDef => {
    const lblText = figma.createText();
    lblText.x = cDef.x;
    lblText.y = 16;
    lblText.fontName = { family: "Inter", style: "Bold" };
    lblText.fontSize = 12;
    lblText.characters = cDef.name;
    lblText.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
    tHeader.appendChild(lblText);
  });
  tableCard.appendChild(tHeader);

  // Table Rows (Rivera Family row example)
  const tRow = figma.createFrame();
  tRow.name = "Report Row: Rivera Family";
  tRow.y = 48;
  tRow.resize(1100, 64);
  tRow.fills = [];
  tRow.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  const cellName = figma.createText();
  cellName.x = 24;
  cellName.y = 23;
  cellName.fontName = { family: "Outfit", style: "Bold" };
  cellName.fontSize = 14;
  cellName.characters = "Rivera Family";
  cellName.fills = [{ type: 'SOLID', color: colorCharcoal }];
  tRow.appendChild(cellName);

  const cellPeriod = figma.createText();
  cellPeriod.x = 260;
  cellPeriod.y = 24;
  cellPeriod.fontName = { family: "Inter", style: "Regular" };
  cellPeriod.fontSize = 13;
  cellPeriod.characters = "Q2 2026";
  cellPeriod.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  tRow.appendChild(cellPeriod);

  const cellStatus = figma.createFrame();
  cellStatus.x = 500;
  cellStatus.y = 20;
  cellStatus.resize(80, 22);
  cellStatus.cornerRadius = 11;
  cellStatus.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.96, b: 0.9 } }]; // Green light bg
  const csTxt = figma.createText();
  csTxt.fontName = { family: "Inter", style: "Bold" };
  csTxt.fontSize = 10;
  csTxt.characters = "Ready";
  csTxt.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.5, b: 0.1 } }];
  csTxt.textAlignHorizontal = 'CENTER';
  csTxt.textAlignVertical = 'CENTER';
  cellStatus.appendChild(csTxt);
  csTxt.resize(80, 22);
  tRow.appendChild(cellStatus);

  // View button inside row
  const rowBtn = figma.createFrame();
  rowBtn.x = 800;
  rowBtn.y = 13;
  rowBtn.resize(140, 36);
  rowBtn.cornerRadius = 6;
  rowBtn.fills = [{ type: 'SOLID', color: colorLavender }];
  const rbText = figma.createText();
  rbText.fontName = { family: "Inter", style: "Bold" };
  rbText.fontSize = 12;
  rbText.characters = "View Report";
  rbText.fills = [{ type: 'SOLID', color: colorWhite }];
  rbText.textAlignHorizontal = 'CENTER';
  rbText.textAlignVertical = 'CENTER';
  rowBtn.appendChild(rbText);
  rbText.resize(140, 36);
  tRow.appendChild(rowBtn);

  tableCard.appendChild(tRow);
  scrReports.appendChild(tableCard);

  screens.push(scrReports);

  // ----------------------------------------------------
  // SCREEN 6: CREATE NEW CASE FORM (1440x1024)
  // ----------------------------------------------------
  console.log("Generating Screen 6: New Case Form...");
  const scrNewCase = figma.createFrame();
  scrNewCase.name = "6. Create New Case View";
  scrNewCase.resize(1440, 1024);
  scrNewCase.x = 0;
  scrNewCase.y = 1200;
  scrNewCase.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.95 } }];

  scrNewCase.appendChild(buildSidebar("case-cards"));
  scrNewCase.appendChild(buildHeader());

  const ncTitle = figma.createText();
  ncTitle.x = 300;
  ncTitle.y = 102;
  ncTitle.fontName = { family: "Outfit", style: "Bold" };
  ncTitle.fontSize = 28;
  ncTitle.characters = "Create New Case";
  ncTitle.fills = [{ type: 'SOLID', color: colorCharcoal }];
  scrNewCase.appendChild(ncTitle);

  // Form Container Card
  const formCard = figma.createFrame();
  formCard.name = "Form Card Container";
  formCard.x = 300;
  formCard.y = 164;
  formCard.resize(800, 750);
  formCard.cornerRadius = 20;
  formCard.fills = [{ type: 'SOLID', color: colorWhite }];
  formCard.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  // Inputs
  const fields = ["Client Family Name", "Primary Caregiver Name", "Client Age & Diagnosis Notes", "Initial Intake Assessment Summary"];
  fields.forEach((field, fIdx) => {
    const group = figma.createFrame();
    group.name = `Input Group: ${field}`;
    group.x = 40;
    group.y = 40 + (fIdx * 120);
    group.resize(720, 90);
    group.fills = [];

    const label = figma.createText();
    label.fontName = { family: "Inter", style: "Bold" };
    label.fontSize = 13;
    label.characters = field;
    label.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
    group.appendChild(label);

    const input = figma.createFrame();
    input.y = 24;
    input.resize(720, 44);
    input.cornerRadius = 8;
    input.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
    input.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
    
    const inpTxt = figma.createText();
    inpTxt.x = 16;
    inpTxt.y = 15;
    inpTxt.fontName = { family: "Inter", style: "Regular" };
    inpTxt.fontSize = 13;
    inpTxt.characters = `Enter ${field.toLowerCase()}...`;
    inpTxt.fills = [{ type: 'SOLID', color: { r: 0.59, g: 0.60, b: 0.59 } }];
    input.appendChild(inpTxt);
    
    group.appendChild(input);
    formCard.appendChild(group);
  });

  // Create Case button
  const btnSubmit = figma.createFrame();
  btnSubmit.x = 40;
  btnSubmit.y = 560;
  btnSubmit.resize(200, 44);
  btnSubmit.cornerRadius = 8;
  btnSubmit.fills = [{ type: 'SOLID', color: colorLavender }];
  const btnSubTxt = figma.createText();
  btnSubTxt.fontName = { family: "Inter", style: "Bold" };
  btnSubTxt.fontSize = 14;
  btnSubTxt.characters = "Save & Add Case";
  btnSubTxt.fills = [{ type: 'SOLID', color: colorWhite }];
  btnSubTxt.textAlignHorizontal = 'CENTER';
  btnSubTxt.textAlignVertical = 'CENTER';
  btnSubmit.appendChild(btnSubTxt);
  btnSubTxt.resize(200, 44);
  formCard.appendChild(btnSubmit);

  scrNewCase.appendChild(formCard);
  screens.push(scrNewCase);

  // ----------------------------------------------------
  // SCREEN 7: MAXIMIZED CARD EDITOR (MODAL OVERLAY - 720x620)
  // ----------------------------------------------------
  console.log("Generating Screen 7: Maximized Card Editor Modal...");
  const modalEditor = figma.createFrame();
  modalEditor.name = "7. Maximized Card Editor (Overlay)";
  modalEditor.resize(720, 620);
  modalEditor.x = screenSpacing;
  modalEditor.y = 1200;
  modalEditor.cornerRadius = 20;
  modalEditor.fills = [{ type: 'SOLID', color: colorWhite }];
  modalEditor.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  
  // Header
  const edHeader = figma.createText();
  edHeader.x = 24;
  edHeader.y = 24;
  edHeader.fontName = { family: "Outfit", style: "Bold" };
  edHeader.fontSize = 18;
  edHeader.characters = "Edit Rivera Family Card";
  edHeader.fills = [{ type: 'SOLID', color: colorCharcoal }];
  modalEditor.appendChild(edHeader);

  // Tabs Row
  const edTabs = ["Intake Info", "Timeline Progress", "Resource Links", "AI Summary"];
  edTabs.forEach((tab, index) => {
    const tabBtn = figma.createFrame();
    tabBtn.name = `Tab: ${tab}`;
    tabBtn.x = 24 + (index * 130);
    tabBtn.y = 64;
    tabBtn.resize(120, 36);
    tabBtn.fills = [];
    
    if (index === 0) {
      const underline = figma.createFrame();
      underline.resize(120, 3);
      underline.y = 33;
      underline.fills = [{ type: 'SOLID', color: colorLavender }];
      tabBtn.appendChild(underline);
    }
    
    const tabTxt = figma.createText();
    tabTxt.fontName = { family: "Inter", style: "Bold" };
    tabTxt.fontSize = 13;
    tabTxt.characters = tab;
    tabTxt.fills = [{ type: 'SOLID', color: index === 0 ? colorLavender : colorCharcoalMed }];
    tabTxt.textAlignHorizontal = 'CENTER';
    tabTxt.textAlignVertical = 'CENTER';
    tabBtn.appendChild(tabTxt);
    tabTxt.resize(120, 36);
    modalEditor.appendChild(tabBtn);
  });

  // Textarea input
  const areaLabel = figma.createText();
  areaLabel.x = 24;
  areaLabel.y = 130;
  areaLabel.fontName = { family: "Inter", style: "Bold" };
  areaLabel.fontSize = 13;
  areaLabel.characters = "Intake Information & Clinical Notes";
  areaLabel.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  modalEditor.appendChild(areaLabel);

  const textarea = figma.createFrame();
  textarea.x = 24;
  textarea.y = 156;
  textarea.resize(672, 340);
  textarea.cornerRadius = 8;
  textarea.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
  textarea.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  
  const areaTxt = figma.createText();
  areaTxt.x = 16;
  areaTxt.y = 16;
  areaTxt.resize(640, 300);
  areaTxt.fontName = { family: "Inter", style: "Regular" };
  areaTxt.fontSize = 13.5;
  areaTxt.characters = "Primary Caregiver: Maria Rivera (daughter).\nClient experiences memory lapses and sundowning agitation around 5:00 PM.\n\nRecommended actions:\n- Establish fixed late-afternoon routines.\n- Setup motion sensors on external exits.";
  areaTxt.fills = [{ type: 'SOLID', color: colorCharcoal }];
  textarea.appendChild(areaTxt);
  modalEditor.appendChild(textarea);

  // Footer buttons
  const btnCancel = figma.createFrame();
  btnCancel.x = 420;
  btnCancel.y = 540;
  btnCancel.resize(120, 44);
  btnCancel.cornerRadius = 8;
  btnCancel.fills = [{ type: 'SOLID', color: colorWhite }];
  btnCancel.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const cancelTxt = figma.createText();
  cancelTxt.fontName = { family: "Inter", style: "Semi Bold" };
  cancelTxt.fontSize = 14;
  cancelTxt.characters = "Cancel";
  cancelTxt.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  cancelTxt.textAlignHorizontal = 'CENTER';
  cancelTxt.textAlignVertical = 'CENTER';
  btnCancel.appendChild(cancelTxt);
  cancelTxt.resize(120, 44);
  modalEditor.appendChild(btnCancel);

  const btnSave = figma.createFrame();
  btnSave.x = 560;
  btnSave.y = 540;
  btnSave.resize(136, 44);
  btnSave.cornerRadius = 8;
  btnSave.fills = [{ type: 'SOLID', color: colorLavender }];
  const saveTxt = figma.createText();
  saveTxt.fontName = { family: "Inter", style: "Bold" };
  saveTxt.fontSize = 14;
  saveTxt.characters = "Save Changes";
  saveTxt.fills = [{ type: 'SOLID', color: colorWhite }];
  saveTxt.textAlignHorizontal = 'CENTER';
  saveTxt.textAlignVertical = 'CENTER';
  btnSave.appendChild(saveTxt);
  saveTxt.resize(136, 44);
  modalEditor.appendChild(btnSave);

  screens.push(modalEditor);

  // ----------------------------------------------------
  // SCREEN 8: VIEW REPORT DETAIL PAGE (1440x1024)
  // ----------------------------------------------------
  console.log("Generating Screen 8: Family Report Detail View...");
  const scrReportDetail = figma.createFrame();
  scrReportDetail.name = "8. Rivera Family Report Detail View";
  scrReportDetail.resize(1440, 1024);
  scrReportDetail.x = screenSpacing * 2;
  scrReportDetail.y = 1200;
  scrReportDetail.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.95 } }];

  scrReportDetail.appendChild(buildSidebar("family-report"));
  scrReportDetail.appendChild(buildHeader());

  const rdTitle = figma.createText();
  rdTitle.x = 300;
  rdTitle.y = 102;
  rdTitle.fontName = { family: "Outfit", style: "Bold" };
  rdTitle.fontSize = 28;
  rdTitle.characters = "Rivera Family Quarterly Report";
  rdTitle.fills = [{ type: 'SOLID', color: colorCharcoal }];
  scrReportDetail.appendChild(rdTitle);

  // Report Panel
  const reportPanel = figma.createFrame();
  reportPanel.name = "Report Content Card";
  reportPanel.x = 300;
  reportPanel.y = 164;
  reportPanel.resize(1100, 750);
  reportPanel.cornerRadius = 20;
  reportPanel.fills = [{ type: 'SOLID', color: colorWhite }];
  reportPanel.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  const reportHeader = figma.createText();
  reportHeader.x = 40;
  reportHeader.y = 40;
  reportHeader.fontName = { family: "Outfit", style: "Bold" };
  reportHeader.fontSize = 20;
  reportHeader.characters = "Quarterly Assessment Summary - Q2 2026";
  reportHeader.fills = [{ type: 'SOLID', color: colorCharcoal }];
  reportPanel.appendChild(reportHeader);

  // Report details text
  const reportBody = figma.createText();
  reportBody.x = 40;
  reportBody.y = 90;
  reportBody.resize(1020, 520);
  reportBody.fontName = { family: "Inter", style: "Regular" };
  reportBody.fontSize = 14;
  reportBody.characters = "Patient: Rivera Family (Elder Member: Sofia Rivera)\nAssigned CHW: Jane Doe\nStatus: Intake Complete\n\nClinical Overview:\nSofia has moderate dementia with primary behavioral symptom of late-afternoon agitation. Home safety audit conducted on June 10, 2026. Family successfully connected to caregiver support groups.\n\nCompleted Milestones:\n- Conducted home safety walkthrough.\n- Shared wander prevention sensor guide.\n- Added caregiver support directory links to library.\n\nAI Recommendations checklist:\n- Monitor sundowning calming routines.\n- Finalize sensor purchase checklist.";
  reportBody.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  reportPanel.appendChild(reportBody);

  // Close Case button
  const btnCloseCase = figma.createFrame();
  btnCloseCase.name = "Close Case Button";
  btnCloseCase.x = 40;
  btnCloseCase.y = 650;
  btnCloseCase.resize(180, 44);
  btnCloseCase.cornerRadius = 8;
  btnCloseCase.fills = [{ type: 'SOLID', color: { r: 0.78, g: 0.16, b: 0.16 } }];
  const btnCcTxt = figma.createText();
  btnCcTxt.fontName = { family: "Inter", style: "Bold" };
  btnCcTxt.fontSize = 14;
  btnCcTxt.characters = "Close Case / Archive";
  btnCcTxt.fills = [{ type: 'SOLID', color: colorWhite }];
  btnCcTxt.textAlignHorizontal = 'CENTER';
  btnCcTxt.textAlignVertical = 'CENTER';
  btnCloseCase.appendChild(btnCcTxt);
  btnCcTxt.resize(180, 44);
  reportPanel.appendChild(btnCloseCase);

  scrReportDetail.appendChild(reportPanel);
  screens.push(scrReportDetail);

  // ----------------------------------------------------
  // SCREEN 9: CLOSE CASE ARCHIVING OPTIONS (MODAL OVERLAY - 520x280)
  // ----------------------------------------------------
  console.log("Generating Screen 9: Close Case Archive Options Modal...");
  const modalArchive = figma.createFrame();
  modalArchive.name = "9. Archive Options Modal (Overlay)";
  modalArchive.resize(520, 280);
  modalArchive.x = screenSpacing * 3;
  modalArchive.y = 1200;
  modalArchive.cornerRadius = 20;
  modalArchive.fills = [{ type: 'SOLID', color: colorWhite }];
  modalArchive.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  const maHeader = figma.createText();
  maHeader.x = 24;
  maHeader.y = 24;
  maHeader.fontName = { family: "Outfit", style: "Bold" };
  maHeader.fontSize = 18;
  maHeader.characters = "Archive / Close Case";
  maHeader.fills = [{ type: 'SOLID', color: colorCharcoal }];
  modalArchive.appendChild(maHeader);

  const maBody = figma.createText();
  maBody.x = 24;
  maBody.y = 60;
  maBody.resize(472, 80);
  maBody.fontName = { family: "Inter", style: "Regular" };
  maBody.fontSize = 13.5;
  maBody.characters = "Would you like to save resource recommendations from this case to your library before closing?";
  maBody.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  modalArchive.appendChild(maBody);

  // Preview Box
  const previewBox = figma.createFrame();
  previewBox.x = 24;
  previewBox.y = 120;
  previewBox.resize(472, 54);
  previewBox.cornerRadius = 8;
  previewBox.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } }];
  previewBox.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const prTxt = figma.createText();
  prTxt.x = 16;
  prTxt.y = 19;
  prTxt.fontName = { family: "Inter", style: "Semi Bold" };
  prTxt.fontSize = 12;
  prTxt.characters = "Rivera Case Summary • Tag: case study, clinical";
  prTxt.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  previewBox.appendChild(prTxt);
  modalArchive.appendChild(previewBox);

  // Footer buttons row
  const btnArcCancel = figma.createFrame();
  btnArcCancel.x = 24;
  btnArcCancel.y = 210;
  btnArcCancel.resize(80, 38);
  btnArcCancel.cornerRadius = 6;
  btnArcCancel.fills = [{ type: 'SOLID', color: colorWhite }];
  btnArcCancel.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const arcCanTxt = figma.createText();
  arcCanTxt.fontName = { family: "Inter", style: "Semi Bold" };
  arcCanTxt.fontSize = 12;
  arcCanTxt.characters = "Cancel";
  arcCanTxt.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  arcCanTxt.textAlignHorizontal = 'CENTER';
  arcCanTxt.textAlignVertical = 'CENTER';
  btnArcCancel.appendChild(arcCanTxt);
  arcCanTxt.resize(80, 38);
  modalArchive.appendChild(btnArcCancel);

  // No Just Close
  const btnNoClose = figma.createFrame();
  btnNoClose.x = 120;
  btnNoClose.y = 210;
  btnNoClose.resize(100, 38);
  btnNoClose.cornerRadius = 6;
  btnNoClose.fills = [{ type: 'SOLID', color: colorWhite }];
  btnNoClose.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const noCloseTxt = figma.createText();
  noCloseTxt.fontName = { family: "Inter", style: "Semi Bold" };
  noCloseTxt.fontSize = 12;
  noCloseTxt.characters = "No, Just Close";
  noCloseTxt.fills = [{ type: 'SOLID', color: { r: 0.78, g: 0.16, b: 0.16 } }];
  noCloseTxt.textAlignHorizontal = 'CENTER';
  noCloseTxt.textAlignVertical = 'CENTER';
  btnNoClose.appendChild(noCloseTxt);
  noCloseTxt.resize(100, 38);
  modalArchive.appendChild(btnNoClose);

  // Add to Practices
  const btnAddPrac = figma.createFrame();
  btnAddPrac.x = 230;
  btnAddPrac.y = 210;
  btnAddPrac.resize(120, 38);
  btnAddPrac.cornerRadius = 6;
  btnAddPrac.fills = [{ type: 'SOLID', color: colorWhite }];
  btnAddPrac.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  const addPracTxt = figma.createText();
  addPracTxt.fontName = { family: "Inter", style: "Semi Bold" };
  addPracTxt.fontSize = 12;
  addPracTxt.characters = "Add to Practices";
  addPracTxt.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  addPracTxt.textAlignHorizontal = 'CENTER';
  addPracTxt.textAlignVertical = 'CENTER';
  btnAddPrac.appendChild(addPracTxt);
  addPracTxt.resize(120, 38);
  modalArchive.appendChild(btnAddPrac);

  // Add to Resources
  const btnAddRes = figma.createFrame();
  btnAddRes.x = 360;
  btnAddRes.y = 210;
  btnAddRes.resize(136, 38);
  btnAddRes.cornerRadius = 6;
  btnAddRes.fills = [{ type: 'SOLID', color: colorLavender }];
  const addResTxt = figma.createText();
  addResTxt.fontName = { family: "Inter", style: "Bold" };
  addResTxt.fontSize = 12;
  addResTxt.characters = "Add to Resources";
  addResTxt.fills = [{ type: 'SOLID', color: colorWhite }];
  addResTxt.textAlignHorizontal = 'CENTER';
  addResTxt.textAlignVertical = 'CENTER';
  btnAddRes.appendChild(addResTxt);
  addResTxt.resize(136, 38);
  modalArchive.appendChild(btnAddRes);

  screens.push(modalArchive);

  // ----------------------------------------------------
  // FINALIZE VIEWPORT
  // ----------------------------------------------------
  figma.viewport.scrollAndZoomIntoView(screens);
  console.log("All 9 screen frames drawn successfully!");
})();

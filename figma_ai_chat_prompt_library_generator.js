// FIGMA AI CHAT WITH PROMPT LIBRARY OVERLAY GENERATOR
// Paste this code into Figma Console (Ctrl + Alt + I / Cmd + Option + I)
(async () => {
  console.log("Loading typography assets...");
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" }),
    figma.loadFontAsync({ family: "Outfit", style: "Bold" })
  ]);

  // COLORS (Sage & Lavender theme)
  const colorSage = { r: 0.82, g: 0.83, b: 0.78 };       // #D2D4C8
  const colorCream = { r: 0.88, g: 0.89, b: 0.86 };      // #E0E2DB
  const colorCharcoal = { r: 0.16, g: 0.17, b: 0.16 };   // #2A2B2A
  const colorCharcoalMed = { r: 0.29, g: 0.29, b: 0.29 };// #4A4B4A
  const colorLavender = { r: 0.61, g: 0.54, b: 0.72 };   // #9C89B8
  const colorLavenderLight = { r: 0.73, g: 0.67, b: 0.82 };// #B6A6C4
  const colorLavenderGlow = { r: 0.93, g: 0.91, b: 0.96 };// #edeaf4
  const colorWhite = { r: 1, g: 1, b: 1 };
  const colorGreyLight = { r: 0.96, g: 0.96, b: 0.96 };
  const colorGreyBorder = { r: 0.88, g: 0.88, b: 0.88 };

  const page = figma.currentPage;

  // ----------------------------------------------------
  // 1. GENERATE THE PROMPT LIBRARY OVERLAY FRAME
  // ----------------------------------------------------
  console.log("Generating Prompt Library Overlay Frame...");
  const overlay = figma.createFrame();
  overlay.name = "3b. Prompt Library Overlay";
  overlay.resize(680, 780);
  overlay.cornerRadius = 16;
  overlay.fills = [{ type: 'SOLID', color: colorWhite }];
  overlay.strokes = [{ type: 'SOLID', color: colorSage }];
  overlay.strokeAlign = 'INSIDE';
  overlay.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.15 },
    offset: { x: 0, y: 4 },
    radius: 20,
    visible: true,
    blendMode: 'NORMAL'
  }];

  // Header Title
  const title = figma.createText();
  title.x = 30; title.y = 30;
  title.fontName = { family: "Outfit", style: "Bold" };
  title.fontSize = 22; title.characters = "Prompt Library";
  title.fills = [{ type: 'SOLID', color: colorCharcoal }];
  overlay.appendChild(title);

  // Close Button "✕"
  const btnClose = figma.createFrame();
  btnClose.name = "BtnClose";
  btnClose.x = 615; btnClose.y = 25; btnClose.resize(34, 34);
  btnClose.cornerRadius = 17;
  btnClose.fills = [{ type: 'SOLID', color: colorGreyLight }];
  const closeTxt = figma.createText();
  closeTxt.fontName = { family: "Inter", style: "Bold" };
  closeTxt.fontSize = 16; closeTxt.characters = "✕";
  closeTxt.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  closeTxt.textAlignHorizontal = 'CENTER'; closeTxt.textAlignVertical = 'CENTER';
  btnClose.appendChild(closeTxt); closeTxt.resize(34, 34);
  overlay.appendChild(btnClose);

  // Subtitle
  const subtitle = figma.createText();
  subtitle.x = 30; subtitle.y = 66;
  subtitle.fontName = { family: "Inter", style: "Regular" };
  subtitle.fontSize = 13.5; subtitle.characters = "Select a curated, personal prompt to insert directly into your active chat.";
  subtitle.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  overlay.appendChild(subtitle);

  // Prompts Library Content (Categories & Cards)
  const categories = [
    {
      title: "First Encounters & Rapport",
      prompts: [
        "How do I build rapport during my first conversation with a new family?",
        "Can we roleplay an approach for a first conversation with a hesitant patient?"
      ]
    },
    {
      title: "Navigating Difficult Conversations",
      prompts: [
        "Help me prepare for a conversation with a family member who is in denial.",
        "What is the best way to bring up transitioning a patient to an old age home?",
        "How can I gently tell a caregiver they need to focus on self-care without guilt?"
      ]
    },
    {
      title: "Expectations & Advocacy",
      prompts: [
        "How do I manage a family's unrealistic expectations about recovery?",
        "What are some strategies I can use to help this family advocate for themselves?"
      ]
    }
  ];

  let currentY = 110;

  // Draw sections & prompt cards
  for (let catIdx = 0; catIdx < categories.length; catIdx++) {
    const cat = categories[catIdx];
    
    // Category Heading
    const catHead = figma.createText();
    catHead.x = 30; catHead.y = currentY;
    catHead.fontName = { family: "Inter", style: "Bold" };
    catHead.fontSize = 14; catHead.characters = cat.title;
    catHead.fills = [{ type: 'SOLID', color: colorLavender }];
    overlay.appendChild(catHead);
    currentY += 24;

    for (let pIdx = 0; pIdx < cat.prompts.length; pIdx++) {
      const promptText = cat.prompts[pIdx];

      // Card Container
      const card = figma.createFrame();
      card.name = `PromptCard_${catIdx}_${pIdx}`;
      card.x = 30; card.y = currentY; card.resize(620, 52);
      card.cornerRadius = 8;
      card.fills = [{ type: 'SOLID', color: colorGreyLight }];
      card.strokes = [{ type: 'SOLID', color: colorGreyBorder }];
      card.strokeAlign = 'INSIDE';

      // Card Text Label
      const label = figma.createText();
      label.x = 16; label.y = 17; label.resize(588, 18);
      label.fontName = { family: "Inter", style: "Semi Bold" };
      label.fontSize = 12.5; label.characters = `"${promptText}"`;
      label.fills = [{ type: 'SOLID', color: colorCharcoal }];
      card.appendChild(label);
      overlay.appendChild(card);

      // Wire each prompt card click to CLOSE the overlay
      try {
        await card.setReactionsAsync([{
          trigger: { type: 'ON_CLICK' },
          actions: [{
            type: 'NODE',
            navigation: 'CLOSE'
          }]
        }]);
      } catch(e) {
        console.warn("Card reaction setup error, using fallback...", e);
        await card.setReactionsAsync([{
          trigger: { type: 'ON_CLICK' },
          actions: [{ type: 'BACK' }]
        }]);
      }

      currentY += 62;
    }
    currentY += 15;
  }

  // Wire Close Button to CLOSE the overlay
  try {
    await btnClose.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{
        type: 'NODE',
        navigation: 'CLOSE'
      }]
    }]);
  } catch (e) {
    await btnClose.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{ type: 'BACK' }]
    }]);
  }


  // ----------------------------------------------------
  // 2. GENERATE THE UPDATED AI CHAT VIEW SCREEN
  // ----------------------------------------------------
  console.log("Generating AI Chat View Screen Frame...");
  const frame = figma.createFrame();
  frame.name = "3. AI Chat View (Prompt Library)";
  frame.resize(1440, 1024);
  frame.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.95 } }];

  // Sidebar
  const sidebar = figma.createFrame();
  sidebar.name = "Sidebar"; sidebar.resize(270, 1024);
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
    { name: "Case Card", active: false },
    { name: "AI Chat", active: true },
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

  // Header
  const header = figma.createFrame();
  header.name = "Header"; header.resize(1170, 70); header.x = 270; header.y = 0;
  header.fills = [{ type: 'SOLID', color: colorCream }];
  header.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];
  
  const headerTitle = figma.createText();
  headerTitle.x = 30; headerTitle.y = 26;
  headerTitle.fontName = { family: "Outfit", style: "Bold" };
  headerTitle.fontSize = 18; headerTitle.characters = "AI Chat Assistant";
  headerTitle.fills = [{ type: 'SOLID', color: colorCharcoal }];
  header.appendChild(headerTitle);
  frame.appendChild(header);

  // Main Chat Container Panel
  const chatContainer = figma.createFrame();
  chatContainer.name = "Chat Container";
  chatContainer.x = 300; chatContainer.y = 100;
  chatContainer.resize(1110, 890);
  chatContainer.cornerRadius = 20;
  chatContainer.fills = [{ type: 'SOLID', color: colorWhite }];
  chatContainer.strokes = [{ type: 'SOLID', color: { r: 0.79, g: 0.80, b: 0.76 } }];

  // Welcome message bubble
  const welcomeBubble = figma.createFrame();
  welcomeBubble.x = 30; welcomeBubble.y = 30; welcomeBubble.resize(550, 110);
  welcomeBubble.cornerRadius = 12;
  welcomeBubble.fills = [{ type: 'SOLID', color: colorLavenderGlow }];
  
  const welcomeTxt = figma.createText();
  welcomeTxt.x = 20; welcomeTxt.y = 20; welcomeTxt.resize(510, 70);
  welcomeTxt.fontName = { family: "Inter", style: "Regular" };
  welcomeTxt.fontSize = 13.5;
  welcomeTxt.characters = "Welcome, Jane! I am your AI guide for Alzheimer's community care. You can use me to think through difficult conversations or to quickly find curated, approved resources. Select a guideline below to begin, or ask me anything.";
  welcomeTxt.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  welcomeBubble.appendChild(welcomeTxt);
  chatContainer.appendChild(welcomeBubble);

  // Suggestions Cards on the Right
  const cards = [
    { label: "First Encounters & Rapport", x: 610, y: 30, active: true },
    { label: "Expectations & Advocacy", x: 860, y: 30, active: true },
    { label: "Navigating Difficult Conversations", x: 610, y: 130, active: false },
    { label: "Communication Hurdles", x: 860, y: 130, active: false }
  ];
  cards.forEach(c => {
    const card = figma.createFrame();
    card.x = c.x; card.y = c.y; card.resize(230, 80); card.cornerRadius = 10;
    card.fills = c.active ? [{ type: 'SOLID', color: colorLavender }] : [{ type: 'SOLID', color: colorGreyBorder }];
    
    const cardTxt = figma.createText();
    cardTxt.x = 16; cardTxt.y = 16; cardTxt.resize(198, 48);
    cardTxt.fontName = { family: "Inter", style: "Bold" };
    cardTxt.fontSize = 13; cardTxt.characters = c.label;
    cardTxt.fills = [{ type: 'SOLID', color: c.active ? colorWhite : colorCharcoalMed }];
    card.appendChild(cardTxt);
    chatContainer.appendChild(card);
  });

  // Bottom Input Box
  const inputBar = figma.createFrame();
  inputBar.name = "InputBar";
  inputBar.x = 30; inputBar.y = 810; inputBar.resize(850, 50);
  inputBar.cornerRadius = 8;
  inputBar.fills = [{ type: 'SOLID', color: colorGreyLight }];
  inputBar.strokes = [{ type: 'SOLID', color: colorGreyBorder }];
  inputBar.strokeAlign = 'INSIDE';

  const inputTxt = figma.createText();
  inputTxt.x = 16; inputTxt.y = 18;
  inputTxt.fontName = { family: "Inter", style: "Regular" };
  inputTxt.fontSize = 13.5; inputTxt.characters = "Ask AI Companion a question...";
  inputTxt.fills = [{ type: 'SOLID', color: { r: 0.59, g: 0.60, b: 0.59 } }];
  inputBar.appendChild(inputTxt);
  chatContainer.appendChild(inputBar);

  // NEW WIDGET BUTTON: Prompt Library
  const btnPromptLibrary = figma.createFrame();
  btnPromptLibrary.name = "BtnPromptLibrary";
  btnPromptLibrary.x = 900; btnPromptLibrary.y = 810; btnPromptLibrary.resize(180, 50);
  btnPromptLibrary.cornerRadius = 8;
  btnPromptLibrary.fills = [{ type: 'SOLID', color: colorLavenderGlow }];
  btnPromptLibrary.strokes = [{ type: 'SOLID', color: colorLavender }];
  btnPromptLibrary.strokeAlign = 'INSIDE';

  const plTxt = figma.createText();
  plTxt.fontName = { family: "Inter", style: "Bold" };
  plTxt.fontSize = 13.5; plTxt.characters = "📚 Prompt Library";
  plTxt.fills = [{ type: 'SOLID', color: colorLavender }];
  plTxt.textAlignHorizontal = 'CENTER'; plTxt.textAlignVertical = 'CENTER';
  btnPromptLibrary.appendChild(plTxt); plTxt.resize(180, 50);
  chatContainer.appendChild(btnPromptLibrary);

  frame.appendChild(chatContainer);

  // Position frames side by side in the workspace
  overlay.x = 1500;
  overlay.y = 100;
  page.appendChild(overlay);
  page.appendChild(frame);

  // ----------------------------------------------------
  // 3. WIRE PROTOTYPE INTERACTION: OPEN OVERLAY
  // ----------------------------------------------------
  console.log("Wiring prompt library overlay interactions...");
  try {
    await btnPromptLibrary.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{
        type: 'NODE',
        navigation: 'OVERLAY',
        destinationId: overlay.id,
        transition: { type: 'DISSOLVE', duration: 0.15 },
        overlayPositionType: 'CENTER',
        overlayBackground: { type: 'SOLID_COLOR', color: { r: 0, g: 0, b: 0, a: 0.4 } },
        overlayBackgroundInteraction: 'CLOSE_ON_CLICK_OUTSIDE'
      }]
    }]);
    console.log("Interactions wired successfully!");
  } catch (e) {
    console.log("Interaction binding warning, trying standard navigation overlay fallback...", e);
    await btnPromptLibrary.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{
        type: 'NODE',
        navigation: 'OVERLAY',
        destinationId: overlay.id
      }]
    }]);
  }

  // Scroll viewport to show the frames
  figma.viewport.scrollAndZoomIntoView([frame, overlay]);
  console.log("AI Chat View & Prompt Library Overlay frames successfully generated side-by-side!");
})();

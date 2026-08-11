// FIGMA SHARE CASE CARD OVERLAY GENERATOR
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
  const colorLavenderGlow = { r: 0.93, g: 0.91, b: 0.96 };// #edeaf4
  const colorWhite = { r: 1, g: 1, b: 1 };
  const colorGreyLight = { r: 0.96, g: 0.96, b: 0.96 };
  const colorGreyBorder = { r: 0.88, g: 0.88, b: 0.88 };

  const page = figma.currentPage;

  // ----------------------------------------------------
  // BUILD MASTER INTERACTIVE CHECKBOX COMPONENT SET
  // ----------------------------------------------------
  console.log("Creating Interactive Checkbox Component Set...");
  const v1Unchecked = figma.createComponent();
  v1Unchecked.name = "Checked=False";
  v1Unchecked.resize(20, 20);
  v1Unchecked.cornerRadius = 4;
  v1Unchecked.fills = [{ type: 'SOLID', color: colorWhite }];
  v1Unchecked.strokes = [{ type: 'SOLID', color: { r: 0.7, g: 0.7, b: 0.7 } }];
  v1Unchecked.strokeAlign = 'INSIDE';

  const v2Checked = figma.createComponent();
  v2Checked.name = "Checked=True";
  v2Checked.resize(20, 20);
  v2Checked.cornerRadius = 4;
  v2Checked.fills = [{ type: 'SOLID', color: colorLavender }];
  v2Checked.strokes = [{ type: 'SOLID', color: colorLavender }];
  v2Checked.strokeAlign = 'INSIDE';

  // Draw checkmark symbol inside Checked variant
  const checkTxt = figma.createText();
  checkTxt.fontName = { family: "Inter", style: "Bold" };
  checkTxt.fontSize = 12;
  checkTxt.characters = "✓";
  checkTxt.fills = [{ type: 'SOLID', color: colorWhite }];
  checkTxt.textAlignHorizontal = 'CENTER';
  checkTxt.textAlignVertical = 'CENTER';
  v2Checked.appendChild(checkTxt);
  checkTxt.resize(20, 20);

  const checkboxSet = figma.combineAsVariants([v1Unchecked, v2Checked], page);
  checkboxSet.name = "Interactive Checkbox Set";
  checkboxSet.x = -600;
  checkboxSet.y = 400;

  // Set toggle interactions
  await v1Unchecked.setReactionsAsync([{
    trigger: { type: 'ON_CLICK' },
    actions: [{
      type: 'NODE',
      navigation: 'CHANGE_TO',
      destinationId: v2Checked.id,
      transition: { type: 'SMART_ANIMATE', duration: 0.1, easing: { type: 'LINEAR' } }
    }]
  }]);

  await v2Checked.setReactionsAsync([{
    trigger: { type: 'ON_CLICK' },
    actions: [{
      type: 'NODE',
      navigation: 'CHANGE_TO',
      destinationId: v1Unchecked.id,
      transition: { type: 'SMART_ANIMATE', duration: 0.1, easing: { type: 'LINEAR' } }
    }]
  }]);

  function instantiateCheckbox(x, y, isChecked = false) {
    const defaultComp = checkboxSet.defaultVariant || checkboxSet.children[0];
    const inst = defaultComp.createInstance();
    inst.x = x;
    inst.y = y;
    inst.setProperties({ "Checked": isChecked ? "True" : "False" });
    return inst;
  }

  // ----------------------------------------------------
  // GENERATE THE SHARE OVERLAY FRAME
  // ----------------------------------------------------
  console.log("Generating Share Overlay Frame...");
  const overlay = figma.createFrame();
  overlay.name = "9b. Share Case Card Overlay";
  overlay.resize(520, 620);
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
  title.x = 24; title.y = 24;
  title.fontName = { family: "Outfit", style: "Bold" };
  title.fontSize = 20; title.characters = "Share Case Card";
  title.fills = [{ type: 'SOLID', color: colorCharcoal }];
  overlay.appendChild(title);

  // Close Button "✕"
  const btnClose = figma.createFrame();
  btnClose.name = "BtnClose";
  btnClose.x = 466; btnClose.y = 20; btnClose.resize(30, 30);
  btnClose.cornerRadius = 15;
  btnClose.fills = [{ type: 'SOLID', color: colorGreyLight }];
  const closeTxt = figma.createText();
  closeTxt.fontName = { family: "Inter", style: "Bold" };
  closeTxt.fontSize = 14; closeTxt.characters = "✕";
  closeTxt.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  closeTxt.textAlignHorizontal = 'CENTER'; closeTxt.textAlignVertical = 'CENTER';
  btnClose.appendChild(closeTxt); closeTxt.resize(30, 30);
  overlay.appendChild(btnClose);

  // Preview Box (Rivera Family Preview)
  const previewBox = figma.createFrame();
  previewBox.name = "PreviewBox";
  previewBox.x = 24; previewBox.y = 80; previewBox.resize(472, 86);
  previewBox.cornerRadius = 8;
  previewBox.fills = [{ type: 'SOLID', color: colorLavenderGlow }];
  previewBox.strokes = [{ type: 'SOLID', color: colorLavender }];
  previewBox.strokeAlign = 'INSIDE';

  // Preview Badge
  const badge = figma.createFrame();
  badge.x = 16; badge.y = 12; badge.resize(96, 20);
  badge.cornerRadius = 4;
  badge.fills = [{ type: 'SOLID', color: colorLavender }];
  const badgeTxt = figma.createText();
  badgeTxt.fontName = { family: "Inter", style: "Bold" };
  badgeTxt.fontSize = 10; badgeTxt.characters = "Shared Preview";
  badgeTxt.fills = [{ type: 'SOLID', color: colorWhite }];
  badgeTxt.textAlignHorizontal = 'CENTER'; badgeTxt.textAlignVertical = 'CENTER';
  badge.appendChild(badgeTxt); badgeTxt.resize(96, 20);
  previewBox.appendChild(badge);

  // Preview Text
  const previewTxt = figma.createText();
  previewTxt.x = 16; previewTxt.y = 44; previewTxt.resize(440, 30);
  previewTxt.fontName = { family: "Inter", style: "Regular" };
  previewTxt.fontSize = 13;
  previewTxt.characters = "Sharing case card details for: Rivera Family (Intake Active)";
  previewTxt.fills = [{ type: 'SOLID', color: colorCharcoal }];
  previewBox.appendChild(previewTxt);
  overlay.appendChild(previewBox);

  // Search User Search Field
  const lblSearch = figma.createText();
  lblSearch.x = 24; lblSearch.y = 190;
  lblSearch.fontName = { family: "Inter", style: "Semi Bold" };
  lblSearch.fontSize = 13; lblSearch.characters = "Search users within organization";
  lblSearch.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  overlay.appendChild(lblSearch);

  const inpSearch = figma.createFrame();
  inpSearch.x = 24; inpSearch.y = 214; inpSearch.resize(472, 44);
  inpSearch.cornerRadius = 8;
  inpSearch.fills = [{ type: 'SOLID', color: colorGreyLight }];
  inpSearch.strokes = [{ type: 'SOLID', color: colorGreyBorder }];
  inpSearch.strokeAlign = 'INSIDE';

  const inpSearchTxt = figma.createText();
  inpSearchTxt.x = 16; inpSearchTxt.y = 15;
  inpSearchTxt.fontName = { family: "Inter", style: "Regular" };
  inpSearchTxt.fontSize = 13; inpSearchTxt.characters = "Type name, email, or role...";
  inpSearchTxt.fills = [{ type: 'SOLID', color: { r: 0.59, g: 0.60, b: 0.59 } }];
  inpSearch.appendChild(inpSearchTxt);
  overlay.appendChild(inpSearch);

  // Organizational User Rows
  const users = [
    { name: "Marcus Aurelius", initials: "MA", role: "CHW Specialist", isChecked: true },
    { name: "Sarah Connor", initials: "SC", role: "CHW (Event Manager)", isChecked: false },
    { name: "Robert Mercer", initials: "RM", role: "CHW Supervisor", isChecked: false }
  ];

  users.forEach((usr, idx) => {
    const rowY = 280 + (idx * 68);
    const row = figma.createFrame();
    row.name = `UserRow_${idx}`;
    row.x = 24; row.y = rowY; row.resize(472, 54);
    row.fills = []; // transparent container

    // Clickable Checkbox
    const chk = instantiateCheckbox(12, 17, usr.isChecked);
    row.appendChild(chk);

    // Avatar
    const avatar = figma.createFrame();
    avatar.x = 48; avatar.y = 10; avatar.resize(34, 34);
    avatar.cornerRadius = 17;
    avatar.fills = [{ type: 'SOLID', color: colorSage }];
    const avTxt = figma.createText();
    avTxt.fontName = { family: "Inter", style: "Bold" };
    avTxt.fontSize = 12; avTxt.characters = usr.initials;
    avTxt.fills = [{ type: 'SOLID', color: colorCharcoal }];
    avTxt.textAlignHorizontal = 'CENTER'; avTxt.textAlignVertical = 'CENTER';
    avatar.appendChild(avTxt); avTxt.resize(34, 34);
    row.appendChild(avatar);

    // Name & Role labels
    const uName = figma.createText();
    uName.x = 96; uName.y = 10;
    uName.fontName = { family: "Inter", style: "Semi Bold" };
    uName.fontSize = 13; uName.characters = usr.name;
    uName.fills = [{ type: 'SOLID', color: colorCharcoal }];
    row.appendChild(uName);

    const uRole = figma.createText();
    uRole.x = 96; uRole.y = 28;
    uRole.fontName = { family: "Inter", style: "Regular" };
    uRole.fontSize = 11; uRole.characters = usr.role;
    uRole.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
    row.appendChild(uRole);

    overlay.appendChild(row);
  });

  // Footer Buttons
  const divider = figma.createFrame();
  divider.name = "Divider";
  divider.x = 24; divider.y = 540; divider.resize(472, 1);
  divider.fills = [{ type: 'SOLID', color: colorGreyBorder }];
  overlay.appendChild(divider);

  const btnCancel = figma.createFrame();
  btnCancel.name = "BtnCancel";
  btnCancel.x = 210; btnCancel.y = 556; btnCancel.resize(120, 40);
  btnCancel.cornerRadius = 8;
  btnCancel.fills = [{ type: 'SOLID', color: colorWhite }];
  btnCancel.strokes = [{ type: 'SOLID', color: colorGreyBorder }];
  btnCancel.strokeAlign = 'INSIDE';
  const cancelTxt = figma.createText();
  cancelTxt.fontName = { family: "Inter", style: "Semi Bold" };
  cancelTxt.fontSize = 13.5; cancelTxt.characters = "Cancel";
  cancelTxt.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  cancelTxt.textAlignHorizontal = 'CENTER'; cancelTxt.textAlignVertical = 'CENTER';
  btnCancel.appendChild(cancelTxt); cancelTxt.resize(120, 40);
  overlay.appendChild(btnCancel);

  const btnShare = figma.createFrame();
  btnShare.name = "BtnShare";
  btnShare.x = 346; btnShare.y = 556; btnShare.resize(150, 40);
  btnShare.cornerRadius = 8;
  btnShare.fills = [{ type: 'SOLID', color: colorLavender }];
  const shareTxt = figma.createText();
  shareTxt.fontName = { family: "Inter", style: "Bold" };
  shareTxt.fontSize = 13.5; shareTxt.characters = "Share Case Card";
  shareTxt.fills = [{ type: 'SOLID', color: colorWhite }];
  shareTxt.textAlignHorizontal = 'CENTER'; shareTxt.textAlignVertical = 'CENTER';
  btnShare.appendChild(shareTxt); shareTxt.resize(150, 40);
  overlay.appendChild(btnShare);

  page.appendChild(overlay);

  // ----------------------------------------------------
  // WIRE OVERLAY PROTOTYPE CLOSE REACTIONS
  // ----------------------------------------------------
  const closers = [btnClose, btnCancel, btnShare];
  for (let cNode of closers) {
    try {
      await cNode.setReactionsAsync([{
        trigger: { type: 'ON_CLICK' },
        actions: [{
          type: 'NODE',
          navigation: 'CLOSE'
        }]
      }]);
    } catch(e) {
      console.log("Close binding warning, using fallback...", e);
      await cNode.setReactionsAsync([{
        trigger: { type: 'ON_CLICK' },
        actions: [{ type: 'BACK' }]
      }]);
    }
  }

  // Scroll view
  figma.viewport.scrollAndZoomIntoView([overlay]);
  console.log("Share Case Card Overlay frame successfully generated!");
})();

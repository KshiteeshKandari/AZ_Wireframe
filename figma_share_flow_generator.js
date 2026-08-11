// FIGMA COMPLETE SHARE FLOW GENERATOR (MODAL + SUCCESS TOAST)
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
  checkboxSet.name = "Flow Checkbox Set";
  checkboxSet.x = -600;
  checkboxSet.y = 800;

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
  // GENERATE FRAME 1: THE SHARE OVERLAY
  // ----------------------------------------------------
  console.log("Generating Share Overlay Frame...");
  const overlayShare = figma.createFrame();
  overlayShare.name = "9b. Share Case Card Overlay";
  overlayShare.resize(520, 620);
  overlayShare.cornerRadius = 16;
  overlayShare.fills = [{ type: 'SOLID', color: colorWhite }];
  overlayShare.strokes = [{ type: 'SOLID', color: colorSage }];
  overlayShare.strokeAlign = 'INSIDE';
  overlayShare.effects = [{
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
  overlayShare.appendChild(title);

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
  overlayShare.appendChild(btnClose);

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
  overlayShare.appendChild(previewBox);

  // Search User Search Field
  const lblSearch = figma.createText();
  lblSearch.x = 24; lblSearch.y = 190;
  lblSearch.fontName = { family: "Inter", style: "Semi Bold" };
  lblSearch.fontSize = 13; lblSearch.characters = "Search users within organization";
  lblSearch.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  overlayShare.appendChild(lblSearch);

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
  overlayShare.appendChild(inpSearch);

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

    overlayShare.appendChild(row);
  });

  // Footer Buttons
  const divider = figma.createFrame();
  divider.name = "Divider";
  divider.x = 24; divider.y = 540; divider.resize(472, 1);
  divider.fills = [{ type: 'SOLID', color: colorGreyBorder }];
  overlayShare.appendChild(divider);

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
  overlayShare.appendChild(btnCancel);

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
  overlayShare.appendChild(btnShare);


  // ----------------------------------------------------
  // GENERATE FRAME 2: THE SUCCESS DIALOG OVERLAY
  // ----------------------------------------------------
  console.log("Generating Success Overlay Frame...");
  const overlaySuccess = figma.createFrame();
  overlaySuccess.name = "9c. Share Success Dialog";
  overlaySuccess.resize(420, 260);
  overlaySuccess.cornerRadius = 16;
  overlaySuccess.fills = [{ type: 'SOLID', color: colorWhite }];
  overlaySuccess.strokes = [{ type: 'SOLID', color: colorSage }];
  overlaySuccess.strokeAlign = 'INSIDE';
  overlaySuccess.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.15 },
    offset: { x: 0, y: 4 },
    radius: 20,
    visible: true,
    blendMode: 'NORMAL'
  }];

  // Success Checkmark Circle Badge
  const checkCircle = figma.createFrame();
  checkCircle.x = 178; checkCircle.y = 30; checkCircle.resize(64, 64);
  checkCircle.cornerRadius = 32;
  checkCircle.fills = [{ type: 'SOLID', color: colorLavenderGlow }];
  checkCircle.strokes = [{ type: 'SOLID', color: colorLavender }];
  checkCircle.strokeAlign = 'INSIDE';

  const checkMark = figma.createText();
  checkMark.fontName = { family: "Inter", style: "Bold" };
  checkMark.fontSize = 28; checkMark.characters = "✓";
  checkMark.fills = [{ type: 'SOLID', color: colorLavender }];
  checkMark.textAlignHorizontal = 'CENTER'; checkMark.textAlignVertical = 'CENTER';
  checkCircle.appendChild(checkMark); checkMark.resize(64, 64);
  overlaySuccess.appendChild(checkCircle);

  // Success Header text
  const successHeader = figma.createText();
  successHeader.x = 20; successHeader.y = 114; successHeader.resize(380, 24);
  successHeader.fontName = { family: "Outfit", style: "Bold" };
  successHeader.fontSize = 18; successHeader.characters = "Case Shared Successfully!";
  successHeader.fills = [{ type: 'SOLID', color: colorCharcoal }];
  successHeader.textAlignHorizontal = 'CENTER';
  overlaySuccess.appendChild(successHeader);

  // Success Description Text
  const successDesc = figma.createText();
  successDesc.x = 30; successDesc.y = 142; successDesc.resize(360, 40);
  successDesc.fontName = { family: "Inter", style: "Regular" };
  successDesc.fontSize = 12.5;
  successDesc.characters = "The Case Card has been shared with the selected team members in your organization.";
  successDesc.fills = [{ type: 'SOLID', color: colorCharcoalMed }];
  successDesc.textAlignHorizontal = 'CENTER';
  overlaySuccess.appendChild(successDesc);

  // Success Done Button
  const btnDone = figma.createFrame();
  btnDone.name = "BtnDone";
  btnDone.x = 140; btnDone.y = 200; btnDone.resize(140, 36);
  btnDone.cornerRadius = 8;
  btnDone.fills = [{ type: 'SOLID', color: colorLavender }];
  const doneTxt = figma.createText();
  doneTxt.fontName = { family: "Inter", style: "Bold" };
  doneTxt.fontSize = 13; doneTxt.characters = "Done";
  doneTxt.fills = [{ type: 'SOLID', color: colorWhite }];
  doneTxt.textAlignHorizontal = 'CENTER'; doneTxt.textAlignVertical = 'CENTER';
  btnDone.appendChild(doneTxt); doneTxt.resize(140, 36);
  overlaySuccess.appendChild(btnDone);


  // Place them side-by-side in the current page
  overlayShare.x = 100;
  overlayShare.y = 100;
  overlaySuccess.x = 680;
  overlaySuccess.y = 100;

  page.appendChild(overlayShare);
  page.appendChild(overlaySuccess);


  // ----------------------------------------------------
  // WIRE PROTOTYPE REACTIONS
  // ----------------------------------------------------
  console.log("Wiring sharing flow reactions...");

  // Close and Cancel buttons on Share Modal close the overlay
  const closers = [btnClose, btnCancel];
  for (let node of closers) {
    try {
      await node.setReactionsAsync([{
        trigger: { type: 'ON_CLICK' },
        actions: [{
          type: 'NODE',
          navigation: 'CLOSE'
        }]
      }]);
    } catch(e) {
      await node.setReactionsAsync([{
        trigger: { type: 'ON_CLICK' },
        actions: [{ type: 'BACK' }]
      }]);
    }
  }

  // Click "Share Case Card" swaps the overlay to show the Success Dialog
  try {
    await btnShare.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{
        type: 'NODE',
        navigation: 'SWAP',
        destinationId: overlaySuccess.id,
        transition: { type: 'SMART_ANIMATE', duration: 0.15, easing: { type: 'EASE_OUT' } }
      }]
    }]);
  } catch(e) {
    console.warn("Overlay swap error, using fallback navigation...", e);
    await btnShare.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{
        type: 'NODE',
        navigation: 'OVERLAY',
        destinationId: overlaySuccess.id
      }]
    }]);
  }

  // Done button on the Success Modal closes the overlay flow entirely
  try {
    await btnDone.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{
        type: 'NODE',
        navigation: 'CLOSE'
      }]
    }]);
  } catch(e) {
    await btnDone.setReactionsAsync([{
      trigger: { type: 'ON_CLICK' },
      actions: [{ type: 'BACK' }]
    }]);
  }

  figma.viewport.scrollAndZoomIntoView([overlayShare, overlaySuccess]);
  console.log("Complete Share Flow (Share Dialog & Success Toast) generated successfully side-by-side!");
})();

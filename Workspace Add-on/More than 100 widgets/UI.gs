const headerCard = CardService.newCardHeader()
  .setTitle('An alternate to displaying more than 100 widgets/sections.')
  .setImageUrl('https://script.gs/content/images/2022/11/custom-functions-logo.jpeg')
  .setImageStyle(CardService.ImageStyle.SQUARE);

const footerCard = CardService.newFixedFooter()
  .setPrimaryButton(CardService.newTextButton()
    .setText('FOLLOW')
    .setBackgroundColor("#f57c00")
    .setOpenLink(CardService.newOpenLink()
      .setUrl('https://twitter.com/intent/follow?screen_name=choraria')))
  .setSecondaryButton(CardService.newTextButton()
    .setText('READ MORE')
    .setOpenLink(CardService.newOpenLink()
      .setUrl('https://script.gs/')));

function sheetsHome(e) {
  const userInput = e.formInput && e.formInput !== '' ? e.formInput['searchInput'] : null;

  const rawData = functions;

  let newData = rawData.sort((a, b) => a.name < b.name ? -1 : (a.name > b.name ? 1 : 0))
  let userFiltered
  try {
    userFiltered = newData.filter(func => userInput !== null && userInput !== '' && userInput !== undefined ? func.name.toString().match(userInput.toUpperCase()) : func);
  } catch (e) {
    userFiltered = null;
  }

  const searchOnChangeAction = CardService.newAction()
    .setFunctionName('sheetsHomeOnChange');
  const searchWidget = CardService.newTextInput()
    .setFieldName('searchInput')
    .setTitle('Search')
    .setOnChangeAction(searchOnChangeAction);
  userInput !== null && userInput !== '' && userInput !== undefined ? searchWidget.setValue(userInput) : null;
  const functionList = CardService.newCardSection();
  functionList.addWidget(searchWidget);
  const functionGrid = CardService.newGrid()
    .setTitle(" ")
    .setBorderStyle(CardService.newBorderStyle()
      .setType(CardService.BorderType.STROKE)
      .setCornerRadius(8)
      .setStrokeColor("#D3D3D3"))
    .setNumColumns(1)
    .setOnClickAction(CardService.newAction()
      .setFunctionName("functionClick_"));
  const funcGridItem = (func) => CardService.newGridItem().setTitle(func.name).setIdentifier(JSON.stringify(func));
  if (userFiltered?.length > 0) {
    userFiltered.forEach(func => functionGrid.addItem(funcGridItem(func)));
  } else {
    functionList.addWidget(CardService.newDecoratedText()
      .setText(`<font color="#FF0000">No function matched: "<b>${userInput}</b>"</font>`)
      .setWrapText(true))
    newData.forEach(func => functionGrid.addItem(funcGridItem(func)));
  }
  functionList.addWidget(functionGrid);

  const card = CardService.newCardBuilder()
    .setHeader(headerCard)
    .addSection(functionList)
    .setFixedFooter(footerCard)
    .build();

  return card;
}

function sheetsHomeOnChange(e) {
  let card = sheetsHome(e);
  const actionBuilder = CardService.newActionResponseBuilder();
  actionBuilder.setNavigation(CardService.newNavigation().updateCard(card))
    .setStateChanged(true)
  return actionBuilder.build();
}

function functionClick_(e) {
  const actionBuilder = CardService.newActionResponseBuilder();
  actionBuilder.setNotification(CardService.newNotification()
    .setText(`You clicked ${JSON.parse(e.parameters.grid_item_identifier).name}`)
    .setType(CardService.NotificationType.INFO))
  return actionBuilder.build();
}

function setCards(result) {
  const type = result.type;
  const color = result.color;
  const gameId = result.gameId;

  const game = games[gameId];

  console.log(result);

  if (color != game.state.currentColor) {
    console.log("you can't do that");
    return;
  }
  try {
    cards = game.state.cards;

    //console.log(cards);

    for (var card in cards) {
      try {
        if (card != type) game.state.cards[card][color].isActive = false; //This loops through all the cards and disables them so a player can't use two cards at the same time
      } catch (error) {
        console.log(error);
      }
      console.log(`${card} has been disabled`);
    }

    console.log(game.state.cards[type][color]);
    game.state.cards[type][color].isActive = true;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { setCards };

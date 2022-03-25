function cards(result) {
  const type = result.type;
  const color = result.color;
  const gameId = result.gameId.toLocaleUpperCase();;

  const game = games[gameId];

  //console.log(`${color} clicked ${type} card in game ${gameId}`);

  if (color != game.state.currentColor) {
    return;
  }

  state = game.state;

  state.cards = Object.assign(state.cards,
    // This adds the object below to the state variable
    {
      [type]: {
        [color]: {
          onBoard: true,
          isActive: false,
        },
      },
    }
  );

  console.log(state.cards);

  game.state = state;

  cardPayload = {
    method: "cardSelection",
    card: {
      cardType: type,
      color: color,
      active: true,
    },
  };

  game.clients.forEach((c) => {
    clients[c.clientId].connection.send(JSON.stringify(cardPayload));
    console.log("cards send to " + c.clientId);
  });
}

module.exports = { cards };

function leaveGame(result) {
  const clientId = result.clientId;
  const gameId = result.gameId.toLocaleUpperCase();
  const color = result.color;

  const clients = games[gameId].clients;

  var counter = 0;
  var index;
  clients.forEach((c) => {
    if (clientId == c.clientId) index = counter;
    counter++;
  });
  clients.splice(index, 1);

  var disconnectPayload = {
    method: "disconnect",
    color: game.state.currentColor,
    name: game.state.name,
    continue: true,
  };

  if (clients.length == 1) {
    disconnectPayload.continue = false;
    delete games[gameId];
    /*
    games = games.filter((element) => {
      return element !== undefined;
    });
    */
  }
}

module.exports = { leaveGame };

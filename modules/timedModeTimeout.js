function timedModeTimeout(game) {
  var timedModePayload = {
    method: "timedModeFinished",
  };

  console.log("timed mode timeouit");

  game.clients.forEach((c) => {
    try {
      clients[c.clientId].connection.send(JSON.stringify(timedModePayload));
    } catch (error) {
      console.error(error);
    }
  });

  delete games[game.id]; //This deletes the game from the server

  /*
    games = games.filter((element) => {
      return element !== undefined;
    });
    */
}

module.exports = { timedModeTimeout };

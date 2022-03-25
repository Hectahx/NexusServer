function doomCards(result){
    
    const type = result.type;
    const color = result.color;
    const gameId = result.gameId.toLocaleUpperCase();;

    const game = games[gameId];

    state = game.state;

    if (color != game.state.currentColor) {
      return;
    }
    if (type == "snatchCard") {
      console.log("Snatched was selected");
      var done = false;
      var chosenToken;

      while (!done) {
        var rand = Math.floor(Math.random() * game.state.buttons.length);
        var button = game.state.buttons[rand];
        if (button[1] == game.state.currentColor) {
          done = true;
          chosenToken = button[0];
          game.state.buttons.splice(rand, 1);
        }
      }

      console.log(`Token ${chosenToken} was snatched`);

      const snatchPayload = {
        method: "snatch",
        button: chosenToken,
      };

      game.clients.forEach((c) => {
        clients[c.clientId].connection.send(JSON.stringify(snatchPayload));
      });
    }
    if (type == "skipTurn") {
      let i = 0;
      let currentColor = {};
      game.clients.forEach((c) => {
        currentColor[i] = {
          color: c.color,
          name: c.name,
        };
        i++;
      });

      let oldColor = game.state.currentColor;
      console.log(`old color ${oldColor}`);
      game.state.skipTurnMoves += 1;
      game.state.currentColor =
        currentColor[
          (game.state.moves -
            game.state.extraCardMoves +
            game.state.skipTurnMoves) %
            game.clients.length
        ].color;
      console.log(`Current color ${game.state.currentColor}`);

      const snatchPayload = {
        method: "skipTurn",
        oldColor: oldColor,
        newColor: game.state.currentColor,
      };

      game.clients.forEach((c) => {
        clients[c.clientId].connection.send(JSON.stringify(snatchPayload));
      });
    }
}

module.exports = {doomCards}
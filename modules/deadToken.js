function deadToken(size, game) {
  var done = false;
  var rand = Math.floor(Math.random() * 100);
  var breakLoop = false;
  var chosenToken;

  if (rand >= 85) {
    while (!done) {
      rand = Math.floor(Math.random() * Math.pow(size, 2));

      game.state.buttons.forEach((element) => {
        if (element[0] != rand && breakLoop == false) {
          chosenToken = rand;
          breakLoop = true;
        }
      });
      done = true;
    }

    const deadTokenPayload = {
      method: "deadToken",
      button: chosenToken,
    };

    game.clients.forEach((c) => {
      clients[c.clientId].connection.send(JSON.stringify(deadTokenPayload)); //this is send the dead token to the users
    });

    return chosenToken;
  }
  return null;
}

module.exports = {deadToken}
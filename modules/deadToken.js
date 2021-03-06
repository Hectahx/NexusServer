function deadToken(size, game) {
  var done = false;
  var rand = Math.floor(Math.random() * 100);
  var breakLoop = false;
  var chosenToken;

  if (rand >= 75) {
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
      try{
        clients[c.clientId].connection.send(JSON.stringify(deadTokenPayload)); //this is send the dead token to the users
      }
      catch (error){
        console.error(error);
      }
    });

    return chosenToken;
  }
  return null;
}

module.exports = {deadToken}
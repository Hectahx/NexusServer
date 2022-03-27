function joinGame(result) {
  const clientId = result.clientId;
  var gameId;
  try {
    gameId = result.gameId.toUpperCase();
  } catch {
    console.log("No such game exists");
    return;
  }
  const name = result.name;

  const game = games[gameId];
  if (!game) {
    console.log("No such game exists");
    return;
    //Add Error Message For Non existance games and full lobbies
  }
  if (game.clients.length >= game.limit) {
    console.log("ruh roh raggy robby is rull");
    return;
  }
  const color = { 0: "red", 1: "blue", 2: "green", 3: "purple" }[
    game.clients.length
  ];

  game.clients.push({
    clientId: clientId,
    name: name,
    color: color,
  });

  const payload = {
    method: "join",
    game: game,
  };

  //loop through all clients and tell them that people have joined
  game.clients.forEach((c) => {
    try {
      clients[c.clientId].connection.send(
        JSON.stringify(payload, (key, value) => {
          if (key === "timer") return "";
          return value;
        })
      );
    } catch (error) {
      console.error(error);
    }
  });

  console.log(`Client ID of "${clientId}" and color "${color}" has joined`);

  if (game.clients.length == game.limit) {
    const startPayload = {
      method: "start",
    };

    clearTimeout(game.timer);

    setTimeout(() => {
      game.clients.forEach((c) => {
        try {
          clients[c.clientId].connection.send(JSON.stringify(startPayload));
        } catch (error) {
          console.error(error);
        }
      });
    }, 2000);
  }
}

module.exports = { joinGame };

const { timedModeTimeout } = require("./timedModeTimeout");

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
    gameMode: game.gameMode
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
      //This sends a request to the other clients to start the game 2 seconds after the last person has joined
      game.clients.forEach((c) => {
        try {
          clients[c.clientId].connection.send(JSON.stringify(startPayload));
        } catch (error) {
          console.error(error);
        }
      });

      if ((game.gameMode == "timed")) {
        //If the gamemode is timed it sets the 60 second timer
        game.state.gameModeTimer = setTimeout(
          () => timedModeTimeout(game),
          game.timeLength * 1000
        );
      }
      
    }, 2000);
  }
}

module.exports = { joinGame };

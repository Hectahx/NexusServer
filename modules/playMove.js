const { deadToken } = require("./deadToken");
const { checkWin } = require("./checkWin");
const { timeoutFunction } = require("./timeout.js");

function playMove(result) {
  const clientId = result.clientId;
  const gameId = result.gameId.toLocaleUpperCase();
  const buttonId = result.buttonId;
  const color = result.color;
  const clientName = result.clientName;

  const game = games[gameId];

  let state;

  try {
    state = game.state;
  } catch {
    console.log("Game doesnt exist");
    return;
  }

  try {
    clearTimeout(state.timer);
  } catch {}

  var isEnabled;
  try {
    isEnabled = state.cards["enabledCard"][color].isActive;
  } catch {
    //this is to check if the user has his enabled card active
    isEnabled = false;
  }

  var toReturn = false; //because you cannot fucking return from a forEach loop :)))))))))))))))))

  //just checks if a user has tried to overwrite an already marked button
  state.buttons.forEach((element) => {
    if (element[0] == buttonId) {
      console.log("Dead token clicked");
      if (element[1] == "dead" && isEnabled) {
        console.log("Dead token changed");
        const remPayload = {
          method: "removeCard",
          cardType: "enabledCard",
          color: color,
        };
        game.clients.forEach((c) => {
          try {
            clients[c.clientId].connection.send(JSON.stringify(remPayload)); //this is sent to remove the extra card from the playing field
          } catch (error) {
            console.error(error);
          }
        });
        state.cards["enabledCard"][color].isActive = false;
      } else {
        toReturn = true;
      }
    }
  });
  if (toReturn) return;

  state.buttons.push([buttonId, color]);

  try {
    if (state.cards["extraCard"][color].isActive == true) {
      state.cards["extraCard"][color].isActive = false;
      state.extraCardMoves += 1;
      const remPayload = {
        method: "removeCard",
        cardType: "extraCard",
        color: color,
      };
      game.clients.forEach((c) => {
        try {
          clients[c.clientId].connection.send(JSON.stringify(remPayload)); //this is sent to remove the extra card from the playing field
        } catch (error) {
          console.error(error);
        }
      });
    }
  } catch {}

  state.moves += 1;

  games[gameId].state = state;

  const payload = {
    method: "play",
    move: {
      buttonId: buttonId,
      color: color,
    },
  };

  game.clients.forEach((c) => {
    try {
      clients[c.clientId].connection.send(JSON.stringify(payload));
    } catch (error) {
      console.error(error);
    }
  });

  //Below is the win code

  button = Array(Math.pow(game.size, 2));

  state.buttons.forEach((element) => {
    button[element[0]] = element[1];
  });

  if (!checkWin(button, color, 10)) { //This if statement is executed when no one has won
    //This if statement checks if draw
    if (state.moves == Math.pow(game.size, 2)) {
      console.log("draw");
      return;
    }
    //this selects the current players turn
    let i = 0;
    let currentColor = {};
    game.clients.forEach((c) => {
      currentColor[i] = {
        color: c.color,
        name: c.name,
      };
      i++;
    });

    game.state.currentColor =
      currentColor[
        (game.state.moves -
          game.state.extraCardMoves +
          game.state.skipTurnMoves) %
          game.clients.length
      ].color;
    game.state.name =
      currentColor[
        (game.state.moves -
          game.state.extraCardMoves +
          game.state.skipTurnMoves) %
          game.clients.length
      ].name;

    let moveorCardsPayload = {};

    if (game.state.moves % 7 == 0) {
      moveorCardsPayload = {
        method: "cards",
        currentColor: game.state.currentColor,
        name: game.state.name,
      };
    } else if (game.state.moves % 11 == 0) {
      moveorCardsPayload = {
        method: "doomCards",
        currentColor: game.state.currentColor,
        name: game.state.name,
      };
    } else {
      moveorCardsPayload = {
        method: "move",
        currentMove: {
          color: game.state.currentColor,
        },
      };
    }

    game.clients.forEach((c) => {
      try {
        clients[c.clientId].connection.send(JSON.stringify(moveorCardsPayload));
      } catch (error) {
        console.error(error);
      }
    });

    var deadTokenId = deadToken(game.size, game);
    if (deadTokenId != null) game.state.buttons.push([deadTokenId, "dead"]);

    state.timer = setTimeout(() => timeoutFunction(game), 20000);

    return; //so win code isnt executed
  }

  //Below is the code that is executed once the game has been won

  if(game.gameMode == "timed"){
    clearTimeout(game.gameModeTimer)
  }

  const winPayload = {
    method: "win",
    winner: {
      clientId: clientId,
      color: color,
      clientName: clientName,
    },
  };

  game.clients.forEach((c) => {
    try {
      clients[c.clientId].connection.send(JSON.stringify(winPayload));
      console.log("win sent to " + c.clientId);
    } catch (error) {
      console.error(error);
    }
  });

  delete games[gameId]; //this deletes the game from the hashmap once won
}

module.exports = { playMove };

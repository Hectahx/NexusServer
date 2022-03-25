function timeoutHandler(result) {
  const color = result.color;
  const gameId = result.gameId.toLocaleUpperCase();;
  const game = games[gameId];

  clearTimeout(game.state.timer);
  game.state.timer = setTimeout(() => timeoutFunction(game), 5000);

  continuePayload = {
    method: "continue",
    color: game.state.currentColor,
    name: game.state.name,
  };
  game.clients.forEach((c) => {
    clients[c.clientId].connection.send(JSON.stringify(continuePayload));
  });
}

function timeoutFunction(game) {
  console.log(`${game.state.currentColor} took too long `);

  timeoutPayload = {
    method: "timeout",
    color: game.state.currentColor,
    name: game.state.name,
  };
  game.clients.forEach((c) => {
    clients[c.clientId].connection.send(JSON.stringify(timeoutPayload));
  });
  clearInterval(game.state.timer);
  game.state.timer = setTimeout(() => disconnectTimeout(game), 10000);
}

function disconnectTimeout(game) {
  var disconnectPayload = {
    method: "disconnect",
    color: game.state.currentColor,
    name: game.state.name,
    continue: true,
  };

  var newClients = {};

  newClients = JSON.parse(JSON.stringify(game.clients));
  console.log(newClients);

  var counter = 0;
  var index;
  newClients.forEach((c) => {
    if (game.state.currentColor == c.color) index = counter;
    counter++;
  });
  newClients.splice(index, 1);

  console.log(newClients.length);

  if (newClients.length == 1) disconnectPayload.continue = false;

  game.clients.forEach((c) => {
    clients[c.clientId].connection.send(JSON.stringify(disconnectPayload));
  });
}

module.exports = {timeoutHandler, timeoutFunction}
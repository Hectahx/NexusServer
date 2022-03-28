const { cards } = require("./modules/cards");
const { joinGame } = require("./modules/joinGame");
const { playMove } = require("./modules/playMove");
const { setCards } = require("./modules/setCards");
const { doomCards } = require("./modules/doomCards");
const { timeoutHandler, timeoutFunction } = require("./modules/timeout");
const { leaveGame } = require("./modules/leaveGame");
//Separated all the functions into files to make development and debugging easier

const http = require("http");
const websocketServer = require("websocket").server;
const port = 6969;
const httpServer = http.createServer();
httpServer.listen(port, () => {
  console.log(`Listening on ${port}`);
});

//global hashmap of clients, games and an array of all games
global.clients = {};
global.games = {};
global.gameList = [];

const wsServer = new websocketServer({
  httpServer: httpServer,
});

wsServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);
  connection.on("open", () => console.log("open"));
  connection.on("close", (err) => {
    console.log(`Socket closed, reason ${err}`);
  });
  connection.on("error", (err) => {
    console.log(err);
  });
  connection.on("message", (message) => {
    const string = new TextDecoder().decode(message.binaryData);
    const result = JSON.parse(string);

    //I have received a new message from the client
    //user wants to create a new game
    if (result.method === "create") {
      const gameId = (S4() + S4()).toUpperCase().substring(0, 6).toLocaleUpperCase();//creates a 6 digit game id so other players can join easily
      //const gameId = (S4() + S4()).toUpperCase().substring(0, 6);//creates a 6 digit game id so other players can join easily
      console.log(`Creating game with id of ${gameId}`);

      games[gameId] = {
        id: gameId,
        size: 10,
        limit: 2,
        clients: [],
        state : {
          buttons: [],
          moves: 0,
          extraCardMoves: 0,
          skipTurnMoves: 0,
          cards : {},
          timer : setTimeout(() => timeoutFunction(games[gameId]), 20000)
        }
      }
      
      gameList.push(games[gameId]);
      gameList = gameList.map(({state, ...rest}) => rest)
      const payload = {
        method: "create",
        game: games[gameId],
      };

      const con = clients[clientId].connection;
      con.send(
        JSON.stringify(payload, (key, value) => {
        if(key === "timer") return "";
        return value;
        })
      );
    }

    if (result.method === "join") {
      joinGame(result);
    }

    if (result.method == "play") {
      playMove(result);
    }

    if (result.method == "cards") {
      cards(result);
    }

    if (result.method == "setCard") {
      setCards(result);
    }

    if (result.method == "doomCards") {
      doomCards(result);
    }

    if (result.method == "timeout") {
      timeoutHandler(result);
    }
    if(result.method == "leaveGame"){
      //TODO Need to dispose of game properly when a player chooses to leave
      //leaveGame(result)
    }
  });

  //generate a new client id
  const clientId = guid();
  clients[clientId] = {
    connection: connection,
  };

  const payload = {
    method: "connect",
    clientId: clientId,
    games: gameList,
  };

  console.log(`Client ${clientId} connected`);
  try {
    connection.send(JSON.stringify(payload));
  } catch (error) {
    console.error(error)
  }
});

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
const guid = () =>
  (
    S4() +
    S4() +
    "-" +
    S4() +
    "-4" +
    S4().substring(0, 3) +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  ).toLowerCase();

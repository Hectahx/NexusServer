const { cards } = require("./modules/cards");
const { joinGame } = require("./modules/joinGame");
const { playMove } = require("./modules/playMove");
const { setCards } = require("./modules/setCards");
const { doomCards } = require("./modules/doomCards");
const { timeoutHandler, timeoutFunction } = require("./modules/timeout");
const { leaveGame } = require("./modules/leaveGame");
const { login } = require("./modules/login");
const { signup } = require("./modules/signup");
const { guid, S4 } = require("./modules/guid");
//Separated all the functions into files to make development and debugging easier

const https = require("https");
const axios = require("axios").default;
require("dotenv").config();
const { readFileSync } = require("fs");
const mysql = require("mysql2");

const websocketServer = require("websocket").server;
const port = 6969;
const httpsServer = https.createServer({
  cert: readFileSync("./Keys/cert.pem"),
  key: readFileSync("./Keys/key.pem"),
});
httpsServer.listen(port, () => {
  console.log(`Listening on ${port}`);
});

global.pool = mysql.createPool({
  connectionLimit: 10,
  host: "139.59.162.2",
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD, 
  database: process.env.DATABASE,
});

//global hashmap of clients, games and an array of all games
global.clients = {};
global.games = {};
global.gameList = [];

const wsServer = new websocketServer({
  httpServer: httpsServer,
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
      const gameId = (S4() + S4())
        .toUpperCase()
        .substring(0, 6)
        .toLocaleUpperCase(); //creates a 6 digit game id so other players can join easily
      //creates a 6 digit game id so other players can join easily
      console.log(`Creating game with id of ${gameId}`);

      var gameMode = result.gameMode.toLowerCase();
      var playerLimit = result.playerSize;
      var isPrivate = result.isPrivate;
      var clientId = result.clientId;

      games[gameId] = {
        id: gameId,
        size: 10, //This is the length of the board. So 10 means 10x10 board
        isPrivate: isPrivate,
        limit: playerLimit, //This is how many players can play in a game
        clients: [],
        gameMode: gameMode,
        state: {
          buttons: [],
          moves: 0,
          extraCardMoves: 0,
          skipTurnMoves: 0,
          cards: {},
          //timer: setTimeout(() => timeoutFunction(games[gameId]), 20000),
        },
      };

      games[gameId].isPrivate = isPrivate;

      if (isPrivate) {
        games[gameId].password = result.password;
      }

      if (gameMode == "timed") {
        games[gameId].state.gameModeTimer = null;
        games[gameId].timeLength = parseInt(result.timeLength); //Gonna try to let it so the player can choose
        //This is the game timer so once this timer has finished it will stop the game
      }

      if (!isPrivate) {
        gameList.push(games[gameId]);
        gameList = gameList.map(({ state, ...rest }) => rest); // this line removes the state attribute from the gameList var
      }

      const payload = {
        method: "create",
        game: games[gameId],
      };
      try {
        const con = clients[clientId].connection;
        con.send(
          JSON.stringify(payload, (key, value) => {
            if (key === "timer") return "";
            return value;
          })
        );
      } catch (error) {
        console.error(error);
      }
    }

    if (result.method === "join") {  //These if statements are all executed when the server gets sent data and the method is one of the ones listed
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
    if (result.method == "leaveGame") {
      //TODO Need to dispose of game properly when a player chooses to leave
      //leaveGame(result)
    }
    if (result.method == "login") {
      login(result, connection);
    }
    if (result.method == "signup") {
      signup(result, connection);
    }
    if (result.method == "guest") {
      const clientId = guid();
      clients[clientId] = {
        connection: connection,
      };

      const payload = {
        method: "guest",
        clientId: clientId,
      };

      try {
        connection.send(JSON.stringify(payload));
      } catch (error) {
        console.error(error);
      }
    }
    if ((result.method = "serverBrowser")) {
      connection.send(
        JSON.stringify({
          method: "serverBrowser",
          games: gameList,
        })
      );
    }
  });

  //generate a new client id
  /*
  const clientId = guid();
  clients[clientId] = {
    connection: connection,
  };
  

  const payload = {
    method: "connect",
    //clientId: clientId,
    games: gameList,
  };

  
  try {
    connection.send(JSON.stringify(payload));
  } catch (error) {
    console.error(error);
  }

  */
  console.log(`A client has connected`);
});

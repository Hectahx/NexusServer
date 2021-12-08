const http = require("http");
const websocketServer = require("websocket").server;
const checkWin = require("./checkWin");
const port = 6969;
const httpServer = http.createServer();
httpServer.listen(port, () => {
	console.log(`Listening on ${port}`);
});

//hashmap
const clients = {};
const games = {};

const wsServer = new websocketServer({
	httpServer: httpServer,
});

wsServer.on("request", (request) => {
	const connection = request.accept(null, request.origin);
	connection.on("open", () => console.log("open"));
	connection.on("close", (err) => {
		console.log(`Socket closed, reason ${err}`);
	});
	connection.on("message", (message) => {
		const result = JSON.parse(message.utf8Data);
		//I have received a new message from the client
		//user wants to create a new gam,e
		if (result.method === "create") {
			const gameId = guid();
			console.log(`Creating game with id of ${gameId}`);

			games[gameId] = {
				id: gameId,
				size: 10,
				limit: 2,
				clients: [],
			};
			const payload = {
				method: "create",
				game: games[gameId],
			};

			const con = clients[clientId].connection;
			con.send(JSON.stringify(payload));
		}

		if (result.method === "join") {
			const clientId = result.clientId;
			const gameId = result.gameId;
			const name = result.name;

			const game = games[gameId];
			if (!game) {
				return;
				//Add Error Message For Non existance games and full lobbies
			}
			if (game.clients.length >= game.limit) {
				console.log("ruh roh raggy robby is rull");
				return;
			}
			const color = { 0: "red", 1: "blue", 2: "green", 3: "purple" }[game.clients.length];

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
				clients[c.clientId].connection.send(JSON.stringify(payload));
			});

			console.log(`Client ID of "${clientId}" and color "${color}" has joined`);

			if (game.clients.length == game.limit) {
				const startPayload = {
					method: "start",
				};
				
				setTimeout(() => {
					game.clients.forEach((c) => {
						clients[c.clientId].connection.send(JSON.stringify(startPayload));
					});
				}, 2000);
			}
		}

		if (result.method == "play") {
			const clientId = result.clientId;
			const gameId = result.gameId;
			const buttonId = result.buttonId;
			const color = result.color;
			const clientName = result.clientName;

			const game = games[gameId];

			let state = games[gameId].state;
			if (!state) {
				state = {
					buttons: [],
					moves: 0,
					extraCardMoves: 0,
				};
			}
			var isEnabled;
			try {
				isEnabled = state.cards["enabledCard"][color].isActive;
			} catch {
				//this is to check if the user has his enabled card  active
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
							clients[c.clientId].connection.send(JSON.stringify(remPayload)); //this is sent to remove the extra card from the playing field
						});
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
						clients[c.clientId].connection.send(JSON.stringify(remPayload)); //this is sent to remove the extra card from the playing field
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
				clients[c.clientId].connection.send(JSON.stringify(payload));
			});

			//Below is the win code

			button = Array(Math.pow(game.size, 2));

			state.buttons.forEach((element) => {
				button[element[0]] = element[1];
			});

			if (!checkWin.checkWin(button, color, 10)) {
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
						(game.state.moves - game.state.extraCardMoves) % game.clients.length
					].color;
				game.state.name =
					currentColor[
						(game.state.moves - game.state.extraCardMoves) % game.clients.length
					].color;

				let moveorCardsPayload = {};

				if (game.state.moves % 7 == 0) {
					moveorCardsPayload = {
						method: "cards",
						currentColor: game.state.currentColor,
						name: currentColor[game.state.moves % game.clients.length].name,
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
					clients[c.clientId].connection.send(
						JSON.stringify(moveorCardsPayload)
					);
				});

				var deadTokenId = deadToken(game.size, game);
				if (deadTokenId != null) game.state.buttons.push([deadTokenId, "dead"]);
				return; //so win code isnt executed
			}

			console.log("win");

			const winPayload = {
				method: "win",
				winner: {
					clientId: clientId,
					color: color,
					clientName: clientName,
				},
			};

			game.clients.forEach((c) => {
				clients[c.clientId].connection.send(JSON.stringify(winPayload));
				console.log("win sent to " + c.clientId);
			});
		}
		if (result.method == "cards") {
			const type = result.type;
			const color = result.color;
			const gameId = result.gameId;

			const game = games[gameId];

			//console.log(`${color} clicked ${type} card in game ${gameId}`);

			if (color != game.state.currentColor) {
				return;
			}

			state = game.state;

			state = Object.assign(
				{
					cards: {
						[type]: {
							[color]: {
								onBoard: true,
								isActive: false,
							},
						},
					},
				},
				state
			);

			game.state = state;
			cardPayload = {
				method: "cardSelection",
				card: {
					cardType: type,
					color: color,
					active: true,
				},
			};

			game.clients.forEach((c) => {
				clients[c.clientId].connection.send(JSON.stringify(cardPayload));
				console.log("cards send to " + c.clientId);
			});
		}

		if (result.method == "setCard") {
			const type = result.type;
			const color = result.color;
			const gameId = result.gameId;

			const game = games[gameId];

			if (color != game.state.currentColor) {
				console.log("you can't do that");
				return;
			}

			cards = game.state.cards;

			for (var card in cards) {
				if (card != type) game.state.cards[card][color].isActive = false;
				//console.log(`${card} has been disabled`);
			}

			game.state.cards[type][color].isActive = true;
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
	};

	console.log(`Client ${clientId} connected`);
	connection.send(JSON.stringify(payload));
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
		S4().substr(0, 3) +
		"-" +
		S4() +
		"-" +
		S4() +
		S4() +
		S4()
	).toLowerCase();

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

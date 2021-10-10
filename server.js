
/* Chess studies API v0.11
* Philippe Marc Meyer 2021
*/

'use strict';
const express = require('express');
const cors = require('cors'); //import cors module

const app = express();

app.use(express.json())

const port = process.env.PORT || 8080

var whitelist = [ 'http://localhost:'+port,]; //white list consumers
var corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
	  console.log("white list");
    } else {
      callback(null, false);
	  console.log("black list");
    }

  },
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: false, //Credentials are cookies, authorization headers or TLS client certificates.
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept']
};

app.use(cors(corsOptions)); //adding cors middleware to the express with above configurations
app.use(express.static(__dirname + "/public"));

const fs = require('fs');
let chessGames = [];
// --- Reading chess games on the server and putting the array into a variable chessGames
fs.readFile("./data/chessGames.json", "utf8", (err, rawdata) => {
	if (err) {
	  console.log("File read failed:", err);
	  return;
	}else{
		chessGames = JSON.parse(rawdata);
	}
  });

// --- Getting all the games
app.get('/games', (req,res) => {
    res.status(200).json(chessGames);
})

// --- Getting one game
app.get('/game/:id', (req,res) => {
    const id = parseInt(req.params.id)
    const chessGame = chessGames.find(game => game.id === id)
    res.status(200).json(chessGame)
})

// --- Deleting one game
app.delete('/game/:id', (req, res) => {
	let result = {"success":true,"message":""};
	let id = Number(req.params.id);
	chessGames = chessGames.filter((game) => {
		return game.id !== id;
	  });
	let gameStr = JSON.stringify(chessGames);

	fs.writeFile("./data/chessGames.json", gameStr, err => {
		if (err) {
			console.log("Error writing file:", err);
			result.success = false;
			result.message = err.toString();
		}
	  });
	res.status(200).json(result);
  });

// --- posting a new game
app.put('/game', function(req, res){
	let result = {"success":true,"message":""};
	let game = req.body;      // your JSON
	console.log(game.id);
	console.log(game.comments);

	let id = game.id;
	if(!chessGames || chessGames.length === 0){
		chessGame = [];
		chessGames.push(game);
	}else{
		let checkGame = chessGames.filter((x) => {
			return x.id === id;
		});
		if(checkGame.length === 0){
			chessGames.push(game);
		}else{
			chessGames = chessGames.filter((game) => {
				return game.id !== id;
			  });
			 chessGames.push(game);
		}
	}

	let gameStr = JSON.stringify(chessGames);

	fs.writeFile("./data/chessGames.json", gameStr, err => {
		if (err) {
			console.log("Error writing file:", err);
			result.success = false;
			result.message = err.toString();
		}
	  });
	res.status(200).json(result);
  });

app.listen(port, () => {
    console.log("Chess server starts at port " + port);
})

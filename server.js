
/* Chess studies API v0.1 
* Philippe Marc Meyer 2021
*/

'use strict';
const express = require('express');
const app = express();

var cors = require('cors'); //import cors module

var whitelist = [ 'http://localhost:8080']; //white list consumers
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


const fs = require('fs');
let chessGames = [];
// --- Reading chess games on the server and putting the array into a variable chessGames
fs.readFile("./chessGames.json", "utf8", (err, rawdata) => {
	if (err) {
	  console.log("File read failed:", err);
	  return;
	}else{
		chessGames = JSON.parse(rawdata);
	}
  });

app.use(express.static(__dirname + "/public"));

app.use(express.json());

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
	console.log(id);
	let beforeSize = chessGames.length;
	chessGames = chessGames.filter((game) => {
		debugger
		return game.id !== id;
	  });
	let afterSize = chessGames.length;
	console.log("before : "+ beforeSize);
	console.log("after : "+ afterSize);

	let gameStr = JSON.stringify(chessGames);

	fs.writeFile("./chessGames.json", gameStr, err => {
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
			chessGames.forEach((x)=>{
				if(x.id === game.id){
					x = game;
				}
			});
		}
	}
	let gameStr = JSON.stringify(chessGames);

	fs.writeFile("./chessGames.json", gameStr, err => {
		if (err) {
			console.log("Error writing file:", err);
			result.success = false;
			result.message = err.toString();
		}
	  });
	res.status(200).json(result);
  });

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log("Chess server starts at port " + port);
})


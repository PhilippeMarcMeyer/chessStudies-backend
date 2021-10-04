
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


//app.use(cors());
//app.options('*', cors());
const fs = require('fs');
let chessGames = "[]";
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
	let id = req.params.id;
	let checkGame = chessGames.filter((x) => {
		return x.id === x.id;
	});
	
	if(checkGame.length === 0){
		res.status(400);
	}else{
		chessGames = chessGames.filter((game) => {
			return game.id !== id;
		  })
	}
	fs.writeFile("./chessGames.json", JSON.stringify(chessGames), err => {
		if (err) console.log("Error writing file:", err);
	  });
	res.status(200).json(chessGames);
  });

// --- posting a new game
app.put('/game', function(req, res){
	let game = JSON.parse(req.body);      // your JSON
	if(!chessGames || chessGames.length === 0){
		chessGames.push(game);
	}else{
		let checkGame = chessGames.filter((x) => {
			return x.id === x.id;
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
	fs.writeFile("./chessGames.json", JSON.stringify(chessGames), err => {
		if (err) console.log("Error writing file:", err);
	  });
	res.status(200).json(chessGames);
  });

  app.put('/games', function(req, res){
	let chessGames = JSON.parse(req.body);      // your JSON
	fs.writeFile("./chessGames.json", JSON.stringify(chessGames), err => {
		if (err) console.log("Error writing file:", err);
	  });
	res.status(200).json(chessGames);
  });

app.listen(8080, () => {
    console.log("Chess server starts");
})


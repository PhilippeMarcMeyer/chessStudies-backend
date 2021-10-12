
/* Chess studies API v0.11
* Philippe Marc Meyer 2021
*/

'use strict';
const express = require('express');
const cors = require('cors'); //import cors module
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')

const saltRounds = 10;

const app = express();

app.use(express.json())
app.use(cookieParser())

const port = process.env.PORT || 8080
const devPort = 3000

const cookieName = "chessStudies"

let users = [{login:"philmageo",pw:"$2b$10$J1hZVj6AGwmHoaY3F31/9OR75lldnlE5diARa/79Xl25EKVumMeuS",sessionId:"azertyuiop"}];

let chessGames = [];

var whitelist = [ 'http://localhost:'+port,'http://localhost:'+devPort]; //white list consumers : on devPort it works like an api
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
	if(checkSession(req)){
		res.status(200).json(chessGames);
	}else{
		res.status(401);
	}
})

// --- Getting one game
app.get('/game/:id', (req,res) => {
	if(checkSession(req)){
		const id = parseInt(req.params.id)
		const chessGame = chessGames.find(game => game.id === id)
		res.status(200).json(chessGame)
	}else{
		res.status(401);
	}
})

// --- Deleting one game
app.delete('/game/:id', (req, res) => {
	if(checkSession(req)){
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
	}else{
		res.status(401);
	}

  });

// --- posting a new game
app.put('/game', function(req, res){
	if(checkSession(req)){
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
	}else{
		res.status(401);
	}

  });

app.listen(port, () => {
    console.log("Chess server starts at port " + port);
})

function getcookie(req) {
    var cookie = req.headers.cookie;
    // user=someone; session=QyhYzXhkTZawIb5qSl3KKyPVN (this is my cookie i get)
    return cookie.split('; ');
}

function checkSession(req){
	if(cookieName in req.cookies){
		let userArr = users.filter((x)=>{
			return x.sessionId === req.cookies.chessStudies;
		})
		return userArr.length === 1;
	}else{
		return false;
	}
}

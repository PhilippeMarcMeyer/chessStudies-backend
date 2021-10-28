
/* Chess studies backend v0.25
* v0.25 : 2021-10-28 : debug mode to allow using it as an api for may other repo front (reactjs)
* Philippe Marc Meyer 2021
*/

'use strict';
const express = require('express');
const cors = require('cors'); //import cors module
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')
const fs = require('fs');

const mode = "prod"; // "prod || debug"

const app = express();

app.use(express.json())
app.use(cookieParser())

const port = process.env.PORT || 8080
const devPort = 3000

const cookieName = "chessStudies";
const baseFilename = "chessGames";
const unauthFilename = "exampleGames.json";

let users = [{id:1,login:"pmg.meyer@gmail.com",name:"philmageo",hash:"$2b$10$J1hZVj6AGwmHoaY3F31/9OR75lldnlE5diARa/79Xl25EKVumMeuS",sessionId:"azertyuiop"}];

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

const loadGames = (file) => {
	return new Promise(function (resolve, reject) {
		if (!fs.existsSync("./data/" + file)) {
			chessGames = [];
			fs.writeFile("./data/" + file, JSON.stringify(chessGames), err => {
				if (err) {
					console.log("Error writing file on creatings games for new user:", err);
					result.success = false;
					result.message = err.toString();
					return;
				}
			});
			resolve(chessGames);
		} else {
			fs.readFile("./data/" + file, 'utf8', (err, rawdata) => {
				if (err) {
					console.error(err)
					reject(error);
					return
				}
				chessGames = JSON.parse(rawdata);
				resolve(chessGames);
			})
		}
	});
}
// const

const readingError = "readingError";
const sessionError = "sessionError";

// -- logout

app.get('/logout',(req,res) => {
	let user = checkSession(req);
	if(user){
		users.forEach((x)=>{
			if(x.id === user.id){
				x.sessionId = null;
			}
		});
		res.clearCookie(cookieName);
	}else{
		if(cookieName in req.cookies){
			res.clearCookie(cookieName);
		}
	}

    res.redirect('/');
});

// -- login 

app.post('/login', (req,res) => {
	let result = {"success":false,"message":sessionError};
	let auth = req.body;      // your JSON
	let username = auth.username.trim();
	let password = auth.password.trim();

	if(cookieName in req.cookies){
		res.clearCookie(cookieName);
	}

	checkPassword(username,password)
	.then(function(userId){
		let userArr = users.filter((x)=>{
			return x.id === userId;
		});
		let sessionId = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2);
		users.forEach((x)=>{
			if(x.id === userId){
				x.sessionId = sessionId;
			}
		});
		res.cookie(cookieName, sessionId, {httpOnly: true});
		result = {"success":true,"message":"Welcome back "+ userArr[0].name +"!"};
		res.send(result)
	})
	.catch(function(userId){
		if(userId != 0){
			users.forEach((x)=>{
				if(x.id === userId){
					x.sessionId = null;
				}
			});
		}
		res.send(result)
	})
})

const checkPassword = (username,password) => {
	return new Promise(function (resolve, reject) {
		const isDebug = mode === "debug" ;
		let usernameToTest = isDebug ? "philmageo" : username;
		let userArr = users.filter((x)=>{
			return x.name === usernameToTest;
		});
		if(userArr.length === 1){
			if(isDebug){
				resolve(userArr[0].id);
			}else{
				bcrypt.compare(password, userArr[0].hash)
				.then(function(compareResult) {
					if(compareResult){
						resolve(userArr[0].id);
					}else{
						reject(userArr[0].id)
					}
				});
			}
		}else{
			reject(0);
		}
	});
}
// --- Getting all the games
app.get('/games', (req,res) => {
	let session = checkSession(req);
	if(session){
		let filename = baseFilename + "-" + session.name + ".json"; 
		loadGames(filename)
		.then(function (data) {
			users.forEach((x)=>{
				if(x.id === session.id){
					x.games =  [... data];
				}
			});
			res.status(200).json(session.games);
          })
		  .catch(function(error){
			res.status(200).json({"error" : readingError});
		  });
	}else{
		res.status(200).json({"error" : sessionError});
	}
})

// --- Getting one game
app.get('/game/:id', (req,res) => {
	let session = checkSession(req);
	if(session){
		const id = parseInt(req.params.id)
		let chessGames = JSON.parse(session.games);
		const chessGame = chessGames.find(game => game.id === id)
		res.status(200).json(chessGame)
	}else{
		res.status(200).json({"error" : sessionError});
	}
})

// --- Deleting one game
app.delete('/game/:id', (req, res) => {
	let session = checkSession(req);
	if(session){
		let result = {"success":true,"message":""};
		let id = Number(req.params.id);
		let filename = baseFilename + "-" + session.name + ".json"; 
		loadGames(filename)
		.then(function (chessGames) {
			chessGames = chessGames.filter((game) => {
				return game.id !== id;
			  });
			  setUserSessionGames(session.id,chessGames)
	
			fs.writeFile("./data/" + filename, JSON.stringify(chessGames), err => {
				if (err) {
					console.log("Error writing file on delete one:", err);
					result.success = false;
					result.message = err.toString();
				}
			  });
			res.status(200).json(result);
          })
		  .catch(function(error){
			res.status(200).json({"error" : readingError});
		  });

	}else{
		res.status(200).json({"error" : sessionError});
	}
  });

// --- posting a new game
app.put('/game', function(req, res){
	let session = checkSession(req);
	if(session){
		let result = {"success":true,"message":""};
		let game = req.body;      // your JSON
		let id = game.id;
		let filename = baseFilename + "-" + session.name + ".json"; 
		loadGames(filename)
		.then(function (chessGames) {
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
			  setUserSessionGames(session.id,chessGames)
	
			fs.writeFile("./data/" + filename, JSON.stringify(chessGames), err => {
				if (err) {
					console.log("Error writing file on adding one:", err);
					result.success = false;
					result.message = err.toString();
				}
			  });
			res.status(200).json(result);
          })
		  .catch(function(error){
			res.status(200).json({"error" : readingError});
		  });
	}else{
		res.status(200).json({"error" : sessionError});
	}
  });

app.listen(port, () => {
    console.log("Chess server starts at port " + port);
})

function getUserSessionGames(id){
	let chessGames = [];
	users.forEach((x)=>{
		if(x.id === id){
			chessGames =  [... x.games];
		}
	});
	return chessGames;
}

function setUserSessionGames(id,games){
	let chessGames = [];
	users.forEach((x)=>{
		if(x.id === id){
			x.games =  [... games];
		}
	});
}

function checkSession(req) {
	if (mode === "debug") {
		let userArr = users.filter((x)=>{
			return x.name === "philmageo";
		});
		return userArr.length === 1 ? userArr[0] : false;
	} else {
		if (cookieName in req.cookies) {
			let userArr = users.filter((x) => {
				return x.sessionId === req.cookies.chessStudies;
			})
			return userArr.length === 1 ? userArr[0] : false;
		} else {
			return false;
		}
	}
}


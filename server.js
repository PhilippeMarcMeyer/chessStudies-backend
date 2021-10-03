
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
//const fs = require('fs');

// json file with the data
//const data = fs.readFileSync('./data/data.json');

//const chessGames = JSON.parse(data);
const app = express();

// To solve the cors issue
app.set('port', 12000);
app.listen(process.env.PORT,
	() => console.log("Server Starts"));
	
app.use(express.static('public'));
/*
app.use(cors());
app.get('/test', () =>{
	response.send("ok");

});
*/
// when get request is made, alldata() is called
//app.get('/games', alldata);

function alldata(request, response) {
	
	// Returns all information about the chessGames
	response.send(JSON.stringfy(chessGames));
}

app.get('/', (req, res) => {
	res.send("Hello!");
})
/*
app.get('/games/:id/', searchGame);

function searchGame(request, response) {
	let id = Number(request.params.games);
    let reply = chessGames.filter((x) =>{
        return x.id === id;
    });
	
	if(reply.length === 0) {
		reply = "";		
	}else{
        reply=JSON.stringfy(reply);
    }
	response.send(reply);
}
*/
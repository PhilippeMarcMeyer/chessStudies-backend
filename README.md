# chessStudies backend v0.24

node server for my chess studies
 
the front part is the built version of ChessStudies (front in reactjs)

to do :

1. ~~Put the games in a data folder~~
1. ~~Auth : session~~
1. ~~filename contening chess games specific to user~~
1. ~~Auth : redirect to login/password form instead of http 500~~
1. put the PGN analysis on the server side
1. Load games only if version number != server
1. Manage a maximum localStorage usage


History :

v0.24 : 2021-10-21 : get rid of promise for games json reading, using my own promise

v0.23 : 2021-10-14 : fixed rook choice in the analyse of the PGN, when both might move to the chosen place (checking if there are obstacles on the way)

v0.22 : 2021-10-14 : login form back endpoint and the session id in a cookie + logout

v0.21 : 2021-10-13 : lock the game and give a feed back to user if no session : to do : a login form back endpoint and the session id in a cookie




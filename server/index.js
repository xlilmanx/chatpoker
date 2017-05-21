var express = require('express');
var path = require('path');
var http = require('http');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var PORT = process.env.PORT || 5000;
var useronline = 0;


// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

// Answer API requests.
app.get('/api', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the custom server!"}');
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});
/*
app.get('/', function (req, res) {
  res.sendFile(__dirname, '../react-ui/public/index.html');
});
*/

//  Game Variables

var deck = ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
  "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
  "9c", "9d", "9h", "9s", "10c", "10d", "10h", "10s", "Jc", "Jd", "Jh", "Js",
  "Qc", "Qd", "Qh", "Qs", "Kc", "Kd", "Kh", "Ks"];
var deckref = ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
  "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
  "9c", "9d", "9h", "9s", "10c", "10d", "10h", "10s", "Jc", "Jd", "Jh", "Js",
  "Qc", "Qd", "Qh", "Qs", "Kc", "Kd", "Kh", "Ks"];
var field = [];
//var playerhand = { id: "", hand: "" }
var allhand = [];
var returnarray = [];
var playercount = 0;
var deckarr = [];
var fieldarr = [];
var num1 = 0;
var card1 = "";
var num2 = 0;
var card2 = "";
var hand = [];



io.on('connection', function (socket) {

  // game stuff

  //    playerhand["id"] = id;
  //    playerhand["hand"] = hand;
  //    allhand.push(playerhand);
  var playercountid = playercount;
  playercount = playercount + 1;

  io.emit('gameconnect', returnarray);


  socket.on('dealhand', function () {


    deckarr = ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
      "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
      "9c", "9d", "9h", "9s", "10c", "10d", "10h", "10s", "Jc", "Jd", "Jh", "Js", "Qc", "Qd", "Qh", "Qs",
      "Kc", "Kd", "Kh", "Ks"];
    allhand = [];

    for (i = 0; i < playercount; i++) {

      num1 = Math.floor(Math.random() * (deckarr.length - 1));
      card1 = deckarr[num1];
      deckarr.splice(num1, 1);
      num2 = Math.floor(Math.random() * (deckarr.length - 1));
      card2 = deckarr[num2];
      deckarr.splice(num2, 1);

      hand = [card1, card2];

      allhand.push(hand);
      deck = deckarr;
    }

    field = [];
    returnarray[0] = allhand;
    returnarray[1] = deck;
    returnarray[2] = field;
    io.emit('dealhand', returnarray);
  });

  socket.on('dealfield', function () {

    deckarr = deck;
    num1 = Math.floor(Math.random() * (deckarr.length - 1));
    card1 = deckarr[num1];
    deckarr.splice(num1, 1);

    fieldarr = field;
    fieldarr.push(card1);

    field = fieldarr;
    deck = deckarr;

    returnarray[0] = allhand;
    returnarray[1] = deck;
    returnarray[2] = field;
    io.emit('dealfield', returnarray);
  });


  /*         old stuff
    io.emit('chat message', 'a user connected');
    console.log('asdf');
    useronline = useronline + 1;
    io.emit('userupdate', useronline);
  
    socket.on('disconnect', function () {
      io.emit('chat message', 'a user disconnected');
      useronline = useronline - 1;
    io.emit('userupdate', useronline);

  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });
});  */
  var name = userNames.getGuestName();

  // send the new user their name and a list of users
  socket.emit('init', {
    name: name,
    users: userNames.get()
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name: name
  });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
    socket.broadcast.emit('send:message', {
      user: name,
      text: data.text
    });
  });

  // validate a user's name change, and broadcast it on success
  socket.on('change:name', function (data, fn) {
    if (userNames.claim(data.name)) {
      var oldName = name;
      userNames.free(oldName);

      name = data.name;

      socket.broadcast.emit('change:name', {
        oldName: oldName,
        newName: name
      });

      fn(true);
    } else {
      fn(false);
    }
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('disconnect', function () {


    playercount = playercount - 1;
    returnarray[0].splice(playercountid, 1);
    io.emit('gameconnect', returnarray);
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });

});

server.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});

// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
      nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName
  };
}());

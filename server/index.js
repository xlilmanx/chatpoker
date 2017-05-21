var express = require('express');
var path = require('path');
var http = require('http');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var PORT = process.env.PORT || 5000;
var useronline = 0;

var Ranker = require('handranker');

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
  "9c", "9d", "9h", "9s", "Tc", "Td", "Th", "Ts", "Jc", "Jd", "Jh", "Js", "Qc", "Qd", "Qh", "Qs",
  "Kc", "Kd", "Kh", "Ks"];
var deckref = ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
  "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
  "9c", "9d", "9h", "9s", "Tc", "Td", "Th", "Ts", "Jc", "Jd", "Jh", "Js", "Qc", "Qd", "Qh", "Qs",
  "Kc", "Kd", "Kh", "Ks"];
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
var userid = [];
var handstring = "";
var gameinprogress = false;



io.on('connection', function (socket) {

  // game stuff

  //    playerhand["id"] = id;
  //    playerhand["hand"] = hand;
  //    allhand.push(playerhand);
  var clientInfo = new Object();
  clientInfo.id = socket.id;
  clientInfo.cards = [];
  userid.push(clientInfo);
  io.emit('gameconnect', returnarray);


  socket.on('dealhand', function () {

    if (!gameinprogress) {

      deckarr = ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
        "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
        "9c", "9d", "9h", "9s", "Tc", "Td", "Th", "Ts", "Jc", "Jd", "Jh", "Js", "Qc", "Qd", "Qh", "Qs",
        "Kc", "Kd", "Kh", "Ks"];
      allhand = [];

      for (i = 0; i < userid.length; i++) {

        num1 = Math.floor(Math.random() * (deckarr.length - 1));
        card1 = deckarr[num1];
        deckarr.splice(num1, 1);
        num2 = Math.floor(Math.random() * (deckarr.length - 1));
        card2 = deckarr[num2];
        deckarr.splice(num2, 1);

        hand = [card1, card2];


        var c = userid[i];
        c.cards = hand;


        allhand.push(hand);
        deck = deckarr;
      }

      field = [];
      returnarray[0] = allhand;
      returnarray[1] = deck;
      returnarray[2] = field;
      io.emit('dealhand', returnarray);

    }
  });

  socket.on('dealfield', function () {

    if (gameinprogress) {
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


      if (field.length >= 5) {
        /*  
            for (i = 0; i < userid.length; i++) {
      
              if (i == 0) {
      
                handstring = "userid[" + i + "]";
      
              } else {
      
                handstring = handstring + ", userid[" + i + "]";
      
              }
            }
      */

        var allplayerhands = [];
        if (userid[0] != null) {
          if (userid[0].cards != null) {
            var hand1 = { id: 1, cards: userid[0].cards };
            allplayerhands.push(hand1);
          }
        }
        if (userid[1] != null) {
          if (userid[1].cards != null) {
            var hand2 = { id: 2, cards: userid[1].cards };
            allplayerhands.push(hand2);
          }
        }
        if (userid[2] != null) {
          if (userid[2].cards != null) {
            var hand3 = { id: 3, cards: userid[2].cards };
            allplayerhands.push(hand3);
          }
        }
        if (userid[3] != null) {
          if (userid[3].cards != null) {
            var hand4 = { id: 4, cards: userid[3].cards };
            allplayerhands.push(hand4);
          }
        }
        if (userid[4] != null) {
          if (userid[4].cards != null) {
            var hand5 = { id: 5, cards: userid[4].cards };
            allplayerhands.push(hand5);
          }
        }
        if (userid[5] != null) {
          if (userid[5].cards != null) {
            var hand6 = { id: 6, cards: userid[5].cards };
            allplayerhands.push(hand6);
          }
        }
        if (userid[6] != null) {
          if (userid[6].cards != null) {
            var hand7 = { id: 7, cards: userid[6].cards };
            allplayerhands.push(hand7);
          }
        }
        if (userid[7] != null) {
          if (userid[7].cards != null) {
            var hand8 = { id: 8, cards: userid[7].cards };
            allplayerhands.push(hand8);
          }
        }





        var results = Ranker.orderHands(allplayerhands, field);
        console.log(handstring);
        console.log(results);
        gameinprogress = false;
      }
    }
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


    for (var i = 0; i < userid.length; ++i) {
      var c = userid[i];

      if (c.id == socket.id) {
        userid.splice(i, 1);

        if (returnarray[0][i] != null) {
          returnarray[0].splice(i, 1);
        }
        break;
      }
    }

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

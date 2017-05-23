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
var allhand = [];
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
var handdealt = false;
var returnarray = { hand: [], deck: [], field: [] };
var returnbetarray = { money: [], bet: [], turnbet: [] };
var allmoney = [];
var allbet = [];
var allturbet = [];
var winner = { id: 0, name: new Object(), hand: new Object(), totalwon: 0 };
// waitingtostart, preflop, flop, turn, river
var gamedata = { phase: "waitingtostart", currentbet: 0, dealernum: -1, turnnum: 0 };
var smallblind = 1;
var bigblind = 2;

io.on('connection', function (socket) {

  // game stuff

  var clientInfo = new Object();
  clientInfo.id = socket.id;
  clientInfo.cards = [];
  clientInfo.name = "";
  clientInfo.money = 100;
  clientInfo.bet = 0;
  clientInfo.turnbet = 0;
  var idAdded = false;


  if (idAdded == false) {
    console.log("initial idadd: " + idAdded.toString());
    if (userid.length > 0) {
      for (i = 0; i < userid.length; i++) {

        if (userid[i] == null) {

          userid.splice(i, 1, clientInfo);
          idAdded = true;

        }
      }

      if (idAdded == false) {

        userid.push(clientInfo);
        idAdded = true;
      }

    } else {

      userid.push(clientInfo);
      idAdded = true;
    }

    for (var i = 0; i < userid.length; i++) {
      if (userid[i] != null) {
        if (userid[i].id === socket.id) {
          clientNumber = i;
          socket.emit('updatePlayerId', i);
        }
      }
    }

    var name = userNames.getGuestName();

  }

  console.log("after idadd: " + idAdded.toString());
  console.log(userid.length);


  // inital connection update game

  allmoney = [];
  allbet = [];
  allturnbet = [];

  for (var i = 0; i < userid.length; i++) {

    if (userid[i] != null) {
      allmoney[i] = userid[i].money;
      allbet[i] = userid[i].bet;
      allturnbet[i] = userid[i].turnbet;
    }
  }
  returnbetarray.money = allmoney;
  returnbetarray.bet = allbet;
  returnbetarray.turnbet = allturnbet;



  socket.emit('updateGame', returnarray);
  socket.emit('updatePhase', gamedata);
  io.emit('updateBet', returnbetarray);

  // update bets

  //updateGame.bets();

  // betting, dealing hand, dealing card

  socket.on('dobet', function (data) {

    console.log('do bet');
    console.log(clientNumber);
    if (gamedata.turnnum == clientNumber) {

      for (var i = 0; i < userid.length; ++i) {
        var c = userid[i];

        if (c.id == socket.id) {

          userid[i].money = userid[i].money - data;
          userid[i].bet = userid[i].bet + data;
          userid[i].turnbet = userid[i].turnbet + data;
          console.log('do bet complete: ' + userid[i].turnbet);
          if (userid[i].bet >= gamedata.currentbet) {

            gamedata.currentbet = userid[i].bet;
            io.emit('updatePhase', gamedata);

            console.log('updated currentbet');
          }

        }
      }

      updateGame.bets();

    } else {

      socket.emit('updatePhase', gamedata);

    }
  });
  /*
    socket.on('startgame', function (data) {
  
      console.log('socket startgame')
      gamedata.dealernum = (gamedata.dealernum + 1) % userid.length;
      gamedata.phase = "preflop";
      gamedata.currentbet = bigblind;
      gamedata.turnnum = (gamedata.dealernum + 3) % userid.length;
      var smallblindplayer = (gamedata.dealernum + 1) % userid.length;
      var bigblindplayer = (gamedata.dealernum + 2) % userid.length;
      userid[smallblindplayer].money = userid[smallblindplayer].money - smallblind;
      userid[smallblindplayer].bet = userid[smallblindplayer].bet + smallblind;
      userid[bigblindplayer].money = userid[bigblindplayer].money - bigblind;
      userid[bigblindplayer].bet = userid[bigblindplayer].bet + bigblind;
      io.emit('updatePhase', gamedata);
      updateGame.bets();
  
    });
  
  
    socket.on('endTurn', function () {
  
      updateGame.endturn();
  
    });
  */
  socket.on('fold', function () {

    if (gamedata.currentbet > userid[clientNumber].bet) {
      console.log('fold')
      returnarray.hand[clientNumber] = [];
      io.emit('updateGame', returnarray);

      var numplayersingame = 0;

      for (i = 0; i < userid.length; i++) {

        if (users[i].cards.length != 0) {

          numplayersingame = numplayersingame + 1;

        }

      }

      if (numplayersingame == 1) {

        updateGame.winner();


      } else {

        updateGame.endturn();

      }



    } else {
      updateGame.endturn();

    }

  });


  socket.on('dealhand', function () {

    if (!gameinprogress) {

      console.log('deal hand')
      gamedata.dealernum = (gamedata.dealernum + 1) % userid.length;
      gamedata.phase = "preflop";
      gamedata.currentbet = bigblind;
      gamedata.turnnum = (gamedata.dealernum + 3) % userid.length;
      var smallblindplayer = (gamedata.dealernum + 1) % userid.length;
      var bigblindplayer = (gamedata.dealernum + 2) % userid.length;
      userid[smallblindplayer].money = userid[smallblindplayer].money - smallblind;
      userid[smallblindplayer].bet = userid[smallblindplayer].bet + smallblind;
      userid[bigblindplayer].money = userid[bigblindplayer].money - bigblind;
      userid[bigblindplayer].bet = userid[bigblindplayer].bet + bigblind;
      io.emit('updatePhase', gamedata);
      updateGame.bets();

      deckarr = ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
        "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
        "9c", "9d", "9h", "9s", "Tc", "Td", "Th", "Ts", "Jc", "Jd", "Jh", "Js", "Qc", "Qd", "Qh", "Qs",
        "Kc", "Kd", "Kh", "Ks"];
      allhand = [];

      for (i = 0; i < userid.length; i++) {

        if (userid[i] != null) {

          num1 = Math.floor(Math.random() * (deckarr.length - 1));
          card1 = deckarr[num1];
          deckarr.splice(num1, 1);
          num2 = Math.floor(Math.random() * (deckarr.length - 1));
          card2 = deckarr[num2];
          deckarr.splice(num2, 1);

          hand = [card1, card2];

          var c = userid[i];
          c.cards = hand;

          allhand[i] = hand;
          deck = deckarr;
        }
      }

      field = [];
      updateGame.gamedatacards();
      gameinprogress = true;

    }
  });

  socket.on('dealfield', function () {

    if (gamedata.dealernum == clientNumber) {
      gameinprogress = true;

      if (gamedata.phase == "preflop") {

        for (i = 0; i < 3; i++) {
          deckarr = deck;
          num1 = Math.floor(Math.random() * (deckarr.length - 1));
          card1 = deckarr[num1];
          deckarr.splice(num1, 1);

          fieldarr = field;
          fieldarr.push(card1);

          field = fieldarr;
          deck = deckarr;
        }
        gamedata.phase = "turn";
      }

      else {

        deckarr = deck;
        num1 = Math.floor(Math.random() * (deckarr.length - 1));
        card1 = deckarr[num1];
        deckarr.splice(num1, 1);

        fieldarr = field;
        fieldarr.push(card1);

        field = fieldarr;
        deck = deckarr;
        gamedata.phase = "river";

      }
      console.log('dealfield')
      io.emit('toggleDealField', false);
      gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;

      do {
        gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;
      }
      while (userid[gamedata.turnnum].cards.length == 0);


      io.emit('updatePhase', gamedata);
      updateGame.gamedatacards();
    }
  });



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
      userid[clientNumber].name = name;

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
        delete userid[i];
        delete returnarray[i];

        //       userid.splice(i, 1);

        /*       if (returnarray[0] != null) {
                   if (returnarray[0][i] != null) {
                     returnarray[0].splice(i, 1);
                   }
         break;
               }*/
        break;
      }

      for (i = userid.length - 1; i > 0; i--) {

        if (userid[i] == null) {
          userid.splice(i, 1);
        } else {
          break;

        }
      }
    }

    io.emit('gameconnect', returnarray);
    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });

  socket.on('updateclientnumber', function () {

    for (var i = 0; i < userid.length; i++) {
      if (userid[i] != null) {
        if (userid[i].id === socket.id) {
          clientNumber = i;
          userid[clientNumber].name = name;
          socket.emit('updatePlayerId', i);
        }
      }
    }

  });

});

server.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});

// update game stats
var updateGame = (function () {

  var bets = function () {
    allmoney = [];
    allbet = [];
    allturnbet = [];

    for (var i = 0; i < userid.length; i++) {

      allmoney[i] = userid[i].money;
      allbet[i] = userid[i].bet;
      allturnbet[i] = userid[i].turnbet;


    }
    returnbetarray.money = allmoney;
    returnbetarray.bet = allbet;
    returnbetarray.turnbet = allturnbet;

    io.emit('updateBet', returnbetarray);
  };

  var gamedatacards = function () {
    returnarray.hand = allhand;
    returnarray.deck = deck;
    returnarray.field = field;
    io.emit('updateGame', returnarray);
  };

  var endturn = function () {


    if (gamedata.turnnum == gamedata.dealernum && userid[gamedata.turnnum].bet == gamedata.currentbet) {

      if (clientNumber === gamedata.dealernum) {

        if (gamedata.phase == "preflop") {

          gamedata.phase = "flop";
          io.emit('toggleDealField', true);

        } else if (gamedata.phase == "flop") {

          gamedata.phase = "turn";
          io.emit('toggleDealField', true);

        } else if (gamedata.phase == "turn") {

          gamedata.phase = "river";
          io.emit('toggleDealField', true);

        } else if (gamedata.phase == "river") {

          /*          if (field.length >= 5) {
          
           
          
                    }*/
          updateGame.winner();

          gameinprogress = false;
          handdealt = false;
          gamedata.phase = "waitingtostart";
          io.emit('updatePhase', gamedata);

        }

      }


    } else {
      console.log('endturn')
      gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;
      io.emit('updatePhase', gamedata);

    }

  };

  var winner = function () {
    var allplayerhands = [];
    if (userid[0] != null) {
      if (userid[0].cards != null) {
        var hand1 = { id: 1, cards: userid[0].cards };
        allplayerhands[0] = hand1;
      }
    }
    if (userid[1] != null) {
      if (userid[1].cards != null) {
        var hand2 = { id: 2, cards: userid[1].cards };
        allplayerhands[1] = hand2;
      }
    }
    if (userid[2] != null) {
      if (userid[2].cards != null) {
        var hand3 = { id: 3, cards: userid[2].cards };
        allplayerhands[2] = hand3;
      }
    }
    if (userid[3] != null) {
      if (userid[3].cards != null) {
        var hand4 = { id: 4, cards: userid[3].cards };
        allplayerhands[3] = hand4;
      }
    }
    if (userid[4] != null) {
      if (userid[4].cards != null) {
        var hand5 = { id: 5, cards: userid[4].cards };
        allplayerhands[4] = hand5;
      }
    }
    if (userid[5] != null) {
      if (userid[5].cards != null) {
        var hand6 = { id: 6, cards: userid[5].cards };
        allplayerhands[5] = hand6;
      }
    }
    if (userid[6] != null) {
      if (userid[6].cards != null) {
        var hand7 = { id: 7, cards: userid[6].cards };
        allplayerhands[6] = hand7;
      }
    }
    if (userid[7] != null) {
      if (userid[7].cards != null) {
        var hand8 = { id: 8, cards: userid[7].cards };
        allplayerhands[7] = hand8;
      }
    }
    if (userid[8] != null) {
      if (userid[8].cards != null) {
        var hand8 = { id: 9, cards: userid[8].cards };
        allplayerhands[8] = hand9;
      }
    }
    if (userid[9] != null) {
      if (userid[9].cards != null) {
        var hand8 = { id: 10, cards: userid[9].cards };
        allplayerhands[9] = hand10;
      }
    }

    var results = Ranker.orderHands(allplayerhands, field);

    winner.id = userid[results[0][0].id - 1]
    winner.idname = winner.id.name;
    winner.hand = results[0][0].description;
    winner.totalwon = 0;

    //handle bet after match end
    for (i = 0; i < userid.length; i++) {

      if (userid[i] != null) {
        winner.id.money = winner.id.money + userid[i].bet;
        winner.totalwon = winner.totalwon + userid[i].bet;
        userid[i].bet = 0;
      }
    }

    io.emit('send:message', {
      user: "APPLICATION BOT",
      text: winner.idname + " has won $" + winner.totalwon + " with " + winner.hand + "!"
    });

    bets();
  };

  return {
    bets: bets,
    gamedatacards: gamedatacards,
    winner: winner,
    endturn: endturn
  };

}());

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
      userid[clientNumber].name = name;
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

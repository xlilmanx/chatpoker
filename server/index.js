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
var socketList = io.sockets.server.eio.clients;
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
var gamedata = { phase: "waitingtostart", currentbet: 0, dealernum: -1, turnnum: 0, numplayers: 0 };
var smallblind = 1;
var bigblind = 2;
var bigblindplayer = -1;
var smallblindplayer = -1;
var betraised = false;
var betraisedplayer = -1;
var allowbet = false;
var timeouttime = 10000;
var timeoutfunction;

io.on('connection', function (socket) {

  // game stuff

  var clientInfo = new Object();
  clientInfo.id = socket.id;
  clientInfo.num = -1;
  clientInfo.cards = [];
  clientInfo.name = "";
  clientInfo.money = 100;
  clientInfo.bet = 0;
  clientInfo.turnbet = 0;
  var idAdded = false;
  var clientnum = -1;


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
          userid[i].num = i;
          clientnum = i;
          socket.emit('updatePlayerId', i);
        }
      }
    }

    var name = userNames.getGuestName(clientnum);

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

    if (allowbet) {

      console.log('do bet');
      console.log(clientnum);
      if (gamedata.turnnum == clientnum) {

        for (var i = 0; i < userid.length; ++i) {
          var c = userid[i];

          if (c.id == socket.id) {

            userid[i].money = userid[i].money - data;
            userid[i].bet = userid[i].bet + data;
            userid[i].turnbet = userid[i].turnbet + data;
            console.log('do bet complete: ' + userid[i].turnbet);
            if (userid[i].bet > gamedata.currentbet) {

              gamedata.currentbet = userid[i].bet;
              io.emit('updatePhase', gamedata);
              betraised = true;
              betraisedplayer = i;

              console.log('updated currentbet');
            }

          }
        }

        updateGame.bets();

      } else {

        socket.emit('updatePhase', gamedata);

      }
    }
  });

  socket.on('fold', function () {

    updateGame.fold(clientnum);


  });


  socket.on('dealhand', function () {

    if (!gameinprogress) {

      deckarr = ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
        "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
        "9c", "9d", "9h", "9s", "Tc", "Td", "Th", "Ts", "Jc", "Jd", "Jh", "Js", "Qc", "Qd", "Qh", "Qs",
        "Kc", "Kd", "Kh", "Ks"];
      allhand = [];
      gamedata.numplayers = 0;

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
          gamedata.numplayers = gamedata.numplayers + 1;
        }
      }

      console.log('deal hand');
      for (i = 0; i < userid.length; i++) {
        gamedata.dealernum = (gamedata.dealernum + 1) % userid.length;
        if (userid[gamedata.dealernum] != null) {
          break;
        }
      }

      gamedata.phase = "preflop";
      gamedata.currentbet = bigblind;

      smallblindplayer = (gamedata.dealernum + 1) % userid.length;
      if (userid[smallblindplayer] == null) {
        for (i = 0; i < userid.length; i++) {
          smallblindplayer = (smallblindplayer + 1) % userid.length;
          if (userid[smallblindplayer] != null) {
            break;
          }
        }
      }

      bigblindplayer = (smallblindplayer + 1) % userid.length;
      if (userid[bigblindplayer] == null) {
        for (i = 0; i < userid.length; i++) {
          bigblindplayer = (bigblindplayer + 1) % userid.length;
          if (userid[bigblindplayer] != null) {
            break;
          }
        }
      }

      gamedata.turnnum = (bigblindplayer + 1) % userid.length;
      if (userid[gamedata.turnnum] == null) {
        for (i = 0; i < userid.length; i++) {
          gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;
          if (userid[gamedata.turnnum] != null) {
            break;
          }
        }
      }

      userid[smallblindplayer].money = userid[smallblindplayer].money - smallblind;
      userid[smallblindplayer].bet = userid[smallblindplayer].bet + smallblind;
      userid[bigblindplayer].money = userid[bigblindplayer].money - bigblind;
      userid[bigblindplayer].bet = userid[bigblindplayer].bet + bigblind;
      betraised = true;
      betraisedplayer = bigblindplayer;
      io.emit('updatePhase', gamedata);
      updateGame.bets();

      field = [];
      updateGame.gamedatacards();
      gameinprogress = true;
      allowbet = true;
      clearTimeout(timeoutfunction);
      timeoutfunction = setTimeout(updateGame.ontimeout, 10000);
      io.emit('updateTimeout', 10);

    }
  });

  socket.on('dealfield', function () {

    updateGame.dealfield(clientnum);

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
      userid[clientnum].name = name;

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

    for (var i = 0; i < userid.length; i++) {
      var c = userid[i];
      if (c != null) {
        if (c.id == socket.id) {
          if (c.cards.length != 0) {
            gamedata.numplayers = gamedata.numplayers - 1;
          }
          delete userid[i];
          delete returnarray[i];
          delete returnbetarray[i];
          if (i == gamedata.dealernum) {
            for (i = 0; i < userid.length; i++) {
              gamedata.dealernum = (gamedata.dealernum + 1) % userid.length;
              if (userid[gamedata.dealernum] != null) {
                break;
              }
            }
          }
          if (i == gamedata.turnnum) {
            for (i = 0; i < userid.length; i++) {
              gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;
              if (userid[gamedata.turnnum] != null) {
                if (userid[gamedata.turnnum].cards.length != 0) {
                  break;
                }
              }
            }
          }
          if (i == betraisedplayer) {
            for (i = userid.length; i > 0; i--) {
              betraisedplayer = (betraisedplayer - 1) % userid.length;
              if (userid[betraisedplayer] != null) {
                break;
              }
            }
          }
        }
      }
    }

    socketList = io.sockets.server.eio.clients;
    for (i = userid.length - 1; i > 0; i--) {
      if (userid[i] != null) {
        if (socketList[userid[i].id] === undefined) {
          if (c.cards.length != 0) {
            gamedata.numplayers = gamedata.numplayers - 1;
          }
          delete userid[i];
          delete returnarray[i];
          delete returnbetarray[i];
          if (i == gamedata.dealernum) {
            for (i = 0; i < userid.length; i++) {
              gamedata.dealernum = (gamedata.dealernum + 1) % userid.length;
              if (userid[gamedata.dealernum] != null) {
                break;
              }
            }
          }
          if (i == gamedata.turnnum) {
            for (i = 0; i < userid.length; i++) {
              gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;
              if (userid[gamedata.turnnum] != null) {
                if (userid[gamedata.turnnum].cards.length != 0) {
                  break;
                }
              }
            }
          }
          if (i == betraisedplayer) {
            for (i = userid.length; i > 0; i--) {
              betraisedplayer = (betraisedplayer - 1) % userid.length;
              if (userid[betraisedplayer] != null) {
                break;
              }
            }
          }
        }
      }
    }

    for (i = userid.length - 1; i >= 0; i--) {

      if (userid[i] == null) {
        userid.splice(i, 1);
      } else {
        break;
      }
    }

    if (userid.length == 0) {

      gamedata.phase = "waitingtostart";
      gameinprogress = false;

    }


    //    io.emit('gameconnect', returnarray);
    io.emit('updateGame', returnarray);
    io.emit('updatePhase', gamedata);
    io.emit('updateBet', returnbetarray);

    socket.broadcast.emit('user:left', {
      name: name
    });
    userNames.free(name);
  });

  socket.on('updateclientnumber', function () {

    for (var i = 0; i < userid.length; i++) {
      if (userid[i] != null) {
        if (userid[i].id === socket.id) {
          clientnum = i;
          userid[clientnum].name = name;
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
      if (userid[i] != null) {
        allmoney[i] = userid[i].money;
        allbet[i] = userid[i].bet;
        allturnbet[i] = userid[i].turnbet;
      }
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

  var fold = function (n) {
    if (userid[n] != null) {
      if (gamedata.currentbet > userid[n].bet) {
        console.log('fold: ' + n);
        userid[n].cards = [];
        returnarray.hand[n] = [];
        io.emit('updateGame', returnarray);
        io.emit('send:message', {
          user: "APPLICATION BOT",
          text: userid[n].name + " has folded."
        });
        endturn(n);
      } else if (gamedata.currentbet == userid[n].bet) {
        endturn(n);
        io.emit('send:message', {
          user: "APPLICATION BOT",
          text: userid[n].name + " has called/checked the current bet at $" + gamedata.currentbet + "."
        });
      } else {
        endturn(n);
        io.emit('send:message', {
          user: "APPLICATION BOT",
          text: userid[n].name + " has raised the current bet to $" + gamedata.currentbet + "."
        });
      }
    } else {
      endturn(n);
    }
  };

  var endturn = function (n) {

    console.log('did end turn client: ' + n);

    if ((gamedata.turnnum == betraisedplayer && !betraised) || (gamedata.turnnum == betraisedplayer && gamedata.numplayers == 1)) {

      console.log('dealer call: ' + userid[gamedata.turnnum].bet + " - " + gamedata.currentbet);

      console.log('equal n');

      if (gamedata.phase == "preflop") {

        console.log('preflop end');
        allowbet = false;
        io.emit('toggleDealField', 1);

      } else if (gamedata.phase == "flop") {

        console.log('flop end');
        allowbet = false;
        io.emit('toggleDealField', 1);

      } else if (gamedata.phase == "turn") {

        console.log('turn end');
        allowbet = false;
        io.emit('toggleDealField', 1);

      } else if (gamedata.phase == "river") {
        allowbet = false;
        console.log('checkwinner');
        /*          if (field.length >= 5) {

                  }*/
        updateGame.winner();
        gameinprogress = false;
        handdealt = false;
        gamedata.phase = "waitingtostart";
        io.emit('updatePhase', gamedata);
        clearTimeout(timeoutfunction);
        io.emit('updateTimeout', 0);
      }
      console.log('nope error ' + n + ' not player: ' + bigblindplayer)
    } else {
      console.log('endturn');
      for (i = 0; i < userid.length; i++) {
        gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;
        if (userid[gamedata.turnnum] != null) {
          if (userid[gamedata.turnnum].cards.length != 0) {
            break;
          }
        }
      }
      betraised = false;
      console.log('nexturn: ' + gamedata.turnnum);
      io.emit('updatePhase', gamedata);

    }
    if (gameinprogress) {
      console.log('settimeout');
      clearTimeout(timeoutfunction);
      timeoutfunction = setTimeout(ontimeout, 10000);
      io.emit('updateTimeout', 10);
    }
  };

  var dealfield = function (n) {
    if (gamedata.dealernum == n) {
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

        gamedata.phase = "flop";
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

        if (gamedata.phase == "flop") {
          gamedata.phase = "turn";
        } else {
          gamedata.phase = "river";
        }
      }
      console.log('dealfield');
      io.emit('toggleDealField', 0);

      gamedata.turnnum = (gamedata.dealernum + 1) % userid.length;
      if (userid[gamedata.turnnum] == null) {
        for (i = 0; i < userid.length; i++) {
          gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;
          if (userid[gamedata.turnnum] != null) {
            if (userid[gamedata.turnnum].cards.length != 0) {
              break;
            }
          }
        }
      } else if (userid[gamedata.turnnum].cards.length == 0) {
        for (i = 0; i < userid.length; i++) {
          gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;
          if (userid[gamedata.turnnum] != null) {
            if (userid[gamedata.turnnum].cards.length != 0) {
              break;
            }
          }
        }
      }
      betraised = false;
      allowbet = true;
      io.emit('updatePhase', gamedata);
      gamedatacards();
      clearTimeout(timeoutfunction);
      timeoutfunction = setTimeout(ontimeout, 10000);
      io.emit('updateTimeout', 10);
    }
  };

  var ontimeout = function () {
    if (!allowbet) {

      if (gamedata.phase == "preflop") {

        console.log('preflop end');
        dealfield(gamedata.turnnum);

      } else if (gamedata.phase == "flop") {

        dealfield(gamedata.turnnum);

      } else if (gamedata.phase == "turn") {

        dealfield(gamedata.turnnum);

      } else if (gamedata.phase == "river") {
        allowbet = false;
        console.log('checkwinner');
        updateGame.winner();
        gameinprogress = false;
        handdealt = false;
        gamedata.phase = "waitingtostart";
        io.emit('updatePhase', gamedata);
      }
    } else {

      fold(gamedata.turnnum);

    }

  };

  var winner = function () {
    var allplayerhands = [];
    if (userid[0] != null) {
      if (userid[0].cards.length != 0) {
        var hand1 = { id: 1, cards: userid[0].cards };
        allplayerhands[0] = hand1;
      }
    }
    if (userid[1] != null) {
      if (userid[1].cards.length != 0) {
        var hand2 = { id: 2, cards: userid[1].cards };
        allplayerhands[1] = hand2;
      }
    }
    if (userid[2] != null) {
      if (userid[2].cards.length != 0) {
        var hand3 = { id: 3, cards: userid[2].cards };
        allplayerhands[2] = hand3;
      }
    }
    if (userid[3] != null) {
      if (userid[3].cards.length != 0) {
        var hand4 = { id: 4, cards: userid[3].cards };
        allplayerhands[3] = hand4;
      }
    }
    if (userid[4] != null) {
      if (userid[4].cards.length != 0) {
        var hand5 = { id: 5, cards: userid[4].cards };
        allplayerhands[4] = hand5;
      }
    }
    if (userid[5] != null) {
      if (userid[5].cards.length != 0) {
        var hand6 = { id: 6, cards: userid[5].cards };
        allplayerhands[5] = hand6;
      }
    }
    if (userid[6] != null) {
      if (userid[6].cards.length != 0) {
        var hand7 = { id: 7, cards: userid[6].cards };
        allplayerhands[6] = hand7;
      }
    }
    if (userid[7] != null) {
      if (userid[7].cards.length != 0) {
        var hand8 = { id: 8, cards: userid[7].cards };
        allplayerhands[7] = hand8;
      }
    }
    if (userid[8] != null) {
      if (userid[8].cards.length != 0) {
        var hand8 = { id: 9, cards: userid[8].cards };
        allplayerhands[8] = hand9;
      }
    }
    if (userid[9] != null) {
      if (userid[9].cards.length != 0) {
        var hand8 = { id: 10, cards: userid[9].cards };
        allplayerhands[9] = hand10;
      }
    }

    for (i = 0; i < 9; i++) {
      if (allplayerhands[i] == null) {
        allplayerhands.splice(i, 1, []);
      } else if (allplayerhands[i].cards == null) {
        allplayerhands.splice(i, 1, []);
      }
    }

    var winnerarray = []
    for (i = 0; i < userid.length; i++) {
      if (userid[i] != null) {
        if (userid[i].cards.length != null) {
          winnerarray.push(userid[i].num);
        }
      }
    }
    console.log(allplayerhands);
    var results = Ranker.orderHands(allplayerhands, field);

    winner.id = userid[winnerarray[results[0][0].id - 1]];
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
    endturn: endturn,
    dealfield: dealfield,
    fold: fold,
    ontimeout: ontimeout
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
  var getGuestName = function (n) {
    var name,
      nextUserId = 1;

    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
      userid[n].name = name;
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

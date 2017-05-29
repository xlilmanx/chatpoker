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
var returnbetarray = { money: [], bet: [], turnbet: [], status: [] };
var allmoney = [];
var allbet = [];
var allturbet = [];
var allstatus = [];
var winner = { id: 0, name: new Object(), hand: new Object(), totalwon: 0, winninghand: [] };
// waitingtostart, preflop, flop, turn, river
var gamedata = { phase: "waitingtostart", currentbet: 0, dealernum: -1, turnnum: 0, numplayers: 0 };
var smallblind = 1;
var bigblind = 2;
var bigblindplayer = -1;
var smallblindplayer = -1;
var betraised = false;
var betraisedplayer = -1;
var betiscalled = false;
var allowbet = false;
var timeouttime = 10000;
var timeoutfunction;
var endgamecheck = false;

io.on('connection', function (socket) {

  // Add client info array

  var clientInfo = new Object();
  clientInfo.id = socket.id;
  clientInfo.num = -1;
  clientInfo.cards = [];
  clientInfo.name = "";
  clientInfo.money = 100;
  clientInfo.bet = 0;
  clientInfo.turnbet = 0;
  clientInfo.isingame = false;
  clientInfo.didbet = false;
  clientInfo.turnstatus = "";
  var idAdded = false;
  var clientnum = -1;

  // Check if id already added

  if (idAdded == false) {

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
        if (userid[i].id == socket.id) {
          userid[i].num = i;
          clientnum = i;
          socket.emit('updatePlayerId', i);
        }
      }
    }

    var name = userNames.getGuestName(clientnum);

  }
  // inital connection send all game variables

  allmoney = [];
  allbet = [];
  allturnbet = [];
  allstatus = [];

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
  returnbetarray.turnstatus = allstatus;


  io.emit('updateGame', returnarray);
  io.emit('updatePhase', gamedata);
  io.emit('updateBet', returnbetarray);

  // update bets

  //updateGame.bets();

  // betting, dealing hand, dealing card

  socket.on('dobet', function (data) {

    var thisbetamount = data;

    if (allowbet) {

      if (gamedata.turnnum == clientnum) {

        for (var i = 0; i < userid.length; ++i) {
          var c = userid[i];
          if (c != null) {
            if (c.id == socket.id) {
              userid[i].didbet = true;

              // bet calculation if player has enough money to bet

              if (userid[i].money >= thisbetamount) {
                userid[i].money = userid[i].money - thisbetamount;
              } else if (userid[i].money > 0) {
                thisbetamount = thisbetamount - userid[i].money;
                userid[i].money = 0;
              } else {
                thisbetamount = 0;
              }
              userid[i].bet = userid[i].bet + thisbetamount;
              userid[i].turnbet = userid[i].turnbet + thisbetamount;

              // set raise if player bet is higher than current bet

              if (userid[i].bet > gamedata.currentbet) {

                gamedata.currentbet = userid[i].bet;
                io.emit('updatePhase', gamedata);
                betraised = true;
                betiscalled = false;
                betraisedplayer = i;
                userid[i].turnstatus = "Raise";

                for (j = 0; j < userid.length; j++) {
                  if (userid[j] != null) {
                    if (i != j) {
                      userid[j].didbet = false;
                    }
                  }
                }
              }

              // set fold,check,raise,call

              if (gamedata.currentbet > userid[i].bet) {
                userid[i].turnstatus = "Fold";
              } else if (userid[i].turnbet == 0) {
                userid[i].turnstatus = "Check";
              } else if (gamedata.currentbet == gamedata.currentbet && i == betraisedplayer) {
                userid[i].turnstatus = "Raise";
              } else {
                userid[i].turnstatus = "Call";
              }
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

      // deal hand reset game variables

      allhand = [];
      gamedata.numplayers = 0;
      betiscalled = false;
      winner.winninghand = [];
      io.emit('updateWinningHand', winner.winninghand)

      for (i = 0; i < userid.length; i++) {

        if (userid[i] != null) {
          if (userid[i].money > 0) {
            userid[i].bet = 0;
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
            userid[i].isingame = true;
            userid[i].didbet = false;
            userid[i].turnbet = 0;
            userid[i].turnstatus = "";
          } else {
            userid[i].didbet = false;
            userid[i].turnbet = 0;
            userid[i].turnstatus = "";
          }
        }
      }


      // pick next dealer

      for (i = 0; i < userid.length; i++) {
        gamedata.dealernum = (gamedata.dealernum + 1) % userid.length;
        if (userid[gamedata.dealernum] != null) {
          if (userid[gamedata.dealernum].money > 0) {
            break;
          }
        }
      }

      // small blind, big blind

      gamedata.phase = "preflop";
      gamedata.currentbet = bigblind;

      smallblindplayer = (gamedata.dealernum + 1) % userid.length;
      if (userid[smallblindplayer] == null) {
        for (i = 0; i < userid.length; i++) {
          smallblindplayer = (smallblindplayer + 1) % userid.length;
          if (userid[smallblindplayer] != null) {
            if (userid[smallblindplayer].money > 0) {
              break;
            }
          }
        }
      } else if (userid[smallblindplayer].money <= 0) {
        for (i = 0; i < userid.length; i++) {
          smallblindplayer = (smallblindplayer + 1) % userid.length;
          if (userid[smallblindplayer] != null) {
            if (userid[smallblindplayer].money > 0) {
              break;
            }
          }
        }
      }

      bigblindplayer = (smallblindplayer + 1) % userid.length;
      if (userid[bigblindplayer] == null) {
        for (i = 0; i < userid.length; i++) {
          bigblindplayer = (bigblindplayer + 1) % userid.length;
          if (userid[bigblindplayer] != null) {
            if (userid[bigblindplayer].money > 0) {
              userid[bigblindplayer].didbet = false;
              break;
            }
          }
        }
      } else if (userid[bigblindplayer].money <= 0) {
        for (i = 0; i < userid.length; i++) {
          bigblindplayer = (bigblindplayer + 1) % userid.length;
          if (userid[bigblindplayer] != null) {
            if (userid[bigblindplayer].money > 0) {
              userid[bigblindplayer].didbet = false;
              break;
            }
          }
        }
      }

      userid[bigblindplayer].didbet = false;

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
    name: name,
    users: userNames.get()
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
          delete returnarray.hand[i];
          delete returnbetarray.bet[i];
          delete returnbetarray.money[i];
          delete returnbetarray.turnbet[i];
          if (i == gamedata.dealernum) {
            clearTimeout(timeoutfunction);
            timeoutfunction = setTimeout(updateGame.ontimeout, 10000);
            io.emit('updateTimeout', 10);
            for (j = 0; j < userid.length; j++) {
              gamedata.dealernum = (gamedata.dealernum + 1) % userid.length;
              if (userid[gamedata.dealernum] != null) {
                break;
              }
            }
          }
          if (i == gamedata.turnnum) {
            for (j = 0; j < userid.length; j++) {
              gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;
              if (userid[gamedata.turnnum] != null) {
                if (userid[gamedata.turnnum].cards.length != 0) {
                  break;
                }
              }
            }
          }
          if (i == betraisedplayer) {
            for (j = userid.length; j > 0; j--) {
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
        if (socketList[userid[i].id] == undefined) {
          if (c.cards.length != 0) {
            gamedata.numplayers = gamedata.numplayers - 1;
          }
          delete userid[i];
          delete returnarray.hand[i];
          delete returnbetarray.bet[i];
          delete returnbetarray.money[i];
          delete returnbetarray.turnbet[i];
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

    if (userid.length == 0 || gamedata.numplayers <= 0) {

      gamedata.phase = "waitingtostart";
      gameinprogress = false;

    }


    io.emit('updateGame', returnarray);
    io.emit('updatePhase', gamedata);
    io.emit('updateBet', returnbetarray);

    socket.broadcast.emit('user:left', {
      name: name,
      users: userNames.get()
    });
    userNames.free(name);
  });

  // update clientnumber when someone disconnects

  socket.on('updateclientnumber', function () {

    for (var i = 0; i < userid.length; i++) {
      if (userid[i] != null) {
        if (userid[i].id == socket.id) {
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
    allstatus = [];

    for (var i = 0; i < userid.length; i++) {
      if (userid[i] != null) {
        allmoney[i] = userid[i].money;
        allbet[i] = userid[i].bet;
        allturnbet[i] = userid[i].turnbet;
        allstatus[i] = userid[i].turnstatus;
      }
    }
    returnbetarray.money = allmoney;
    returnbetarray.bet = allbet;
    returnbetarray.turnbet = allturnbet;
    returnbetarray.turnstatus = allstatus;

    io.emit('updateBet', returnbetarray);
  };


  var gamedatacards = function () {
    returnarray.hand = allhand;
    returnarray.deck = deck;
    returnarray.field = field;
    io.emit('updateGame', returnarray);
  };

  var fold = function (n) {
    if (gameinprogress) {
      if (userid[n] != null) {
        if (gamedata.currentbet > userid[n].bet) {
          userid[n].turnstatus = "Fold";
        } else if (userid[n].turnbet == 0) {
          userid[n].turnstatus = "Check";
        } else if (gamedata.currentbet == gamedata.currentbet && n == betraisedplayer) {
          userid[n].turnstatus = "Raise";
        } else {
          userid[n].turnstatus = "Call";
        }

        if (gamedata.currentbet > userid[n].bet && gamedata.numplayers > 1) {

          userid[n].cards = [];
          returnarray.hand[n] = [];
          userid[n].isingame = false;
          gamedata.numplayers = gamedata.numplayers - 1;
          userid[n].didbet = true;
          io.emit('updateGame', returnarray);
          io.emit('send:gameupdate', {
            user: "APPLICATION BOT",
            text: userid[n].name + " has folded."
          });
          endturn(n);
        } else if (gamedata.currentbet == userid[n].bet && (betraisedplayer != n || betiscalled)) {
          userid[n].didbet = true;
          betiscalled = true;
          if (userid[n].turnstatus == "Call") {
            io.emit('send:gameupdate', {
              user: "APPLICATION BOT",
              text: userid[n].name + " has called the current bet at $" + gamedata.currentbet + "."
            });
            endturn(n);
          } else {
            io.emit('send:gameupdate', {
              user: "APPLICATION BOT",
              text: userid[n].name + " has checked the current bet at $" + gamedata.currentbet + "."
            });
            endturn(n);
          }

        } else {
          if (gamedata.numplayers > 1) {
            io.emit('send:gameupdate', {
              user: "APPLICATION BOT",
              text: userid[n].name + " has raised the current bet to $" + gamedata.currentbet + "."
            });
          }
          endturn(n);

          /*          if (((gamedata.turnnum == betraisedplayer && !betraised) || gamedata.numplayers == 1)) {
          
          
                    } else {
                      if (gamedata.phase != "river" && gamedata.phase != "waitingtostart") {
          
                      }
                    }*/
        }
        bets();
      } else {
        endturn(n);
      }
    }
  };

  var endturn = function (n) {

    var everyonebet = false;
    for (i = 0; i < userid.length; i++) {

      if (userid[i] != null) {
        if (userid[i].isingame == true) {
          if (userid[i].didbet == true) {
            everyonebet = true;
          } else {
            everyonebet = false;
            break;
          }
        }
      }
    }


    if ((everyonebet) || gamedata.numplayers <= 1) {

      if (gamedata.numplayers == 1) {

        if (field.length < 5) {
          var tempfieldlength = field.length;
          for (i = 0; i < 5 - tempfieldlength; i++) {
            deckarr = deck;
            num1 = Math.floor(Math.random() * (deckarr.length - 1));
            card1 = deckarr[num1];
            deckarr.splice(num1, 1);

            fieldarr = field;
            fieldarr.push(card1);

            field = fieldarr;
            deck = deckarr;
          }
        }

        allowbet = false;
        winner();
        gamedatacards();
        gameinprogress = false;
        handdealt = false;
        gamedata.phase = "waitingtostart";
        io.emit('updatePhase', gamedata);
        clearTimeout(timeoutfunction);
        io.emit('updateTimeout', 0);

      } else if (gamedata.phase == "preflop") {


        allowbet = false;
        io.emit('toggleDealField', 1);

      } else if (gamedata.phase == "flop") {


        allowbet = false;
        io.emit('toggleDealField', 1);

      } else if (gamedata.phase == "turn") {


        allowbet = false;
        io.emit('toggleDealField', 1);

      } else if (gamedata.phase == "river") {
        allowbet = false;

        winner();
        gameinprogress = false;
        handdealt = false;
        gamedata.phase = "waitingtostart";
        io.emit('updatePhase', gamedata);
        clearTimeout(timeoutfunction);
        io.emit('updateTimeout', 0);
      }

    } else {

      for (i = 0; i < userid.length; i++) {
        gamedata.turnnum = (gamedata.turnnum + 1) % userid.length;
        if (userid[gamedata.turnnum] != null) {
          if (userid[gamedata.turnnum].cards.length != 0) {
            break;
          }
        }
      }
      betraised = false;

      io.emit('updatePhase', gamedata);

    }
    if (gameinprogress) {

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
      for (i = 0; i < userid.length; i++) {
        if (userid[i] != null) {
          userid[i].didbet = false;
          userid[i].turnstatus = "";
          userid[i].turnbet = 0;
        }
      }

      betraised = false;
      allowbet = true;
      io.emit('updatePhase', gamedata);
      gamedatacards();
      updateGame.bets();
      clearTimeout(timeoutfunction);
      timeoutfunction = setTimeout(ontimeout, 10000);
      io.emit('updateTimeout', 10);
    }
  };

  var ontimeout = function () {
    clearTimeout(timeoutfunction);
    if (gamedata.numplayers != 0) {
      if (!allowbet) {

        if (gamedata.phase == "preflop") {

          dealfield(gamedata.turnnum);

        } else if (gamedata.phase == "flop") {

          dealfield(gamedata.turnnum);

        } else if (gamedata.phase == "turn") {

          dealfield(gamedata.turnnum);

        } else if (gamedata.phase == "river") {
          allowbet = false;
          updateGame.winner();
          gameinprogress = false;
          handdealt = false;
          gamedata.phase = "waitingtostart";
          io.emit('updatePhase', gamedata);
        }
      } else {

        fold(gamedata.turnnum);

      }
    } else {

      gamedata.phase == 'waitingtostart'
      gameinprogress = false;
      handdealt = false;
      io.emit('updatePhase', gamedata);

    }
  };

  var winner = function () {
    gameinprogress = false;
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
      if (allplayerhands[i] == (null || undefined)) {
        allplayerhands.splice(i, 1, []);
      } else if (allplayerhands[i].cards.length == 0) {
        allplayerhands.splice(i, 1, []);
      }
    }

    var winnerarray = []
    for (i = 0; i < userid.length; i++) {
      if (userid[i] != null) {
        if (userid[i].cards.length != 0) {
          winnerarray.push(userid[i].num);
        }
      }
    }

    if (winnerarray.length > 1) {

      var results = Ranker.orderHands(allplayerhands, field);

      winner.id = userid[winnerarray[results[0][0].id - 1]];
      winner.idname = winner.id.name;
      winner.hand = results[0][0].description;
      winner.totalwon = 0;
      winner.winninghand = [];
      var tempwinninghand = results[0][0].playingCards;
      for (i = 0; i < tempwinninghand.length; i++) {
        winner.winninghand[i] = tempwinninghand[i].rank.concat(tempwinninghand[i].suit);
      }

      //handle bet after match end
      for (i = 0; i < userid.length; i++) {

        if (userid[i] != null) {
          winner.id.money = winner.id.money + userid[i].bet;
          winner.totalwon = winner.totalwon + userid[i].bet;
        }
      }

      io.emit('send:gameupdate', {
        user: "APPLICATION BOT",
        text: winner.idname + " has won $" + winner.totalwon + " with " + winner.hand + "!"
      });

      bets();
      io.emit('updateWinningHand', winner.winninghand)
    } if (winnerarray.length == 1) {

      winner.id = userid[winnerarray[0]];
      winner.idname = winner.id.name;
      winner.hand = Ranker.getHand(winner.id.cards, field);
      winner.totalwon = 0;
      winner.winninghand = [];
      var tempwinninghand = winner.hand.playingCards;
      for (i = 0; i < tempwinninghand.length; i++) {
        winner.winninghand[i] = tempwinninghand[i].rank.concat(tempwinninghand[i].suit);
      }

      //handle bet after match end
      for (i = 0; i < userid.length; i++) {

        if (userid[i] != null) {
          winner.id.money = winner.id.money + userid[i].bet;
          winner.totalwon = winner.totalwon + userid[i].bet;
        }
      }

      io.emit('send:gameupdate', {
        user: "APPLICATION BOT",
        text: winner.idname + " has won $" + winner.totalwon + " with " + winner.hand.description + "!"
      });
      io.emit('updateWinningHand', winner.winninghand)
      bets();

    }
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
    /*   for (user in names) {
         res.push(user);
       }*/
    for (i = 0; i < userid.length; i++) {
      if (userid[i] != null) {
        res[i] = userid[i].name;
      }
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

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
        if (gameinprogress) {
            if (userid[n] != null) {
                if (gamedata.currentbet > userid[n].bet) {

                    userid[n].cards = [];
                    returnarray.hand[n] = [];
                    userid[n].isingame = false;
                    gamedata.numplayers = gamedata.numplayers - 1;
                    console.log(gamedata.numplayers);
                    io.emit('updateGame', returnarray);
                    io.emit('send:message', {
                        user: "APPLICATION BOT",
                        text: userid[n].name + " has folded."
                    });
                    endturn(n);
                } else if (gamedata.currentbet == userid[n].bet && (betraisedplayerbefore != n || betiscalled)) {
                    endturn(n);
                    betiscalled = true;
                    if (gameinprogress) {
                        io.emit('send:message', {
                            user: "APPLICATION BOT",
                            text: userid[n].name + " has called/checked the current bet at $" + gamedata.currentbet + "."
                        });
                    }
                } else {
                    endturn(n);
                    if (gameinprogress) {
                        io.emit('send:message', {
                            user: "APPLICATION BOT",
                            text: userid[n].name + " has raised the current bet to $" + gamedata.currentbet + "."
                        });
                    }
                }
            } else {
                endturn(n);
            }
        }
    };

    var endturn = function (n) {

        if ((gamedata.turnnum == betraisedplayerbefore && !betraised) || gamedata.numplayers == 1) {

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

                /*          if (field.length >= 5) {
        
                          }*/
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

            //handle bet after match end
            for (i = 0; i < userid.length; i++) {

                if (userid[i] != null) {
                    winner.id.money = winner.id.money + userid[i].bet;
                    winner.totalwon = winner.totalwon + userid[i].bet;
                }
            }

            io.emit('send:message', {
                user: "APPLICATION BOT",
                text: winner.idname + " has won $" + winner.totalwon + " with " + winner.hand + "!"
            });

            bets();
        } if (winnerarray.length == 1) {

            winner.id = userid[winnerarray[0]];
            winner.idname = winner.id.name;
            winner.hand = Ranker.getHand(winner.id.cards, field);
            winner.totalwon = 0;


            //handle bet after match end
            for (i = 0; i < userid.length; i++) {

                if (userid[i] != null) {
                    winner.id.money = winner.id.money + userid[i].bet;
                    winner.totalwon = winner.totalwon + userid[i].bet;
                }
            }

            io.emit('send:message', {
                user: "APPLICATION BOT",
                text: winner.idname + " has won $" + winner.totalwon + " with " + winner.hand.description + "!"
            });

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


module.exports.updateGame = updateGame;
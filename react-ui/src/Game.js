import React, { Component } from 'react';


class GameUsers extends React.Component {
  render() {
    return (
      <div className='gameuserlist'>
        {
          this.props.users.map((user, i) => {
            return (
              <div className={('usercontainer' + i)}>
                <div className='usercards'>
                  {this.props.hand[i] != (null || undefined) &&

                    this.props.hand[i].map((card) => {
                      return (
                        this.props.playerid == i || !this.props.gameinprogress ? <img className={this.props.winninghand.indexOf(card) > -1 ? 'playercardsimagehighlight' : 'playercardsimage'} src={'/cards/' + card + '.png'} key={card} /> : <img className='playercardsimage' src={'/cards/x.png'} key={card} />
                      );
                    })
                  }
                  {this.props.hand[i] == (null || undefined) &&
                    <span className='usercards'> </span>

                  }
                </div>
                <div className={this.props.turn == i ? 'userborderturn' : 'userborder'}>
                  <div className='username'>
                    {user}
                  </div>
                  <div className='usermoney'>
                    ${this.props.money[i]}
                  </div>
                </div>
                <div className='userstatus'>
                  {this.props.status[i]}
                </div>
                <div className={'userbet' + i}>${this.props.bet[i]}</div>
              </div>

            );
          })}
      </div>
    );
  }
}



class Betting extends React.Component {
  render() {
    return (
      <div className='betting'>
        <div>Betting -- Total Money: ${this.props.money}<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>Player Bet: ${this.props.playerbet}<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>Current Pot: ${this.props.currentbet}</div>
        <div className='bettingbutton'>
          <button disabled={!this.props.isturn || this.props.dealfield || !this.props.gameinprogress} className="button" onClick={() => this.props.handleBet(1)}>Bet $1</button>
          <button disabled={!this.props.isturn || this.props.dealfield || !this.props.gameinprogress} className="button" onClick={() => this.props.handleBet(5)}>Bet $5</button>
          <button disabled={!this.props.isturn || this.props.dealfield || !this.props.gameinprogress || (this.props.playerbet >= this.props.currentbet)} className="button" onClick={() => this.props.handleBet(Math.max(this.props.currentbet - this.props.playerbet), 0)}>Call</button>
          <button disabled={!this.props.isturn || this.props.dealfield || !this.props.gameinprogress} className="button" onClick={() => this.props.handleBet(this.props.money)}>All In</button>
          <button disabled={!this.props.isturn || this.props.dealfield || !this.props.gameinprogress} className="button" onClick={() => this.props.handleFold()}>{this.props.playerbet >= this.props.currentbet ? (this.props.turnbet == 0 ? 'Check' : 'End Turn') : 'Fold'}</button>
        </div>
      </div>

    );
  }
}



/*
class Deck extends React.Component {
          constructor() {
        super();
    this.state = {
          value: null,
    };
  }
  render() {
    return (
      <div className="deck">
          Deck: <br />{this.props.deckhtml}
        </div>
        );
  }
}
*/
class Field extends React.Component {

  render() {
    return (
      <div>
        {this.props.field != (null || undefined) &&
          this.props.field.map((card, i) => {
            return (
              <div key={'field: ' + card}>
                <div className={'fieldcards'} key={card}><img className={this.props.winninghand.indexOf(card) > -1 ? ('fieldcardsimagehighlight' + i) : ('fieldcardsimage' + i)} src={'/cards/' + card + '.png'} /></div>
                <span className="spacer">&nbsp;</span>
              </div>);
          })
        }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      hand: [],
      field: [],
      deck: ["Ac", "Ad", "Ah", "As", "2c", "2d", "2h", "2s", "3c", "3d", "3h", "3s", "4c", "4d", "4h", "4s",
        "5c", "5d", "5h", "5s", "6c", "6d", "6h", "6s", "7c", "7d", "7h", "7s", "8c", "8d", "8h", "8s",
        "9c", "9d", "9h", "9s", "10c", "10d", "10h", "10s", "Jc", "Jd", "Jh", "Js", "Qc", "Qd", "Qh", "Qs",
        "Kc", "Kd", "Kh", "Ks"],
      users: [],
      money: [],
      bet: [],
      playerid: 0,
      phase: "",
      currentbet: 0,
      dealer: -1,
      turn: -1,
      isdealer: false,
      isturn: false,
      dealhand: false,
      dealfield: false,
      gameinprogress: false,
      timeout: 0,
      status: "",
      turnbet: 0,
      winninghand: ['', '', '', '', '']

    };
    this.updatePhase = this.updatePhase.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.updateBet = this.updateBet.bind(this);
    this.handleStartGame = this.handleStartGame.bind(this);
    this.handleDealHand = this.handleDealHand.bind(this);
    this.handleDealField = this.handleDealField.bind(this);
    this.handleBet = this.handleBet.bind(this);
    this.handleFold = this.handleFold.bind(this);
    this.updatePlayerId = this.updatePlayerId.bind(this);
    this.toggleDealHand = this.toggleDealHand.bind(this);
    this.toggleDealField = this.toggleDealField.bind(this);
    this.updateTimeout = this.updateTimeout.bind(this);
    this.timer = this.timer.bind(this);
    this.updateWinningHand = this.updateWinningHand.bind(this);
  }

  componentDidMount() {

    this.props.socket.on('updatePhase', this.updatePhase);
    this.props.socket.on('updateGame', this.updateGame);
    this.props.socket.on('updateBet', this.updateBet);
    this.props.socket.on('updatePlayerId', this.updatePlayerId);
    this.props.socket.on('toggleDealHand', this.toggleDealHand);
    this.props.socket.on('toggleDealField', this.toggleDealField);
    this.props.socket.on('updateTimeout', this.updateTimeout);
    this.props.socket.on('updateWinningHand', this.updateWinningHand);
  }

  updateTimeout(n) {

    this.setState({

      timeout: n

    })

    clearInterval(this.doInterval);

    this.doInterval = setInterval(this.timer, 1000);

  }

  timer() {

    if (this.state.timeout > 0) {
      var temptimeout = this.state.timeout - 1;
      this.setState({
        timeout: temptimeout
      })
    } else {
      clearInterval(this.doInterval);
    }
  }


  updatePlayerId(playerid) {

    this.setState({

      playerid: playerid

    })

  }

  updateWinningHand(data) {

    this.setState({

      winninghand: data

    })

  }

  updatePhase(phasedata) {

    var refisturn = false;
    if (phasedata.turnnum == this.state.playerid) {
      refisturn = true;
    } else {
      refisturn = false;
    }

    var refisdealer = false;
    if (phasedata.dealernum == this.state.playerid) {
      refisdealer = true;
    } else {
      refisdealer = false;
    }

    var refgameinprogress = false;
    if (phasedata.phase != "waitingtostart") {
      refgameinprogress = true;
    } else {
      refgameinprogress = false;
    }

    this.setState({

      phase: phasedata.phase,
      currentbet: phasedata.currentbet,
      dealer: phasedata.dealernum,
      turn: phasedata.turnnum,
      isturn: refisturn,
      isdealer: refisdealer,
      gameinprogress: refgameinprogress

    })

  }

  toggleDealField(value) {
    if (value == 1) {
      this.setState({
        dealfield: true
      })
    } else {
      this.setState({
        dealfield: false
      })

    }

  }

  toggleDealHand() {

    if (this.state.dealhand == true) {
      this.setState({
        dealhand: false
      })
    } else {
      this.setState({
        dealhand: true
      })
    }

  }


  updateGame(gamedata) {

    if (gamedata.length == 0) {

    } else {

      this.setState({
        hand: gamedata.hand,
        deck: gamedata.deck,
        field: gamedata.field
      });

    }

  }

  updateBet(betdata) {


    if (betdata.length == 0) {

    } else {

      this.setState({
        money: betdata.money,
        bet: betdata.bet,
        status: betdata.turnstatus,
        turnbet: betdata.turnbet
      });

    }


  }

  handleStartGame() {

    this.props.socket.emit('startgame');

  }

  handleDealHand() {

    this.props.socket.emit('dealhand');

  }

  handleDealField() {

    this.props.socket.emit('dealfield');

  }

  handleBet(amount) {

    this.props.socket.emit('dobet', amount);

  }

  handleFold() {

    this.props.socket.emit('fold');

  }



  render() {
    /*    var handhtml = this.state.hand.map(function (card) {
          return <span className="card" key={card}>{card}</span>;
        });
    */


    /*
        if (this.state.deck != null) {
          var deckhtml = this.state.deck.map(function (card) {
            return <span className="card" key={card}>{card}</span>;
          });
        }


        {this.state.winninghand.indexOf(card) > -1 ? 'fieldcardsimagehighlight' : 'fieldcardsimage'}
        */
    return (
      <div className='gamecontainer'>
        <div className='titletext'><span><strong>Poker Game</strong></span> -- {this.state.phase == "waitingtostart" ? "Waiting to Start" : (this.state.phase == "preflop" ? "Pre-flop" : (this.state.phase == "flop" ? "Flop" : (this.state.phase == "turn" ? "Turn" : (this.state.phase == "river" ? "River" : ""))))}
          -- Turn Time: {this.state.timeout > 0 ? this.state.timeout : 0}
        </div>
        <br />
        <br />
        <GameUsers
          users={this.props.users}
          hand={this.state.hand}
          bet={this.state.bet}
          money={this.state.money}
          dealer={this.state.dealer}
          turn={this.state.turn}
          playerid={this.state.playerid}
          gameinprogress={this.state.gameinprogress}
          status={this.state.status}
          winninghand={this.state.winninghand}
        />
        <div className='fieldarea'>
          <div className='fieldcardcontainer'>
            <div className='playingtable'>
              <div className='circleleftouter'></div>
              <div className='rectangleouter'></div>
              <div className='circlerightouter'></div>
              <div className='circleleftinner'></div>
              <div className='rectangleinner'></div>
              <div className='circlerightinner'></div>
              <div className='fieldcurrentpot'>Pot: ${this.state.currentbet}</div>
              <Field
                field={this.state.field}
                winninghand={this.state.winninghand}
              />
            </div>

          </div>

        </div>

        <div className='dealbuttons'>
          <button className="button" disabled={this.state.gameinprogress} onClick={this.handleDealHand}>Deal Hand</button>
          <button className="button" disabled={!this.state.dealfield || !this.state.isdealer} onClick={this.handleDealField}>Deal Field</button>
        </div>

        {/*
          <br />playerid: {this.state.playerid} -- gameinprogress: {this.state.gameinprogress.toString()} -- {this.state.phase} -- turn: {this.state.turn} -- dealer: {this.state.dealer} -- isdealer: {this.state.isdealer.toString()}{this.state.dealfield.toString()} -- isturn: {this.state.isturn.toString()} -- currentbet: {this.state.currentbet}<br />
          */}

        <br />

        <div className='bigplayercardscontainer'>
          {this.state.hand[this.state.playerid] != (null || undefined) &&
            this.state.hand[this.state.playerid].map((card) => {
              return (
                <div key={'bigplayercards: ' + card}>
                  <span className='bigplayercards' key={'big ' + card}><img className='bigplayercardsimage' src={'/cards/' + card + '.png'} /></span>
                </div>
              );
            })
          }
          {this.state.hand[this.state.playerid] == (null || undefined) &&
            <span className='bigplayercards'> </span>
          }
        </div>
        <div className='cardsleft'>

          Cards Left in Deck: {this.state.deck != (null || undefined) &&
            this.state.deck.length}
        </div>

        <Betting
          handleBet={this.handleBet}
          handleFold={this.handleFold}
          money={this.state.money[this.state.playerid]}
          isturn={this.state.isturn}
          currentbet={this.state.currentbet}
          playerbet={this.state.bet[this.state.playerid]}
          dealfield={this.state.dealfield}
          gameinprogress={this.state.gameinprogress}
          turnbet={this.state.turnbet[this.state.playerid]}
        />
      </div>

    );
  }
}

export default Game;

/*
todo: auto check win conditions. rewrites: card is a object with {num,suit}
for example checking flush means if exists 5 of same suit on board (7 cards)
checking straight means in 7 size array if exists 5 in a row
would have to map J,Q,K to real numbers 
todo: multiplayer with express/node server
todo: refactor with more react objects
*/
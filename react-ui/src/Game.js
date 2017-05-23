import React, { Component } from 'react';


class GameUsers extends React.Component {
  render() {
    return (
      <div className='gameuserlist'>
        {
          this.props.users.map((user, i) => {
            return (
              <div className='gameusercontainer'>
                <div className='gameuser'>
                  <strong>{user}</strong> <br />
                  ${this.props.money[i]}
                </div>
                <div>
                  {this.props.hand[i] != null &&

                    this.props.hand[i].map((card) => {
                      return (
                        <span className='playercards' key={card}>{card}</span>
                      );
                    })
                  }
                  <br />
                  <span className='betamount'>Bet: ${this.props.bet[i]}</span>
                </div>
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
        <div>Betting</div>
        <div className='bettingbutton'>
          <button disabled={!this.props.isturn} className="button" onClick={() => this.props.handleBet(1)}>Bet $1</button>
          <button disabled={!this.props.isturn} className="button" onClick={() => this.props.handleBet(5)}>Bet $5</button>
          <button disabled={!this.props.isturn} className="button" onClick={() => this.props.handleBet(this.props.currentbet - this.props.playerbet)}>Call</button>
          <button disabled={!this.props.isturn} className="button" onClick={() => this.props.handleBet(this.props.money)}>All In</button>
          <button disabled={!this.props.isturn} className="button" onClick={() => this.props.handleFold()}>End Turn/Fold</button>
        </div>
        <br />
        Total Money: ${this.props.money}
      </div>

    );
  }
}




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
      dealer: 0,
      turn: 0,
      isdealer: false,
      isturn: false,
      dealhand: false,
      dealfield: false,
      gameinprogress: false

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
  }

  componentDidMount() {

    this.props.socket.on('updatePhase', this.updatePhase);
    this.props.socket.on('updateGame', this.updateGame);
    this.props.socket.on('updateBet', this.updateBet);
    this.props.socket.on('updatePlayerId', this.updatePlayerId);
    this.props.socket.on('toggleDealHand', this.updatePlayerId);
    this.props.socket.on('toggleDealField', this.updatePlayerId);

  }

  updatePlayerId(playerid) {

    this.setState({

      playerid: playerid

    })

  }

  updatePhase(phasedata) {
console.log(phasedata);
    var refisturn = false;
    if (phasedata.turnnum = this.state.playerid) {
      refisturn = true;
    } else {
      refisturn = false;
    }

    var refisdealer = false;
    if (phasedata.dealernum = this.state.playerid) {
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

    console.log (phasedata.dealer);
    console.log (phasedata.turn);

  }

  toggleDealField() {

    if (this.state.dealfield = true) {
      this.setState({
        dealfield: false
      })
    } else {
      this.setState({
        dealfield: true
      })
    }

  }

  toggleDealHand() {

    if (this.state.dealhand = true) {
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
        bet: betdata.bet
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
    if (this.state.field != null) {
      var fieldhtml = this.state.field.map(function (card) {
        return (
          <div>
            <span className="fieldcards" key={card}>{card}</span>
            <span className="spacer">&nbsp;</span>
          </div>
        );
      });
    }


    if (this.state.deck != null) {
      var deckhtml = this.state.deck.map(function (card) {
        return <span className="card" key={card}>{card}</span>;
      });
    }
    return (
      <div>
        <h1>Poker Game</h1>
        <GameUsers
          users={this.props.users}
          hand={this.state.hand}
          bet={this.state.bet}
          money={this.state.money}
        />


        <div className='fieldarea'>
          <div className='fieldcardcontainer'>{fieldhtml}
          </div>
          <div className='dealbuttons'>
            <button className="button" disabled={this.state.gameinprogress} onClick={this.handleDealHand}>Deal Hand</button>
            <button className="button" disabled={!this.state.dealfield || !this.state.isdealer} onClick={this.handleDealField}>Deal Field</button>
          </div>
          <br /> {this.state.gameinprogress.toString()} -- {this.state.phase} -- turn: {this.state.turn} -- dealer: {this.state.dealer} -- isturn: {this.state.isturn.toString()} -- currentbet: {this.state.currentbet}<br />

          <div className='cardsleft'>
            Cards Left in Deck: {this.state.deck != null &&
              this.state.deck.length}
          </div>

        </div> <br />
        <Betting
          handleBet={this.handleBet}
          handleFold={this.handleFold}
          money={this.state.money[this.state.playerid]}
          isturn={this.state.isturn}
          currentbet={this.state.currentbet}
          playerbet={this.state.bet[this.state.playerid]}
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
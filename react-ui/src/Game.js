import React, { Component } from 'react';


class GameUsers extends React.Component {
  render() {
    return (
      <div className='gameuserlist'>
        {
          this.props.users.map((user, i) => {
            return (
              <div key={i} className='gameuser'>

                {this.props.hand[i] != null &&

                  this.props.hand[i].map((card) => {
                    return (
                      <span className="card" key={card}>{card}</span>
                    );
                  })

                }

                <br />
                {user}

                <br />
                {this.props.bet[i] != null &&

                  this.props.bet[i].map((bet) => {
                    return (
                      <span >${bet}</span>
                    );
                  })

                }
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
      <div>
        <div>Betting</div>
        <div><button className="btn" onClick={() => this.props.handleBet(1)}>Bet $1</button></div>
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
      bet: []
    };
    this.updateGame = this.updateGame.bind(this);
    this.updateBet = this.updateBet.bind(this);
    this.handleDealHand = this.handleDealHand.bind(this);
    this.handleDealField = this.handleDealField.bind(this);
    this.handleBet = this.handleBet.bind(this);
  }

  componentDidMount() {

    this.props.socket.on('updateGame', this.updateGame);
    this.props.socket.on('updateBet', this.updateBet);

  }

  updateGame(data) {

    if (data.length == 0) {

    } else {

      this.setState({
        hand: data[0],
        deck: data[1],
        field: data[2]
      });

    }

  }

  updateBet(data) {

    console.log('update bet');
    if (data.length == 0) {

    } else {

      this.setState({
        money: data[3],
        bet: data[4]
      });

    }


  }



  handleDealHand() {

    this.props.socket.emit('dealhand');

  }

  handleDealField() {

    this.props.socket.emit('dealfield');

  }

  handleBet(amount) {
    console.log('handle bet');
    this.props.socket.emit('dobet', amount);

  }


  render() {
    /*    var handhtml = this.state.hand.map(function (card) {
          return <span className="card" key={card}>{card}</span>;
        });
    */
    if (this.state.field != null) {
      var fieldhtml = this.state.field.map(function (card) {
        return <span className="card" key={card}>{card}</span>;
      });
    }
    if (this.state.deck != null) {
      var deckhtml = this.state.deck.map(function (card) {
        return <span className="card" key={card}>{card}</span>;
      });
    }
    return (
      <div className="game">
        <div className="instructions">
          To play: press "Deal Hand / Restart" button to get your initial hand. Then press "Deal Field" to add a card to the community. You need to press 3 times for flop, then 1 more time each for turn and river. After 5 cards, then press "Deal Hand / Restart".
        </div>
        <div className="field">
          <div>Field: </div>
          {fieldhtml}
        </div>

        <br />
        <GameUsers
          users={this.props.users}
          hand={this.state.hand}
          bet={this.state.bet}
        />
        { /*   <div className="hand">
          Hand: {handhtml}
        </div>
  */}
        <button className="btn" onClick={this.handleDealHand}>Deal Hand / Restart</button>
        <button className="btn" onClick={this.handleDealField}>Deal Field</button>
        <br /><br />
        <Deck deckhtml={deckhtml} />

        <div className="cardsleft">
          Cards Left in Deck: {this.state.deck.length}
        </div> <br /><br />

        <Betting
          handleBet={this.handleBet}
          money={this.state.money}
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
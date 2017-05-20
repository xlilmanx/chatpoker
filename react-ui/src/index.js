import React from 'react';
import ReactDOM from 'react-dom';




class Deck extends React.Component {
  constructor(){
    super();
    this.state={
      value: null,
    };
  }
  render() {
    return (
        <div className="deck">
          Deck: {this.props.deckhtml}
        </div>
    );
  }
}

class Game extends React.Component {
  constructor(){
    super();
    this.state={
      hand: [],
      field: [],
      deck: ["Ac","Ad","Ah","As","2c","2d","2h","2s","3c","3d","3h","3s","4c","4d","4h","4s",
             "5c","5d","5h","5s","6c","6d","6h","6s","7c","7d","7h","7s","8c","8d","8h","8s",
             "9c","9d","9h","9s","10c","10d","10h","10s","Jc","Jd","Jh","Js",
             "Qc","Qd","Qh","Qs","Kc","Kd","Kh","Ks"]
    };
  }
  
  dealHand(){
    var deckarr = ["Ac","Ad","Ah","As","2c","2d","2h","2s","3c","3d","3h","3s","4c","4d","4h","4s",
                   "5c","5d","5h","5s","6c","6d","6h","6s","7c","7d","7h","7s","8c","8d","8h","8s",
                  "9c","9d","9h","9s","10c","10d","10h","10s","Jc","Jd","Jh","Js","Qc","Qd","Qh","Qs",
                   "Kc","Kd","Kh","Ks"];
    var num1 = Math.floor(Math.random()*(deckarr.length-1));
    var card1 = deckarr[num1];
    deckarr.splice(num1,1);
	  var num2 = Math.floor(Math.random()*(deckarr.length-1));
    var card2 = deckarr[num2];
    deckarr.splice(num2,1);
    
    var hand = [card1,card2];
    
    this.setState({
      hand: hand,
      field: [],
      deck: deckarr
    })
  }
  
  dealField(){
    var deckarr = this.state.deck;
    var num1 = Math.floor(Math.random()*(deckarr.length-1));
    var card1 = deckarr[num1];
    deckarr.splice(num1,1);
    
    var fieldarr = this.state.field;
    fieldarr.push(card1); 
    
    this.setState({
      field: fieldarr,
      deck: deckarr
    })
  }
  
  render() {
     var handhtml = this.state.hand.map(function(card) {
        return <span className="card" key={card}>{card}</span>;
     });
    
    var fieldhtml = this.state.field.map(function(card) {
        return <span className="card" key={card}>{card}</span>;
     });
   
    var deckhtml = this.state.deck.map(function(card) {
        return <span className="card" key={card}>{card}</span>;
     });
    
    return (
      <div className="game">
        <div className="instructions">
          To play: press "Deal Hand / Restart" button to get your initial hand. Then press "Deal Field" to add a card to the community. You need to press 3 times for flop, then 1 more time each for turn and river. After 5 cards, then press "Deal Hand / Restart".
        </div>
        <div className = "field">
          <div>Field: </div>
          {fieldhtml}
        </div>
        
        <br/>
        <div className="hand">
          Hand: {handhtml}
        </div>
        <button className="btn" onClick={() => this.dealHand()}>Deal Hand / Restart</button>
        <button className="btn" onClick={() => this.dealField()}>Deal Field</button>
        <br/><br/>
        <Deck deckhtml = {deckhtml}/>
        
        <div className="cardsleft">
          Cards Left in Deck: {this.state.deck.length}
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('wrapper')
);

/*
todo: auto check win conditions. rewrites: card is a object with {num,suit}
for example checking flush means if exists 5 of same suit on board (7 cards)
checking straight means in 7 size array if exists 5 in a row
would have to map J,Q,K to real numbers 
todo: multiplayer with express/node server
todo: refactor with more react objects
*/
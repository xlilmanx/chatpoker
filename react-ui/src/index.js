import React from 'react';
import ReactDOM from 'react-dom';


import io from 'socket.io-client'
var socket = io.connect(process.env.PORT);

class UsersList extends React.Component{
  render() {
      return (
          <div className='users'>
              <h3> Online Users </h3>
              <ul>
                  {
                      this.props.users.map((user, i) => {
                          return (
                              <li key={i}>
                                  {user}
                              </li>
                          );
                      })
                  }
              </ul>                
          </div>
      );
  }
}



class Message extends React.Component{
  render() {
      return (
          <div className="message">
              <strong>{this.props.user} :</strong> 
              <span>{this.props.text}</span>        
          </div>
      );
  }
}



class MessageList extends React.Component{
  render() {
      return (
          <div className='messages'>
              <h2> Conversation: </h2>
              {
                  this.props.messages.map((message, i) => {
                      return (
                          <Message
                              key={i}
                              user={message.user}
                              text={message.text}
                          />
                      );
                  })
              }
          </div>
      );
  }
}


class MessageForm extends React.Component{

constructor(props) {
    super(props);
    this.state = {text: ''};
	this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleSubmit(e) {
      e.preventDefault();
      var message = {
          user : this.props.user,
          text : this.state.text
      }
      this.props.onMessageSubmit(message); 
      this.setState({ text: '' });
  }

  changeHandler(e) {
      this.setState({ text : e.target.value });
  }

  render() {
      return(
          <div className='message_form'>
              <h3>Write New Message</h3>
              <form onSubmit={this.handleSubmit}>
                  <input
                      onChange={this.changeHandler}
                      value={this.state.text}
                  />
              </form>
          </div>
      );
  }
}

class ChangeNameForm extends React.Component{
	
	constructor(props) {
    super(props);
    this.state = {newName: ''};
	this.onKey = this.onKey.bind(this);
	this.handleSubmit = this.handleSubmit.bind(this);
  }


  onKey(e) {
      this.setState({ newName : e.target.value });
  }

  handleSubmit(e) {
      e.preventDefault();
      var newName = this.state.newName;
      this.props.onChangeName(newName);    
      this.setState({ newName: '' });
  }

  render() {
      return(
          <div className='change_name_form'>
              <h3> Change Name </h3>
              <form onSubmit={this.handleSubmit}>
                  <input
                      onChange={this.onKey}
                      value={this.state.newName}
                  />
              </form>  
          </div>
      );
  }
}


class ChatApp extends React.Component{

	constructor(props) {
    super(props);
    this.state = {users: [], messages:[], text: ''};
	this._initialize = this._initialize.bind(this);
	this._messageRecieve = this._messageRecieve.bind(this);
	this._userJoined = this._userJoined.bind(this);
	this._userLeft = this._userLeft.bind(this);
	this._userChangedName = this._userChangedName.bind(this);
	this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
	this.handleChangeName = this.handleChangeName.bind(this);

  }


  componentDidMount() {
      socket.on('init', this._initialize);
      socket.on('send:message', this._messageRecieve);
      socket.on('user:join', this._userJoined);
      socket.on('user:left', this._userLeft);
      socket.on('change:name', this._userChangedName);
  }

  _initialize(data) {
      var {users, name} = data;
      this.setState({users, user: name});
  }

  _messageRecieve(message) {
      var {messages} = this.state;
      messages.push(message);
      this.setState({messages});
  }

  _userJoined(data) {
      var {users, messages} = this.state;
      var {name} = data;
      users.push(name);
      messages.push({
          user: 'APPLICATION BOT',
          text : name +' Joined'
      });
      this.setState({users, messages});
  }

  _userLeft(data) {
      var {users, messages} = this.state;
      var {name} = data;
      var index = users.indexOf(name);
      users.splice(index, 1);
      messages.push({
          user: 'APPLICATION BOT',
          text : name +' Left'
      });
      this.setState({users, messages});
  }

  _userChangedName(data) {
      var {oldName, newName} = data;
      var {users, messages} = this.state;
      var index = users.indexOf(oldName);
      users.splice(index, 1, newName);
      messages.push({
          user: 'APPLICATION BOT',
          text : 'Change Name : ' + oldName + ' ==> '+ newName
      });
      this.setState({users, messages});
  }

  handleMessageSubmit(message) {
      var {messages} = this.state;
      messages.push(message);
      this.setState({messages});
      socket.emit('send:message', message);
  }

  handleChangeName(newName) {
      var oldName = this.state.user;
      socket.emit('change:name', { name : newName}, (result) => {
          if(!result) {
              return alert('There was an error changing your name');
          }
          var {users} = this.state;
          var index = users.indexOf(oldName);
          users.splice(index, 1, newName);
          this.setState({users, user: newName});
      });
  }

  render() {
      return (
          <div>
              <UsersList
                  users={this.state.users}
              />
              <MessageList
                  messages={this.state.messages}
              />
              <MessageForm
                  onMessageSubmit={this.handleMessageSubmit}
                  user={this.state.user}
              />
              <ChangeNameForm
                  onChangeName={this.handleChangeName}
              />
          </div>
      );
  }
}






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

ReactDOM.render(<ChatApp/>, document.getElementById('app'));

/*
todo: auto check win conditions. rewrites: card is a object with {num,suit}
for example checking flush means if exists 5 of same suit on board (7 cards)
checking straight means in 7 size array if exists 5 in a row
would have to map J,Q,K to real numbers 
todo: multiplayer with express/node server
todo: refactor with more react objects
*/
import React from 'react';
import ReactDOM from 'react-dom';
import ChatApp from './Chat.js';
import Game from './Game.js';
import io from 'socket.io-client'

var socket = io();

class MainWrapper extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            messages: [],
            text: '',
            gamescale: 0,
            gameupdate: []
        };
        this._initialize = this._initialize.bind(this);
        this._gameUpdateReceive = this._gameUpdateReceive.bind(this);
        this._messageRecieve = this._messageRecieve.bind(this);
        this._userJoined = this._userJoined.bind(this);
        this._userLeft = this._userLeft.bind(this);
        this._userChangedName = this._userChangedName.bind(this);
        this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

    }

    updateWindowDimensions() {
        var scale = Math.min(
            window.innerWidth / 1625,
            window.innerHeight / 910
        );
        scale = Math.min(scale, 1);

        this.setState({ gamescale: scale });
    }

    componentDidMount() {
        socket.on('init', this._initialize);
        socket.on('send:message', this._messageRecieve);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('change:name', this._userChangedName);
        socket.on('send:gameupdate', this._gameUpdateReceive);
        this.updateWindowDimensions();
        window.addEventListener("resize", this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    _initialize(data) {
        var { users, name } = data;
        this.setState({ users, user: name });
    }

    _gameUpdateReceive(message) {
        var { gameupdate } = this.state;
        gameupdate.push(message);
        this.setState({ gameupdate });
    }

    _messageRecieve(message) {
        var { messages } = this.state;
        messages.push(message);
        this.setState({ messages });
    }

    _userJoined(data) {
        var { messages } = this.state;
        var { users, name } = data;
        messages.push({
            user: 'APPLICATION BOT',
            text: name + ' Joined'
        });
        this.setState({ users, messages });
    }

    _userLeft(data) {
        var { messages } = this.state;
        var { users, name } = data;
        messages.push({
            user: 'APPLICATION BOT',
            text: name + ' Left'
        });
        this.setState({ users, messages });
    }

    _userChangedName(data) {
        var { oldName, newName } = data;
        var { users, messages } = this.state;
        var index = users.indexOf(oldName);
        users.splice(index, 1, newName);
        messages.push({
            user: 'APPLICATION BOT',
            text: 'Change Name : ' + oldName + ' ==> ' + newName
        });
        this.setState({ users, messages });
    }

    handleMessageSubmit(message) {
        var { messages } = this.state;
        messages.push(message);
        this.setState({ messages });
        socket.emit('send:message', message);
    }

    handleChangeName(newName) {
        var oldName = this.state.user;
        socket.emit('change:name', { name: newName }, (result) => {
            if (!result) {
                return alert('There was an error changing your name');
            }
            var { users } = this.state;
            var index = users.indexOf(oldName);
            users.splice(index, 1, newName);
            this.setState({ users, user: newName });
        });
    }

    render() {

        var csstransform = 'translate(0, 0) ' + 'scale(' + this.state.gamescale + ')';
        var cssgame = {
            transform: csstransform,
            position: 'absolute',
            top: 0,
            left: 0
        }
        var csschat = {
            transform: 'translate(0, 0) ' + 'scale(' + this.state.gamescale + ', 1)',
            position: 'absolute',
            top: 0,
            right: 0
        }

        return (

            <div className='appcontainer'>
                <div style={cssgame}>
                    <Game
                        socket={socket}
                        users={this.state.users} />
                </div>
                <div style={csschat}>
                    <ChatApp
                        socket={socket}
                        users={this.state.users}
                        handleChangeName={this.handleChangeName}
                        messages={this.state.messages}
                        handleMessageSubmit={this.handleMessageSubmit}
                        user={this.state.user}
                        gameupdate={this.state.gameupdate} />
                </div>
            </div>
        );
    }
}








ReactDOM.render(<MainWrapper />, document.getElementById('app'));
//ReactDOM.render(<Game />, document.getElementById('wrapper'));





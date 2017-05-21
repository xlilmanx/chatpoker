import React from 'react';
import ReactDOM from 'react-dom';
import ChatApp from './Chat.js';
import Game from './Game.js';
import io from 'socket.io-client'

var socket = io();


class MainWrapper extends React.Component {

    constructor(props) {
        super(props);
        this.state = { users: [], messages: [], text: '' };
        this._initialize = this._initialize.bind(this);
        this._messageRecieve = this._messageRecieve.bind(this);
        this._userJoined = this._userJoined.bind(this);
        this._userLeft = this._userLeft.bind(this);
        this._userChangedName = this._userChangedName.bind(this);
        this.handleMessageSubmit = this.handleMessageSubmit.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);

    }


    componentDidMount() {
        this.props.socket.on('init', this._initialize);
        this.props.socket.on('send:message', this._messageRecieve);
        this.props.socket.on('user:join', this._userJoined);
        this.props.socket.on('user:left', this._userLeft);
        this.props.socket.on('change:name', this._userChangedName);
    }

    _initialize(data) {
        var { users, name } = data;
        this.setState({ users, user: name });
    }

    _messageRecieve(message) {
        var { messages } = this.state;
        messages.push(message);
        this.setState({ messages });
    }

    _userJoined(data) {
        var { users, messages } = this.state;
        var { name } = data;
        users.push(name);
        messages.push({
            user: 'APPLICATION BOT',
            text: name + ' Joined'
        });
        this.setState({ users, messages });
    }

    _userLeft(data) {
        var { users, messages } = this.state;
        var { name } = data;
        var index = users.indexOf(name);
        users.splice(index, 1);
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
        this.props.socket.emit('send:message', message);
    }

    handleChangeName(newName) {
        var oldName = this.state.user;
        this.props.socket.emit('change:name', { name: newName }, (result) => {
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
        return (


            <Chat
                users={this.state.users}
                onChangeName={this.handleChangeName}
                messages={this.state.messages}
                onMessageSubmit={this.handleMessageSubmit}
                user={this.state.user}
            />


        );
    }

}











ReactDOM.render(<ChatApp socket={socket} />, document.getElementById('app'));
ReactDOM.render(<Game socket={socket} />, document.getElementById('wrapper'));




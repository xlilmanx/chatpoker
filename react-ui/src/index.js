import React from 'react';
import ReactDOM from 'react-dom';
import { ChatApp, MessageList } from './Chat.js';
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

    scrollToBottom() {
        const scrollHeight = this.messageList.scrollHeight;
        const height = this.messageList.clientHeight;
        const maxScrollTop = scrollHeight - height;
        this.messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }

    componentDidMount() {
        socket.on('init', this._initialize);
        socket.on('send:message', this._messageRecieve);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('change:name', this._userChangedName);
    }

    _initialize(data) {
        var { users, name } = data;
        this.setState({ users, user: name });
    }

    _messageRecieve(message) {
        var { messages } = this.state;
        messages.push(message);
        this.setState({ messages });
        this.scrollToBottom();
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
        socket.emit('updateclientnumber');
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
        return (
            <div>
                <Game
                    socket={socket}
                    users={this.state.users} />
                <ChatApp
                    socket={socket}
                    users={this.state.users}
                    handleChangeName={this.handleChangeName}
                    messages={this.state.messages}
                    handleMessageSubmit={this.handleMessageSubmit}
                    user={this.state.user} />
            </div>

        );
    }
}











ReactDOM.render(<MainWrapper />, document.getElementById('app'));
//ReactDOM.render(<Game />, document.getElementById('wrapper'));





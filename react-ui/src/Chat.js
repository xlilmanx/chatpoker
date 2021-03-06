import React, { Component } from 'react';


class UsersList extends React.Component {
    render() {
        return (
            <div className='users'>
                <h3> Online Users </h3>
                <ul className='userslist'>
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



class Message extends React.Component {
    render() {

        if (this.props.user == "APPLICATION BOT") {

            return (<div className="message">
                <strong>{this.props.text} </strong>
            </div>);

        } else {

            return (<div className="message">
                <strong>{this.props.user}: </strong>
                <span>{this.props.text}</span>
            </div>);
        }

    }
}



class MessageList extends React.Component {

    componentDidUpdate() {
        this.scrollToBottom();
    }

    scrollToBottom() {
        const scrollHeight = this.messageList.scrollHeight;
        const height = this.messageList.clientHeight;
        const maxScrollTop = scrollHeight - height;
        this.messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }

    render() {
        return (
            <div className='messages' ref={(div) => {
                this.messageList = div;
            }}>

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

class GameUpdateList extends React.Component {

    componentDidUpdate() {
        this.scrollToBottom();
    }

    scrollToBottom() {
        const scrollHeight = this.gameUpdateList.scrollHeight;
        const height = this.gameUpdateList.clientHeight;
        const maxScrollTop = scrollHeight - height;
        this.gameUpdateList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }

    render() {
        return (
            <div className='gameupdates' ref={(div) => {
                this.gameUpdateList = div;
            }}>

                {
                    this.props.gameupdate.map((message, i) => {
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


class MessageForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = { text: '' };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.changeHandler = this.changeHandler.bind(this);
    }


    handleSubmit(e) {
        e.preventDefault();
        var message = {
            user: this.props.user,
            text: this.state.text
        }
        this.props.onMessageSubmit(message);
        this.setState({ text: '' });
    }


    handleEnter = (event) => {
        if (event.key == 'Enter') {
            event.preventDefault();
            var message = {
                user: this.props.user,
                text: this.state.text
            }
            this.props.onMessageSubmit(message);
            this.setState({ text: '' });
        }
    }

    changeHandler(e) {
        this.setState({ text: e.target.value });
    }


    render() {
        return (
            <div className='message_form'>
                <form onSubmit={this.handleSubmit}>
                    <textarea
                        onKeyPress={this.handleEnter}
                        onChange={this.changeHandler}
                        value={this.state.text}
                        className='messageforminput'
                        placeholder='Type chat here...'
                    />
                </form>
            </div>
        );
    }
}

class ChangeNameForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = { newName: '' };
        this.onKey = this.onKey.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    onKey(e) {
        this.setState({ newName: e.target.value });
    }

    handleSubmit(e) {
        e.preventDefault();
        var newName = this.state.newName;
        this.props.onChangeName(newName);
        this.setState({ newName: '' });
    }

    render() {
        return (
            <div className='change_name_form'>
                <h3> Change Name </h3>
                <form onSubmit={this.handleSubmit}>
                    <input
                        className='change_name_form_input'
                        onChange={this.onKey}
                        value={this.state.newName}
                    />
                </form>
            </div>
        );
    }
}


class ChatApp extends React.Component {

    render() {
        return (
            <div className='chatapp'>

                <div className='right-panel'>

                    <UsersList
                        users={this.props.users}
                    />
                    <ChangeNameForm
                        onChangeName={this.props.handleChangeName}
                    /><br />
                    <div>
                        <strong>Stats</strong><br />
                        Royal Flush: {this.props.stats[0]}<br />
                        Straight Flush: {this.props.stats[1]}<br />
                        Four of a Kind: {this.props.stats[2]}<br />
                        Full House: {this.props.stats[3]}<br />
                        Flush: {this.props.stats[4]}<br />
                        Straight: {this.props.stats[5]}<br />
                        Three of a Kind: {this.props.stats[6]}<br />
                        Two Pairs: {this.props.stats[7]}<br />
                        Pair: {this.props.stats[8]}<br />
                        High Card: {this.props.stats[9]}<br />
                    </div>
                </div>

                <div className='messagescontainer'>
                    <GameUpdateList
                        gameupdate={this.props.gameupdate}
                    />
                    <MessageList
                        messages={this.props.messages}
                    />
                    <MessageForm
                        onMessageSubmit={this.props.handleMessageSubmit}
                        user={this.props.user}
                    />
                </div>
            </div>
        );
    }
}


export default ChatApp;

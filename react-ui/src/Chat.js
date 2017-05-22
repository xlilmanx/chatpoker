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

    changeHandler(e) {
        this.setState({ text: e.target.value });
    }

    render() {
        return (
            <div className='message_form'>
                <form onSubmit={this.handleSubmit}>
                    <input
                        onChange={this.changeHandler}
                        value={this.state.text}
                        size="30"
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
                    />
                </div>

                <MessageList
                    messages={this.props.messages}
                />
                <MessageForm
                    onMessageSubmit={this.props.handleMessageSubmit}
                    user={this.props.user}
                />

            </div>
        );
    }
}


export default ChatApp;

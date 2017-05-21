import React from 'react';
import ReactDOM from 'react-dom';
import ChatApp from './Chat.js';
import Game from './Game.js';
import io from 'socket.io-client'

var socket = io();

ReactDOM.render(<ChatApp socket={socket}/>, document.getElementById('app'));
ReactDOM.render(<Game socket={socket}/>, document.getElementById('wrapper'));




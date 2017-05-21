import React from 'react';
import ReactDOM from 'react-dom';
import ChatApp from './Chat.js';
import Game from './Game.js';
import io from 'socket.io-client'


ReactDOM.render(<Game />, document.getElementById('wrapper'));

ReactDOM.render(<ChatApp />, document.getElementById('app'));


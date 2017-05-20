var express = require('express');
var path = require('path');
var http = require('http');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var PORT = process.env.PORT || 5000;

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

// Answer API requests.
app.get('/api', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send('{"message":"Hello from the custom server!"}');
});

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});
/*
app.get('/', function (req, res) {
  res.sendFile(__dirname, '../react-ui/public/index.html');
});
*/
io.on('connection', function (socket) {
  io.emit('chat message', 'a user connected');
  console.log('asdf');
  useronline = useronline + 1;
  io.emit('userupdate', useronline);

  socket.on('disconnect', function () {
    io.emit('chat message', 'a user disconnected');
    useronline = useronline - 1;
  io.emit('userupdate', useronline);

  });
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });
});

server.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});

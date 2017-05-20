const express = require('express');
const path = require('path');


const http = require('http').Server(app);
const io = require('socket.io')(http);
var useronline = 0;

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  io.emit('chat message', 'a user connected');
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


http.listen(process.env.PORT || 8080, function () {
  console.log('listening on *:5000');
});

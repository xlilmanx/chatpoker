var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var useronline = 0;

app.get('/', function (req, res) {
  res.sendFile(__dirname + './react-ui/public/index.html');
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

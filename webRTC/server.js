const express = require('express');
const app = express();
const { v4: uuidV4 } = require('uuid');

const fs = require('fs');
const https = require('https');
const { response } = require('express');

const server = https.createServer(
  {
    // https 프로토콜 사용을 위한 ssl 발급
    key: fs.readFileSync('./private.pem'),
    cert: fs.readFileSync('./public.pem'),
    requestCert: false,
    rejectUnauthorized: false,
  },
  app
);

const io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});


io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    console.log(userId + 'is connected');

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
      console.log(userId + 'is disconnected');
    });
  });
});

server.listen(3000);
console.log('server is running...');

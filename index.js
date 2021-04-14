const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io=require("socket.io")(server,{
    cors:{
        origin:"http://localhost:3000",
    },
});

// app.get('/', (req, res) => {
// //   res.send('<h1>Hello world</h1>');
// console.log("connection connected");
// });

io.use((socket,next)=>{
    const username=socket.handshake.auth.username;
    if(!username){
        return next(new Error("already exist"));
    }
    socket.username=username;
    next();
});

server.listen(3001, () => {
  console.log('listening on *:3000');
});
const app=require('express')();
const server=require('http').createServer(app);
const options={
    cors:true,
    origins:["http://127.0.0.1:3000","*"]
}

const io=require('socket.io')(server,options);
const users=[];

app.use((req,res,next)=>{
    // res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization,Authentication');
    next();
})
const userexist=(username)=>{
    if(users.length>1){
        for (let na of users){
            if(na.username==username){
                return false;
            }
        }
    }
    return true;
}
const statusoffline=(username)=>{
    console.log("status called");
        for (let i=0;i<users.length;i++){
            if(users[i].username==username){         
                users[i].online=false;
                break; 
            }
        }
}
const statusonline=(username)=>{
    console.log("status called");
        for (let i=0;i<users.length;i++){
            if(users[i].username==username){         
                if(users[i].online){
                    return false;
                }
                users[i].online=true;
                break; 
            }
        }
        return true;
}
app.get('/',(req,res,next)=>{
    console.log('Hit');
    res.send('<h1>Hello</h1>');
});
io.use((socket,next)=>{
    const username=socket.handshake.auth.username;
    if(userexist(username)){
        users.push({username:username,userId:socket.id,online:true});
        socket.broadcast.emit("new-user", {
            name: username
        });
    }
    else{
        if(statusonline(username)){
            socket.broadcast.emit('status-online',username);
        }
        else{
            //if a user login from one multiple location then
            // this will track the number of windows
            if(socket.dup){
                socket.dup=socket.dup+1;
            }
            else{
                socket.dup=1;
            }
        }
    }
    socket.username=username;
    console.log("username:",socket.username,"users:",users);

    //if(!users.find(username)){
        //users.push(username);
    //}
    next();
})
io.on('connection',(socket)=>{
    console.log("Hey connection established");
    socket.emit("users",users,socket.username);
    socket.on('mes',me=>{
        console.log(me);
        socket.broadcast.emit('mes',me);
    });
    socket.onAny((event, ...args) => {
        console.log("From onAny",event, args);
      });
      socket.on('private-message',(content,recevier)=>{
          console.log("content:",content,"reciver:",recevier);
          let j=0;
          for(let i=0;i<users.length;i++){
            if(users[i].username==recevier){
                j=users[i].userId;
            }
          }
          socket.to(j).emit('private-message',content,socket.username);
      });  
    socket.on('disconnect',()=>{
        // console.log(users.find(socket.username));
        if(socket.dup){
            socket.dup=socket.dup-1;
        }else{
            let a=statusoffline(socket.username);
            socket.broadcast.emit('status-offline',socket.username);
        }

        // users[a].online=false;
        //socket.broadcast.emit('mes',users);
        console.log('disconnected Successfully');
    });

});


server.listen(3001,()=>{
    console.log("Listening on port 3001");
});

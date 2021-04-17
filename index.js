const app=require("express")();
const server=require("http").createServer(app);
const io=require("socket.io")(server,{
    cors:{
        origin:"http://localhost:3000",
        method:['get','post'],
    },
});
app.use((req,res,next)=>{
    // res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization,Authentication');
    next();
})
app.get('/', function(req, res) {
    res.send('<h1>h<h1>');
 });
 const users=[];
 let flag;
const userexist=(username,id)=>{
    flag=0;
    if(users.length>0){
        for(let i=0;i<users.length;i++){
            if(users[i].name==username){
                if(!users[i].online){
                    users[i].online=true;
                    users[i].id=id;
                    flag=1;
                    return false;  
                }
                return true
            }
            
        }
    }
    users.push({name:username,id:id,online:true});
    return false
}
const online=()=>{
    for(let i=0;i<users.length;i++){
        if(users[i].name==username){   
            return true;
        }
    }
    return false;
}
const offline=(username)=>{
    console.log("[offline]",username);
    for(let i=0;i<users.length;i++){
        if(users[i].name==username){
            users[i].online=false;
            users[i].id=null;
            break;
        }
    }
}
const recevier=(dat)=>{
    let k=0;
    for(let i=0;i<users.length;i++){
        if(users[i].name==dat){    
            k=users[i].id;
            break;
        }
    }
    return k;
}

 io.use((socket,next)=>{
    const username = socket.handshake.auth.username;
    console.log(username,socket.id);
    if(userexist(username,socket.id,)){
        //code to disconnect user.
    }
    
    socket.username=username;
    next();
 })
 io.on('connection',(socket)=>{
    if(flag==1){
        socket.broadcast.emit('online',socket.username);
    }else{
    socket.broadcast.emit('new-user',users[users.length-1]);
    }
    let f; 
    if(users.length==1){
        f=[];
     }else{
        f=users.filter(dat=>{return dat.name!=socket.username});
     }
    // console.log("userconnected socket",users,'f:',f);
    socket.emit('users',f);
    // setTimeout(function() {
    //     socket.emit('mes','Sent a message 4seconds after connection!');
    //  }, 4000);
     socket.on('private-message',(content,sender)=>{
        console.log("client:",content,sender);
        let to=recevier(sender);
        socket.to(to).emit('private-message',content,socket.username);
    })
     socket.on('disconnect',()=>{
        socket.broadcast.emit('offline',socket.username);
        offline(socket.username);
        console.log("users offlinelist:",users);
        console.log("user disconnected");
    })
 });
 server.listen(3001,()=>{
     console.log("listeing on 3001");
 });

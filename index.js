const { Console } = require("console");

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
                return true;
            }
            
        }
    }
    users.push({name:username,id:id,online:true,isGroup:false,group:[]});
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
const usergroupadded=(dat,username)=>{
    for(let i=0;i<users.length;i++){
        if(users[i].name==username){   
            users[i].group.push(dat);
        }
    }
}
const usergrouplist=(username)=>{
    let k=[];
    for(let i=0;i<users.length;i++){
        if(users[i].name==username){   
            k=users[i].group;
            users[i].group=[];
            return k;
        }
    }
}
const usergroupleft=(dat,username)=>{
    for(let i=0;i<users.length;i++){
        if(users[i].name==username){   
            for(let j=0;j<users[i].group.length;j++){
                if(users[i].group[j]==dat){
                    users[i].group.splice(j,1);
                    j--;
                }
            }
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
        console.log("user already present");
        const err = new Error("not authorized");
        err.data = { content: "Please retry later" };
        return next(err);           
    }
// });
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
    });
    socket.on('group-message',(content,sender)=>{
        // console.log("Message recieved group");
        // console.log("client:",content,sender,socket.username);
        socket.to(sender).emit('group-message',content,sender,socket.username);
    });
    socket.on('new-group-list',(name,datalist)=>{
        
        let flag=0;
        for(let i=0;i<users.length;i++){
            if(users[i].name==name){
                flag=1;
                break;
            }}
            if(flag){
              socket.emit("error","Name Already in use");  
            }else{
                console.log(`Group name:${name} and list${datalist}`);
                socket.join(name);
                usergroupadded(name,socket.username);
                let tlist=datalist.slice();
                tlist.push(socket.username);
                datalist.forEach(element => {
                    let to=recevier(element);
                    socket.to(to).emit('new-group-req',name,tlist);
            })
            socket.emit("room-joined",name,tlist);
        };

            // socket.to(datalist).emit('new-group-req',name);            
        

    });
    socket.on('new-group',(dat,l)=>{
        usergroupadded(dat,socket.username);
        socket.join(dat);
        console.log("joined");
        socket.emit('room-joined',dat,l);
    });
    socket.on('add-to-group',(name,glist,tlist)=>{
        tlist.push(...glist);
        console.log("tlist::",tlist);
        glist.forEach(element => {
            let to=recevier(element);
            socket.to(to).emit('new-group-req',name,tlist);
    });
    socket.to(name).emit('group-user-added',name,glist);
    socket.emit('group-user-added',name,glist);
    });
    //
    socket.on('remove-from-group',(name,glist,tlist)=>{
        glist.forEach(element=>{
            for(var i=0;i<tlist.length;i++){
                if(element==tlist[i]){
                    tlist.splice(i,1);
                    i--;
                }
            }
        })     
        console.log("tlist:",tlist,"glist:",glist,"name:",name);
        glist.forEach(element => {
            let to=recevier(element);
            socket.to(to).emit('remove-from-group-req',name);
    });
    socket.to(name).emit('user-left',name,tlist);
    socket.emit('user-left',name,tlist);
    });
    socket.on('leave-from-group',(name,glist,tlist)=>{
        glist.forEach(element=>{
            for(var i=0;i<tlist.length;i++){
                if(element==tlist[i]){
                    tlist.splice(i,1);
                    i--;
                }
            }
        })     
        console.log("tlist:",tlist,"glist:",glist,"name:",name);
            socket.emit('remove-from-group-req',name);
            socket.to(name).emit('user-left',name,tlist);
    });
    socket.on('leave-group',(name)=>{
        console.log("leave-group:",name);
        usergroupleft(name,socket.username);
        socket.leave(name);
    })
    //
     socket.on('disconnect',()=>{
         let g=usergrouplist(socket.username);
         g.forEach(element => {
            socket.to(element).emit('group-exit',element,socket.username); 
            socket.leave(element);
         });
        socket.broadcast.emit('offline',socket.username);
        offline(socket.username);
        console.log("users offlinelist:",users);
        console.log("user disconnected");
    });
 });
 server.listen(3001,()=>{
     console.log("listeing on 3001");
 });

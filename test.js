const users=new Array();
console.log(typeof(users));

users.push({username:"sam",online:true});
users.push({username:"sa",online:true});
const userexist()=>{

    // if(users.length>1){
        console.log(users.length);
        for (let na of users){
            // console.log("#",na);
                    if(na.username==username){
                return false;
            }
        }
    // }
    return true;
}
let username="sa";
console.log("@@",users.find(userexist()));
console.log(typeof(users));

// if(users.find(userexist(username))){
//     users.push({username:username,online:true});
// }
// console.log("########################3");
// if(users.find(userexist(username))){
//     users.push({username:username,online:true});
// }
// console.log("########################3");
// if(users.find(userexist(username))){
//     users.push({username:username,online:true});
// }
// console.log("########################3");
// console.log(users);

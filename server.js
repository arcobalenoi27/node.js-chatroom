// server.js
// where your node app starts

// init project
var express = require('express');
var underscore = require('underscore');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
/*引入靜態檔案像css檔之類的,不先設定會無法讀取css檔*/
app.use(express.static(__dirname + "/"));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/indexes.html');
});
app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/chat.html');
});

/*
  user list
  Format:
  {
    {
      name:'',
      img:'',
        socketId:''
    }
  }
*/
var userList = [];

io.sockets.on('connection', function(socket){
  console.log('a user connected');
  io.emit('online', '');
    
  socket.on('chat message', function(msg){
    console.log(msg);
    io.emit('chat message', msg);
  });
  //login function
  socket.on('login', function(user)
  {
    // console.log("someone login");
    /*
    socket id:
    每一個socket連線之後,伺服器端都會為他創建一個id,這一個id是一個伺服器端永遠不會重複的id,這個id可以理解成我們在操作資料的時候的guid,uuid
    */
     
    user.id = socket.id;
    userList.push(user);
    console.log(userList);
    //send the user list to all client
    io.emit('userList', userList);
    //send the client information to clent
    socket.emit('userInfo', user);
    //send login info to all. 原發送者不收到消息*
    socket.broadcast.emit('loginInfo', user.name);
  });
  
  socket.on('toAll', function(msgObj)
  {
    /*
      format:{
        from:{
          name:'',
          img:'',
          id:''
        },
        msg:''
      }
    */
    socket.broadcast.emit('toAll', msgObj);
  });
  
  //sendImageToAll
  socket.on('sendImageToAll', function(msgObj)
  {
    /*
      format:{
        from:{
          name:'',
          img:'',
          id:''
        },
        img:''
      }
    */
    // console.log(msgObj);
    socket.broadcast.emit('sendImageToAll', msgObj);  
  });
  
  //send to one
  socket.on('toOne', function(msgObj)
  {
    /*
      format:{
        from:{
          name:'',
          img:'',
          id:''
        },
        to:'', // socketid
        msg:''
      }
    */
    //var toSocket = _.findWhere(socketList, {id:msgObj. to});
    //io.sockets.sockets 找到所有連接到伺服器的使用者的集合
    //_.findWhere   引用到underscore.js 的函數庫
    var toSocket = underscore.findWhere(io.sockets.sockets, {id:msgObj.to});
    console.log(toSocket);
    toSocket.emit('toOne', msgObj);
  });
  
  socket.on('disconnect', function()
  {
    console.log("someone disconnect");
    var index = -1
    
    
    for(var user in userList)
    {
      if(socket.id === userList[user].id)
      {
        index = userList[user];
        userList[user] = undefined;
      }
    }
    
    
    // userList.forEach(function(user)
    // {
    //   if(socket.id === user['id'])
    //   {
    //     index = user;
    //     user = "undefined";
    //   }
    // });
    
    /*
      Format:{
        userList
      }
    */
    userList = userList.filter(function(user)
    {
      return (user !== undefined);
    });
    var removeUser = index;
    console.log(removeUser);
    // console.log(userList.length);
    io.emit('offline', removeUser);
    if(removeUser !== -1)
      io.emit('updateUser', userList);
    // io.emit('offline', socket.id);
  });  
});

http.listen(3000);
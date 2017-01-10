var socket = io.connect();

socket.on('offline', function(removeUser) 
{
  // console.log("disconnect:");
  // console.log(Boolean(removeUser));
  if( Boolean(removeUser))
  {
    disconnectFromSys(removeUser);
  }
  
});
socket.on('updateUser', function(userList)
{
  // console.log(userList);
  updateUser(userList);
  
});

socket.on('loginInfo', function(msg)
{
  //user login message scojs_message
  addMsgFromSys(msg);
  
});
//add user in ui
socket.on('userList', function(userList)
{
  //modify user count
  //modifyUserCount(userList.length);
  addUser(userList);
});

//client review user information  after login
socket.on('userInfo', function(userObj)
{
  //should be use cookie or session
  userSelf = userObj;
  $('.welcome').text(userObj.name + entries.UILanguage.welcome  );
});

//receive/review message from toAll
socket.on('toAll', function(msgObj)
{
  addMsgFromUser(msgObj, false);
});

socket.on('toOne', function(msgObj)
{
  Messenger().post({
    message: "<a href=\"javascript:showSetMsgToOne(\'" + msgObj.from.name + "\',\'"  + msgObj.from.id + "\');\">" +  msgObj.from.name + entries.UILanguage.msgFrom + msgObj.msg +  "</a>",
    showCloseButton: true
  });
});

socket.on('sendImageToAll', function(msgObj)
{
  addImgFromUser(msgObj, false);
});
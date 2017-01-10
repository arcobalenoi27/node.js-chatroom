
var entriesDataEng = {
  nickname: "Nickname",
  avatar : "Avatar/Icon",
  language: "Language",
  chatMemeber: "Chat",
  chatRoomName: "Public chat room",
  welcome: ", welcome to chat",
  inputhint: "Type your message...",
  send: "Send",
  settingText : "Please set up the configuration of chatroom",
  OKText: "OK",
  loginText: " has signed in chatroom.",
  logoutText: " has signed out chatroom.",
  msgFrom: " send to you  a message: "
};
var entriesDataCn = {
  nickname: "暱稱",
  avatar : "大頭貼",
  language: "語言設定",
  chatMemeber: "在線成員",
  chatRoomName: "公開聊天室",
  welcome: "，歡迎您",
  inputhint: "說點什麼...",
  send: "Enter",
  settingText : "請設定聊天室",
  OKText: "確定",
  loginText: "已經登入~",
  logoutText: "登出了",
  msgFrom: " 對你說: "
};
var entriesDataJp = {
  nickname: "お名前",
  avatar : "アイコン",
  language: "言語設定",
  chatMemeber: "メンバー",
  chatRoomName: "公開チャットルーム",
  welcome: "さん、ようこそ ",
  inputhint: "Type your message...",
  send: "発言",
  settingText : "チャットルームの設定をします",
  OKText: "設定保存",
  loginText: "さんがログインしました。",
  logoutText: "さんがログアウトしました。",
  msgFrom: " さんからのメセッジ: "
};
var entries = {
    eng: entriesDataEng,
    cn: entriesDataCn,
    jp: entriesDataJp
};
var List = [] ;
var userList = [];
var defaultImgSrc = "https://media0.giphy.com/media/qrwthQPPQrtEk/200_s.gif";
$(document).ready(function()
{
     $('#userInfoModal').modal('show');


    $('#saveSetting').on('click', function()
    {
       var name = $('#nickname').val();
       if(checkUser(name))
       {
         $('#nickname').val("");
         alert("Nickname already exists or can not be empty.");
       }
       else
       {
         var userDataObj = {
           name: $('#nickname').val(),
           img: "https://media0.giphy.com/media/qrwthQPPQrtEk/200_s.gif"
         };

         entries['name']　= userDataObj.name;
         if($('#headImage').val().trim() !== "")
         {
            userDataObj.img = $('#headImage').val();
         }
         socket.emit('login', userDataObj);


         setLanguage(entries[$('#language').find(":selected").val()]);
         entries.UILanguage = entries[$('#language').find(":selected").val()];
         $('#userInfoModal').modal('hide');
         $('#nickname').val("");
         $('#message').focus();
       }
    });

    $('#imgUpload').on('change', function()
    {
      if(this.files.length !== 0)
      {
        var file = this.files[0];
        reader = new FileReader();
        if(!reader)
        {
          alert("Your browser doesn\'t support fileReader !");
          return;
        }
        reader.onload = function(e)
        {
          var msgObj = {
            from: userSelf,
            img: e.target.result
          };
          socket.emit('sendImageToAll', msgObj);
          addImgFromUser(msgObj, true);
        };
        reader.readAsDataURL(file);
      }
    });

    $('#message').on('keypress', function(event)
    {
      var msg = $('#message').val();
      if(msg !== '' && event.keyCode == 13)
      {
        $('#send').trigger('click');
      }
    });

    $('#inputMsgToOne').on('keypress', function(event)
    {
      var msg = $('#inputMsgToOne').val();
      if(msg !== '' && event.keyCode == 13)
      {
        $('#btnToOne').trigger('click');
      }
    });


    $('#send').on('click', function()
    {
      var msg = $('#message').val();
      if(msg === '')
      {
        alert('Please input the message content.');
        return;
      }
      var from = userSelf;
      var msgObj = {
        from: from,
        msg: msg
      };
      socket.emit('toAll', msgObj);
      addMsgFromUser(msgObj, true);
      $('#message').val('');
    });

    Messenger.options = {
    extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
    theme: 'future'
    };

    $('#btnToOne').on('click', function()
    {
      console.log();
      var msg = $('#inputMsgToOne').val();
      if(msg === '')
      {
        alert("Please enter the message content !");
        return;
      }

      var msgObj = {
        from: userSelf,
        to: toOneId,
        msg: msg
      };
      socket.emit('toOne', msgObj);
      $('#sendMsgToOne').modal('hide');
      $('#inputMsgToOne').val('');
    });

});

function setLanguage(entriesChose)
{
   $('#chatSettingText').text(entriesChose.settingText);
   $('#nicknameText').text(entriesChose.nickname);
   $('#avatarText').text(entriesChose.avatar);
   $('#languageText').text(entriesChose.language);
   $('#saveSetting').text(entriesChose.OKText);
   $('#chatMemberText').text(entriesChose.chatMemeber);
   $('#chatroomNameText').text(entriesChose.chatRoomName);
   $('#send').text(entriesChose.send);
   $('#message').attr("placeholder", entriesChose.inputhint);

}

function checkUser(name)
{
  if(name == "")
  {
     return true;
  }
  else if(List.indexOf(name) != -1)
  {
     return true;
  }
  else
  {
    return false;
  }
}

function showMsg(type)
{
  if(type == 1)
    $.scojs_message('This is an info message', $.scojs_message.TYPE_OK);
  else
    $.scojs_message('This is an info message', $.scojs_message.TYPE_ERROR);
}

function addUser(userList)
{

  var parentUI =  $('.userlist-body');
  var cloneLi = parentUI.children('li:first').clone();
  parentUI.html("");
  parentUI.append(cloneLi);
  for(var i in userList)
  {
    var cloneLi = parentUI.children('li:first').clone();
    List.push(userList[i].name);
    cloneLi.children('a').attr('href', "javascript:showSetMsgToOne('" + userList[i].name + "','" + userList[i].id + "');");
    cloneLi.children('a').children('img').attr('src', userList[i].img);
    cloneLi.children('a').children('span').text(userList[i].name);
    cloneLi.show();
    parentUI.append(cloneLi);
  }
  parentUI.children("li:first").remove();

}

function updateUser(userList)
{
  var parentUI =  $('.userlist-body');
  var allUserInfo;
  parentUI.children('li').remove();
  userList.forEach(function(user)
  {
    var userHtml = $('<li class="user"><a href="#">　<img src="#" class="userthumbnail">　<span></span></a></li>');
    userHtml.children('a').attr('href', "javascript:showSetMsgToOne('" + user.name + "','" + user.id + "');");
    userHtml.children('a').children('img').attr('src', user.img);
    userHtml.children('a').children('span').text(user.name);
    userHtml.show();
    parentUI.append(userHtml);
  });


}




//add message in UI. add message with messagebox
// if isSelf equal to false, meaning that the message receive from other user
//isSelf 為true時,訊息就是自己發的;false時則是別人發的
function addMsgFromUser(msgObj, isSelf)
{
  var msgHtml = isSelf ? $('<div><div class="from-me"><p></p></div><img src="#" class="mychatAvator"><div class="clear"></div></div>') :
                        $('<div><img src="#" class="otherchatAvator"><div class="from-them"><p></p></div><div class="clear"></div></div>');

  msgHtml.children('img').attr('src', msgObj.from.img);
  msgHtml.children('img').attr('title', msgObj.from.name);
  if(isSelf)
    msgHtml.children('.from-me').children('p').text(msgObj.msg);
  else
    msgHtml.children('.from-them').children('p').text(msgObj.msg);
  $('.messageFlow').append(msgHtml.children());
  //Scroll to bottom of Div
  //滾動條一直在最底部
  $('.messageFlow').scrollTop($('.messageFlow')[0].scrollHeight);
}

//add Img to UI
function addImgFromUser(msgObj, isSelf)
{
  var msgHtml = isSelf ? $('<div><div class="from-me"><img src="#" class="imgBox"></img></div><img src="#" class="mychatAvator"><div class="clear"></div></div>') :
                        $('<div><img src="#" class="otherchatAvator"><div class="from-them"><img src="#" class="imgBox"></img></div><div class="clear"></div></div>');
  msgHtml.children('img').attr('src', msgObj.from.img);
  msgHtml.children('img').attr('title', msgObj.from.name);
  if(isSelf)
    msgHtml.children('.from-me').children('img').attr('src', msgObj.img);
  else
    msgHtml.children('.from-them').children('img').attr('src', msgObj.img);
  $('.messageFlow').append(msgHtml.children());
  //Scroll to bottom of Div
  //滾動條一直在最底部
  $('.messageFlow').scrollTop($('.messageFlow')[0].scrollHeight);
}

function showSetMsgToOne(name, id)
{
  $('#sendMsgToOne').modal('show');
  $('#sendToOneText').text("Send to " + name);
  toOneId = id;
}

function addMsgFromSys(msg)
{
  $.scojs_message(msg + entries.UILanguage.loginText, $.scojs_message.TYPE_OK);
}

function disconnectFromSys(UserObj)
{
  // console.log(UserObj);
  $.scojs_message(UserObj.name + entries.UILanguage.logoutText, $.scojs_message.TYPE_ERROR);
}

//send message enter function
function keywordsMsg(e)
{
  var event = e || window.event;
  if(event.keyCode == 13)
  {
    $('#send').click();
  }
}

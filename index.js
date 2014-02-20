var express = require("express");
var markdown = require( "markdown" ).markdown;
var app = express();
var port = process.env.PORT || 80;
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.get("/", function(req, res){
    res.render("page");
});

app.get("/", function(req, res){
    res.send("It works!");
});
app.use(express.static(__dirname + '/public'));
var io = require('socket.io').listen(app.listen(port));
io.sockets.on('connection', function (socket) {

  if(!socket.room) socket.room = 'chatroom';
  socket.join(socket.room);
    socket.emit('message', { message: 'welcome (you can use <a href="http://daringfireball.net/projects/markdown/">markdown</a>). Want commands? do /commands. View the source <a href="https://github.com/zackify/nodechat">on my github</a>' });
    socket.broadcast.to(socket.room).emit('message', { message: 'New user joined' });

    socket.on('send', function (data) {
      socket.nickname = data.username;
      socket.join(data.username);
      var roster = io.sockets.clients(socket.room);
      var users = roster.length +' users online now: '; 
      
      roster.forEach(function(client) {
          users += client.nickname + ',';
      });

      var message = data.message.replace(/(<([^>]+)>)/ig,"");
      if(message == '!whoishere'){
        socket.emit('message', {username: "Server", message: users});
      }
      else if(message == '/commands'){
        socket.emit('message', {username: "Server", message: "(<br /><p class=\"red\">!whoishere</p>) <br /> (<p class=\"red\">/room roomname</p>) to change rooms <br /> (<p class=\"red\">@username text</p>) to mention privately"});
      }
      else if(message.match(/\@(\w+)/)){
        var match = message.match(/\@(\w+)/);
        var message = message.replace(/\@(\w+)/,'');
        if(match){
          io.sockets.in(match[1]).emit('message', {username: data.username, message: message, private: 1});
          socket.emit('message', {username: data.username, message: message, private: 1});
        }
      }
      else if(message.match(/\/room/)){
        var match = message.match(/\/room (.*)/);
        if(!match){
          socket.emit('message', {username: "Server", message: "You're in the room: " + socket.room});
        }
        else{
          socket.broadcast.to(socket.room).emit('message', { message: data.username+' left this room' });
          socket.leave(socket.room);
          socket.room = match[1];
          socket.join(socket.room);
          socket.broadcast.to(socket.room).emit('message', { message: data.username+' joined this room' });
          socket.emit('message', {username: "Server", message: "Welcome to " + match[1]});
        }
      }
      else{
        data.message = markdown.toHTML(message);
        console.log(socket.room);
        io.sockets.in(socket.room).emit('message', data);
      }
    });
});

console.log("Listening on port " + port);
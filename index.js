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
  socket.join('chatroom');
    
    socket.emit('message', { message: 'welcome (you can use <a href="http://daringfireball.net/projects/markdown/">markdown</a>). Want commands? do /commands. View the source <a href="https://github.com/zackify/nodechat">on my github</a>' });
    io.sockets.emit('message', { message: 'New user joined' });

    socket.on('send', function (data) {
      socket.nickname = data.username;
      var roster = io.sockets.clients('chatroom');
      var users = roster.length +' users online now: '; 
      
      roster.forEach(function(client) {
          users += client.nickname + ',';
      });

      var message = data.message.replace(/(<([^>]+)>)/ig,"");
      if(message == '!whoishere'){
        socket.emit('message', {username: "Server", message: users});
      }
      else if(message == '/commands'){
        socket.emit('message', {username: "Server", message: "!whoishere"});
      }
      else{
        data.message = markdown.toHTML(message);
        io.sockets.emit('message', data);
      }
    });
});

console.log("Listening on port " + port);
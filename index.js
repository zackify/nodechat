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
    socket.emit('message', { message: 'welcome (you can use <a href="http://daringfireball.net/projects/markdown/">markdown</a>), view the source <a href="https://github.com/zackify/nodechat">on my github</a>' });
    socket.on('send', function (data) {
        var message = data.message.replace(/(<([^>]+)>)/ig,"");
        data.message = markdown.toHTML(message);
        io.sockets.emit('message', data);
    });
});
console.log("Listening on port " + port);
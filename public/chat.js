$(document).ready(function() {
 
    var messages = [];
    var socket = io.connect(location.origin.replace(/^http/, 'ws'));
    var field = document.getElementById("field");
    var content = document.getElementById("content");
    var name = document.getElementById("name");
    var sound = document.getElementById("sound");
    var nameWrapper = document.getElementById("nameWrapper");
    var value;
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                if(messages[i].private){
                    if(messages[i].private != name.value){
                        html += '<p class="red"><b>Message to ' + messages[i].private + ': </b>';
                    }
                    else{
                        html += '<p class="red"><b>Message from ' + messages[i].username + ': </b>';
                    }
                    html += messages[i].message + '</p><br />';
                }
                else{
                    html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                    html += messages[i].message + '<br />';
                }
                if(value != messages[messages.length -1].username && messages[messages.length -1].username && messages[messages.length -1].username != 'Server') $('#sound')[0].play();
            }
            content.innerHTML = html;
            content.scrollTop = content.scrollHeight;
        } else {
            console.log("There is a problem:", data);
        }
    });
    socket.on('clear', function (data) {
        content.innerHTML = '';
        messages = [];
    });
    sendMessage = function() {
        if(name.value == "" || name.value == "Server") {
            alert("Please type your name!");
        } else {
            var text = field.value;
            console.log(text);
            if(!value) value = name.value;
            socket.emit('send', { message: text, username: name.value });
            field.value = "";
            nameWrapper.style.display = 'none';

        }
    };
    $("#field").keyup(function(e) {

        if(e.keyCode == 13) {
            if (!e.shiftKey) sendMessage();
        }
    });
 
});
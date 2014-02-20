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
            if(!content.innerHTML){
                html = localStorage.getItem("html");
                if(html == null) html = '';
            }
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
                if(value != messages[messages.length -1].username && messages[messages.length -1].username && messages[messages.length -1].username != 'Server') $('#sound')[0].play();
            }
            content.innerHTML = html;
            if(messages[messages.length -1].username && messages[messages.length -1]){
                var currentHTML = localStorage.getItem("html");
                if(!currentHTML) currentHTML = '';
                var stored_html = localStorage.setItem("html",currentHTML +'<b>' + messages[messages.length -1].username + ': </b>' +messages[messages.length -1].message + '<br />');
            }
        } else {
            console.log("There is a problem:", data);
        }
    });
 
    sendMessage = function() {
        if(name.value == "") {
            alert("Please type your name!");
        } else {
            var text = field.value;
            if(!value) value = name.value;
            socket.emit('send', { message: text, username: name.value });
            field.value = "";
            nameWrapper.style.display = 'none';

        }
    };
    $("#field").keyup(function(e) {

        if(e.keyCode == 13) {
            sendMessage();
        }
    });
 
});
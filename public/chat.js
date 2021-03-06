$(document).ready(function() {
    $('#imagefile').on('change', function(e){
    //Get the first (and only one) file element
    //that is included in the original event
    var file = e.originalEvent.target.files[0],
        reader = new FileReader();
    //When the file has been read...
    reader.onload = function(evt){
        //Because of how the file was read,
        //evt.target.result contains the image in base64 format
        //Nothing special, just creates an img element
        //and appends it to the DOM so my UI shows
        //that I posted an image.
        //send the image via Socket.io
        console.log(evt.target.result);
        socket.emit('image', {username: name, image: evt.target.result});
    };
    //And now, read the image and base64
    reader.readAsDataURL(file);  
});

    function getQueryVariable(variable)
    {
           var query = window.location.search.substring(1);
           var vars = query.split("&");
           for (var i=0;i<vars.length;i++) {
                   var pair = vars[i].split("=");
                   if(pair[0] == variable){return pair[1];}
           }
           return(false);
    }
    if(!getQueryVariable('username')){
      window.location = "http://micr.io/login";
    }
    else{
      var name = getQueryVariable('username');
      if (history && history.pushState){
        history.pushState(null, null, '/');
      }
    }
    var messages = [];
    var socket = io.connect(location.origin.replace(/^http/, 'ws'));
    socket.emit('join', { username: name });
    var field = document.getElementById("field");
    var content = document.getElementById("content");
    var sound = document.getElementById("sound");
    var nameWrapper = document.getElementById("nameWrapper");
    var value;
    socket.on('message', function (data) {
        if(data.message || data.image) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                if(messages[i].private){
                    if(messages[i].private != name){
                        html += '<p class="red"><b>Message to ' + messages[i].private + ': </b>';
                    }
                    else{
                        html += '<p class="red"><b>Message from ' + messages[i].username + ': </b>';
                    }
                    html += messages[i].message + '</p><br />';
                }
                else{
                    html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                    if(messages[i].image){
                        html += '<img src="'+ messages[i].image + '" /> <br />';
                    }
                    else{
                        html += messages[i].message + '<br />';
                    }
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
        if(name == "" || name == "Server") {
            alert("Please type your name!");
        } else {
            var text = field.value;
            console.log(text);
            if(!value) value = name;
            socket.emit('send', { message: text, username: name });
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
var inbox = new ReconnectingWebSocket("ws://"+ location.host + "/receive");
var outbox = new ReconnectingWebSocket("ws://"+ location.host + "/submit");

inbox.onmessage = function(message) {
    console.log(message);
    var data = JSON.parse(message.data);
    console.log(message.timeStamp);
    var t = new Date( message.timeStamp );
    //var formatted = t.format("dd.mm.yyyy hh:MM:ss");
    $('#table-body').prepend('<tr><td>'+ t.toISOString()+'</td><td>'+data.stuff+'</td><td>'+data.thing+'</td><td>'+data.message+'</td></tr>');
};

inbox.onclose = function(){
    console.log('inbox closed');
    this.inbox = new WebSocket(inbox.url);

};

outbox.onclose = function(){
    console.log('outbox closed');
    this.outbox = new WebSocket(outbox.url);
};


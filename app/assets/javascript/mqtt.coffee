window.MqttThingFabric = { }

class MqttThingFabric.Page

  constructor: () ->
    me = this
    @websocket
    @retry = true
    @connected = false
    @topic = "public/thingfabric/#"
    me.connect()
    setInterval (->
      me.doSend("PING<--pinging<--|<--|")
    ), 1000 * 25

  isConnected: () ->
    console.log("==========function: isConnected")
    if @websocket
      command = "CHECK<--"
      @doSend(command + "is connected?<--|<--|")
    else
      @connected = false

  connect: () ->
    console.log("==========function: connect")
    console.log "IsConnected? " + @connected
    if @validateReq() && !@connected
      #console.log "retry=" + @retry
      @doClose()
      @initWebSocket()

  validateReq: () ->
    console.log("==========function: validateReq")
    valid = true
    valid

  disconnect: () ->
    console.log("==========function: disconnect")
    @doClose()

  subscribe: () ->
    me=this
    console.log("==========function: subscribe")
    command = "SUBSCRIBE<--"
    @messages = ""
    qos = 0
    @doSend(command + me.topic + '<--' + qos + '<--|') #2E2CF895E097353A84AAD55302B29BFA/pepsicenter/door01


  unsubscribe: () ->
    me=this
    console.log("==========function: unsubscribe")
    command = "UNSUBSCRIBE<--"
    @doSend(command + me.topic + "<--|<--|")

  messageArrived: (data) ->
    me=this
    topic = data.split('\n')[0]
    message = data.split('\n')[1]
    console.log("======================")
    console.log("messageArrived")
    console.log(message)
    console.log("======================")
    stuff = topic.split('/')[1]
    thing = topic.split('/')[2]
    $('#table-body').prepend('<tr><td>'+new Date().toString()+'</td><td>'+stuff+'</td><td>'+thing+'</td><td>'+message+'</td></tr>');




  doClose: ->
    console.log("==========function: doClose")
    @retry = false
    if @websocket
      @websocket.close()
      @websocket = null

  doSend: (message) ->
    console.log("==========function: doSend")
    console.log(message)
    @websocket.send(message)

   initWebSocket: ->
    me = this;
    console.log "Initing web socket"
    if !@websocket

      serverurl = window.location.href;
      serverurl = serverurl.replace("http://", "");

      urlExplode = serverurl.split("/");
      serverName = urlExplode[0];

      console.log "Server Name" + serverName

      url = "ws://" + serverName + "/mqtt"

      console.log "WS Request URL: " + url

      if typeof WebSocket != 'undefined'
        @websocket = new WebSocket(url)
      else
        @websocket = new MozWebSocket(url)

      @websocket.onopen = ->
        me.isConnected()

      @websocket.onmessage = (evt) ->
        data = evt.data
        if data == "-->CONNECTED"
          #me.showConnect("connected to " + ip + ":" + port)
          me.subscribe()
        else if data == "-->LOSTCONNECT"
          #me.showLostConnect("Lost Connection to " + ip + ", reconnecting ")
          setTimeout ( -> me.connect()) 5000
        else if data == "-->EXCEPTION"
          #me.showLostConnect("Unable to establish connection to: " + ip)
        else
          me.messageArrived(data)

      @websocket.onclose = ->
        console.log "Websocket closed or unavailable, retry=" + me.retry
        if(me.retry)
          setTimeout (->
            console.log "Attempting re-connect every 5 seconds..."
            me.initWebSocket()
            console.log "Re-establishing connection!"
          ), 1000 * 5

      @websocket.onerror = (error) ->
        console.log "Websocket error: " + error


  $ ->
    MqttThingFabric.controller = new MqttThingFabric.Page
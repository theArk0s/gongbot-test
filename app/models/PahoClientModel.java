package models;
import org.apache.commons.lang3.ArrayUtils;
import org.eclipse.paho.client.mqttv3.*;
import play.*;
import play.mvc.*;
import play.api.libs.json.JsValue;
import java.util.ArrayList;

public class PahoClientModel implements MqttCallback  {
    private String url = new String();
    private ArrayList<String> subTopics = new ArrayList<String>();
    private ArrayList<Integer> subQos = new ArrayList<Integer>();
    private MqttConnectOptions conOpt = new MqttConnectOptions();
    public MqttClient client;
    private String clientid;
    private WebSocket.Out<String> channel;
  public PahoClientModel(String ip, int port, String clientId, String username, String md5pass,
        Boolean clean, int keepAlive, WebSocket.Out<String> channelOut)  throws MqttSecurityException,MqttException {
      channel = channelOut;
      url = "tcp://" + ip + ":" + port;

      conOpt.setCleanSession(clean);
      conOpt.setKeepAliveInterval(keepAlive);

      if (username != "") {
          conOpt.setUserName(username);
          conOpt.setPassword(md5pass.toCharArray());
      }

      clientid = clientId;
      client = new MqttClient(url, clientid);
      client.setCallback(this);

      client.connect(conOpt);
      System.out.println("MQtt webclient connected.");
  }

  public void lwt(String topicName, String payload, Integer qos){
    MqttTopic mqttTopic = client.getTopic(topicName);
    conOpt.setWill(mqttTopic, payload.getBytes(), qos, false);
  }

  public void subscribe(String topicName, Integer qos)  throws MqttException{
    System.out.println("Subscribed on "+ topicName);
    subTopics.add(topicName);
    subQos.add(qos);
    client.subscribe(topicName, qos);
  }

  public void unsubscribe(String topicName) throws MqttException{
    System.out.println("Unsubscribed on "+ topicName);
    Integer idx = subTopics.indexOf(topicName);
    subTopics.remove(idx);
    subQos.remove(idx);
    client.unsubscribe(topicName);
  }

  public void publish(String topicName, String payload, Integer qos) throws MqttException{
    System.out.println("Publish on "+ topicName);
    MqttTopic mqttTopic = client.getTopic(topicName);
    MqttMessage mqttMessage = new MqttMessage(payload.getBytes());
    mqttMessage.setQos(qos);
    MqttDeliveryToken token = mqttTopic.publish(mqttMessage);
    token.waitForCompletion();
  }

  public void disconnect() throws MqttException{
    client.disconnect();
    System.out.println("MQtt webclient disconnected");
  }

  @Override
  public void connectionLost(Throwable cause){
    System.out.println("MQtt webclient connection lost");
    channel.write("-->LOSTCONNECT");
    try{
        client = new MqttClient(url, clientid);
        client.connect(conOpt);
        client.subscribe(subTopics.toArray(new String[subTopics.size()]), ArrayUtils.toPrimitive(subQos.toArray(new Integer[subQos.size()])));
    }catch (MqttException e){

    }

  }

  //@Override
  public void deliveryComplete(IMqttDeliveryToken token) {

  }

  public void deliveryComplete(MqttDeliveryToken token) {

  }

  @Override
  public void messageArrived(String topic, MqttMessage message) {
    String payload = new String(message.getPayload());
    System.out.println(payload);
    channel.write(topic + "\n" + payload);
  }

}
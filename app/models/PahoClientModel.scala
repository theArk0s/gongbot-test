package models
import scala.reflect.BeanProperty
import org.eclipse.paho.client.mqttv3.MqttCallback
import org.eclipse.paho.client.mqttv3.MqttClient
import org.eclipse.paho.client.mqttv3.MqttConnectOptions
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken
import org.eclipse.paho.client.mqttv3.MqttMessage
import org.eclipse.paho.client.mqttv3.MqttTopic
import play.api.Logger._
import play.api.libs.iteratee.Concurrent
import play.api.libs.json.JsValue
import scala.collection.mutable.ArrayBuffer

class PahoClientModel(ip: String, port: Int, clientid: String, username: String, md5pass: String,
  clean: Boolean, keepAlive: Int, channel: Concurrent.Channel[String]) extends MqttCallback {

 
  val url = "tcp://" + ip + ":" + port
  val subTopics = ArrayBuffer[String]()
  val subQos = ArrayBuffer[Int]()

  val conOpt = new MqttConnectOptions
  conOpt.setCleanSession(clean)
  conOpt.setKeepAliveInterval(keepAlive)

  if (username!="") {
      logger.info(username)
      conOpt.setUserName(username)
      conOpt.setPassword(md5pass.toCharArray)
    }


  @BeanProperty
  var client = new MqttClient(url, clientid)
  client.setCallback(this)

  client.connect(conOpt)
  logger.info("MQtt webclient connected.")
  
  
  def lwt(topicName: String, payload:String, qos:Int) = {
    val mqttTopic = client.getTopic(topicName);
    conOpt.setWill(mqttTopic, payload.getBytes(), qos, false)
  }

  def subscribe(topicName: String, qos:Int) = {
    logger.info("Subscribed on "+ topicName)
    subTopics += topicName
    subQos += qos
    client.subscribe(topicName, qos)
  }

  def unsubscribe(topicName: String) = {
    logger.info("Unsubscribed on "+ topicName)
    val idx = subTopics.indexOf(topicName)
    subTopics.remove(idx)
    subQos.remove(idx)
    client.unsubscribe(topicName)
  }

  def publish(topicName: String, payload: String, qos:Int) = {
    logger.info("Publish on "+ topicName)
    val mqttTopic = client.getTopic(topicName);
    val mqttMessage = new MqttMessage(payload.getBytes());
    mqttMessage.setQos(qos);
    val token = mqttTopic.publish(mqttMessage);
    token.waitForCompletion();
  }

  def disconnect = {
    client.disconnect
    logger.info("MQtt webclient disconnected")
  }

  override def connectionLost(cause: Throwable) = {
    logger.info("MQtt webclient connection lost")
    channel.push("-->LOSTCONNECT")
    client = new MqttClient(url, clientid)
    client.connect(conOpt)
    client.subscribe(subTopics.toArray, subQos.toArray)
  }

  override def deliveryComplete(token: IMqttDeliveryToken) = {

  }

  override def messageArrived(topic: String, message: MqttMessage) = {
    val payload = new String(message.getPayload())
    logger.info(payload)
    channel.push(topic + "\n" + payload)
  }

}
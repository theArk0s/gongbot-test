package controllers

import models.PahoClientModel
import utils.ScalaMD5Sum
import play.api._
import play.api.mvc._
import play.api.libs.iteratee.Enumerator
import play.api.libs.iteratee.Iteratee
import play.api.libs.iteratee.Concurrent
import play.api.Logger._
import play.api.libs.concurrent.Execution.Implicits._
import scala.util.Properties

object Application extends Controller {
  
  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def mqtt() = WebSocket.using[String] { request =>
  //println("In websocket action.")
    val md5pass =ScalaMD5Sum.computeSum(Properties.envOrElse("THINGFABRIC_PASSWORD", "" ))//"a029d0df84eb5549c641e04a9ef389e5"

    val (out,channel) = Concurrent.broadcast[String]

    val mqtt = new PahoClientModel(Properties.envOrElse("THINGFABRIC_M2M_ENDPOINT", "q.m2m.io" ), 1883, java.util.UUID.randomUUID.toString.substring(0,22), Properties.envOrElse("THINGFABRIC_USERNAME", ""), md5pass, true, 30, channel)

    val in = Iteratee.foreach[String](x => {
      //logger.info("Websocket msg: " + x)
      try {
        val Array(cmd, topic, qos, message) = x.split("<--")
        cmd match {
          case "SUBSCRIBE" => mqtt.subscribe(Properties.envOrElse("THINGFABRIC_M2M_DATA_CHANNEL", "public/thingfabric/#" ), qos.toInt)
          case "UNSUBSCRIBE" => mqtt.unsubscribe(topic)
          case "PUBLISH" => mqtt.publish(topic, message, qos.toInt)
          case "CHECK" => if(mqtt.client.isConnected()) channel.push("-->CONNECTED")
          case "PING" => mqtt.publish(topic, message, 0)
          case _ => logger.info("Unknown cmd: " + x)
        }
      } catch {
        case e: Exception => {
          logger.error("Exception occured in websocket", e)
        }
      }
    }).mapDone { x =>
      mqtt.disconnect
    }

    (in, out)
  }
  
}
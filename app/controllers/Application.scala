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

object Application extends Controller {
  
  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def mqtt(ip: String, port: Int, clientid: String, un: Option[String], pw: Option[String],
           clean: String, ttl: Int, lwtTopic:Option[String], lwtQos:Int, lwtPayload:Option[String]) = WebSocket.using[String] { request =>
  //println("In websocket action.")
    val md5pass =ScalaMD5Sum.computeSum(pw.getOrElse(""))//"a029d0df84eb5549c641e04a9ef389e5"
    println(md5pass)

    val (out,channel) = Concurrent.broadcast[String]

    val mqtt = new PahoClientModel(ip, port, clientid, un, md5pass, clean.toBoolean, ttl, channel)

    val in = Iteratee.foreach[String](x => {
      //logger.info("Websocket msg: " + x)
      try {
        val Array(cmd, topic, qos, message) = x.split("<--")
        cmd match {
          case "SUBSCRIBE" => mqtt.subscribe(topic, qos.toInt)
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
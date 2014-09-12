package controllers;

import play.*;
import play.mvc.*;

import views.html.*;
import models.PahoClientModel;
import utils.ScalaMD5Sum;
import akka.actor.ActorRef;
import akka.actor.Cancellable;
import akka.actor.Props;
import play.libs.Akka;
import play.libs.F.Callback0;
import play.libs.F.Callback;
import org.eclipse.paho.client.mqttv3.*;
import java.util.UUID;
import java.security.NoSuchAlgorithmException;

public class Application extends Controller {

    public static Result index() {
        return ok(index.render("Your new application is ready."));
    }

    public static WebSocket<String> mqtt() {
        return new WebSocket<String>() {
            public void onReady(WebSocket.In<String> in, final WebSocket.Out<String> out) {
                try{
                    String md5pass = "";
                    String username = "";
                    if (System.getenv().containsKey("THINGFABRIC_USERNAME") && System.getenv().containsKey("THINGFABRIC_PASSWORD")){
                        md5pass = ScalaMD5Sum.computeSum(System.getenv().get("THINGFABRIC_PASSWORD")) ;
                        username =  System.getenv().get("THINGFABRIC_USERNAME");
                    }
                    final PahoClientModel mqtt = new PahoClientModel(System.getenv("THINGFABRIC_M2M_ENDPOINT"), 1883, UUID.randomUUID().toString().substring(0,22), username, md5pass, true, 30, out);

                    in.onMessage(new Callback<String>() {
                        public void invoke(String event) throws MqttException{
                            Logger.info(event);
                            String[] arr = event.split("<--");
                            String cmd = arr[0];
                            String topic = arr[1];
                            Logger.info(cmd);
                            if (cmd.equals("SUBSCRIBE")) mqtt.subscribe(System.getenv().get("THINGFABRIC_M2M_DATA_CHANNEL"), 1);
                            if (cmd.equals("UNSUBSCRIBE")) mqtt.unsubscribe(topic);
                            if (cmd.equals("PUBLISH") ) mqtt.publish(System.getenv().get("THINGFABRIC_M2M_DATA_CHANNEL"), arr[3], 1);
                            if (cmd.equals("CHECK"))  if(mqtt.client.isConnected()) out.write("-->CONNECTED");
                            if (cmd.equals("PING")) mqtt.publish(topic, arr[3], 0);

                        }
                    });

                    in.onClose(new Callback0() {
                        public void invoke() throws Throwable {
                            mqtt.disconnect();
                        }
                    });
                } catch (MqttSecurityException se){
                     Logger.info("MqttSecurityException");
                } catch (MqttException e){
                    Logger.info("MqttException");
                } catch (NoSuchAlgorithmException ex){
                    Logger.info("NoSuchAlgorithmException");
                }
            }

        };
    }
}

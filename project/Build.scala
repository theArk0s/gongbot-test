import sbt._
import Keys._
import play.Project._

object ApplicationBuild extends Build {

  val appName         = "thingfabric-play"
  val appVersion      = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    // Add your project dependencies here,
    jdbc,
    anorm,
    "org.eclipse.paho" % "mqtt-client" % "0.4.0"
  )


  val main = play.Project(appName, appVersion, appDependencies).settings(
    // Add your own project settings here
    coffeescriptOptions := Seq("bare"),
    resolvers ++= Seq(
      "Maven Repository" at "http://repo1.maven.org/maven2/",
      "Paho-releases" at "https://repo.eclipse.org/content/repositories/paho-releases",
      "Paho-snapshots" at "https://repo.eclipse.org/content/repositories/paho-snapshots/"
    )
  )

}

package utils
import java.security.MessageDigest

object ScalaMD5Sum {

  def computeSum(string:String) : String = {
    computeSum(string.getBytes())
  }
  
  def computeSum(bytes: Array[Byte]): String = {
    val md5 = MessageDigest.getInstance("MD5")
    md5.reset()
    md5.update(bytes)

    md5.digest().map(0xFF & _).map { "%02x".format(_) }.foldLeft("") { _ + _ }
  }

}
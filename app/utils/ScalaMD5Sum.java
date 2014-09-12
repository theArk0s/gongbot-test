package utils;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class ScalaMD5Sum {

  public static String computeSum(String string) throws NoSuchAlgorithmException{
    return computeSum(string.getBytes());
  }

  public static String computeSum(byte[] bytes) throws NoSuchAlgorithmException{
    MessageDigest md5 = MessageDigest.getInstance("MD5");
    md5.reset();
    md5.update(bytes);

      byte[] digest = md5.digest();
      StringBuffer sb = new StringBuffer();
      for (int i = 0; i < digest.length; i++)
          sb.append(Integer.toString((digest[i] & 0xff) + 0x100, 16).substring(1));
      return sb.toString();
  }

}
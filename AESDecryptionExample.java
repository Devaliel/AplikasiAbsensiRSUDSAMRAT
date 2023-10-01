import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

/**
 * Example of AES Decryption
 * Decrypts AES-encrypted data using a specified key.
 */
public class AESDecryptionExample {
    public static void main(String[] args) throws Exception {
        // Encrypted data to be decrypted
        String encryptedData = "dlAvw4j4f/yMq62GRD5bYGshoYxQLHtGkBD2loAWtTDb8+9g/JrmWSj7dEbaRpkO";

        // AES key used for decryption (base64-encoded)
        String secretKey = "u/Gu5posvwDsXUnV5Zaq4g==";

        // Decode the key from base64
        byte[] decodedKey = Base64.getDecoder().decode(secretKey);
        SecretKeySpec secretKeySpec = new SecretKeySpec(decodedKey, "AES");

        // Initialize the cipher for decryption
        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, secretKeySpec);

        // Decrypt the encrypted data
        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        String decryptedData = new String(decryptedBytes);

        // Display the decrypted data
        System.out.println("Decrypted data: " + decryptedData);
    }
}

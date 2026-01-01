package com.electronics.backend.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class GoogleAuthenticatorUtils {

    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    public String generateSecret() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    public String generateQrCodeImageUri(String secret, String email) {
        try {
            System.out.println("=== DÉBUT GÉNÉRATION QR CODE ===");
            System.out.println("📧 Email: " + email);
            System.out.println("🔐 Secret: " + secret);

            // Nettoyer l'email
            String cleanEmail = email != null ? email.trim().toLowerCase() : "user@example.com";
            String issuer = "ElectronicStore"; // IMPORTANT: Pas d'espaces dans le nom

            // Vérifier le format du secret
            if (!isValidBase32(secret)) {
                System.err.println("❌ Secret invalide (doit être Base32): " + secret);
                return null;
            }

            // Méthode 1: Utiliser la bibliothèque GoogleAuthenticatorQRGenerator (la plus fiable)
            GoogleAuthenticatorKey key = new GoogleAuthenticatorKey.Builder(secret).build();
            String otpAuthUrl = GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(issuer, cleanEmail, key);

            System.out.println("🔗 OTPAuth URL (méthode 1): " + otpAuthUrl);

            // Alternative: Construire manuellement l'URL
            String manualUrl = String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s",
                    URLEncoder.encode(issuer, StandardCharsets.UTF_8.name()),
                    URLEncoder.encode(cleanEmail, StandardCharsets.UTF_8.name()),
                    secret,
                    URLEncoder.encode(issuer, StandardCharsets.UTF_8.name()));

            System.out.println("🔗 OTPAuth URL (méthode manuelle): " + manualUrl);

            // Utiliser l'URL de la bibliothèque (plus fiable)
            String urlToEncode = otpAuthUrl;

            // Générer le QR code
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(urlToEncode, BarcodeFormat.QR_CODE, 300, 300);

            // Convertir en image
            BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

            // Convertir en base64
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "png", baos);
            byte[] imageBytes = baos.toByteArray();

            String base64 = Base64.getEncoder().encodeToString(imageBytes);
            String result = "data:image/png;base64," + base64;

            System.out.println("✅ QR code généré avec succès");
            System.out.println("📏 Longueur base64: " + base64.length());
            System.out.println("=== FIN GÉNÉRATION QR CODE ===");

            return result;

        } catch (Exception e) {
            System.err.println("❌ Erreur génération QR code: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // Méthode alternative ultra-simple
    public String generateSimpleQrCode(String secret, String email) {
        try {
            System.out.println("=== GÉNÉRATION QR CODE SIMPLIFIÉE ===");

            // Format simple et éprouvé
            String issuer = "ElectronicStore";
            String account = email != null ? email.trim().toLowerCase() : "user@example.com";

            // URL au format standard Google Authenticator
            String otpUrl = String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s",
                    issuer,
                    account,
                    secret,
                    issuer);

            System.out.println("🔗 URL simplifiée: " + otpUrl);

            // Créer le QR code
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(otpUrl, BarcodeFormat.QR_CODE, 250, 250);

            ByteArrayOutputStream os = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", os);

            String base64 = Base64.getEncoder().encodeToString(os.toByteArray());
            String result = "data:image/png;base64," + base64;

            System.out.println("✅ QR code simplifié généré");
            System.out.println("=== FIN GÉNÉRATION SIMPLIFIÉE ===");

            return result;

        } catch (Exception e) {
            System.err.println("❌ Erreur génération simplifiée: " + e.getMessage());
            return null;
        }
    }

    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null) {
            return false;
        }
        try {
            int verificationCode = Integer.parseInt(code);
            return gAuth.authorize(secret, verificationCode);
        } catch (NumberFormatException e) {
            System.err.println("Code invalide: " + code);
            return false;
        }
    }

    private boolean isValidBase32(String secret) {
        if (secret == null) return false;
        // Base32: A-Z et 2-7 uniquement
        return secret.matches("^[A-Z2-7]+=*$");
    }

    // Méthode pour générer un code de test (pour debug)
    public String getCurrentCode(String secret) {
        try {
            int code = gAuth.getTotpPassword(secret);
            return String.format("%06d", code);
        } catch (Exception e) {
            return null;
        }
    }
}

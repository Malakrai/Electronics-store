package com.electronics.backend.services.jwt;

import com.electronics.backend.model.User;
import com.electronics.backend.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender; // IMPORTANT: Pour envoyer des emails

    // Stockage temporaire des tokens
    private final Map<String, PasswordResetToken> resetTokens = new ConcurrentHashMap<>();

    @Value("${app.base-url:http://localhost:4200}")
    private String baseUrl;

    @Value("${app.email.sender:abdozahid51@gmail.com}")
    private String emailSender;

    @Value("${app.email.sender.name:Electronic Store}")
    private String senderName;

    /**
     * Envoie un VRAI email de réinitialisation
     */
    public boolean sendPasswordResetLink(String email) {
        try {
            System.out.println("📧 Tentative d'envoi d'email à: " + email);

            // Vérifier si l'utilisateur existe
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                System.out.println("❌ Utilisateur non trouvé: " + email);
                return false;
            }

            User user = userOptional.get();
            String token = UUID.randomUUID().toString();

            // Stocker le token (valable 24h)
            resetTokens.put(token, new PasswordResetToken(email, LocalDateTime.now().plusHours(24)));

            // Construire le lien de réinitialisation
            String resetLink = baseUrl + "/forgot-password?token=" + token;
            boolean emailSent = sendRealEmail(email, token, resetLink, user);

            if (emailSent) {
                return true;
            } else {
                printEmailInConsole(email, token, resetLink, user);
                return true; // Pour le développement
            }

        } catch (Exception e) {
            System.out.println("Erreur: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Envoie un VRAI email via SMTP Gmail
     */
    private boolean sendRealEmail(String toEmail, String token, String resetLink, User user) {
        try {
            System.out.println(" Envoi SMTP à: " + toEmail);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(emailSender, senderName);
            helper.setTo(toEmail);
            helper.setSubject("Réinitialisation de mot de passe - Electronic Store");

            // Contenu HTML professionnel
            String htmlContent = buildEmailHtml(resetLink, token, user);
            helper.setText(htmlContent, true);

            // ENVOYER L'EMAIL
            mailSender.send(message);

            System.out.println("Email SMTP envoyé avec succès!");
            return true;

        } catch (MessagingException e) {
            System.out.println(" Erreur SMTP: " + e.getMessage());
            System.out.println("Vérifiez la configuration SMTP dans application.properties");
            return false;
        } catch (Exception e) {
            System.out.println(" Autre erreur: " + e.getMessage());
            return false;
        }
    }

    /**
     * Construit le contenu HTML de l'email
     */
    private String buildEmailHtml(String resetLink, String token, User user) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }" +
                ".container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }" +
                ".header { background: #3498db; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".button { display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                ".token-box { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; margin: 20px 0; }" +
                ".footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>🛒 Electronic Store</h1><h2>Réinitialisation de mot de passe</h2></div>" +
                "<p>Bonjour <strong>" + user.getFirstName() + " " + user.getLastName() + "</strong>,</p>" +
                "<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>" +
                "<div style='text-align: center;'><a href='" + resetLink + "' class='button'>Réinitialiser mon mot de passe</a></div>" +
                "<p>Ou copiez-collez ce lien dans votre navigateur :</p>" +
                "<p><a href='" + resetLink + "'>" + resetLink + "</a></p>" +
                "<p><strong>⚠️ Important :</strong></p>" +
                "<ul><li>Ce lien est valable 24 heures</li><li>Ne partagez jamais ce lien</li><li>Si vous n'avez pas fait cette demande, ignorez cet email</li></ul>" +
                "<p>Cordialement,<br>L'équipe Electronic Store</p>" +
                "<div class='footer'><p>© 2024 Electronic Store. Tous droits réservés.</p><p>Cet email est envoyé automatiquement, merci de ne pas y répondre.</p></div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Affiche l'email dans la console (mode développement)
     */
    private void printEmailInConsole(String email, String token, String resetLink, User user) {
        System.out.println("\n" + "=".repeat(80));
        System.out.println(" MODE DÉVELOPPEMENT - Email simulé");
        System.out.println("=".repeat(80));
        System.out.println("À: " + email);
        System.out.println("Lien: " + resetLink);
        System.out.println("Token: " + token);
        System.out.println("Utilisateur: " + user.getFirstName() + " " + user.getLastName());
        System.out.println("=".repeat(80) + "\n");
    }

    // ... autres méthodes (resetPassword, validateToken, etc.) restent inchangées
    public boolean resetPassword(String token, String newPassword) {
        try {
            PasswordResetToken resetToken = resetTokens.get(token);
            if (resetToken == null || resetToken.isExpired()) {
                System.out.println(" Token invalide ou expiré: " + token);
                return false;
            }

            Optional<User> userOptional = userRepository.findByEmail(resetToken.getEmail());
            if (userOptional.isEmpty()) {
                System.out.println(" Utilisateur non trouvé pour token: " + token);
                return false;
            }

            User user = userOptional.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            resetTokens.remove(token);
            System.out.println(" Mot de passe réinitialisé pour: " + user.getEmail());
            return true;
        } catch (Exception e) {
            System.out.println(" Erreur lors de la réinitialisation: " + e.getMessage());
            return false;
        }
    }

    public boolean validateToken(String token) {
        PasswordResetToken resetToken = resetTokens.get(token);
        boolean isValid = resetToken != null && !resetToken.isExpired();
        System.out.println("🔍 Validation token " + token + ": " + isValid);
        return isValid;
    }

    public Map<String, String> getUserInfoByToken(String token) {
        PasswordResetToken resetToken = resetTokens.get(token);
        if (resetToken != null && !resetToken.isExpired()) {
            Optional<User> userOptional = userRepository.findByEmail(resetToken.getEmail());
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                Map<String, String> userInfo = new HashMap<>();
                userInfo.put("email", user.getEmail());
                userInfo.put("firstName", user.getFirstName());
                userInfo.put("lastName", user.getLastName());
                userInfo.put("userType", user.getUserType());
                return userInfo;
            }
        }
        return null;
    }

    private static class PasswordResetToken {
        private final String email;
        private final LocalDateTime expiryDate;

        public PasswordResetToken(String email, LocalDateTime expiryDate) {
            this.email = email;
            this.expiryDate = expiryDate;
        }

        public String getEmail() {
            return email;
        }

        public boolean isExpired() {
            return LocalDateTime.now().isAfter(expiryDate);
        }
    }
}

package com.electronics.backend.controller;

import com.electronics.backend.services.jwt.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/password-reset")
public class PasswordResetController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Email est requis"
                ));
            }

            System.out.println("📧 Password reset request for: " + email);

            boolean result = emailService.sendPasswordResetLink(email);

            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Token de réinitialisation généré avec succès. Vérifiez la console pour le token."
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Utilisateur non trouvé ou erreur de génération du token"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erreur: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");

            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Token est requis"
                ));
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Nouveau mot de passe est requis"
                ));
            }

            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Le mot de passe doit contenir au moins 6 caractères"
                ));
            }

            boolean result = emailService.resetPassword(token, newPassword);

            if (result) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Mot de passe réinitialisé avec succès"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Token invalide ou expiré"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erreur: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "valid", false,
                        "message", "Token est requis"
                ));
            }

            boolean isValid = emailService.validateToken(token);
            Map<String, String> userInfo = emailService.getUserInfoByToken(token);

            if (isValid && userInfo != null) {
                return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "user", userInfo,
                        "message", "Token valide"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "valid", false,
                        "message", "Token invalide ou expiré"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", "Erreur: " + e.getMessage()
            ));
        }
    }

    // Endpoint pour obtenir les informations utilisateur par token
    @GetMapping("/user-info")
    public ResponseEntity<?> getUserInfoByToken(@RequestParam String token) {
        try {
            Map<String, String> userInfo = emailService.getUserInfoByToken(token);

            if (userInfo != null) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "user", userInfo
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Token invalide ou expiré"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Erreur: " + e.getMessage()
            ));
        }
    }
}

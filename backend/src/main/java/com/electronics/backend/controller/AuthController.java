package com.electronics.backend.controller;

import com.electronics.backend.dto.AdminRegistrationDto;
import com.electronics.backend.dto.CustomerRegistrationDto;
import com.electronics.backend.dto.LoginRequest;
import com.electronics.backend.dto.LoginResponse;
import com.electronics.backend.dto.TwoFactorVerifyDto;
import com.electronics.backend.model.Admin;
import com.electronics.backend.model.Customer;
import com.electronics.backend.model.Qr;
import com.electronics.backend.model.User;
import com.electronics.backend.services.AuthService;
import com.electronics.backend.services.GoogleAuthenticatorUtils;
import com.electronics.backend.services.QrService;
import com.electronics.backend.utils.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthenticatorUtils googleAuthService;
    private final JwtUtil jwtUtil;
    private final QrService qrService;

    public AuthController(AuthService authService,
                          GoogleAuthenticatorUtils googleAuthService,
                          JwtUtil jwtUtil,
                          QrService qrService) {
        this.authService = authService;
        this.googleAuthService = googleAuthService;
        this.jwtUtil = jwtUtil;
        this.qrService = qrService;
    }

    @PostMapping("/admin/register")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminRegistrationDto dto) {
        try {
            Admin admin = authService.registerAdmin(dto);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Admin registered successfully");
            response.put("adminId", admin.getId());

            if (dto.isEnableGoogleAuth() && admin.getGoogleAuthSecret() != null) {
                String qrCodeUri = googleAuthService.generateQrCodeImageUri(
                        admin.getGoogleAuthSecret(),
                        admin.getEmail()
                );
                response.put("qrCodeUri", qrCodeUri);
                response.put("googleAuthEnabled", true);
                response.put("secret", admin.getGoogleAuthSecret());

                qrService.createQr(admin.getEmail(), admin.getGoogleAuthSecret());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/customer/register")
    public ResponseEntity<?> registerCustomer(@RequestBody CustomerRegistrationDto dto) {
        try {
            Customer customer = authService.registerCustomer(dto);
            return ResponseEntity.ok(Map.of(
                    "message", "Customer registered successfully",
                    "customerId", customer.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest dto) {
        try {
            User user = authService.authenticateUser(dto.getEmail(), dto.getPassword());

            boolean requires2fa = user instanceof Admin && ((Admin) user).isGoogleAuthEnabled();

            if (requires2fa) {
                // Admin avec 2FA activée - retourner le QR code
                Admin admin = (Admin) user;
                String qrCodeUri = googleAuthService.generateQrCodeImageUri(
                        admin.getGoogleAuthSecret(),
                        admin.getEmail()
                );

                Map<String, Object> response = new HashMap<>();
                response.put("userType", user.getUserType());
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("firstName", user.getFirstName());
                response.put("lastName", user.getLastName());
                response.put("requires2fa", true);
                response.put("qrCodeUrl", qrCodeUri);  // Ajouté pour le frontend
                response.put("message", "Admin avec 2FA détecté - scannez le QR code");
                response.put("googleAuthEnabled", true);

                return ResponseEntity.ok(response);
            }

            // Utilisateurs sans 2FA (clients, magasiniers, admins sans 2FA)
            String jwt = jwtUtil.generateToken(user.getEmail(), user.getUserType());

            Map<String, Object> response = new HashMap<>();
            response.put("jwtToken", jwt);
            response.put("userType", user.getUserType());
            response.put("userId", user.getId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("requires2fa", false);
            response.put("message", "Connexion réussie");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/qrcode")
    public ResponseEntity<?> getAdminQrCode(@RequestBody LoginRequest dto) {
        try {
            User user = authService.authenticateUser(dto.getEmail(), dto.getPassword());

            // Vérifier que c'est bien un admin
            if (!(user instanceof Admin)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Utilisateur n'est pas un administrateur"));
            }

            Admin admin = (Admin) user;

            if (!admin.isGoogleAuthEnabled()) {
                return ResponseEntity.badRequest().body(Map.of("error", "2FA non activée pour cet administrateur"));
            }

            String qrCodeUri = googleAuthService.generateQrCodeImageUri(
                    admin.getGoogleAuthSecret(),
                    admin.getEmail()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("qrCodeRequired", true);
            response.put("qrCodeUrl", qrCodeUri);
            response.put("message", "Veuillez scanner le QR code avec Google Authenticator");
            response.put("email", user.getEmail());
            response.put("googleAuthEnabled", true);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/verify-2fa")  // Modifié pour accepter email/password/code
    public ResponseEntity<?> verifyAdmin2FA(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String totpCode = request.get("totpCode");

            if (email == null || password == null || totpCode == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email, mot de passe et code requis"));
            }

            // Authentifier l'utilisateur
            User user = authService.authenticateUser(email, password);

            // Vérifier que c'est bien un admin
            if (!(user instanceof Admin)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Utilisateur n'est pas un administrateur"));
            }

            Admin admin = (Admin) user;

            // Vérifier le code 2FA
            boolean isValid = googleAuthService.verifyCode(admin.getGoogleAuthSecret(), totpCode);

            if (!isValid) {
                return ResponseEntity.badRequest().body(Map.of("error", "Code 2FA invalide"));
            }

            // Générer le JWT
            String jwt = jwtUtil.generateToken(user.getEmail(), user.getUserType());

            // Associer le QR code
            qrService.associateQr(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("jwtToken", jwt);
            response.put("email", user.getEmail());
            response.put("userType", user.getUserType());
            response.put("message", "Authentification 2FA réussie");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verifyTwoFactorAuth(@RequestBody TwoFactorVerifyDto dto) {
        try {
            boolean isValid = authService.verifyGoogleAuth(dto.getUserId(), Integer.parseInt(dto.getCode()));

            if (!isValid) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid 2FA code"));
            }

            User user = authService.getUserById(dto.getUserId());
            String jwt = jwtUtil.generateToken(user.getEmail(), user.getUserType());

            qrService.associateQr(user.getEmail());

            return ResponseEntity.ok(new LoginResponse(
                    jwt,
                    user.getUserType(),
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    false
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/associate-qr")
    public ResponseEntity<?> associateQrCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            Qr qr = qrService.associateQr(email);

            return ResponseEntity.ok(Map.of(
                    "message", "QR code associated successfully",
                    "email", qr.getEmail(),
                    "status", qr.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return ResponseEntity.ok(Map.of("message", "Current user endpoint - to be implemented with JWT extraction"));
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "Authentication Service"));
    }

    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String username = jwtUtil.extractUsername(token);
            boolean isValid = !jwtUtil.isTokenExpired(token);

            return ResponseEntity.ok(Map.of(
                    "valid", isValid,
                    "username", username
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", e.getMessage()));
        }
    }
}

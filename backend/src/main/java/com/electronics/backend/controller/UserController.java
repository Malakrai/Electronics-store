package com.electronics.backend.controller;

import com.electronics.backend.dto.PasswordChangeDto;
import com.electronics.backend.dto.UserProfileDto;
import com.electronics.backend.model.User;
import com.electronics.backend.repository.UserRepository;
import com.electronics.backend.services.AuthService;
import com.electronics.backend.utils.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    // Constructeur manuel
    public UserController(UserRepository userRepository,
                          JwtUtil jwtUtil,
                          PasswordEncoder passwordEncoder,
                          AuthService authService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        try {
            String email = getEmailFromRequest(request);
            Optional<User> user = userRepository.findByEmail(email);

            if (user.isPresent()) {
                UserProfileDto profile = new UserProfileDto();
                profile.setId(user.get().getId());
                profile.setEmail(user.get().getEmail());
                profile.setFirstName(user.get().getFirstName());
                profile.setLastName(user.get().getLastName());
                profile.setPhone(user.get().getPhone());
                profile.setUserType(user.get().getUserType());
                profile.setGoogleAuthEnabled(user.get().isGoogleAuthEnabled());

                return ResponseEntity.ok(profile);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error retrieving profile"));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserProfileDto profileDto, HttpServletRequest request) {
        try {
            String email = getEmailFromRequest(request);
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setFirstName(profileDto.getFirstName());
                user.setLastName(profileDto.getLastName());
                user.setPhone(profileDto.getPhone());

                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error updating profile"));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeDto passwordDto, HttpServletRequest request) {
        try {
            String email = getEmailFromRequest(request);
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // Vérifier que le mot de passe actuel est correct
                if (!passwordEncoder.matches(passwordDto.getCurrentPassword(), user.getPassword())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
                }

                // Vérifier que les nouveaux mots de passe correspondent
                if (!passwordDto.getNewPassword().equals(passwordDto.getConfirmPassword())) {
                    return ResponseEntity.badRequest().body(Map.of("error", "New passwords do not match"));
                }

                // Vérifier la force du mot de passe (optionnel)
                if (passwordDto.getNewPassword().length() < 6) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
                }

                user.setPassword(passwordEncoder.encode(passwordDto.getNewPassword()));
                userRepository.save(user);

                return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error changing password"));
        }
    }

    // Endpoint pour activer/désactiver Google Authenticator
    @PostMapping("/toggle-google-auth")
    public ResponseEntity<?> toggleGoogleAuth(@RequestBody Map<String, Boolean> request, HttpServletRequest httpRequest) {
        try {
            String email = getEmailFromRequest(httpRequest);
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                boolean enable = request.get("enable");

                user.setGoogleAuthEnabled(enable);
                if (!enable) {
                    user.setGoogleAuthSecret(null); // Supprimer le secret si désactivé
                }

                userRepository.save(user);

                return ResponseEntity.ok(Map.of(
                        "message", enable ? "Google Authenticator enabled" : "Google Authenticator disabled",
                        "googleAuthEnabled", enable
                ));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error updating Google Authenticator"));
        }
    }

    private String getEmailFromRequest(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        final String jwt = authHeader.substring(7);
        return jwtUtil.extractUsername(jwt);
    }
}

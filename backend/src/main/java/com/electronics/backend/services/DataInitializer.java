package com.electronics.backend.services;

import com.electronics.backend.model.Admin;
import com.electronics.backend.repository.UserRepository;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== DÉBUT INITIALISATION ===");

        if (userRepository.findByEmail("admin@electronics.com").isEmpty()) {
            Admin admin = new Admin();
            admin.setEmail("admin@electronics.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // hash du mot de passe
            admin.setFirstName("Admin");
            admin.setLastName("System");

            // ✅ Génération du secret Google Authenticator
            SecretGenerator secretGenerator = new DefaultSecretGenerator();
            String secret = secretGenerator.generate();
            admin.setGoogleAuthSecret(secret);
            admin.setGoogleAuthEnabled(true);

            userRepository.save(admin);
            System.out.println("✓ Admin créé: " + admin.getEmail());
            System.out.println("🔑 Secret Google Authenticator: " + secret);
        } else {
            System.out.println("⚠ Admin existe déjà !");
        }

        System.out.println("=== INITIALISATION TERMINÉE ===");
    }
}

package com.electronics.backend.services;

import com.electronics.backend.model.Admin;
import com.electronics.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== DÉBUT INITIALISATION ===");

        // Ne PAS appeler deleteAll() - la table est recréée automatiquement

        Admin admin = new Admin();
        admin.setEmail("admin@electronics.com");
        admin.setPassword("admin123"); // À hasher en production
        admin.setFirstName("Admin");
        admin.setLastName("System");
        admin.setEmployeeCode("EMP001");
        admin.setDepartment("IT");

        userRepository.save(admin);
        System.out.println("✓ Admin créé: " + admin.getEmail());

        System.out.println("=== INITIALISATION TERMINÉE ===");
    }
}

package com.electronics.backend.config;

import com.electronics.backend.model.Product;
import com.electronics.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                System.out.println("Insertion des produits de test");

                Product p1 = new Product("SKU001", "iPhone 15", new BigDecimal("1200.00"));
                p1.setDescription("Smartphone Apple haut de gamme");
                p1.setManufacturerId(1L);

                Product p2 = new Product("SKU002", "Samsung Galaxy S24", new BigDecimal("950.00"));
                p2.setDescription("Smartphone Android puissant");
                p2.setManufacturerId(2L);

                Product p3 = new Product("SKU003", "HP Laptop X360", new BigDecimal("1300.00"));
                p3.setDescription("Ordinateur portable convertible");
                p3.setManufacturerId(3L);

                productRepository.save(p1);
                productRepository.save(p2);
                productRepository.save(p3);

                System.out.println("Produits insérés avec succès !");
            } else {
                System.out.println("Produits déjà présents dans la base, aucun ajout effectué.");
            }
        };
    }
}

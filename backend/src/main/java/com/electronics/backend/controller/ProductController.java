package com.electronics.backend.controller;

import com.electronics.backend.model.Product;
import com.electronics.backend.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    // GET /api/products
    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        try {
            List<Product> products = productService.getAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la récupération: " + e.getMessage()));
        }
    }

    // POST /api/products/add - SIMPLIFIÉ
    @PostMapping("/add")
    public ResponseEntity<?> addProduct(@RequestBody Map<String, Object> productData) {
        try {
            System.out.println("📥 Données reçues: " + productData);

            // Créer un produit avec les données minimales
            Product product = new Product();

            // 1. Nom (obligatoire)
            if (productData.get("name") == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Le nom est obligatoire"));
            }
            product.setName(productData.get("name").toString());

            // 2. Prix (obligatoire)
            if (productData.get("price") == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Le prix est obligatoire"));
            }
            try {
                BigDecimal price = new BigDecimal(productData.get("price").toString());
                product.setPrice(price);
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Format de prix invalide"));
            }

            // 3. Catégorie (optionnel)
            if (productData.get("category") != null) {
                product.setCategory(productData.get("category").toString());
            }

            // 4. Stock (optionnel)
            if (productData.get("stock") != null) {
                try {
                    Integer stock = Integer.parseInt(productData.get("stock").toString());
                    product.setStock(stock);
                } catch (Exception e) {
                    product.setStock(0);
                }
            }

            // 5. Description (optionnel)
            if (productData.get("description") != null) {
                product.setDescription(productData.get("description").toString());
            }

            // 6. Image URL (optionnel)
            if (productData.get("imageUrl") != null) {
                product.setImageUrl(productData.get("imageUrl").toString());
            }

            // 7. SKU (optionnel)
            if (productData.get("sku") != null) {
                product.setSku(productData.get("sku").toString());
            }

            // 8. Status (optionnel, par défaut "active")
            if (productData.get("status") != null) {
                product.setStatus(productData.get("status").toString());
            } else {
                product.setStatus("active");
            }

            System.out.println("✅ Produit à enregistrer: " + product);

            // Sauvegarder via le service
            Product savedProduct = productService.addProduct(product);

            return ResponseEntity.ok(savedProduct);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Erreur création: " + e.getMessage()));
        }
    }

    // PUT /api/products/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> productData) {
        try {
            Product existingProduct = productService.getProductById(id)
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé"));

            // Mettre à jour les champs
            if (productData.get("name") != null) {
                existingProduct.setName(productData.get("name").toString());
            }

            if (productData.get("price") != null) {
                try {
                    BigDecimal price = new BigDecimal(productData.get("price").toString());
                    existingProduct.setPrice(price);
                } catch (Exception e) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Format de prix invalide"));
                }
            }

            if (productData.get("category") != null) {
                existingProduct.setCategory(productData.get("category").toString());
            }

            if (productData.get("stock") != null) {
                try {
                    Integer stock = Integer.parseInt(productData.get("stock").toString());
                    existingProduct.setStock(stock);
                } catch (Exception e) {
                    // Ignorer l'erreur, garder la valeur actuelle
                }
            }

            if (productData.get("description") != null) {
                existingProduct.setDescription(productData.get("description").toString());
            }

            if (productData.get("imageUrl") != null) {
                existingProduct.setImageUrl(productData.get("imageUrl").toString());
            }

            Product updatedProduct = productService.updateProduct(id, existingProduct);
            return ResponseEntity.ok(updatedProduct);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Produit supprimé"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

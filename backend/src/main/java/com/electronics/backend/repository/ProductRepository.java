package com.electronics.backend.repository;

import com.electronics.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Recherche par nom (insensible à la casse)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Recherche par fabricant
    List<Product> findByManufacturerId(Long manufacturerId);

    // Recherche par statut
    List<Product> findByIsActive(Boolean isActive);

    // Recherche par catégorie
    List<Product> findByCategory(String category);

    // Vérifier existence par SKU
    boolean existsBySku(String sku);

    // Trouver par SKU
    Optional<Product> findBySku(String sku);

    // Trouver les produits avec stock > 0
    List<Product> findByStockGreaterThan(Integer minStock);

    // Recherche par mot-clé dans plusieurs champs
    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);

    // Trouver par prix entre min et max
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceBetween(@Param("minPrice") Double minPrice,
                                     @Param("maxPrice") Double maxPrice);
}

package com.electronics.backend.repository;

import com.electronics.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {


    @Query(value = "SELECT * FROM products", nativeQuery = true)
    List<Product> getAllProducts();

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByManufacturerId(Long manufacturerId);

    List<Product> findByIsActive(Boolean isActive);

}

package com.electronics.backend.services;

import com.electronics.backend.model.Product;
import com.electronics.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        return productRepository.findById(id)
                .map(p -> {
                    p.setSku(updatedProduct.getSku());
                    p.setName(updatedProduct.getName());
                    p.setDescription(updatedProduct.getDescription());
                    p.setPrice(updatedProduct.getPrice());
                    p.setCost(updatedProduct.getCost());
                    p.setManufacturerId(updatedProduct.getManufacturerId());
                    p.setWeight(updatedProduct.getWeight());
                    p.setDimensions(updatedProduct.getDimensions());
                    p.setIsActive(updatedProduct.getIsActive());
                    return productRepository.save(p);
                })
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec id: " + id));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }


    public List<Product> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> getByManufacturer(Long manufacturerId) {
        return productRepository.findByManufacturerId(manufacturerId);
    }

    public List<Product> getByStatus(Boolean isActive) {
        return productRepository.findByIsActive(isActive);
    }

}

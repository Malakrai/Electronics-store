package com.electronics.backend.controller;

import com.electronics.backend.model.Product;
import com.electronics.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;


    @PostMapping("/add")
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }


    @GetMapping("/")
    @ResponseBody
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }


    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    @PutMapping("/update/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product updatedProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setSku(updatedProduct.getSku());
                    product.setName(updatedProduct.getName());
                    product.setDescription(updatedProduct.getDescription());
                    product.setPrice(updatedProduct.getPrice());
                    product.setCost(updatedProduct.getCost());
                    product.setManufacturerId(updatedProduct.getManufacturerId());
                    product.setWeight(updatedProduct.getWeight());
                    product.setDimensions(updatedProduct.getDimensions());
                    product.setIsActive(updatedProduct.getIsActive());
                    return productRepository.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec id: " + id));
    }


    @DeleteMapping("/delete/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
    }


}

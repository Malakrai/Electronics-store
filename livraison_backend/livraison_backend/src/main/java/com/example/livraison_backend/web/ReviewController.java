package com.example.livraison_backend.web;

import com.example.livraison_backend.model.Review;
import com.example.livraison_backend.repo.ReviewRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviews;

    public ReviewController(ReviewRepository reviews) {
        this.reviews = reviews;
    }

    @PostMapping
    public Review create(@RequestBody Review r) {
        return reviews.save(r);
    }

    @GetMapping
    public List<Review> list(@RequestParam Long orderId) {
        return reviews.findByOrderId(orderId);
    }
}

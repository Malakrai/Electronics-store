package com.electronics.backend.model;

import java.time.LocalDateTime;

public class Review {
    private int rating;
    private String comment;
    private LocalDateTime date = LocalDateTime.now();

    public Review(int rating, String comment) {
        this.rating = rating;
        this.comment = comment;
    }

    public int getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getDate() { return date; }
}

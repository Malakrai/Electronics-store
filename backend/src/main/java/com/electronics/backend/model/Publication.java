package com.electronics.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idPublication;

    private String contenuPublication;

    @ManyToOne
    private Admin admin;
}

package com.electronics.backend.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("CUSTOMER")
public class Customer extends User {

    public Customer() {
        super();
    }
}

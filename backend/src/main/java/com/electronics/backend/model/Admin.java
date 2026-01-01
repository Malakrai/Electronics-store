package com.electronics.backend.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {

    public Admin() {
        super();
    }

}

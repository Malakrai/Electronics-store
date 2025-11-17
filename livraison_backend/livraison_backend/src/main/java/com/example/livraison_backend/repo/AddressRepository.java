package com.example.livraison_backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.livraison_backend.model.Address;

public interface AddressRepository extends JpaRepository<Address, Long> {
}

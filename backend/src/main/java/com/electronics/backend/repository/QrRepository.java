package com.electronics.backend.repository;

import com.electronics.backend.model.Qr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface QrRepository extends JpaRepository<Qr, Long> {
    Optional<Qr> findByEmail(String email);
    boolean existsByEmail(String email);
}

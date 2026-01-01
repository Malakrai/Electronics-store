package com.electronics.backend.repository;

import com.electronics.backend.model.Magasinier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MagasinierRepository extends JpaRepository<Magasinier, Long> {
    Optional<Magasinier> findByEmail(String email);
}

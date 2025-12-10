package com.electronics.backend.services;

import com.electronics.backend.model.Qr;
import com.electronics.backend.repository.QrRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QrService {

    private final QrRepository qrRepository;

    public QrService(QrRepository qrRepository) {
        this.qrRepository = qrRepository;
    }

    public Qr createQr(String email) {
        return createQr(email, null);
    }

    public Qr createQr(String email, String secretKey) {
        Qr qr = new Qr();
        qr.setEmail(email);
        qr.setStatus("NON_ASSOCIÉ");
        qr.setSecretKey(secretKey);
        return qrRepository.save(qr);
    }

    public Qr associateQr(String email) {
        Optional<Qr> existingQr = qrRepository.findByEmail(email);

        if (existingQr.isPresent()) {
            Qr qr = existingQr.get();
            qr.associate();
            return qrRepository.save(qr);
        } else {
            Qr qr = new Qr();
            qr.setEmail(email);
            qr.associate();
            return qrRepository.save(qr);
        }
    }

    public Qr getQrByEmail(String email) {
        return qrRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("QR code not found for email: " + email));
    }

    public List<Qr> getAllQrs() {
        return qrRepository.findAll();
    }

    public boolean isQrAssociated(String email) {
        return qrRepository.findByEmail(email)
                .map(Qr::isAssociated)
                .orElse(false);
    }

    public void deleteQr(Long id) {
        qrRepository.deleteById(id);
    }

    public Qr updateQrSecret(String email, String secretKey) {
        Qr qr = getQrByEmail(email);
        qr.setSecretKey(secretKey);
        return qrRepository.save(qr);
    }

    public List<Qr> getNonAssociatedQrs() {
        return qrRepository.findAll().stream()
                .filter(qr -> !qr.isAssociated())
                .toList();
    }

    public List<Qr> getAssociatedQrs() {
        return qrRepository.findAll().stream()
                .filter(Qr::isAssociated)
                .toList();
    }
}

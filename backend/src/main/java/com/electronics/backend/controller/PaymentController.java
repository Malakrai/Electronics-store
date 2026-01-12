package com.electronics.backend.controller;

import com.electronics.backend.model.BillStatus;
import com.electronics.backend.model.MonthlyBill;
import com.electronics.backend.model.PaymentMethod;
import com.electronics.backend.repository.MonthlyBillRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentController {

    private final MonthlyBillRepository monthlyBillRepository;

    public PaymentController(MonthlyBillRepository monthlyBillRepository) {
        this.monthlyBillRepository = monthlyBillRepository;
    }

    @PostMapping("/confirm")
    public MonthlyBill confirm(@RequestBody ConfirmPaymentRequest req) {
        MonthlyBill bill = monthlyBillRepository.findById(req.billId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found"));

        if (req.method() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "method is required");
        }

        // Sans connaitre ton enum exact, on fait simple et robuste :
        String m = req.method().name().toUpperCase();

        if (m.contains("CARD") || m.contains("PAYPAL")) {
            bill.setStatus(BillStatus.PAID);
        } else {
            // virement / cash / autre
            bill.setStatus(BillStatus.PENDING);
        }

        return monthlyBillRepository.save(bill);
    }

    public record ConfirmPaymentRequest(Long billId, PaymentMethod method) {}
}

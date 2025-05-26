package com.example.platform.controller.donate;

import com.example.platform.dto.donate.DonationRequest;
import com.example.platform.dto.donate.DonationResponse;
import com.example.platform.dto.payment.PaymentNotification;
import com.example.platform.model.User;
import com.example.platform.service.donate.DonationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<DonationResponse> createDonation(
            @Valid @RequestBody DonationRequest request,
            @AuthenticationPrincipal User user) {
        System.out.println("Creating donation for user: " + (user != null ? user.getId() : "null"));
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }
        return ResponseEntity.ok(donationService.createDonation(request, user));
    }

    @GetMapping("/fund/{fundId}")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<DonationResponse>> getFundDonations(@PathVariable Long fundId) {
        return ResponseEntity.ok(donationService.getFundDonations(fundId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<List<DonationResponse>> getMyDonations(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(donationService.getDonorDonations(user.getId()));
    }

    @GetMapping("/{donationId}")
    @PreAuthorize("hasRole('DONOR') or hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<DonationResponse> getDonation(@PathVariable Long donationId) {
        return ResponseEntity.ok(donationService.getDonation(donationId));
    }

    @PostMapping("/test/complete-payment/{paymentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> testCompletePayment(@PathVariable String paymentId) {
        PaymentNotification notification = new PaymentNotification();
        notification.setEvent("payment.succeeded");
        notification.setPaymentId(paymentId);
        
        donationService.handlePaymentNotification(notification);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/test/cancel-payment/{paymentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> testCancelPayment(@PathVariable String paymentId) {
        PaymentNotification notification = new PaymentNotification();
        notification.setEvent("payment.canceled");
        notification.setPaymentId(paymentId);
        
        donationService.handlePaymentNotification(notification);
        return ResponseEntity.ok().build();
    }
}

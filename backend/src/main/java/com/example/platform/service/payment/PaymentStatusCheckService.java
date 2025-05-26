package com.example.platform.service.payment;

import com.example.platform.model.Donation;
import com.example.platform.model.Enum.DonationStatus;
import com.example.platform.repository.DonationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PaymentStatusCheckService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentStatusCheckService.class);
    private final DonationRepository donationRepository;
    private final PaymentService paymentService;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    public PaymentStatusCheckService(DonationRepository donationRepository, PaymentService paymentService) {
        this.donationRepository = donationRepository;
        this.paymentService = paymentService;
    }

    @Scheduled(fixedRate = 100000)
    @Transactional
    public void checkPendingPayments() {
        logger.info("Starting scheduled check of pending payments");
        

        LocalDateTime twoMinutesAgo = LocalDateTime.now().minusMinutes(1);
        List<Donation> pendingDonations = donationRepository.findByStatusAndCreatedAtBefore(
            DonationStatus.PENDING, 
            twoMinutesAgo
        );

        logger.info("Found {} pending donations to check", pendingDonations.size());

        for (Donation donation : pendingDonations) {
            try {
                // Проверяем статус платежа в ЮKassa
                var paymentStatus = paymentService.getPaymentStatus(donation.getPaymentId());
                String status = paymentStatus.getStatus();
                
                // Проверяем различные статусы платежа
                if ("canceled".equals(status) || 
                    "expired".equals(status) ||
                    // Если платеж в статусе pending и прошло больше 2 минут
                    ("pending".equals(status) && donation.getCreatedAt().isBefore(twoMinutesAgo)) ||
                    // Если платеж в статусе waiting_for_capture и прошло больше 2 минут
                    ("waiting_for_capture".equals(status) && donation.getCreatedAt().isBefore(twoMinutesAgo))) {
                    
                    logger.info("Payment {} is {} in YooKassa, updating donation status to FAILED", 
                        donation.getPaymentId(), status);
                    donation.setStatus(DonationStatus.FAILED);
                    donationRepository.save(donation);
                }
            } catch (Exception e) {
                logger.error("Error checking payment status for donation {}: {}", 
                    donation.getId(), e.getMessage(), e);
            }
        }
    }
} 
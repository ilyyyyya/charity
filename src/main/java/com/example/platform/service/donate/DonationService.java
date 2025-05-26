package com.example.platform.service.donate;

import com.example.platform.dto.donate.DonationRequest;
import com.example.platform.dto.donate.DonationResponse;
import com.example.platform.dto.payment.PaymentNotification;
import com.example.platform.dto.payment.PaymentRequest;
import com.example.platform.dto.payment.PaymentResponse;
import com.example.platform.exceptcontroller.GlobalExceptionHandler;
import com.example.platform.exception.PaymentException;
import com.example.platform.model.Donation;
import com.example.platform.model.Enum.DonationStatus;
import com.example.platform.model.Fund;
import com.example.platform.model.User;
import com.example.platform.repository.DonationRepository;
import com.example.platform.service.fund.FundService;
import com.example.platform.service.fund.FundUpdateService;
import com.example.platform.service.payment.PaymentService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DonationService {

    private static final Logger logger = LoggerFactory.getLogger(DonationService.class);

    private final PaymentService paymentService;
    private final FundService fundService;
    private final DonationRepository donationRepository;
    private final FundUpdateService fundUpdateService;

    public DonationService(PaymentService paymentService, FundService fundService, DonationRepository donationRepository, FundUpdateService fundUpdateService) {
        this.paymentService = paymentService;
        this.fundService = fundService;
        this.donationRepository = donationRepository;
        this.fundUpdateService = fundUpdateService;
    }

    @Transactional
    public DonationResponse createDonation(DonationRequest request, User donor) {
        System.out.println("Starting donation creation for fundId: " + request.getFundId());
        System.out.println("Donor info - ID: " + (donor != null ? donor.getId() : "null") + 
                         ", Name: " + (donor != null ? donor.getDisplayName() : "null"));
        
        if (donor == null) {
            throw new RuntimeException("Donor cannot be null");
        }
        
        Fund fund = fundService.getFundById(request.getFundId());
        System.out.println("Found fund: " + (fund != null ? fund.getTitle() : "null"));
        
        if (fund == null) {
            System.out.println("Fund not found with id: " + request.getFundId());
            throw new GlobalExceptionHandler.ResourceNotFoundException("Fund not found with id: " + request.getFundId());
        }

        try {
            System.out.println("Creating payment request");
            PaymentRequest paymentRequest = new PaymentRequest();
            paymentRequest.setAmount(request.getAmount());
            paymentRequest.setDescription("Пожертвование в фонд: " + fund.getTitle());
            paymentRequest.setReturnUrl(request.getReturnUrl());
            paymentRequest.setMetadata(Map.of(
                    "fundId", fund.getId().toString(),
                    "donorId", donor.getId().toString()
            ));

            System.out.println("Calling payment service");
            PaymentResponse paymentResponse = paymentService.createPayment(paymentRequest);
            System.out.println("Payment created with ID: " + paymentResponse.getPaymentId());

            if (paymentResponse.getPaymentId() == null) {
                throw new PaymentException("Payment ID is null in the response from YooKassa");
            }

            System.out.println("Creating donation entity");
            Donation donation = new Donation();
            donation.setFund(fund);
            donation.setDonor(donor);
            donation.setAmount(request.getAmount());
            donation.setStatus(DonationStatus.PENDING);
            donation.setDescription(request.getDescription());
            donation.setPaymentId(paymentResponse.getPaymentId());
            donation.setCurrency("RUB");

            System.out.println("Saving donation with donor ID: " + donation.getDonor().getId());
            donationRepository.save(donation);
            System.out.println("Donation saved successfully");

            return mapToDonationResponse(donation, paymentResponse);
        } catch (Exception e) {
            System.out.println("Error creating donation: " + e.getMessage());
            e.printStackTrace();
            throw new PaymentException("Failed to create payment: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void handlePaymentNotification(PaymentNotification notification) {
        logger.info("Received payment notification: event={}, paymentId={}", 
            notification.getEvent(), notification.getPaymentId());

        Donation donation = donationRepository.findByPaymentId(notification.getPaymentId())
                .orElseThrow(() -> {
                    logger.error("Donation not found for paymentId: {}", notification.getPaymentId());
                    return new RuntimeException("Donation not found");
                });

        logger.info("Found donation: id={}, fundId={}, amount={}, status={}", 
            donation.getId(), donation.getFund().getId(), donation.getAmount(), donation.getStatus());

        switch (notification.getEvent()) {
            case "payment.succeeded":
                logger.info("Processing successful payment for donation: id={}", donation.getId());
                donation.setStatus(DonationStatus.COMPLETED);
                logger.info("Updating fund amount: fundId={}, currentAmount={}, adding={}",
                    donation.getFund().getId(), donation.getFund().getCurrentAmount(), donation.getAmount());
                fundUpdateService.updateFundAmount(donation.getFund().getId(), donation.getAmount());
                logger.info("Fund amount updated successfully");
                break;

            case "payment.waiting_for_capture":
                logger.info("Payment waiting for capture: id={}, attempting to capture", donation.getId());
                try {
                    PaymentResponse captureResponse = paymentService.capturePayment(notification.getPaymentId());
                    logger.info("Payment captured successfully: id={}, status={}", 
                        captureResponse.getPaymentId(), captureResponse.getStatus());
                    
                    // После успешного подтверждения платежа, обновляем статус и сумму фонда
                    donation.setStatus(DonationStatus.COMPLETED);
                    logger.info("Updating fund amount: fundId={}, currentAmount={}, adding={}", 
                        donation.getFund().getId(), donation.getFund().getCurrentAmount(), donation.getAmount());
                    fundUpdateService.updateFundAmount(donation.getFund().getId(), donation.getAmount());
                    logger.info("Fund amount updated successfully");
                } catch (Exception e) {
                    logger.error("Failed to capture payment: id={}, error={}", 
                        notification.getPaymentId(), e.getMessage(), e);
                    // В случае ошибки оставляем статус PENDING
                }
                break;

            case "payment.canceled":
                logger.info("Processing canceled payment for donation: id={}", donation.getId());
                donation.setStatus(DonationStatus.FAILED);
                break;

            case "refund.succeeded":
                logger.info("Processing refund for donation: id={}", donation.getId());
                donation.setStatus(DonationStatus.REFUNDED);
                // добавить логику для уменьшения суммы фонда
                break;

            default:
                logger.warn("Unknown payment event: {}", notification.getEvent());
                break;
        }

        donationRepository.save(donation);
        logger.info("Donation status updated: id={}, newStatus={}", donation.getId(), donation.getStatus());
    }

    public List<DonationResponse> getFundDonations(Long fundId) {
        return donationRepository.findByFundId(fundId).stream()
                .map(this::mapToDonationResponse)
                .collect(Collectors.toList());
    }

    public List<DonationResponse> getDonorDonations(Long donorId) {
        return donationRepository.findByDonorId(donorId).stream()
                .map(this::mapToDonationResponse)
                .collect(Collectors.toList());
    }

    private DonationResponse mapToDonationResponse(Donation donation) {
        DonationResponse response = new DonationResponse();
        response.setId(donation.getId());
        response.setPaymentId(donation.getPaymentId());
        response.setStatus(donation.getStatus());
        response.setAmount(donation.getAmount());
        response.setCurrency(donation.getCurrency());
        response.setCreatedAt(donation.getCreatedAt());
        response.setFundTitle(donation.getFund().getTitle());
        response.setDonorName(donation.getDonor().getDisplayName());
        return response;
    }

    private DonationResponse mapToDonationResponse(Donation donation, PaymentResponse paymentResponse) {
        DonationResponse response = mapToDonationResponse(donation);
        response.setConfirmationUrl(paymentResponse.getConfirmationUrl());
        return response;
    }

    public DonationResponse getDonation(Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found"));
        return mapToDonationResponse(donation);
    }

}

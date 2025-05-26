package com.example.platform.dto.donate;

import com.example.platform.model.Enum.DonationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DonationResponse {
    private Long id;
    private String paymentId;
    private String confirmationUrl;
    private DonationStatus status;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime createdAt;
    private String fundTitle;
    private String donorName;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getConfirmationUrl() {
        return confirmationUrl;
    }

    public void setConfirmationUrl(String confirmationUrl) {
        this.confirmationUrl = confirmationUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getDonorName() {
        return donorName;
    }

    public void setDonorName(String donorName) {
        this.donorName = donorName;
    }

    public String getFundTitle() {
        return fundTitle;
    }

    public void setFundTitle(String fundTitle) {
        this.fundTitle = fundTitle;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public DonationStatus getStatus() {
        return status;
    }

    public void setStatus(DonationStatus status) {
        this.status = status;
    }
}

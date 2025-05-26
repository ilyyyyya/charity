package com.example.platform.dto.payment;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;


public class PaymentResponse {

    private String paymentId;
    private String confirmationUrl;
    private String status;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime createdAt;



    public PaymentResponse(String id, String confirmationUrl, String status, BigDecimal amount, String currency, LocalDateTime createdAt) {
        this.paymentId = id;
        this.confirmationUrl = confirmationUrl;
        this.status = status;
        this.amount = amount;
        this.currency = currency;
        this.createdAt = createdAt;
    }

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

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

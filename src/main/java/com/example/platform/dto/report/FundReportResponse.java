package com.example.platform.dto.report;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class FundReportResponse {

    private Long id;
    private Long fundId;
    private String fundTitle;
    private String description;
    private BigDecimal totalSpent;
    private List<String> expenses;
    private List<String> purchases;
    private List<ReportPhotoResponse> photos;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFundId() {
        return fundId;
    }

    public void setFundId(Long fundId) {
        this.fundId = fundId;
    }

    public String getFundTitle() {
        return fundTitle;
    }

    public void setFundTitle(String fundTitle) {
        this.fundTitle = fundTitle;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public List<String> getExpenses() {
        return expenses;
    }

    public void setExpenses(List<String> expenses) {
        this.expenses = expenses;
    }

    public List<String> getPurchases() {
        return purchases;
    }

    public void setPurchases(List<String> purchases) {
        this.purchases = purchases;
    }

    public List<ReportPhotoResponse> getPhotos() {
        return photos;
    }

    public void setPhotos(List<ReportPhotoResponse> photos) {
        this.photos = photos;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 
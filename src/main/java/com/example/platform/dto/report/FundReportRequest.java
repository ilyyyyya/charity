package com.example.platform.dto.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public class FundReportRequest {

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Total spent amount is required")
    @Positive(message = "Total spent amount must be positive")
    private BigDecimal totalSpent;

    @NotEmpty(message = "At least one expense must be specified")
    private List<String> expenses;

    @NotEmpty(message = "At least one purchase must be specified")
    private List<String> purchases;

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
} 
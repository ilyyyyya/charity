package com.example.platform.dto.donate;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public class DonationStatistics {

    private BigDecimal totalDonations;
    private Integer donationsCount;
    private LocalDateTime lastDonationDate;
    private BigDecimal averageDonation;

    public BigDecimal getAverageDonation() {
        return averageDonation;
    }

    public void setAverageDonation(BigDecimal averageDonation) {
        this.averageDonation = averageDonation;
    }

    public Integer getDonationsCount() {
        return donationsCount;
    }

    public void setDonationsCount(Integer donationsCount) {
        this.donationsCount = donationsCount;
    }

    public LocalDateTime getLastDonationDate() {
        return lastDonationDate;
    }

    public void setLastDonationDate(LocalDateTime lastDonationDate) {
        this.lastDonationDate = lastDonationDate;
    }

    public BigDecimal getTotalDonations() {
        return totalDonations;
    }

    public void setTotalDonations(BigDecimal totalDonations) {
        this.totalDonations = totalDonations;
    }
}

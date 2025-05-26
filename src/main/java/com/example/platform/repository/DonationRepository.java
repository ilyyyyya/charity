package com.example.platform.repository;

import com.example.platform.model.Donation;
import com.example.platform.model.Enum.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    Optional<Donation> findByPaymentId(String paymentId);
    List<Donation> findByFundId(Long fundId);
    List<Donation> findByDonorId(Long donorId);
    List<Donation> findByStatusAndCreatedAtBefore(DonationStatus status, LocalDateTime createdAt);

}

package com.example.platform.repository;

import com.example.platform.model.FundReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FundReportRepository extends JpaRepository<FundReport, Long> {
    List<FundReport> findByFundId(Long fundId);
    Optional<FundReport> findByFundIdAndId(Long fundId, Long reportId);
} 
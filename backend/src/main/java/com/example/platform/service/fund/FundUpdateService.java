package com.example.platform.service.fund;

import com.example.platform.model.Enum.FundStatus;
import com.example.platform.model.Fund;
import com.example.platform.repository.FundRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class FundUpdateService {

    private final FundRepository fundRepository;

    public FundUpdateService(FundRepository fundRepository) {
        this.fundRepository = fundRepository;
    }

    @Transactional
    public void updateFundAmount(Long fundId, BigDecimal amount) {
        Fund fund = fundRepository.findById(fundId)
                .orElseThrow(() -> new RuntimeException("Fund not found"));

        fund.setCurrentAmount(fund.getCurrentAmount().add(amount));
        if (fund.getCurrentAmount().compareTo(fund.getTargetAmount()) >= 0) {
            fund.setStatus(FundStatus.COMPLETED);
        }

        fundRepository.save(fund);
    }
}

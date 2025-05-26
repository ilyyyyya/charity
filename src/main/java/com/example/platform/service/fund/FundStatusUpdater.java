package com.example.platform.service.fund;

import com.example.platform.model.Enum.FundStatus;
import com.example.platform.repository.FundRepository;
import jakarta.transaction.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class FundStatusUpdater {

    private final FundRepository fundRepository;

    public FundStatusUpdater(FundRepository fundRepository) {
        this.fundRepository = fundRepository;
    }

    @Scheduled(cron = "* * */5 * * ?")
    @Transactional
    public void updateFundStatuses() {
        LocalDate today = LocalDate.now();

        fundRepository.findActiveFundsWithPastEndDate(today)
                .forEach(fund -> {
                    fund.setStatus(FundStatus.COMPLETED);
                    fundRepository.save(fund);
                });
    }
}

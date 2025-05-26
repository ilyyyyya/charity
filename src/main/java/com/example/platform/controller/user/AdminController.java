package com.example.platform.controller.user;

import com.example.platform.service.fund.FundStatusUpdater;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final FundStatusUpdater fundStatusUpdater;


    public AdminController(FundStatusUpdater fundStatusUpdater) {
        this.fundStatusUpdater = fundStatusUpdater;
    }

    @PostMapping("/fund-status-update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> forceUpdate() {
        fundStatusUpdater.updateFundStatuses();
        return ResponseEntity.ok("Status update triggered");
    }
}

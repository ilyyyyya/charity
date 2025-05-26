package com.example.platform.controller.fund;

import com.example.platform.dto.donate.DonationResponse;
import com.example.platform.dto.donate.DonationStatistics;
import com.example.platform.dto.fund.FundRequest;
import com.example.platform.dto.fund.FundResponse;
import com.example.platform.model.Fund;
import com.example.platform.service.donate.DonationService;
import com.example.platform.service.fund.FundService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;


@RestController
@RequestMapping("/api/funds")
public class FundController {

    private final FundService fundService;
    private final DonationService donationService;

    public FundController(FundService fundService, DonationService donationService) {
        this.fundService = fundService;
        this.donationService = donationService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @ResponseStatus(HttpStatus.CREATED)
    public FundResponse createFund(@Valid @RequestPart FundRequest fundRequest, @RequestParam MultipartFile imageFile) throws IOException {

        return fundService.createFund(fundRequest, imageFile);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImageById(@PathVariable Long id) {
        Fund fund = fundService.getFundById(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fund.getImageName() + "\"")
                .contentType(MediaType.parseMediaType(fund.getImageType()))
                .body(fund.getImageData());
    }

    @GetMapping("/{fundId}")
    public FundResponse getFund(@PathVariable Long fundId){
        return fundService.getOneFundById(fundId);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<FundResponse> getAllFunds() {
        return fundService.getAllFunds();
    }


    @GetMapping("/my-funds")
    @PreAuthorize("hasRole('OWNER')")
    public List<FundResponse> getMyOwnerFunds() {
        return fundService.getFundsByCurrentOwner();
    }



    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public FundResponse updateFund(
            @PathVariable Long id,
            @Valid @RequestPart FundRequest request,
            @RequestPart(required = false) MultipartFile imageFile
    ) throws IOException {
        return fundService.updateFund(id, request, imageFile);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFund(@PathVariable Long id) {
        fundService.deleteFund(id);
    }


    @GetMapping("/{fundId}/donations")
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<List<DonationResponse>> getFundDonations(@PathVariable Long fundId) {
        return ResponseEntity.ok(donationService.getFundDonations(fundId));
    }

//    @GetMapping("/{fundId}/statistics")
//    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
//    public ResponseEntity<DonationStatistics> getFundStatistics(@PathVariable Long fundId) {
//        return ResponseEntity.ok(donationService.getDonationStatistics(fundId));
//    }

}

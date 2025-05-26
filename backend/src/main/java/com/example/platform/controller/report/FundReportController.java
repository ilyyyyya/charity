package com.example.platform.controller.report;

import com.example.platform.dto.report.FundReportRequest;
import com.example.platform.dto.report.FundReportResponse;
import com.example.platform.dto.report.ReportPhotoResponse;
import com.example.platform.service.report.FundReportService;
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
@RequestMapping("/api/funds/{fundId}/reports")
public class FundReportController {

    private final FundReportService fundReportService;

    public FundReportController(FundReportService fundReportService) {
        this.fundReportService = fundReportService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('OWNER')")
    @ResponseStatus(HttpStatus.CREATED)
    public FundReportResponse createReport(
            @PathVariable Long fundId,
            @Valid @RequestPart FundReportRequest request,
            @RequestPart(required = false) List<MultipartFile> photos
    ) throws IOException {
        return fundReportService.createReport(fundId, request, photos);
    }

    @GetMapping
    public List<FundReportResponse> getFundReports(@PathVariable Long fundId) {
        return fundReportService.getFundReports(fundId);
    }

    @GetMapping("/{reportId}")
    public FundReportResponse getReport(
            @PathVariable Long fundId,
            @PathVariable Long reportId
    ) {
        return fundReportService.getReport(fundId, reportId);
    }

    @GetMapping("/{reportId}/photos")
    public List<ReportPhotoResponse> getReportPhotos(
            @PathVariable Long fundId,
            @PathVariable Long reportId
    ) {
        return fundReportService.getReportPhotos(fundId, reportId);
    }

    @GetMapping("/{reportId}/photos/{photoId}")
    public ResponseEntity<byte[]> getReportPhoto(
            @PathVariable Long fundId,
            @PathVariable Long reportId,
            @PathVariable Long photoId
    ) {
        var photo = fundReportService.getReportPhoto(fundId, reportId, photoId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + photo.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(photo.getFileType()))
                .body(photo.getData());
    }
} 
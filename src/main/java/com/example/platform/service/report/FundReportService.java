package com.example.platform.service.report;

import com.example.platform.dto.report.FundReportRequest;
import com.example.platform.dto.report.FundReportResponse;
import com.example.platform.dto.report.ReportPhotoResponse;
import com.example.platform.mapper.FundReportMapper;
import com.example.platform.model.Enum.FundStatus;
import com.example.platform.model.Fund;
import com.example.platform.model.FundReport;
import com.example.platform.model.ReportPhoto;
import com.example.platform.model.User;
import com.example.platform.repository.FundReportRepository;
import com.example.platform.repository.FundRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class FundReportService {

    private final FundReportRepository fundReportRepository;
    private final FundRepository fundRepository;
    private final FundReportMapper fundReportMapper;

    public FundReportService(FundReportRepository fundReportRepository,
                           FundRepository fundRepository,
                           FundReportMapper fundReportMapper) {
        this.fundReportRepository = fundReportRepository;
        this.fundRepository = fundRepository;
        this.fundReportMapper = fundReportMapper;
    }

    @Transactional
    public FundReportResponse createReport(Long fundId, FundReportRequest request, List<MultipartFile> photos) throws IOException {
        Fund fund = fundRepository.findById(fundId)
                .orElseThrow(() -> new RuntimeException("Fund not found"));

        if (fund.getStatus() != FundStatus.COMPLETED) {
            throw new RuntimeException("Cannot create report for non-completed fund");
        }

        User currentUser = getCurrentUser();
        if (!fund.getOwner().equals(currentUser)) {
            throw new RuntimeException("Only fund owner can create reports");
        }

        FundReport report = fundReportMapper.toEntity(request);
        report.setFund(fund);

        if (photos != null && !photos.isEmpty()) {
            List<ReportPhoto> reportPhotos = new ArrayList<>();
            for (MultipartFile photo : photos) {
                ReportPhoto reportPhoto = new ReportPhoto();
                reportPhoto.setFileName(photo.getOriginalFilename());
                reportPhoto.setFileType(photo.getContentType());
                reportPhoto.setData(photo.getBytes());
                reportPhoto.setReport(report);
                reportPhotos.add(reportPhoto);
            }
            report.setPhotos(reportPhotos);
        }

        return fundReportMapper.toResponse(fundReportRepository.save(report));
    }

    @Transactional
    public List<FundReportResponse> getFundReports(Long fundId) {
        return fundReportRepository.findByFundId(fundId).stream()
                .map(fundReportMapper::toResponse)
                .toList();
    }

    @Transactional
    public FundReportResponse getReport(Long fundId, Long reportId) {
        return fundReportRepository.findByFundIdAndId(fundId, reportId)
                .map(fundReportMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    @Transactional
    public List<ReportPhotoResponse> getReportPhotos(Long fundId, Long reportId) {
        FundReport report = fundReportRepository.findByFundIdAndId(fundId, reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        return report.getPhotos().stream()
                .map(fundReportMapper::toPhotoResponse)
                .toList();
    }

    @Transactional
    public ReportPhoto getReportPhoto(Long fundId, Long reportId, Long photoId) {
        FundReport report = fundReportRepository.findByFundIdAndId(fundId, reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        return report.getPhotos().stream()
                .filter(photo -> photo.getId().equals(photoId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Photo not found"));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new RuntimeException("User not authenticated");
        }
        return (User) authentication.getPrincipal();
    }
} 
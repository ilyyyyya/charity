package com.example.platform.service.fund;

import com.example.platform.dto.fund.FundRequest;
import com.example.platform.dto.fund.FundResponse;
import com.example.platform.mapper.FundMapper;
import com.example.platform.model.Fund;
import com.example.platform.model.Enum.FundStatus;
import com.example.platform.model.Enum.Role;
import com.example.platform.model.User;
import com.example.platform.repository.FundRepository;
import com.example.platform.repository.UserRepository;
import com.example.platform.service.donate.DonationService;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.context.annotation.Lazy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class FundService {

    private final FundRepository fundRepository;

    private final FundMapper fundMapper;

    private final UserRepository userRepository;

    private final DonationService donationService;

    private static final Logger logger = LoggerFactory.getLogger(FundService.class);

    public FundService(FundRepository fundRepository, FundMapper fundMapper, UserRepository userRepository, @Lazy DonationService donationService) {
        this.fundRepository = fundRepository;
        this.fundMapper = fundMapper;
        this.userRepository = userRepository;
        this.donationService = donationService;
    }

    @Transactional
    public FundResponse createFund(FundRequest fundRequest, MultipartFile imageFile) throws IOException {

        User currentUser = getCurrentUser();

        Fund fund = fundMapper.toEntity(fundRequest);
        fund.setOwner(currentUser);
        fund.setStartDate(LocalDate.now());
        fund.setStatus(FundStatus.ACTIVE);
        fund.setCurrentAmount(BigDecimal.ZERO);

        if (imageFile != null && !imageFile.isEmpty()) {
            fund.setImageName(imageFile.getOriginalFilename());
            fund.setImageType(imageFile.getContentType());
            fund.setImageData(imageFile.getBytes());
        }

        return fundMapper.toResponse(fundRepository.save(fund));
    }

    @Transactional
    public List<FundResponse> getAllFunds() {
        return fundRepository.findAll().stream()
                .map(fundMapper::toResponse)
                .toList();
    }

    @Transactional
    public FundResponse getOneFundById(Long id) {
        return fundRepository.findById(id)
                .map(fundMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Fund not found with id " + id));
    }

    @Transactional
    public FundResponse updateFund(Long fundId, FundRequest fundRequest, MultipartFile imageFile) throws IOException {
        Fund fund = fundRepository.findById(fundId)
                .orElseThrow(() -> new RuntimeException("Fund not found"));

        checkOwner(fund);

        if (imageFile != null && !imageFile.isEmpty()) {
            fund.setImageName(imageFile.getOriginalFilename());
            fund.setImageType(imageFile.getContentType());
            fund.setImageData(imageFile.getBytes());
        }

            fundMapper.updateFromDto(fundRequest, fund);
            return fundMapper.toResponse(fundRepository.save(fund));

    }

    @Transactional
    public List<FundResponse> getFundsByCurrentOwner() {
        User fundOwner = getCurrentUser();
        return fundRepository.findByOwnerId(fundOwner.getId())
                .stream()
                .map(fundMapper::toResponse)
                .toList();
    }

    @Transactional
    public void deleteFund(Long fundId) {
        Fund fund = fundRepository.findById(fundId)
                .orElseThrow(() -> new RuntimeException("Fund not found"));

        checkOwner(fund);
        fundRepository.delete(fund);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Getting current user from authentication: {}", authentication);
        
        if (authentication == null) {
            logger.error("No authentication found in SecurityContext");
            throw new RuntimeException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();
        logger.debug("Authentication principal: {}", principal);

        if (principal instanceof User) {
            User user = (User) principal;
            logger.debug("Retrieved user from authentication: id={}, username={}, role={}", 
                user.getId(), user.getUsername(), user.getRole());
            return user;
        } else {
            logger.error("Principal is not a User instance: {}", principal.getClass());
            throw new RuntimeException("Invalid authentication principal");
        }
    }

    private void checkOwner(Fund fund) {
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isOwner = fund.getOwner().equals(currentUser);

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You are not the owner of this fund");
        }
    }

    public Fund getFundById(Long id) {
        return fundRepository.findById(id).orElse(null);
    }


}

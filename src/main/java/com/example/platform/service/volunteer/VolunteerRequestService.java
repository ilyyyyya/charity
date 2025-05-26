package com.example.platform.service.volunteer;

import com.example.platform.dto.volunteer.VolunteerRequestDto;
import com.example.platform.dto.volunteer.VolunteerRequestResponse;
import com.example.platform.exceptcontroller.GlobalExceptionHandler;
import com.example.platform.mapper.VolunteerRequestMapper;
import com.example.platform.model.*;
import com.example.platform.model.Enum.Role;
import com.example.platform.model.Enum.VolunteerRequestStatus;
import com.example.platform.repository.FundRepository;
import com.example.platform.repository.UserRepository;
import com.example.platform.repository.VolunteerRequestRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VolunteerRequestService {
    private static final Logger logger = LoggerFactory.getLogger(VolunteerRequestService.class);

    private final VolunteerRequestRepository volunteerRequestRepository;
    private final FundRepository fundRepository;
    private final UserRepository userRepository;
    private final VolunteerRequestMapper volunteerRequestMapper;

    public VolunteerRequestService(VolunteerRequestRepository volunteerRequestRepository, FundRepository fundRepository, UserRepository userRepository, VolunteerRequestMapper volunteerRequestMapper) {
        this.volunteerRequestRepository = volunteerRequestRepository;
        this.fundRepository = fundRepository;
        this.userRepository = userRepository;
        this.volunteerRequestMapper = volunteerRequestMapper;
    }

    @Transactional
    public VolunteerRequestResponse createRequest(Long fundId, VolunteerRequestDto requestDto) {
        User currentUser = getAuthenticatedUser();
        validateVolunteerRole(currentUser);

        Fund fund = fundRepository.findById(fundId)
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Fund not found with id: " + fundId));

        checkDuplicateRequest(currentUser, fundId);

        VolunteerRequest request = volunteerRequestMapper.toEntity(requestDto);
        request.setVolunteer(currentUser);
        request.setFund(fund);
        request.setStatus(VolunteerRequestStatus.PENDING);

        return volunteerRequestMapper.toResponse(
                volunteerRequestRepository.save(request)
        );
    }

    @Transactional
    public VolunteerRequestResponse updateRequestStatus(Long requestId, VolunteerRequestStatus status) {

        System.out.println("проверка" + status);

        VolunteerRequest request = volunteerRequestRepository.findById(requestId)
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Request not found with id: " + requestId));

        System.out.println("проверка" + status);

        validateFundOwnershipOrAdmin(getAuthenticatedUser(), request.getFund());

        request.setStatus(status);

        return volunteerRequestMapper.toResponse(
                volunteerRequestRepository.save(request)
        );
    }

    @Transactional
    public List<VolunteerRequestResponse> getRequestsByFund(Long fundId) {
        Fund fund = fundRepository.findById(fundId)
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Fund not found with id: " + fundId));

        validateFundOwnershipOrAdmin(getAuthenticatedUser(), fund);

        return volunteerRequestRepository.findByFundId(fundId)
                .stream()
                .map(volunteerRequestMapper::toResponse)
                .toList();
    }

    @Transactional
    public VolunteerRequestResponse getRequestById(Long requestId) {
        VolunteerRequest request = volunteerRequestRepository.findById(requestId)
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Request not found with id: " + requestId));

        validateRequestAccess(getAuthenticatedUser(), request);

        return volunteerRequestMapper.toResponse(request);
    }

    @Transactional
    public List<VolunteerRequestResponse> getRequestsByCurrentUser() {
        User user = getAuthenticatedUser();
        return volunteerRequestRepository.findByVolunteerId(user.getId())
                .stream()
                .map(volunteerRequestMapper::toResponse)
                .toList();
    }


    @Transactional
    public void deleteRequest(Long requestId) {
        VolunteerRequest request = volunteerRequestRepository.findById(requestId)
                .orElseThrow(() -> new GlobalExceptionHandler.ResourceNotFoundException("Request not found with id: " + requestId));

        validateFundOwnershipOrAdmin(getAuthenticatedUser(), request.getFund());

        volunteerRequestRepository.delete(request);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Getting current user from authentication: {}", authentication);
        
        if (authentication == null) {
            logger.error("No authentication found in SecurityContext");
            throw new AuthenticationException("User not authenticated") {};
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
            throw new AuthenticationException("Invalid authentication principal") {};
        }
    }

    private void validateVolunteerRole(User user) {
        if (user.getRole() != Role.VOLUNTEER) {
            throw new AccessDeniedException("Only volunteers can perform this action");
        }
    }

    private void validateFundOwnershipOrAdmin(User user, Fund fund) {
        if (user.getRole() != Role.ADMIN && !fund.getOwner().equals(user)) {
            throw new AccessDeniedException("No permission to modify this resource");
        }
    }

    private void validateRequestAccess(User user, VolunteerRequest request) {
        if (user.getRole() != Role.ADMIN
                && !request.getVolunteer().equals(user)
                && !request.getFund().getOwner().equals(user)) {
            throw new AccessDeniedException("Access to this request is denied");
        }
    }

    private void checkDuplicateRequest(User volunteer, Long fundId) {
        volunteerRequestRepository.findByVolunteerAndFundId(volunteer, fundId)
                .ifPresent(request -> {
         throw new GlobalExceptionHandler.ConflictException("Request already exists for this fund");
     });
    }

}

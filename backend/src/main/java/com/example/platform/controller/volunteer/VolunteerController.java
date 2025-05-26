package com.example.platform.controller.volunteer;

import com.example.platform.dto.StatusUpdateDto;
import com.example.platform.dto.volunteer.VolunteerRequestDto;
import com.example.platform.dto.volunteer.VolunteerRequestResponse;
import com.example.platform.service.volunteer.VolunteerRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
public class VolunteerController {

    private final VolunteerRequestService volunteerRequestService;


    public VolunteerController(VolunteerRequestService volunteerRequestService) {
        this.volunteerRequestService = volunteerRequestService;
    }

    @PostMapping("/create/{fundId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('VOLUNTEER')")
    public VolunteerRequestResponse applyToFund(
            @PathVariable Long fundId,
            @Valid @RequestBody VolunteerRequestDto requestDto) {
        return volunteerRequestService.createRequest(fundId, requestDto);
    }


    @PatchMapping("/{requestId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public VolunteerRequestResponse updateStatus(@PathVariable Long requestId, @RequestBody StatusUpdateDto status) {
        return volunteerRequestService.updateRequestStatus(requestId, status.getStatus());
    }

    @GetMapping("/fund/{fundId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public List<VolunteerRequestResponse> getByFund(
            @PathVariable Long fundId) {
        return volunteerRequestService.getRequestsByFund(fundId);
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public VolunteerRequestResponse getRequestById(@PathVariable Long requestId) {
        return volunteerRequestService.getRequestById(requestId);
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public List<VolunteerRequestResponse> getUserRequests() {
        return volunteerRequestService.getRequestsByCurrentUser();
    }


    @DeleteMapping("/{requestId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public void deleteApplication(
            @PathVariable Long requestId) {
        volunteerRequestService.deleteRequest(requestId);
    }


}

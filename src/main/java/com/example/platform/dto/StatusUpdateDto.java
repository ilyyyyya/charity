package com.example.platform.dto;

import com.example.platform.model.Enum.VolunteerRequestStatus;

public class StatusUpdateDto {

    private VolunteerRequestStatus status;

    public VolunteerRequestStatus getStatus() {
        return status;
    }

    public void setStatus(VolunteerRequestStatus status) {
        this.status = status;
    }
}

package com.example.platform.dto;

import com.example.platform.dto.fund.FundResponse;

import java.util.List;

public class OrganizerProfileResponse {
    private Long id;
    private String username;
    private String displayName;
    private List<FundResponse> funds;


    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public List<FundResponse> getFunds() {
        return funds;
    }

    public void setFunds(List<FundResponse> funds) {
        this.funds = funds;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}

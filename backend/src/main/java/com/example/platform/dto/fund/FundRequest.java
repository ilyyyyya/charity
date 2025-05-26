package com.example.platform.dto.fund;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;


import java.math.BigDecimal;
import java.time.LocalDate;


public class FundRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @Size(max = 1000, message = "Description too long")
    private String description;

    @Positive(message = "Target amount must be positive")
    private BigDecimal targetAmount;

    @FutureOrPresent(message = "End date must be in future")
    private LocalDate endDate;

    private String category;

    private String imageName;
    private String imageType;
    private byte[] imageData;



    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public @Size(max = 1000, message = "Description too long") String getDescription() {
        return description;
    }

    public void setDescription(@Size(max = 1000, message = "Description too long") String description) {
        this.description = description;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(@Positive(message = "Target amount must be positive") BigDecimal targetAmount) {
        this.targetAmount = targetAmount;
    }

    public @NotBlank(message = "Title is required") String getTitle() {
        return title;
    }

    public void setTitle(@NotBlank(message = "Title is required") String title) {
        this.title = title;
    }


    public @FutureOrPresent(message = "End date must be in future") LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(@FutureOrPresent(message = "End date must be in future") LocalDate endDate) {
        this.endDate = endDate;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }
}

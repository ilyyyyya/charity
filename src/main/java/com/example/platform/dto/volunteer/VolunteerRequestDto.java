package com.example.platform.dto.volunteer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;



public class VolunteerRequestDto {

    @NotBlank(message = "Email is required")
    @Email
    private String email;

    @NotBlank(message = "Telegram username is required")
    @Pattern(regexp = "^@[A-Za-z0-9_]{5,32}$", message = "Invalid Telegram format")
    private String telegram;

    @NotBlank(message = "City is required")
    private String city;

    @Size(max = 500)
    private String message;


    public @NotBlank(message = "City is required") String getCity() {
        return city;
    }

    public void setCity(@NotBlank(message = "City is required") String city) {
        this.city = city;
    }

    public @NotBlank(message = "Email is required") @Email String getEmail() {
        return email;
    }

    public void setEmail(@NotBlank(message = "Email is required") @Email String email) {
        this.email = email;
    }

    public @Size(max = 500) String getMessage() {
        return message;
    }

    public void setMessage(@Size(max = 500) String message) {
        this.message = message;
    }

    public @NotBlank(message = "Telegram username is required") String getTelegram() {
        return telegram;
    }

    public void setTelegram(@NotBlank(message = "Telegram username is required") String telegram) {
        this.telegram = telegram;
    }
}

package com.example.platform.config;


import org.springframework.boot.context.properties.ConfigurationProperties;

import org.springframework.boot.context.properties.bind.ConstructorBinding;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;


@Component
//@Configuration
@ConfigurationProperties(prefix = "yookassa")
public class YooKassaConfig {

    private String shopId;
    private String secretKey;
    private boolean testMode = true;


    public YooKassaConfig() {
    }

    public void validate() {
        if (shopId == null || shopId.isBlank()) {
            throw new IllegalStateException("YooKassa shopId is not configured");
        }
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("YooKassa secretKey is not configured");
        }
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getShopId() {
        return shopId;
    }

    public boolean isTestMode() {
        return testMode;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public void setShopId(String shopId) {
        this.shopId = shopId;
    }

    public void setTestMode(boolean testMode) {
        this.testMode = testMode;
    }
}

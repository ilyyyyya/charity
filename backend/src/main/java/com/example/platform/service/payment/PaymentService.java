package com.example.platform.service.payment;

import com.example.platform.config.YooKassaConfig;
import com.example.platform.dto.payment.PaymentRequest;
import com.example.platform.dto.payment.PaymentResponse;
import com.example.platform.exception.PaymentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    private final YooKassaConfig config;
    private final RestTemplate restTemplate;

    public PaymentService(YooKassaConfig config, RestTemplate restTemplate) {
        this.config = config;
        this.restTemplate = restTemplate;
    }

    private static final String YOOKASSA_API_URL = "https://api.yookassa.ru/v3";


    private HttpHeaders createHeaders() {
        String auth = config.getShopId() + ":" + config.getSecretKey();
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Basic " + encodedAuth);
        headers.set("Idempotence-Key", UUID.randomUUID().toString());

        return headers;
    }

    public PaymentResponse createPayment(PaymentRequest request) {
        String url = YOOKASSA_API_URL + "/payments";
        logger.info("Creating payment for amount: {} RUB", request.getAmount());

        Map<String, Object> paymentData = new HashMap<>();
        paymentData.put("amount", Map.of(
                "value", request.getAmount().toString(),
                "currency", "RUB"
        ));
        paymentData.put("confirmation", Map.of(
                "type", "redirect",
                "return_url", request.getReturnUrl()
        ));
        paymentData.put("description", request.getDescription());
        paymentData.put("metadata", request.getMetadata());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(paymentData, createHeaders());
        logger.debug("Payment request data: {}", paymentData);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            logger.info("Payment created successfully with ID: {}", response.getBody().get("id"));
            return mapToPaymentResponse(response.getBody());
        } catch (Exception e) {
            logger.error("Failed to create payment: {}", e.getMessage(), e);
            throw new PaymentException("Failed to create payment: " + e.getMessage(), e);
        }
    }

    public PaymentResponse getPaymentStatus(String paymentId) {
        String url = YOOKASSA_API_URL + "/payments/" + paymentId;
        HttpEntity<?> entity = new HttpEntity<>(createHeaders());

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            return mapToPaymentResponse(response.getBody());
        } catch (Exception e) {
            throw new PaymentException("Failed to get payment status", e);
        }
    }

    public PaymentResponse capturePayment(String paymentId) {
        String url = YOOKASSA_API_URL + "/payments/" + paymentId + "/capture";
        HttpEntity<?> entity = new HttpEntity<>(createHeaders());

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return mapToPaymentResponse(response.getBody());
        } catch (Exception e) {
            throw new PaymentException("Failed to capture payment", e);
        }
    }

    public PaymentResponse cancelPayment(String paymentId) {
        String url = YOOKASSA_API_URL + "/payments/" + paymentId + "/cancel";
        HttpEntity<?> entity = new HttpEntity<>(createHeaders());

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return mapToPaymentResponse(response.getBody());
        } catch (Exception e) {
            throw new PaymentException("Failed to cancel payment", e);
        }
    }

    private PaymentResponse mapToPaymentResponse(Map<String, Object> responseBody) {
        logger.debug("Mapping payment response: {}", responseBody);
        
        Map<String, Object> amountMap = (Map<String, Object>) responseBody.get("amount");
        String amountValue = amountMap.get("value").toString();
        String currency = (String) amountMap.get("currency");
        
        Map<String, Object> confirmation = (Map<String, Object>) responseBody.get("confirmation");
        String confirmationUrl = confirmation != null ? (String) confirmation.get("confirmation_url") : null;
        
        String createdAtStr = (String) responseBody.get("created_at");
        LocalDateTime createdAt = Instant.parse(createdAtStr)
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        
        String paymentId = (String) responseBody.get("id");
        logger.debug("Extracted payment ID: {}", paymentId);
        
        PaymentResponse response = new PaymentResponse(
                paymentId,
                confirmationUrl,
                (String) responseBody.get("status"),
                new BigDecimal(amountValue),
                currency,
                createdAt
        );
        
        logger.debug("Created PaymentResponse: paymentId={}, status={}, amount={}, currency={}", 
                response.getPaymentId(), response.getStatus(), response.getAmount(), response.getCurrency());
        
        return response;
    }
}

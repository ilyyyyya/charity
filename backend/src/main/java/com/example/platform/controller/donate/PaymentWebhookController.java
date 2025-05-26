package com.example.platform.controller.donate;

import com.example.platform.dto.payment.PaymentNotification;
import com.example.platform.service.donate.DonationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Enumeration;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Arrays;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentWebhookController {
    private static final Logger logger = LoggerFactory.getLogger(PaymentWebhookController.class);
    private final DonationService donationService;
    private final ObjectMapper objectMapper;
    
    @Value("${yookassa.secret-key}")
    private String secretKey;

    @Value("${yookassa.test-mode:true}")
    private boolean testMode;

    // Список разрешенных IP-адресов ЮKassa
    private static final String[] ALLOWED_IP_RANGES = {
        "185.71.76.0/27",
        "185.71.77.0/27",
        "77.75.153.0/25",
        "77.75.156.11/32",
        "77.75.156.35/32",
        "77.75.154.128/25",
        "2a02:5180::/32"
    };

    public PaymentWebhookController(DonationService donationService, ObjectMapper objectMapper) {
        this.donationService = donationService;
        this.objectMapper = objectMapper;
    }

    private boolean isIpAllowed(String ip) {
        // В тестовом режиме пропускаем все IP-адреса
        if (testMode) {
            logger.info("Test mode is enabled, allowing all IPs");
            return true;
        }

        // Проверяем, что IP не null
        if (ip == null) {
            logger.error("IP address is null");
            return false;
        }

        // Удаляем порт, если он есть
        ip = ip.split(":")[0];
        
        // Проверяем каждый разрешенный диапазон
        for (String range : ALLOWED_IP_RANGES) {
            if (isIpInRange(ip, range)) {
                logger.info("IP {} is in allowed range {}", ip, range);
                return true;
            }
        }

        logger.error("IP {} is not in allowed ranges", ip);
        return false;
    }

    private boolean isIpInRange(String ip, String range) {
        try {
            if (range.contains("/")) {
                // Обработка CIDR нотации
                String[] parts = range.split("/");
                String network = parts[0];
                int prefix = Integer.parseInt(parts[1]);

                if (ip.contains(":")) {
                    // IPv6
                    return isIpv6InRange(ip, network, prefix);
                } else {
                    // IPv4
                    return isIpv4InRange(ip, network, prefix);
                }
            } else {
                // Точное совпадение
                return ip.equals(range);
            }
        } catch (Exception e) {
            logger.error("Error checking IP range: {}", e.getMessage());
            return false;
        }
    }

    private boolean isIpv4InRange(String ip, String network, int prefix) {
        try {
            long ipLong = ipToLong(ip);
            long networkLong = ipToLong(network);
            long mask = -1L << (32 - prefix);
            return (ipLong & mask) == (networkLong & mask);
        } catch (Exception e) {
            logger.error("Error checking IPv4 range: {}", e.getMessage());
            return false;
        }
    }

    private boolean isIpv6InRange(String ip, String network, int prefix) {
        // Для простоты в данном случае просто проверяем точное совпадение
        // В реальном приложении здесь должна быть полная реализация проверки IPv6
        return ip.equals(network);
    }

    private long ipToLong(String ip) {
        String[] octets = ip.split("\\.");
        long result = 0;
        for (String octet : octets) {
            result = (result << 8) | Integer.parseInt(octet);
        }
        return result;
    }

    private boolean verifySignature(String signature, String body) {
        try {
            logger.info("Verifying signature header: [{}]", signature);
            logger.info("Secret key (first 10 chars): [{}...]", secretKey.substring(0, 10));
            
            // Разбираем подпись на части
            String[] parts = signature.split("\\s+");
            if (parts.length != 4 || !"v1".equals(parts[0])) {
                logger.error("Invalid signature format, parts: {}", Arrays.toString(parts));
                return false;
            }

            String paymentId = parts[1];
            String timestamp = parts[2];
            String signatureValue = parts[3];

            logger.info("Parsed signature - paymentId={}, timestamp={}, signature={}",
                    paymentId, timestamp, signatureValue);

            // Нормализуем тело запроса
            JsonNode bodyNode = objectMapper.readTree(body);
            String normalizedBody;
            
            if (bodyNode.isArray()) {
                // Если тело пришло как массив, берем первый элемент
                JsonNode firstNode = bodyNode.get(0);
                normalizedBody = objectMapper.writeValueAsString(firstNode);
            } else {
                normalizedBody = objectMapper.writeValueAsString(bodyNode);
            }
            
            logger.info("Normalized body: [{}]", normalizedBody);

            // Формируем строку для подписи
            String stringToSign = paymentId + "." + timestamp + "." + normalizedBody;
            logger.info("String to sign: [{}]", stringToSign);

            // Вычисляем HMAC-SHA256
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(stringToSign.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = Base64.getEncoder().encodeToString(hmacBytes);

            logger.info("Calculated signature: [{}]", calculatedSignature);
            logger.info("Original signature: [{}]", signatureValue);
            logger.info("Signatures match: {}", calculatedSignature.equals(signatureValue));

            return calculatedSignature.equals(signatureValue);
        } catch (Exception e) {
            logger.error("Error verifying signature: {}", e.getMessage(), e);
            return false;
        }
    }

    @PostMapping("/notifications")
    public ResponseEntity<Void> handlePaymentNotification(
            HttpServletRequest request,
            @RequestBody(required = false) String rawNotification) {
        
        logger.info("Received webhook request");
        logger.info("Test mode: {}", testMode);
        
        // Получаем реальный IP-адрес
        String ip = request.getHeader("x-real-ip");
        if (ip == null) {
            ip = request.getRemoteAddr();
        }
        
        logger.info("Request from IP: {}", ip);
        
        // Проверяем IP-адрес
        if (!isIpAllowed(ip)) {
            logger.error("Request from unauthorized IP: {}", ip);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Логируем все заголовки для отладки
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            logger.info("Header {}: {}", headerName, request.getHeader(headerName));
        }

        if (rawNotification == null) {
            logger.error("Received null notification body");
            return ResponseEntity.badRequest().build();
        }

        try {
            // Парсим JSON
            JsonNode bodyNode = objectMapper.readTree(rawNotification);
            JsonNode notificationNode = bodyNode.isArray() ? bodyNode.get(0) : bodyNode;
            
            // Логируем полученное уведомление
            logger.info("Received notification: {}", notificationNode.toPrettyString());
            
            // Преобразуем в объект
            PaymentNotification notification = objectMapper.treeToValue(notificationNode, PaymentNotification.class);
            
            // Проверяем тип уведомления
            if (!"notification".equals(notification.getType())) {
                logger.error("Invalid notification type: {}", notification.getType());
                return ResponseEntity.badRequest().build();
            }
            
            logger.info("Parsed notification: type={}, event={}, paymentId={}, status={}, amount={}", 
                notification.getType(),
                notification.getEvent(), 
                notification.getPaymentId(),
                notification.getStatus(),
                notification.getAmount());
            
            // Обрабатываем уведомление
            donationService.handlePaymentNotification(notification);
            logger.info("Successfully processed payment notification for paymentId: {}", notification.getPaymentId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error processing payment notification: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

package com.example.platform.dto.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.math.BigDecimal;

public class PaymentNotification {
    private String type;
    private String event;
    private JsonNode object;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getEvent() {
        return event;
    }

    public void setEvent(String event) {
        this.event = event;
    }

    public JsonNode getObject() {
        return object;
    }

    public void setObject(JsonNode object) {
        this.object = object;
    }

    // Сеттеры для совместимости с существующим кодом
    public void setPaymentId(String paymentId) {
        if (object == null) {
            object = objectMapper.createObjectNode();
        }
        ((ObjectNode) object).put("id", paymentId);
    }

    public void setStatus(String status) {
        if (object == null) {
            object = objectMapper.createObjectNode();
        }
        ((ObjectNode) object).put("status", status);
    }

    public void setAmount(BigDecimal amount) {
        if (object == null) {
            object = objectMapper.createObjectNode();
        }
        ObjectNode amountNode = objectMapper.createObjectNode();
        amountNode.put("value", amount.toString());
        amountNode.put("currency", "RUB");
        ((ObjectNode) object).set("amount", amountNode);
    }

    public void setCurrency(String currency) {
        if (object == null) {
            object = objectMapper.createObjectNode();
        }
        if (!object.has("amount")) {
            ObjectNode amountNode = objectMapper.createObjectNode();
            amountNode.put("value", "0");
            ((ObjectNode) object).set("amount", amountNode);
        }
        ((ObjectNode) object.get("amount")).put("currency", currency);
    }

    // Геттеры для совместимости с существующим кодом
    public String getPaymentId() {
        return object != null ? object.get("id").asText() : null;
    }

    public String getStatus() {
        return object != null ? object.get("status").asText() : null;
    }

    public BigDecimal getAmount() {
        if (object != null && object.has("amount")) {
            JsonNode amountNode = object.get("amount");
            if (amountNode.has("value")) {
                return new BigDecimal(amountNode.get("value").asText());
            }
        }
        return null;
    }

    public String getCurrency() {
        if (object != null && object.has("amount")) {
            JsonNode amountNode = object.get("amount");
            if (amountNode.has("currency")) {
                return amountNode.get("currency").asText();
            }
        }
        return null;
    }
}

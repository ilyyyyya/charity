package com.example.platform.service.user;

import com.example.platform.model.User;
import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private String secretKey = null;

    final int HOUR_IN_MS = 60 * 60 * 1000;

    public String generateToken(User user) {

        Map<String , Object> claims = new HashMap<>();
        claims.put("role",user.getRole());
        claims.put("displayName", user.getDisplayName());

        return Jwts
                .builder()
                .claims().add(claims)
                .subject(user.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + HOUR_IN_MS))
                .and()
                .signWith(generateKey())
                .compact();
    }

    public SecretKey generateKey() {

        byte[] decode = Decoders.BASE64.decode(getSecretKey());

        return Keys.hmacShaKeyFor(decode);

    }

    public String getSecretKey() {
        Dotenv dotenv = Dotenv.load();
        return dotenv.get("JWT_SECRET_KEY");
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractDisplayName(String token) {
        return extractClaim(token, claims -> claims.get("displayName", String.class));
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        Claims claims = extractClaim(token);
        return claimResolver.apply(claims);

    }

    private Claims extractClaim(String token) {
        return Jwts
                .parser()
                .verifyWith(generateKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String userName = extractUsername(token);

        return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}

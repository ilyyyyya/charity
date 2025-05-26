package com.example.platform.config;

import com.example.platform.CustomUserDetails;
import com.example.platform.model.User;
import com.example.platform.service.user.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter
{
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;

    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        logger.debug("Processing request: {}", request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");
        logger.debug("Auth header: {}", authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer")) {
            logger.debug("No valid auth header found, continuing chain");
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt  = authHeader.substring(7);
        final String username = jwtService.extractUsername(jwt);
        final String displayName = jwtService.extractDisplayName(jwt);
        logger.debug("Extracted username: {}, displayName: {}", username, displayName);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.debug("Current authentication: {}", authentication);

        if(username != null && authentication == null) {
            logger.debug("Attempting to authenticate user: {}", username);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            logger.debug("Loaded user details: {}", userDetails);

            if(jwtService.isTokenValid(jwt, userDetails)) {
                logger.debug("Token is valid for user: {}", username);
                request.setAttribute("displayName", displayName);
                // Get the actual User object from CustomUserDetails
                User user = ((CustomUserDetails) userDetails).getUser();
                logger.debug("Retrieved User object: id={}, username={}, role={}", 
                    user.getId(), user.getUsername(), user.getRole());
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                        user, null, userDetails.getAuthorities()
                );
                authenticationToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                logger.debug("Authentication token set in SecurityContext");
            } else {
                logger.debug("Token validation failed for user: {}", username);
            }
        }

        filterChain.doFilter(request, response);
    }
}

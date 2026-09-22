package com.example.auth_service.security;
import com.example.auth_service.entity.Role;
import com.example.auth_service.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Date;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Get Authorization header
        final String authHeader = request.getHeader("Authorization");

        // 2. Check whether Bearer token exists
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Remove "Bearer " from the token
        final String jwt = authHeader.substring(7);

        try {
            // 4. Extract email from JWT
            String userEmail = jwtService.extractUsername(jwt);

            // 5. Continue only if user is not already authenticated
            if (userEmail != null
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 6. Check token expiration
                Date expiration = jwtService.extractExpiration(jwt);

                if (expiration.before(new Date())) {
                    log.warn("JWT token has expired");
                    filterChain.doFilter(request, response);
                    return;
                }

                // 7. Extract role from JWT
                Role role = jwtService.extractRole(jwt);

                // 8. Convert role into Spring Security authority
                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority(role.name());

                // 9. Create authenticated user
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userEmail,
                                null,
                                Collections.singletonList(authority)
                        );

                // 10. Add request details
                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                // 11. Store authentication in SecurityContext
                SecurityContextHolder.getContext()
                        .setAuthentication(authToken);

                log.debug(
                        "Authenticated user: {} with role: {}",
                        userEmail,
                        role
                );
            }

        } catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
        }

        // 12. Continue request
        filterChain.doFilter(request, response);
    }
}

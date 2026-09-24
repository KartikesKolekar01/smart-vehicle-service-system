package com.example.api_gateway.filter;

import com.example.api_gateway.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;
       private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/forgot-password",   // ✅ NEW
            "/api/auth/reset-password",    // ✅ NEW
            "/api/notifications/internal",
            "/actuator"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        log.debug("Gateway filter: {} {}", request.getMethod(), path);

        // 0. ⚠️ ALWAYS allow CORS preflight (OPTIONS)
        if (request.getMethod() == HttpMethod.OPTIONS) {
            log.debug("OPTIONS preflight — allowing: {}", path);
            return chain.filter(exchange);
        }
        // 0. ⚠️ ALWAYS allow CORS preflight (OPTIONS)
        if (request.getMethod().matches("OPTIONS")) {
            return chain.filter(exchange);
        }
        // 1. Public endpoints
        boolean isPublic = PUBLIC_ENDPOINTS.stream().anyMatch(path::contains);
        if (isPublic) {
            log.debug("Public endpoint, allowing: {}", path);
            return chain.filter(exchange);
        }

        // 2. Authorization header
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            log.warn("Missing Authorization header for: {}", path);
            return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        // 3. Token validate
        if (!jwtUtil.validateToken(token)) {
            log.warn("Invalid/expired JWT for: {}", path);
            return onError(exchange, "Invalid or Expired Token", HttpStatus.UNAUTHORIZED);
        }

        // 4. Extract user info
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);

        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Email", email)
                .header("X-User-Role", role)
                .build();

        log.info("Authenticated {} with role {} → {} {}", email, role, request.getMethod(), path);

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        String body = "{\"status\":\"error\",\"message\":\"" + message + "\"}";
        return response.writeWith(
                Mono.just(response.bufferFactory().wrap(body.getBytes()))
        );
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
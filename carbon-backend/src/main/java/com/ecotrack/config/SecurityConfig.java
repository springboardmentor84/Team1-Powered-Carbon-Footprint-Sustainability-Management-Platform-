package com.ecotrack.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ecotrack.jwt.JwtFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // ==========================================
            // CSRF
            // ==========================================
            .csrf(csrf -> csrf.disable())

            // ==========================================
            // CORS
            // ==========================================
            .cors(cors -> cors.configurationSource(
                    corsConfigurationSource()
            ))

            // ==========================================
            // STATELESS JWT
            // ==========================================
            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            // ==========================================
            // AUTHORIZATION
            // ==========================================
            .authorizeHttpRequests(auth -> auth

                    // CORS preflight
                    .requestMatchers(
                            HttpMethod.OPTIONS,
                            "/**"
                    ).permitAll()

                    // ==================================
                    // PUBLIC AUTH APIs
                    // ==================================
                    .requestMatchers("/register")
                    .permitAll()

                    .requestMatchers("/login")
                    .permitAll()

                    // ==================================
                    // ADMIN APIs
                    // Only users with ADMIN authority
                    // ==================================
                    .requestMatchers("/admin/**")
                    .hasAuthority("ADMIN")

                    .requestMatchers("/admin")
                    .hasAuthority("ADMIN")

                    // ==================================
                    // CARBON APIs
                    // Any authenticated user
                    // ==================================
                    .requestMatchers("/carbon/**")
                    .authenticated()

                    // ==================================
                    // GOAL APIs
                    // Any authenticated user
                    // ==================================
                    .requestMatchers("/goals/**")
                    .authenticated()

                    // ==================================
                    // GAMIFICATION APIs
                    // Any authenticated user
                    // ==================================
                    .requestMatchers("/gamification/**")
                    .authenticated()

                    // ==================================
                    // CHALLENGE APIs
                    // Admin manages challenges.
                    // Users may list/join/leave/complete.
                    // ==================================
                    .requestMatchers(HttpMethod.POST, "/challenges/*/join")
                    .authenticated()

                    .requestMatchers(HttpMethod.POST, "/challenges/*/leave")
                    .authenticated()

                    .requestMatchers(HttpMethod.POST, "/challenges/*/complete")
                    .authenticated()

                    .requestMatchers(HttpMethod.GET, "/challenges", "/challenges/**")
                    .authenticated()

                    .requestMatchers(HttpMethod.POST, "/challenges")
                    .hasAuthority("ADMIN")

                    .requestMatchers(HttpMethod.PUT, "/challenges/**")
                    .hasAuthority("ADMIN")

                    .requestMatchers(HttpMethod.DELETE, "/challenges/**")
                    .hasAuthority("ADMIN")

                    // ==================================
                    // NOTIFICATION APIs
                    // Any authenticated user
                    // ==================================
                    .requestMatchers("/notifications/**")
                    .authenticated()

                    // ==================================
                    // LEADERBOARD API
                    // Any authenticated user
                    // ==================================
                    .requestMatchers("/leaderboard")
                    .authenticated()

                    // ==================================
                    // EVERYTHING ELSE
                    // ==================================
                    .anyRequest()
                    .authenticated()
            )

            // ==========================================
            // JWT FILTER
            // ==========================================
            .addFilterBefore(
                    jwtFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }


    // ==============================================
    // CORS CONFIGURATION
    // ==============================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:4200"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    // ==============================================
    // PASSWORD ENCODER
    // ==============================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }
}

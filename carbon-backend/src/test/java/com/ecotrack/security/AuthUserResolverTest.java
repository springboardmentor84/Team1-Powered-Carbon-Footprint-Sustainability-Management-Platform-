package com.ecotrack.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import com.ecotrack.entity.User;
import com.ecotrack.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class AuthUserResolverTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthUserResolver authUserResolver;

    @Test
    public void testRequireUserSuccess() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("test@example.com");

        User user = new User();
        user.setEmail("test@example.com");
        user.setIsActive(true);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        User result = authUserResolver.requireUser(authentication);
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    public void testRequireUserMissingAuthentication() {
        assertThrows(ResponseStatusException.class, () -> authUserResolver.requireUser(null));
        
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(null);
        assertThrows(ResponseStatusException.class, () -> authUserResolver.requireUser(authentication));
    }

    @Test
    public void testRequireUserNotFound() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("notfound@example.com");

        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> authUserResolver.requireUser(authentication));
    }

    @Test
    public void testRequireUserInactive() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("inactive@example.com");

        User user = new User();
        user.setEmail("inactive@example.com");
        user.setIsActive(false);

        when(userRepository.findByEmail("inactive@example.com")).thenReturn(Optional.of(user));

        assertThrows(ResponseStatusException.class, () -> authUserResolver.requireUser(authentication));
    }
}

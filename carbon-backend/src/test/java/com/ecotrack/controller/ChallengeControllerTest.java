package com.ecotrack.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.ecotrack.entity.ChallengeParticipantEntity;
import com.ecotrack.entity.User;
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.ChallengeService;

@ExtendWith(MockitoExtension.class)
public class ChallengeControllerTest {

    @Mock
    private ChallengeService challengeService;

    @Mock
    private AuthUserResolver authUserResolver;

    @InjectMocks
    private ChallengeController challengeController;

    private User mockUser;
    private Authentication authentication;

    @BeforeEach
    public void setup() {
        mockUser = new User();
        mockUser.setUserId(1L);
        authentication = mock(Authentication.class);
        when(authUserResolver.requireUser(any(Authentication.class))).thenReturn(mockUser);
    }

    @Test
    public void testJoinChallenge() {
        ChallengeParticipantEntity response = new ChallengeParticipantEntity();
        response.setStatus(ChallengeParticipantEntity.Status.JOINED);

        when(challengeService.joinChallenge(eq(1L), eq(mockUser))).thenReturn(response);

        ResponseEntity<ChallengeParticipantEntity> actual = challengeController.joinChallenge(1L, authentication);
        assertEquals(ChallengeParticipantEntity.Status.JOINED, actual.getBody().getStatus());
    }

    @Test
    public void testCheckJoinedStatus() {
        when(challengeService.isJoined(eq(1L), eq(mockUser))).thenReturn(true);

        ResponseEntity<Boolean> actual = challengeController.isJoined(1L, authentication);
        assertEquals(true, actual.getBody());
    }
}

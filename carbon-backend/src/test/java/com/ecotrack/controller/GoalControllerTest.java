package com.ecotrack.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import com.ecotrack.entity.GoalEntity;
import com.ecotrack.entity.User;
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.GoalService;

@ExtendWith(MockitoExtension.class)
public class GoalControllerTest {

    @Mock
    private GoalService goalService;

    @Mock
    private AuthUserResolver authUserResolver;

    @InjectMocks
    private GoalController goalController;

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
    public void testCreateGoal() {
        GoalEntity request = new GoalEntity();
        request.setGoalName("Reduce Carbon Footprint");

        when(goalService.createGoal(any(GoalEntity.class), eq(mockUser))).thenReturn(request);

        GoalEntity actual = goalController.createGoal(request, authentication);
        assertEquals("Reduce Carbon Footprint", actual.getGoalName());
    }

    @Test
    public void testGetOwnGoals() {
        GoalEntity goal = new GoalEntity();
        goal.setGoalName("My Goal");

        when(goalService.getUserGoals(eq(mockUser))).thenReturn(Collections.singletonList(goal));

        List<GoalEntity> actual = goalController.getGoals(authentication);
        assertEquals(1, actual.size());
        assertEquals("My Goal", actual.get(0).getGoalName());
    }
}

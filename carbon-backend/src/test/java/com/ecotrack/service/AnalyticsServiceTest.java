package com.ecotrack.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ecotrack.dto.AnalyticsDTO;
import com.ecotrack.dto.GamificationDTO;
import com.ecotrack.entity.CarbonEntry;
import com.ecotrack.entity.ChallengeParticipantEntity;
import com.ecotrack.entity.GoalEntity;
import com.ecotrack.entity.User;
import com.ecotrack.repository.CarbonEntryRepository;
import com.ecotrack.repository.ChallengeParticipantRepository;
import com.ecotrack.repository.GoalRepository;

@ExtendWith(MockitoExtension.class)
public class AnalyticsServiceTest {

    @Mock
    private CarbonEntryRepository carbonEntryRepository;

    @Mock
    private GoalRepository goalRepository;

    @Mock
    private ChallengeParticipantRepository challengeParticipantRepository;

    @Mock
    private GamificationService gamificationService;

    @InjectMocks
    private AnalyticsService analyticsService;

    private User userA;
    private User userB;

    @BeforeEach
    public void setup() {
        userA = new User();
        userA.setUserId(1L);

        userB = new User();
        userB.setUserId(2L);
    }

    @Test
    public void testGetAnalyticsForUserWithData() {
        CarbonEntry entry1 = new CarbonEntry();
        entry1.setCarbonEmissionKg(new BigDecimal("10.0"));
        entry1.setCategory("Transportation");
        entry1.setEntryDate(LocalDate.of(2023, 10, 15));

        CarbonEntry entry2 = new CarbonEntry();
        entry2.setCarbonEmissionKg(new BigDecimal("20.0"));
        entry2.setCategory("Energy");
        entry2.setEntryDate(LocalDate.of(2023, 10, 16));

        when(carbonEntryRepository.findByUser(eq(userA))).thenReturn(Arrays.asList(entry1, entry2));
        when(goalRepository.findByUser(eq(userA))).thenReturn(new ArrayList<>());
        when(challengeParticipantRepository.findByUserId(eq(userA.getUserId()))).thenReturn(new ArrayList<>());
        when(gamificationService.getGamification(eq(userA))).thenReturn(new GamificationDTO());

        AnalyticsDTO dto = analyticsService.getAnalyticsForUser(userA);

        assertNotNull(dto);
        assertEquals(new BigDecimal("30.0"), dto.getTotalCarbonEmissions());
        assertEquals(2, dto.getTotalActivities());
        assertEquals("Energy", dto.getHighestEmissionCategory()); // 20 > 10

        assertTrue(dto.getEmissionsByCategory().containsKey("Transportation"));
        assertEquals(new BigDecimal("10.0"), dto.getEmissionsByCategory().get("Transportation"));

        assertTrue(dto.getMonthlyEmissions().containsKey("2023-10"));
        assertEquals(new BigDecimal("30.0"), dto.getMonthlyEmissions().get("2023-10"));

        // Test daily emission trends
        assertTrue(dto.getEmissionTrends().containsKey("2023-10-15"));
        assertEquals(new BigDecimal("10.0"), dto.getEmissionTrends().get("2023-10-15"));
        assertTrue(dto.getEmissionTrends().containsKey("2023-10-16"));
        assertEquals(new BigDecimal("20.0"), dto.getEmissionTrends().get("2023-10-16"));
    }

    @Test
    public void testGetAnalyticsForZeroDataUser() {
        when(carbonEntryRepository.findByUser(eq(userB))).thenReturn(Collections.emptyList());
        when(goalRepository.findByUser(eq(userB))).thenReturn(Collections.emptyList());
        when(challengeParticipantRepository.findByUserId(eq(userB.getUserId()))).thenReturn(Collections.emptyList());
        when(gamificationService.getGamification(eq(userB))).thenReturn(new GamificationDTO());

        AnalyticsDTO dto = analyticsService.getAnalyticsForUser(userB);

        assertNotNull(dto);
        assertEquals(BigDecimal.ZERO, dto.getTotalCarbonEmissions());
        assertEquals(0, dto.getTotalActivities());
        assertTrue(dto.getEmissionsByCategory().isEmpty());
        assertTrue(dto.getMonthlyEmissions().isEmpty());
        assertTrue(dto.getEmissionTrends().isEmpty());
        assertEquals("None", dto.getHighestEmissionCategory());
        assertEquals(0, dto.getActiveGoals());
        assertEquals(0, dto.getChallengeParticipationStats());
    }

    @Test
    public void testUserDataIsolation() {
        // User A has data
        CarbonEntry entry1 = new CarbonEntry();
        entry1.setCarbonEmissionKg(new BigDecimal("10.0"));
        when(carbonEntryRepository.findByUser(eq(userA))).thenReturn(Collections.singletonList(entry1));
        
        // User B has no data
        when(carbonEntryRepository.findByUser(eq(userB))).thenReturn(Collections.emptyList());
        
        // Mock Gamification
        when(gamificationService.getGamification(any())).thenReturn(new GamificationDTO());

        AnalyticsDTO dtoA = analyticsService.getAnalyticsForUser(userA);
        AnalyticsDTO dtoB = analyticsService.getAnalyticsForUser(userB);

        // Verification
        assertEquals(new BigDecimal("10.0"), dtoA.getTotalCarbonEmissions());
        assertEquals(BigDecimal.ZERO, dtoB.getTotalCarbonEmissions());
        
        assertEquals(1, dtoA.getTotalActivities());
        assertEquals(0, dtoB.getTotalActivities());
        
        assertTrue(dtoB.getEmissionsByCategory().isEmpty());
        assertTrue(dtoB.getMonthlyEmissions().isEmpty());
    }
}

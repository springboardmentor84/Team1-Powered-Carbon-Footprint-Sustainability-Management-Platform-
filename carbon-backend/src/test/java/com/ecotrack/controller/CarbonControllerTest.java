package com.ecotrack.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import com.ecotrack.entity.CarbonEntry;
import com.ecotrack.entity.User;
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.CarbonEntryService;

@ExtendWith(MockitoExtension.class)
public class CarbonControllerTest {

    @Mock
    private CarbonEntryService carbonEntryService;

    @Mock
    private AuthUserResolver authUserResolver;

    @InjectMocks
    private CarbonEntryController carbonController;

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
    public void testCreateCarbonEntry() {
        CarbonEntry request = new CarbonEntry();
        request.setCategory("Transportation");
        request.setCarbonEmissionKg(new BigDecimal("2.5"));

        when(carbonEntryService.saveEntry(any(CarbonEntry.class), eq(mockUser))).thenReturn(request);

        CarbonEntry actual = carbonController.createEntry(request, authentication);
        assertEquals("Transportation", actual.getCategory());
        assertEquals(new BigDecimal("2.5"), actual.getCarbonEmissionKg());
    }

    @Test
    public void testGetEntriesIsolation() {
        CarbonEntry entry = new CarbonEntry();
        entry.setCategory("Transportation");

        when(carbonEntryService.getUserEntries(eq(mockUser))).thenReturn(Collections.singletonList(entry));

        List<CarbonEntry> actual = carbonController.getEntries(authentication);
        assertEquals(1, actual.size());
        assertEquals("Transportation", actual.get(0).getCategory());
    }
}

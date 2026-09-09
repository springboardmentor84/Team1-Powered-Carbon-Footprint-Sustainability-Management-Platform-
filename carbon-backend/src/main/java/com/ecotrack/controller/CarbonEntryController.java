package com.ecotrack.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.dto.CarbonSummaryDTO;
import com.ecotrack.entity.CarbonEntry;
import com.ecotrack.entity.User;
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.CarbonEntryService;

@RestController
@RequestMapping("/carbon")
public class CarbonEntryController {

    @Autowired
    private CarbonEntryService carbonEntryService;

    @Autowired
    private AuthUserResolver authUserResolver;

    @PostMapping
    public CarbonEntry createEntry(
            @jakarta.validation.Valid @RequestBody CarbonEntry entry,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        return carbonEntryService.saveEntry(entry, user);
    }

    @GetMapping
    public List<CarbonEntry> getEntries(Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        return carbonEntryService.getUserEntries(user);
    }

    @DeleteMapping("/{id}")
    public String deleteEntry(
            @PathVariable Long id,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        carbonEntryService.deleteEntry(id, user);
        return "Carbon entry deleted successfully";
    }

    @GetMapping("/summary")
    public CarbonSummaryDTO getCarbonSummary(Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        return carbonEntryService.getCarbonSummary(user);
    }
}

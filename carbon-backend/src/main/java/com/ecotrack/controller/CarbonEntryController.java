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
import com.ecotrack.repository.UserRepository;
import com.ecotrack.service.CarbonEntryService;

@RestController
@RequestMapping("/carbon")
public class CarbonEntryController {

    @Autowired
    private CarbonEntryService carbonEntryService;

    @Autowired
    private UserRepository userRepository;

    // CREATE carbon entry
    @PostMapping
    public CarbonEntry createEntry(
            @RequestBody CarbonEntry entry,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return carbonEntryService.saveEntry(entry, user);
    }

    // GET logged-in user's carbon entries
    @GetMapping
    public List<CarbonEntry> getEntries(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return carbonEntryService.getUserEntries(user);
    }

    // DELETE carbon entry
    @DeleteMapping("/{id}")
    public String deleteEntry(@PathVariable Long id) {

        carbonEntryService.deleteEntry(id);

        return "Carbon entry deleted successfully";
    }
    
    @GetMapping("/summary")
    public CarbonSummaryDTO getCarbonSummary(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return carbonEntryService.getCarbonSummary(user);
    }
}
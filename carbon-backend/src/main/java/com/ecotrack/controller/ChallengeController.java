package com.ecotrack.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecotrack.entity.ChallengeEntity;
import com.ecotrack.entity.ChallengeParticipantEntity;
import com.ecotrack.entity.User;
import com.ecotrack.security.AuthUserResolver;
import com.ecotrack.service.ChallengeService;

@RestController
@RequestMapping("/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;
    private final AuthUserResolver authUserResolver;

    public ChallengeController(
            ChallengeService challengeService,
            AuthUserResolver authUserResolver) {

        this.challengeService =
                challengeService;
        this.authUserResolver = authUserResolver;
    }

    // ==========================================
    // GET ALL
    // ==========================================

    @GetMapping
    public ResponseEntity<List<ChallengeEntity>>
    getAllChallenges() {

        return ResponseEntity.ok(
                challengeService.getAllChallenges()
        );
    }

    // ==========================================
    // GET ONE
    // ==========================================

    @GetMapping("/{id}")
    public ResponseEntity<ChallengeEntity>
    getChallenge(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                challengeService.getChallengeById(id)
        );
    }

    // ==========================================
    // CREATE
    // ==========================================

    @PostMapping
    public ResponseEntity<ChallengeEntity>
    createChallenge(
            @jakarta.validation.Valid @RequestBody ChallengeEntity challenge) {

        return ResponseEntity.ok(
                challengeService.createChallenge(
                        challenge
                )
        );
    }

    // ==========================================
    // UPDATE
    // ==========================================

    @PutMapping("/{id}")
    public ResponseEntity<ChallengeEntity>
    updateChallenge(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody ChallengeEntity challenge) {

        return ResponseEntity.ok(
                challengeService.updateChallenge(
                        id,
                        challenge
                )
        );
    }

    // ==========================================
    // JOIN
    // ==========================================

    @PostMapping("/{id}/join")
    public ResponseEntity<ChallengeParticipantEntity>
    joinChallenge(
            @PathVariable Long id,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);

        return ResponseEntity.ok(
                challengeService.joinChallenge(
                        id,
                        user
                )
        );
    }

    // ==========================================
    // CHECK JOINED
    // ==========================================

    @GetMapping("/{id}/joined")
    public ResponseEntity<Boolean>
    isJoined(
            @PathVariable Long id,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);

        return ResponseEntity.ok(
                challengeService.isJoined(
                        id,
                        user
                )
        );
    }

    // ==========================================
    // LEAVE
    // ==========================================

    @PostMapping("/{id}/leave")
    public ResponseEntity<ChallengeParticipantEntity>
    leaveChallenge(
            @PathVariable Long id,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);

        return ResponseEntity.ok(
                challengeService.leaveChallenge(
                        id,
                        user
                )
        );
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<ChallengeParticipantEntity.Status> getStatus(
            @PathVariable Long id,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        return ResponseEntity.ok(
                challengeService.getChallengeStatus(id, user)
        );
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ChallengeParticipantEntity> completeChallenge(
            @PathVariable Long id,
            Authentication authentication) {

        User user = authUserResolver.requireUser(authentication);
        return ResponseEntity.ok(
                challengeService.completeChallenge(id, user)
        );
    }

    // ==========================================
    // DELETE
    // ==========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteChallenge(
            @PathVariable Long id) {

        challengeService.deleteChallenge(id);

        return ResponseEntity.noContent()
                .build();
    }
}

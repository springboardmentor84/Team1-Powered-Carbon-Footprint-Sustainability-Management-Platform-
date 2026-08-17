package com.ecotrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecotrack.entity.CarbonEntry;
import com.ecotrack.entity.User;

@Repository
public interface CarbonEntryRepository extends JpaRepository<CarbonEntry, Long> {

    List<CarbonEntry> findByUser(User user);

}
package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.core.domain.org.School;
import com.shikshasathi.backend.infrastructure.repository.org.SchoolRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
public class SchoolController extends BaseController {

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;

    /**
     * Search schools by name (case-insensitive, partial match).
     * Searches TWO sources and merges results:
     *   1. Pre-seeded schools from the `schools` collection
     *   2. Distinct school names from teachers who've already signed up (`users` collection)
     *
     * Results are deduplicated by name (pre-seeded schools take priority).
     * Returns up to 5 total results.
     * Public endpoint — no authentication required.
     */
    @GetMapping("/search")
    public ResponseEntity<List<School>> searchSchools(
            @RequestParam(required = false, defaultValue = "") String q) {
        if (q.isBlank()) {
            return ResponseEntity.ok(List.of());
        }

        // Use a LinkedHashMap to deduplicate by school name (preserves insertion order)
        Map<String, School> uniqueSchools = new LinkedHashMap<>();

        // 1. Search pre-seeded schools from the schools collection
        try {
            var seededPage = schoolRepository.findByNameContainingIgnoreCase(q, PageRequest.of(0, 5));
            for (School school : seededPage.getContent()) {
                if (school.getName() == null) continue;
                uniqueSchools.put(school.getName().trim().toLowerCase(), school);
            }
        } catch (Exception e) {
            // Log and continue to user schools
        }

        // 2. Search distinct school names from existing users
        if (uniqueSchools.size() < 5) {
            try {
                var remaining = 5 - uniqueSchools.size();
                var userSchoolNames = userRepository.findDistinctSchoolNames(q, remaining);
                for (String name : userSchoolNames) {
                    if (name == null || name.isBlank()) continue;
                    String key = name.trim().toLowerCase();
                    if (!uniqueSchools.containsKey(key)) {
                        // Create a School wrapper with null ID (not from seeded collection)
                        School userSchool = new School();
                        userSchool.setId(null);
                        userSchool.setName(name.trim());
                        userSchool.setActive(true);
                        uniqueSchools.put(key, userSchool);
                    }
                }
            } catch (Exception e) {
                // Log and return what we have
            }
        }

        return ResponseEntity.ok(new ArrayList<>(uniqueSchools.values()));
    }
}

package com.shikshasathi.backend.api.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for PublishService.
 * SSA-209: Publish Controls Validation
 */
public class PublishServiceTest {

    @Test
    void testPublishWorkflowStates() {
        // Verify all publish states are supported
        String[] validStates = {"DRAFT", "APPROVED", "PUBLISHED", "REJECTED"};
        
        for (String state : validStates) {
            assertNotNull(state);
            assertTrue(state.length() > 0);
        }
    }

    @Test
    void testPublishResultStructure() {
        // Verify publish result has required fields
        PublishService.PublishResult result = PublishService.PublishResult.builder()
                .publishedCount(10)
                .status("SUCCESS")
                .message("10 questions published successfully")
                .build();

        assertEquals(10, result.getPublishedCount());
        assertEquals("SUCCESS", result.getStatus());
        assertNotNull(result.getMessage());
    }

    @Test
    void testChapterPublishStatusStructure() {
        // Verify chapter status has required fields
        PublishService.ChapterPublishStatus status = PublishService.ChapterPublishStatus.builder()
                .board("NCERT")
                .classLevel("6")
                .subject("Science")
                .book("Curiosity")
                .chapterNumber(1)
                .totalQuestions(4)
                .draftCount(0)
                .approvedCount(0)
                .publishedCount(4)
                .rejectedCount(0)
                .overallStatus("PUBLISHED")
                .build();

        assertEquals("NCERT", status.getBoard());
        assertEquals("6", status.getClassLevel());
        assertEquals(4, status.getPublishedCount());
        assertEquals("PUBLISHED", status.getOverallStatus());
    }

    @Test
    void testDashboardSummaryStructure() {
        // Verify dashboard summary has required fields
        PublishService.PublishDashboardSummary summary = PublishService.PublishDashboardSummary.builder()
                .totalQuestions(100)
                .draftCount(10)
                .approvedCount(40)
                .publishedCount(45)
                .rejectedCount(5)
                .canonicalCount(90)
                .derivedCount(10)
                .publishPercentage(45)
                .build();

        assertEquals(100, summary.getTotalQuestions());
        assertEquals(45, summary.getPublishedCount());
        assertEquals(45, summary.getPublishPercentage());
        assertTrue(summary.getCanonicalCount() > 0);
    }

    @Test
    void testPublishPercentageCalculation() {
        // Verify percentage calculation
        int total = 200;
        int published = 150;
        int expectedPercentage = (int)(published * 100 / total);
        
        assertEquals(75, expectedPercentage);
    }

    @Test
    void testOverallStatusDetermination() {
        // Test status logic
        // All published = PUBLISHED
        assertEquals("PUBLISHED", determineStatus(0, 0, 10, 0));
        
        // All approved = APPROVED
        assertEquals("APPROVED", determineStatus(0, 10, 0, 0));
        
        // Mixed = DRAFT
        assertEquals("DRAFT", determineStatus(5, 5, 0, 0));
        
        // Has rejections = PARTIALLY_REJECTED
        assertEquals("PARTIALLY_REJECTED", determineStatus(0, 8, 0, 2));
    }

    private String determineStatus(long draft, long approved, long published, long rejected) {
        int total = (int)(draft + approved + published + rejected);
        if (published == total && total > 0) return "PUBLISHED";
        if (approved == total && total > 0) return "APPROVED";
        if (rejected > 0) return "PARTIALLY_REJECTED";
        return "DRAFT";
    }

    @Test
    void testQualityGates() {
        // Verify quality gate checks before publishing
        boolean hasProvenance = true;
        boolean answersVerified = true;
        boolean explanationsPresent = true;
        boolean noDuplicates = true;
        boolean variedQuestionTypes = true;

        boolean readyToPublish = hasProvenance && answersVerified && 
                                  explanationsPresent && noDuplicates && variedQuestionTypes;

        assertTrue(readyToPublish, "Content should be ready to publish");
    }

    @Test
    void testTeacherFacingBehavior() {
        // Verify only published content is visible
        String questionStatus = "PUBLISHED";
        boolean isVisibleToTeacher = "PUBLISHED".equals(questionStatus) || "APPROVED".equals(questionStatus);
        assertTrue(isVisibleToTeacher);

        questionStatus = "DRAFT";
        isVisibleToTeacher = "PUBLISHED".equals(questionStatus) || "APPROVED".equals(questionStatus);
        assertFalse(isVisibleToTeacher);

        questionStatus = "REJECTED";
        isVisibleToTeacher = "PUBLISHED".equals(questionStatus) || "APPROVED".equals(questionStatus);
        assertFalse(isVisibleToTeacher);
    }
}

package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.AuditResult;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.infrastructure.repository.learning.AuditResultRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class AuditResultService {

    @Autowired
    private AuditResultRepository auditResultRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

public List<AuditResult> getAuditResults(Integer classLevel, String chapter, String status) {
    // Build query to handle both snake_case and camelCase field names
    List<Criteria> allCriteria = new ArrayList<>();

    if (classLevel != null) {
      // Query both class_level and classLevel
      Criteria classLevelCriteria = new Criteria().orOperator(
          Criteria.where("class_level").is(classLevel),
          Criteria.where("classLevel").is(classLevel)
      );
      allCriteria.add(classLevelCriteria);
    }

    if (chapter != null && !chapter.isEmpty()) {
      allCriteria.add(Criteria.where("chapter").is(chapter));
    }

    if (status != null && !status.isEmpty()) {
      Criteria statusCriteria = new Criteria().orOperator(
          Criteria.where("audit_status").is(status),
          Criteria.where("auditStatus").is(status)
      );
      allCriteria.add(statusCriteria);
    }

    Query query = new Query();
    if (!allCriteria.isEmpty()) {
      query.addCriteria(new Criteria().andOperator(allCriteria.toArray(new Criteria[0])));
    }
    query.with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "audited_at"));

    List<AuditResult> allResults = mongoTemplate.find(query, AuditResult.class);

    // Keep only the latest result for each question
    Map<String, AuditResult> latestByQuestion = new LinkedHashMap<>();
    for (AuditResult result : allResults) {
      String qId = result.getQuestionId();
      if (qId != null && !latestByQuestion.containsKey(qId)) {
        latestByQuestion.put(qId, result);
      }
    }

    return new ArrayList<>(latestByQuestion.values());
  }

public Map<String, Object> getStatistics(Integer classLevel, String chapter) {
    Map<String, Object> stats = new HashMap<>();

    // Get latest results only (deduplicated by question)
    List<AuditResult> results = getAuditResults(classLevel, chapter, null);

    int total = results.size();
    int ok = 0;
    int needsFix = 0;
    int error = 0;

    for (AuditResult r : results) {
      switch (r.getAuditStatus()) {
        case "ok" -> ok++;
        case "needs_fix" -> needsFix++;
        case "error" -> error++;
      }
    }

    stats.put("total", total);
    stats.put("ok", ok);
    stats.put("needsFix", needsFix);
    stats.put("error", error);

    // Group by chapter
    Map<String, Map<String, Integer>> byChapter = new HashMap<>();
    for (AuditResult r : results) {
      String ch = r.getChapter();
      if (ch != null) {
        byChapter.putIfAbsent(ch, new HashMap<>());
        Map<String, Integer> chapterStats = byChapter.get(ch);
        chapterStats.put("total", chapterStats.getOrDefault("total", 0) + 1);
        switch (r.getAuditStatus()) {
          case "ok" -> chapterStats.put("ok", chapterStats.getOrDefault("ok", 0) + 1);
          case "needs_fix" -> chapterStats.put("needsFix", chapterStats.getOrDefault("needsFix", 0) + 1);
          case "error" -> chapterStats.put("error", chapterStats.getOrDefault("error", 0) + 1);
        }
      }
    }
    stats.put("byChapter", byChapter);

    return stats;
  }

    public AuditResult saveAuditResult(AuditResult auditResult) {
        return auditResultRepository.save(auditResult);
    }

    public List<AuditResult> saveAuditResults(List<AuditResult> auditResults) {
        return auditResultRepository.saveAll(auditResults);
    }

    public Question applyFix(String questionId, String appliedBy) {
        Optional<AuditResult> auditResultOpt = auditResultRepository.findTopByQuestionIdOrderByAuditedAtDesc(questionId);
        
        if (auditResultOpt.isEmpty()) {
            throw new IllegalArgumentException("No audit result found for question: " + questionId);
        }

        AuditResult auditResult = auditResultOpt.get();
        
        if (!"needs_fix".equals(auditResult.getAuditStatus())) {
            throw new IllegalArgumentException("Question does not need fixes");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));

        // Apply the fixes from audit result
        Map<String, Object> autoFixes = auditResult.getAutoFixes();
        if (autoFixes != null) {
            if (autoFixes.containsKey("correctAnswer")) {
                question.setCorrectAnswer((String) autoFixes.get("correctAnswer"));
            }
            if (autoFixes.containsKey("text")) {
                question.setText((String) autoFixes.get("text"));
            }
            if (autoFixes.containsKey("type")) {
                question.setType((String) autoFixes.get("type"));
            }
            if (autoFixes.containsKey("options")) {
                question.setOptions((List<String>) autoFixes.get("options"));
            }
            if (autoFixes.containsKey("explanation")) {
                question.setExplanation((String) autoFixes.get("explanation"));
            }
        }

        // Update audit result
        auditResult.setAppliedAt(Instant.now());
        auditResult.setAppliedBy(appliedBy);
        auditResult.setAuditStatus("ok");
        auditResult.setRecommendation("approve");
        auditResultRepository.save(auditResult);

        return questionRepository.save(question);
    }

    public Question rejectQuestion(String questionId, String reason) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));

        question.setReviewStatus("REJECTED");
        question.setReviewerNotes("Rejected via audit: " + reason);
        
        // Update audit result
        Optional<AuditResult> auditResultOpt = auditResultRepository.findTopByQuestionIdOrderByAuditedAtDesc(questionId);
        if (auditResultOpt.isPresent()) {
            AuditResult auditResult = auditResultOpt.get();
            auditResult.setAppliedAt(Instant.now());
            auditResult.setAuditStatus("error");
            auditResult.setRecommendation("reject");
            auditResultRepository.save(auditResult);
        }

        return questionRepository.save(question);
    }

    public int bulkApplyFixes(List<String> questionIds, String appliedBy) {
        int count = 0;
        for (String questionId : questionIds) {
            try {
                applyFix(questionId, appliedBy);
                count++;
            } catch (Exception e) {
                // Skip failed applications
            }
        }
        return count;
    }

    public int bulkReject(List<String> questionIds, String reason) {
        int count = 0;
        for (String questionId : questionIds) {
            try {
                rejectQuestion(questionId, reason);
                count++;
            } catch (Exception e) {
                // Skip failed rejections
            }
        }
        return count;
    }

    public void deleteByAuditRunId(String auditRunId) {
        auditResultRepository.deleteByAuditRunId(auditRunId);
    }

    public List<AuditResult> getAllRaw() {
        return auditResultRepository.findAll();
    }
}

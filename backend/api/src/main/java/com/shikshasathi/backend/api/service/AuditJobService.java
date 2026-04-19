package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.AuditJob;
import com.shikshasathi.backend.infrastructure.repository.learning.AuditJobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuditJobService {

    private final AuditJobRepository auditJobRepository;

    // Keep subprocess handles for running jobs so we can cancel them.
    private final Map<String, Process> runningProcesses = new ConcurrentHashMap<>();

    /**
     * Starts an audit job for the given class level.
     * Returns the persisted AuditJob entity.
     */
    public AuditJob startJob(int classLevel) {
        // Create a unique run identifier – similar format to audit-agent.
        String runId = "audit_" + Instant.now().toString().replaceAll("[:.-]", "");
        AuditJob job = new AuditJob();
        job.setClassLevel(classLevel);
        job.setStatus("RUNNING");
        job.setStartedAt(Instant.now());
        job.setAuditRunId(runId);
        // Persist the job first – this gives us a stable ID.
        AuditJob savedJob = auditJobRepository.save(job);

        // Build command to run the Python audit agent.
String scriptPath = "scripts/audit-agent/audit-agent.py";
        String pythonPath = "scripts/audit-agent/.venv/bin/python";
        ProcessBuilder pb = new ProcessBuilder(
                pythonPath,
                scriptPath,
                "--class-num",
                String.valueOf(classLevel)
        );
        // Inherit environment (MONGODB_URI, etc.)
        pb.environment().putAll(System.getenv());
        // Use project root as working directory.
        pb.directory(new java.io.File(".") );
        try {
            Process proc = pb.start();
            runningProcesses.put(savedJob.getId(), proc);

            // Capture stdout and stderr
            StringBuilder outBuilder = new StringBuilder();
            StringBuilder errBuilder = new StringBuilder();
            Thread outThread = new Thread(() -> {
                try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(proc.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        outBuilder.append(line).append('\n');
                    }
                } catch (Exception ignored) {}
            });
            Thread errThread = new Thread(() -> {
                try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(proc.getErrorStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        errBuilder.append(line).append('\n');
                    }
                } catch (Exception ignored) {}
            });
            outThread.start();
            errThread.start();

            // Asynchronously wait for completion and update job status.
            new Thread(() -> {
                try {
                    int exitCode = proc.waitFor();
                    outThread.join();
                    errThread.join();
                    savedJob.setCompletedAt(Instant.now());
                    savedJob.setStdout(outBuilder.toString());
                    savedJob.setStderr(errBuilder.toString());
                    if (exitCode == 0) {
                        savedJob.setStatus("COMPLETED");
                    } else {
                        savedJob.setStatus("FAILED");
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    savedJob.setStatus("CANCELLED");
                    savedJob.setCompletedAt(Instant.now());
                } finally {
                    auditJobRepository.save(savedJob);
                    runningProcesses.remove(savedJob.getId());
                }
            }).start();
        } catch (Exception e) {
            savedJob.setStatus("FAILED");
            savedJob.setCompletedAt(Instant.now());
            auditJobRepository.save(savedJob);
        }
        return savedJob;
    }

    public AuditJob getJob(String id) {
        return auditJobRepository.findById(id).orElse(null);
    }

    public java.util.List<AuditJob> getAllJobs() {
        return auditJobRepository.findAll();
    }

    public void cancelJob(String id) {
        Process proc = runningProcesses.get(id);
        if (proc != null && proc.isAlive()) {
            proc.destroy();
            AuditJob job = auditJobRepository.findById(id).orElse(null);
            if (job != null) {
                job.setStatus("CANCELLED");
                job.setCompletedAt(Instant.now());
                auditJobRepository.save(job);
            }
            runningProcesses.remove(id);
        }
    }

    public void deleteJob(String id) {
        // Remove any running process first.
        cancelJob(id);
        auditJobRepository.deleteById(id);
    }
}

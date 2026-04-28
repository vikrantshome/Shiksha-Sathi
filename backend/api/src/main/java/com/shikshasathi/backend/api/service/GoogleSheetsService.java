package com.shikshasathi.backend.api.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.*;
import com.shikshasathi.backend.api.dto.ClassGradebookDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GoogleSheetsService {

    private static final String APPLICATION_NAME = "Shiksha Sathi";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private Sheets getSheetsService() throws Exception {
        // Load credentials from local google/ folder (root of project)
        File clientSecretFile = new File("../../google/client_secret.json");
        File tokenFile = new File("../../google/token.json");
        
        if (!clientSecretFile.exists() || !tokenFile.exists()) {
            throw new RuntimeException("Google API credentials not found in project root google/ folder");
        }

        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new FileReader(clientSecretFile));
        
        com.google.api.client.http.HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        
        // Load token.json manually to get the refresh token
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Map<String, Object> tokenData = mapper.readValue(tokenFile, Map.class);
        
        String accessToken = (String) tokenData.get("access_token");
        String refreshToken = (String) tokenData.get("refresh_token");

        // Build a credential that can auto-refresh
        Credential credential = new GoogleCredential.Builder()
                .setTransport(httpTransport)
                .setJsonFactory(JSON_FACTORY)
                .setClientSecrets(clientSecrets)
                .build()
                .setAccessToken(accessToken)
                .setRefreshToken(refreshToken);

        return new Sheets.Builder(httpTransport, JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    public String createGradebookSheet(ClassGradebookDTO data) {
        try {
            Sheets service = getSheetsService();
            
            // 1. Create Spreadsheet
            Spreadsheet spreadsheet = new Spreadsheet()
                    .setProperties(new SpreadsheetProperties()
                            .setTitle("Gradebook - " + data.getClassName()));
            spreadsheet = service.spreadsheets().create(spreadsheet)
                    .setFields("spreadsheetId,spreadsheetUrl")
                    .execute();
            
            String spreadsheetId = spreadsheet.getSpreadsheetId();
            String spreadsheetUrl = spreadsheet.getSpreadsheetUrl();

            // 2. Prepare Data
            List<List<Object>> values = new ArrayList<>();
            
            // Header Row
            List<Object> header = new ArrayList<>();
            header.add("Student Name");
            header.add("Roll Number");
            for (ClassGradebookDTO.AssignmentSummary a : data.getAssignments()) {
                header.add(a.getTitle() + " (max " + a.getMaxScore() + ")");
            }
            header.add("Average %");
            values.add(header);

            // Student Rows
            for (ClassGradebookDTO.StudentPerformance s : data.getStudents()) {
                List<Object> row = new ArrayList<>();
                row.add(s.getStudentName());
                row.add(s.getStudentRollNumber());
                for (ClassGradebookDTO.AssignmentSummary a : data.getAssignments()) {
                    row.add(s.getScores().getOrDefault(a.getId(), 0));
                }
                row.add(s.getAveragePercentage() + "%");
                values.add(row);
            }

            // 3. Write Data
            ValueRange body = new ValueRange().setValues(values);
            service.spreadsheets().values()
                    .update(spreadsheetId, "A1", body)
                    .setValueInputOption("RAW")
                    .execute();

            log.info("Successfully created and populated Google Sheet: {}", spreadsheetUrl);
            return spreadsheetUrl;

        } catch (Exception e) {
            log.error("Google Sheets creation failed", e);
            throw new RuntimeException("Google Sheets Integration failed: " + e.getMessage());
        }
    }
}

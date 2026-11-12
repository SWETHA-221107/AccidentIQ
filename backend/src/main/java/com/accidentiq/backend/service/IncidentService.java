
package com.accidentiq.backend.service;

import com.accidentiq.backend.Incident;
import com.accidentiq.backend.dto.CreateIncidentRequest;
import com.accidentiq.backend.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.Set;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;

    public IncidentService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public Incident createIncident(CreateIncidentRequest request) {
        Incident incident = new Incident();

        incident.setTitle(request.getTitle());
        incident.setLocation(request.getLocation());
        incident.setSeverity(request.getSeverity());
        incident.setWeatherCondition(request.getWeatherCondition());
        incident.setRoadCondition(request.getRoadCondition());
        incident.setIncidentDate(LocalDateTime.now());
        incident.setStatus("REPORTED");
        incident.setLatitude(request.getLatitude());
        incident.setLongitude(request.getLongitude());

        return incidentRepository.save(incident);
    }
    public Incident updateIncidentStatus(Long id, String status) {
    Set<String> allowedStatuses = Set.of(
        "REPORTED",
        "DISPATCHED",
        "IN PROGRESS",
        "RESOLVED"
    );

    String normalizedStatus = status.trim().toUpperCase();

    if (!allowedStatuses.contains(normalizedStatus)) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Invalid incident status"
        );
    }

    Incident incident = incidentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Incident not found"
        ));

    incident.setStatus(normalizedStatus);

    return incidentRepository.save(incident);
}
}

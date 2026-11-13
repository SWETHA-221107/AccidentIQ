import { useState } from "react";
import {
  AlertTriangle,
  Flame,
  MapPin,
  Phone,
  Shield,
  Siren,
  Truck,
} from "lucide-react";
import "./ResponseCentre.css";

const EMERGENCY_SERVICES = [
  {
    key: "ambulance",
    label: "Ambulance",
    number: "108",
    icon: Truck,
    description: "Tamil Nadu accident and emergency ambulance",
  },
  {
    key: "fire",
    label: "Fire & Rescue",
    number: "101",
    icon: Flame,
    description: "Fire, smoke, rescue and entrapment",
  },
  {
    key: "police",
    label: "Police",
    number: "100",
    icon: Shield,
    description: "Police assistance and traffic safety",
  },
];

function normalizeSeverity(severity) {
  const value = String(severity || "").toUpperCase();
  if (value === "CRITICAL") return "CRITICAL";
  if (value === "HIGH") return "HIGH";
  if (value === "MEDIUM" || value === "MODERATE") return "MEDIUM";
  return "LOW";
}

function getRecommendations(incident, checks) {
  const severity = normalizeSeverity(incident.severity);
  const recommendations = [];

  if (severity === "CRITICAL") {
    recommendations.push(
      "Call 112 for coordinated emergency response immediately."
    );
    recommendations.push("Request an ambulance; report the number of injured people if known.");
    recommendations.push("Request police assistance to secure the scene and manage traffic.");
  } else if (severity === "HIGH") {
    recommendations.push("Prioritise ambulance assistance for possible serious injuries.");
    recommendations.push("Request police assistance for scene safety and traffic control.");
  } else if (severity === "MEDIUM") {
    recommendations.push(
      checks.injuries
        ? "Injuries reported: contact the ambulance service."
        : "Check for injuries. Contact an ambulance if anyone is hurt."
    );
    recommendations.push(
      checks.traffic
        ? "Traffic hazard reported: contact police for traffic assistance."
        : "Contact police if the accident is blocking traffic or creating danger."
    );
  } else {
    recommendations.push(
      "Monitor the incident. Escalate immediately if injuries, fire, or danger are identified."
    );
  }

  if (checks.fire) {
    recommendations.push("Fire or smoke reported: contact Fire & Rescue.");
  }

  return recommendations;
}

function callService(number, service, incident) {
  const location = incident.location || "location not provided";
  const confirmed = window.confirm(
    `Call ${service} (${number}) for incident #${incident.id} at ${location}?\n\nOnly continue for a genuine emergency. AccidentIQ does not send incident details automatically.`
  );

  if (confirmed) {
    window.location.href = `tel:${number}`;
  }
}

function ServiceButton({ service, incident, recommended = false }) {
  const Icon = service.icon;

  return (
    <button
      type="button"
      className={`response-call-button ${recommended ? "recommended" : ""}`}
      onClick={() => callService(service.number, service.label, incident)}
    >
      <Icon size={17} />
      <span>
        <strong>Call {service.label}</strong>
        <small>{service.number}</small>
      </span>
      <Phone size={16} className="response-phone-icon" />
    </button>
  );
}

function IncidentResponseCard({ incident }) {
  const [checks, setChecks] = useState({
    injuries: false,
    fire: false,
    traffic: false,
  });

  const severity = normalizeSeverity(incident.severity);
  const recommendations = getRecommendations(incident, checks);
  const showAmbulance = severity === "CRITICAL" || severity === "HIGH" || checks.injuries;
  const showPolice = severity === "CRITICAL" || severity === "HIGH" || checks.traffic;
  const showFire = checks.fire;

  const services = EMERGENCY_SERVICES.filter((service) => {
    if (service.key === "ambulance") return showAmbulance;
    if (service.key === "police") return showPolice;
    if (service.key === "fire") return showFire;
    return false;
  });

  const hasCoordinates =
    incident.latitude !== null &&
    incident.latitude !== undefined &&
    incident.longitude !== null &&
    incident.longitude !== undefined &&
    Number.isFinite(Number(incident.latitude)) &&
    Number.isFinite(Number(incident.longitude));

  return (
    <article className="response-incident-card">
      <div className="response-card-top">
        <div>
          <span className="response-incident-id">
            INCIDENT #{String(incident.id).padStart(3, "0")}
          </span>
          <h3>{incident.title || "Reported accident"}</h3>
          <p className="response-location">
            <MapPin size={15} />
            {incident.location || "Location not provided"}
          </p>
          {hasCoordinates && (
            <a
              className="response-map-link"
              href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              View GPS location
            </a>
          )}
        </div>
        <span className={`response-severity ${severity.toLowerCase()}`}>
          {severity}
        </span>
      </div>

      <div className="response-checks">
        <label>
          <input
            type="checkbox"
            checked={checks.injuries}
            onChange={(event) =>
              setChecks((current) => ({
                ...current,
                injuries: event.target.checked,
              }))
            }
          />
          Injuries reported
        </label>
        <label>
          <input
            type="checkbox"
            checked={checks.fire}
            onChange={(event) =>
              setChecks((current) => ({
                ...current,
                fire: event.target.checked,
              }))
            }
          />
          Fire or smoke reported
        </label>
        <label>
          <input
            type="checkbox"
            checked={checks.traffic}
            onChange={(event) =>
              setChecks((current) => ({
                ...current,
                traffic: event.target.checked,
              }))
            }
          />
          Traffic hazard / road blocked
        </label>
      </div>

      <div className="response-recommendations">
        <h4>
          <AlertTriangle size={16} />
          Recommended response
        </h4>
        <ul>
          {recommendations.map((recommendation) => (
            <li key={recommendation}>{recommendation}</li>
          ))}
        </ul>
      </div>

      {severity === "CRITICAL" && (
        <button
          type="button"
          className="response-primary-call"
          onClick={() => callService("112", "Unified Emergency Response", incident)}
        >
          <Siren size={18} />
          Call 112 – Emergency Response
        </button>
      )}

      {services.length > 0 && (
        <div className="response-service-grid">
          {services.map((service) => (
            <ServiceButton
              key={service.key}
              service={service}
              incident={incident}
              recommended
            />
          ))}
        </div>
      )}

      <div className="response-manual-calls">
        <span>Other emergency contacts</span>
        <div className="response-service-grid">
          {EMERGENCY_SERVICES.filter(
            (service) => !services.some((item) => item.key === service.key)
          ).map((service) => (
            <ServiceButton
              key={service.key}
              service={service}
              incident={incident}
            />
          ))}
          {severity !== "CRITICAL" && (
            <button
              type="button"
              className="response-call-button"
              onClick={() => callService("112", "Unified Emergency Response", incident)}
            >
              <Siren size={17} />
              <span>
                <strong>Call Emergency 112</strong>
                <small>112</small>
              </span>
              <Phone size={16} className="response-phone-icon" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ResponseCentre({ incidents = [] }) {
  const activeIncidents = incidents.filter(
    (incident) =>
      !["RESOLVED", "CLOSED"].includes(
        String(incident.status || "").toUpperCase()
      )
  );

  return (
    <section className="response-centre">
      <div className="response-overview panel">
        <div>
          <span className="response-eyebrow">EMERGENCY OPERATIONS</span>
          <h3>Response Centre</h3>
          <p>
            Review each active incident and contact the appropriate emergency
            service. Recommendations are operator guidance, not automatic dispatch.
          </p>
        </div>
        <div className="response-active-count">
          <strong>{activeIncidents.length}</strong>
          <span>Active incidents</span>
        </div>
      </div>

      <div className="response-important-note">
        <AlertTriangle size={18} />
        <p>
          <strong>For a real emergency, call 112.</strong> Calls are initiated
          only after operator confirmation. AccidentIQ does not automatically
          contact or dispatch emergency services, and it does not transmit the
          incident location to the call centre.
        </p>
      </div>

      {activeIncidents.length === 0 ? (
        <div className="panel response-empty">
          <Siren size={28} />
          <h3>No active incidents</h3>
          <p>New incidents will appear here when they are reported.</p>
        </div>
      ) : (
        <div className="response-incident-list">
          {activeIncidents.map((incident) => (
            <IncidentResponseCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}

      <div className="response-number-reference panel">
        <h4>Emergency number reference · Tamil Nadu</h4>
        <p>
          112 is India's unified emergency number. The direct numbers below are
          listed by Tamil Nadu government district helplines.
        </p>
        <div>
          <span>Unified emergency <strong>112</strong></span>
          <span>Accident ambulance <strong>108</strong></span>
          <span>Fire & Rescue <strong>101</strong></span>
          <span>Police <strong>100</strong></span>
        </div>
      </div>
    </section>
  );
}

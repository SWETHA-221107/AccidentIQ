
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { AlertTriangle, MapPin, Search, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

function markerColor(severity = "") {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "#ff5e62";
    case "HIGH":
      return "#ffad5c";
    case "MEDIUM":
      return "#f3d35c";
    default:
      return "#55c6a9";
  }
}

// Automatically adjusts the map to show all GPS markers.
function FitMapToMarkers({ incidents }) {
  const map = useMap();

  useEffect(() => {
    if (incidents.length > 0) {
      const coordinates = incidents.map((incident) => [
        incident.latitude,
        incident.longitude,
      ]);

      map.fitBounds(coordinates, {
        padding: [45, 45],
        maxZoom: 14,
      });
    }
  }, [incidents, map]);

  return null;
}

export default function MapView({ incidents = [], apiStatus }) {
  const [search, setSearch] = useState("");

  // Only incidents with real, valid GPS coordinates are pinned.
  const mappedIncidents = useMemo(
    () =>
      incidents.filter(
        (incident) =>
          typeof incident.latitude === "number" &&
          Number.isFinite(incident.latitude) &&
          incident.latitude >= -90 &&
          incident.latitude <= 90 &&
          typeof incident.longitude === "number" &&
          Number.isFinite(incident.longitude) &&
          incident.longitude >= -180 &&
          incident.longitude <= 180
      ),
    [incidents]
  );

  const unmappedIncidents = incidents.filter(
    (incident) => !mappedIncidents.some((mapped) => mapped.id === incident.id)
  );

  const visibleIncidents = mappedIncidents.filter((incident) =>
    `${incident.title} ${incident.location} ${incident.status} ${incident.severity}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="map-workspace">
      <div className="map-summary-row">
        <div className="map-stat-card">
          <span>Loaded incidents</span>
          <strong>{incidents.length}</strong>
        </div>

        <div className="map-stat-card">
          <span>GPS map pins</span>
          <strong>{mappedIncidents.length}</strong>
        </div>

        <div className="map-stat-card">
          <span>Missing GPS coordinates</span>
          <strong>{unmappedIncidents.length}</strong>
        </div>
      </div>

      <div className="panel map-panel">
        <div className="panel-heading">
          <div>
            <h3>GPS incident locations</h3>
            <p>
              Incidents are displayed using their saved latitude and longitude.
            </p>
          </div>

          <span
            className={`map-api-pill ${
              apiStatus === "connected" ? "online" : "offline"
            }`}
          >
            {apiStatus === "connected"
              ? "LIVE INCIDENT DATA"
              : apiStatus === "checking"
                ? "CONNECTING"
                : "BACKEND OFFLINE"}
          </span>
        </div>

        <div className="map-layout">
          <div className="leaflet-map-frame">
            <MapContainer
              center={[13.0475, 80.2090]}
              zoom={11}
              scrollWheelZoom
              zoomControl={false}
              className="accidentiq-leaflet-map"
            >
              <ZoomControl position="topright" />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              <FitMapToMarkers incidents={visibleIncidents} />

              {visibleIncidents.map((incident) => (
                <CircleMarker
                  key={incident.id}
                  center={[incident.latitude, incident.longitude]}
                  radius={9}
                  pathOptions={{
                    color: markerColor(incident.severity),
                    fillColor: markerColor(incident.severity),
                    fillOpacity: 0.9,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="map-popup">
                      <strong>
                        #{incident.id} · {incident.title || "Accident report"}
                      </strong>

                      <span>
                        <MapPin size={13} /> {incident.location}
                      </span>

                      <span>Severity: {incident.severity || "Unknown"}</span>
                      <span>Status: {incident.status || "Unknown"}</span>

                      <small>
                        GPS: {incident.latitude}, {incident.longitude}
                      </small>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <aside className="map-incident-list">
            <label className="search-box map-search-box">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search GPS incidents..."
              />
            </label>

            <div className="map-legend">
              <span>
                <i style={{ background: "#ff5e62" }} /> Critical
              </span>
              <span>
                <i style={{ background: "#ffad5c" }} /> High
              </span>
              <span>
                <i style={{ background: "#f3d35c" }} /> Medium
              </span>
              <span>
                <i style={{ background: "#55c6a9" }} /> Low / other
              </span>
            </div>

            {visibleIncidents.length ? (
              visibleIncidents.map((incident) => (
                <div className="map-incident-item" key={incident.id}>
                  <span
                    className="map-incident-marker"
                    style={{
                      background: markerColor(incident.severity),
                    }}
                  />

                  <div>
                    <strong>
                      {incident.title || `Incident #${incident.id}`}
                    </strong>

                    <span>{incident.location}</span>

                    <small>
                      {incident.severity} · {incident.status}
                    </small>

                    <small>
                      {incident.latitude}, {incident.longitude}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="map-empty">
                No GPS incidents match your search.
              </p>
            )}
          </aside>
        </div>

        {unmappedIncidents.length > 0 && (
          <div className="map-notice">
            <AlertTriangle size={17} />

            <div>
              <strong>
                {unmappedIncidents.length} incident(s) have no GPS coordinates.
              </strong>

              <p>
                Older reports may not have GPS data. New reports can be pinned
                using the location picker in the Report Incident form.
              </p>

              <ul>
                {unmappedIncidents.slice(0, 5).map((item) => (
                  <li key={item.id}>
                    #{item.id}: {item.location}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {mappedIncidents.length === 0 && (
          <div className="map-notice">
            <Navigation size={17} />
            <div>
              <strong>No GPS incidents available yet.</strong>
              <p>
                Report a new incident and select its location on the map to
                see its GPS marker here.
              </p>
            </div>
          </div>
        )}

        <p className="map-attribution-note">
          Map tiles © OpenStreetMap contributors. Incident markers use saved
          GPS coordinates.{" "}
          <a
            href="https://operations.osmfoundation.org/policies/tiles/"
            target="_blank"
            rel="noreferrer"
          >
            Tile usage policy
          </a>
        </p>
      </div>
    </section>
  );
}

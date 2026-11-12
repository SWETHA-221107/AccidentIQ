
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";
import { Plus, X, LoaderCircle, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:8080/api/incidents";

const initialForm = {
  title: "",
  location: "",
  severity: "MEDIUM",
  weatherCondition: "Clear",
  roadCondition: "Dry",
  latitude: null,
  longitude: null,
};

function LocationPicker({ latitude, longitude, onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: Number(event.latlng.lat.toFixed(7)),
        longitude: Number(event.latlng.lng.toFixed(7)),
      });
    },
  });

  if (latitude === null || longitude === null) {
    return null;
  }

  return (
    <CircleMarker
      center={[latitude, longitude]}
      radius={9}
      pathOptions={{
        color: "#ffffff",
        fillColor: "#ff5e62",
        fillOpacity: 1,
        weight: 3,
      }}
    />
  );
}

export default function CreateIncident({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleLocationSelect(coordinates) {
    setForm((current) => ({
      ...current,
      ...coordinates,
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.latitude === null || form.longitude === null) {
      setError("Please click on the map to select the accident location.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Could not save the incident.");
      }

      const createdIncident = await response.json();

      onCreated(createdIncident);
      setForm({ ...initialForm });
      setOpen(false);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that Spring Boot is running."
          : err.message
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="report-incident-btn"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        <Plus size={17} />
        Report Incident
      </button>

      {open && (
        <div
          className="incident-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setOpen(false);
            }
          }}
        >
          <section
            className="incident-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="incident-form-title"
          >
            <div className="incident-modal-header">
              <div>
                <p className="incident-eyebrow">ACCIDENTIQ / INCIDENTS</p>
                <h2 id="incident-form-title">Report an incident</h2>
                <p className="incident-subtitle">
                  Enter the details and select the exact location on the map.
                </p>
              </div>

              <button
                type="button"
                className="incident-close-btn"
                aria-label="Close form"
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="incident-form">
              <label>
                Incident title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Vehicle collision at junction"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Location name
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Anna Salai, Chennai"
                  maxLength={200}
                  required
                />
              </label>

              <div className="gps-picker-heading">
                <strong>
                  <MapPin size={16} /> Select accident location
                </strong>
                <span>Click anywhere on the map</span>
              </div>

              <div className="incident-location-map">
                <MapContainer
                  center={[13.0475, 80.2090]}
                  zoom={11}
                  scrollWheelZoom
                  className="incident-picker-map"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />

                  <LocationPicker
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onSelect={handleLocationSelect}
                  />
                </MapContainer>
              </div>

              {form.latitude !== null && form.longitude !== null ? (
                <div className="gps-coordinate-display">
                  <span>Selected GPS coordinates</span>
                  <strong>
                    {form.latitude}, {form.longitude}
                  </strong>
                </div>
              ) : (
                <p className="gps-instruction">
                  No location selected yet. Click on the map to place a marker.
                </p>
              )}

              <div className="incident-form-grid">
                <label>
                  Severity
                  <select
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </label>

                <label>
                  Weather
                  <select
                    name="weatherCondition"
                    value={form.weatherCondition}
                    onChange={handleChange}
                  >
                    <option>Clear</option>
                    <option>Rainy</option>
                    <option>Foggy</option>
                    <option>Cloudy</option>
                    <option>Unknown</option>
                  </select>
                </label>
              </div>

              <label>
                Road condition
                <select
                  name="roadCondition"
                  value={form.roadCondition}
                  onChange={handleChange}
                >
                  <option>Dry</option>
                  <option>Wet</option>
                  <option>Slippery</option>
                  <option>Damaged</option>
                  <option>Unknown</option>
                </select>
              </label>

              {error && (
                <p className="incident-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="incident-form-actions">
                <button
                  type="button"
                  className="incident-cancel-btn"
                  disabled={saving}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="incident-submit-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="incident-spinner" size={16} />
                      Saving...
                    </>
                  ) : (
                    "Save incident"
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

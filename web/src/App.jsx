
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CarFront,
  CheckCircle2,
  ChevronDown,
  Clock3,
  LayoutDashboard,
  Map as MapIcon,
  MapPin,
  Menu,
  Search,
  ShieldAlert,
  Siren,
  TrendingUp,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./App.css";
import CreateIncident from "./CreateIncident";
import MapView from "./MapView";
import RoadSafetyNews from "./RoadSafetyNews";

const API_URL = "http://localhost:8080/api/incidents";

const trendData = [
  { day: "Mon", incidents: 18 },
  { day: "Tue", incidents: 24 },
  { day: "Wed", incidents: 16 },
  { day: "Thu", incidents: 31 },
  { day: "Fri", incidents: 26 },
  { day: "Sat", incidents: 38 },
  { day: "Sun", incidents: 21 },
];

const severityData = [
  { name: "Critical", value: 12, color: "#ff5e62" },
  { name: "High", value: 24, color: "#ffad5c" },
  { name: "Medium", value: 38, color: "#f3d35c" },
  { name: "Low", value: 26, color: "#55c6a9" },
];

const initialIncidents = [
  {
    id: 1,
    title: "Multi-vehicle collision",
    location: "Anna Salai, Chennai",
    severity: "CRITICAL",
    status: "DISPATCHED",
    time: "10:42 AM",
  },
  {
    id: 2,
    title: "Two-wheeler accident",
    location: "OMR, Chennai",
    severity: "HIGH",
    status: "IN PROGRESS",
    time: "10:18 AM",
  },
  {
    id: 3,
    title: "Rear-end collision",
    location: "GST Road, Chennai",
    severity: "MEDIUM",
    status: "REPORTED",
    time: "09:56 AM",
  },
  {
    id: 4,
    title: "Single vehicle incident",
    location: "ECR, Chennai",
    severity: "LOW",
    status: "RESOLVED",
    time: "09:31 AM",
  },
];

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Analysis", icon: BarChart3 },
  { name: "Map", icon: MapIcon },
  { name: "News & Alerts", icon: Bell },
  { name: "Simulator", icon: Activity },
  { name: "Response Centre", icon: Siren },
];

function formatTime(date) {
  return date
    ? new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
}

function mapIncident(item) {
  return {
    id: item.id,
    title: item.title,
    location: item.location,
    severity: item.severity,
    status: item.status,
    latitude: item.latitude,
    longitude: item.longitude,
    time: formatTime(item.incidentDate),
  };
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [incidents, setIncidents] = useState(initialIncidents);
  const [apiStatus, setApiStatus] = useState("checking");
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [updatingIncidentId, setUpdatingIncidentId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("API request failed");
        }
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;

        setApiStatus("connected");
        setIncidents(data.map(mapIncident));
      })
      .catch(() => {
        if (!cancelled) {
          setApiStatus("offline");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredIncidents = incidents.filter((incident) =>
    `${incident.title} ${incident.location} ${incident.severity} ${incident.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const criticalCount = incidents.filter(
    (item) => item.severity?.toUpperCase() === "CRITICAL"
  ).length;

  const activeCount = incidents.filter((item) =>
    ["REPORTED", "DISPATCHED", "IN PROGRESS"].includes(
      item.status?.toUpperCase()
    )
  ).length;

  function exportCsv() {
    const header = ["ID", "Title", "Location", "Severity", "Status"];

    const rows = incidents.map((item) => [
      item.id,
      item.title,
      item.location,
      item.severity,
      item.status,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "accidentiq-incidents.csv";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleStatusChange(id, newStatus) {
    const incident = incidents.find((item) => item.id === id);

    if (
      !incident ||
      incident.status === newStatus ||
      updatingIncidentId !== null
    ) {
      return;
    }

    const previousStatus = incident.status;

    setUpdatingIncidentId(id);
    setStatusMessage("");
    setStatusError("");

    // Update the UI immediately while the API request is running.
    setIncidents((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    try {
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        let message = `Could not save status (HTTP ${response.status}).`;

        try {
          const errorBody = await response.json();
          if (errorBody.detail || errorBody.message) {
            message = errorBody.detail || errorBody.message;
          }
        } catch {
          // Keep the default error message if the response is not JSON.
        }

        throw new Error(message);
      }

      const savedIncident = await response.json();

      setIncidents((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: savedIncident.status }
            : item
        )
      );

      setStatusMessage(
        `Incident #${id} status saved as ${savedIncident.status}.`
      );
    } catch (error) {
      // Restore the previous status if the server rejects the update.
      setIncidents((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: previousStatus }
            : item
        )
      );

      setStatusError(
        error.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that Spring Boot is running."
          : error.message || "Failed to update incident status."
      );
    } finally {
      setUpdatingIncidentId(null);
    }
  }

  function handleIncidentCreated(createdIncident) {
    const newIncident = mapIncident(createdIncident);

    setIncidents((current) => [
      newIncident,
      ...current.filter((item) => item.id !== newIncident.id),
    ]);

    setApiStatus("connected");
    setStatusMessage("Incident reported and saved successfully.");
    setStatusError("");
  }

  const tableProps = {
    incidents: filteredIncidents,
    apiStatus,
    onStatusChange: handleStatusChange,
    updatingIncidentId,
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <ShieldAlert size={25} />
          </div>

          <div>
            <h1>
              Accident<span>IQ</span>
            </h1>
            <p>INTELLIGENT RESPONSE</p>
          </div>

          <button
            className="icon-button close-sidebar"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <div className="nav-caption">WORKSPACE</div>

        <nav className="nav-list">
          {navItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${
                activePage === name ? "active" : ""
              }`}
              onClick={() => {
                setActivePage(name);
                setSidebarOpen(false);
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === "Response Centre" && (
                <span className="nav-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-card">
            <div className="system-heading">
              <span className="live-dot" /> SYSTEM STATUS
            </div>

            <div className="system-row">
              <span>Backend API</span>
              <span
                className={
                  apiStatus === "connected"
                    ? "online"
                    : apiStatus === "offline"
                      ? "offline"
                      : ""
                }
              >
                {apiStatus === "connected"
                  ? "Online"
                  : apiStatus === "offline"
                    ? "Offline"
                    : "Checking"}
              </span>
            </div>

            <div className="system-row">
              <span>Response network</span>
              <span className="online">Demo</span>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">AI</div>
            <div className="profile-text">
              <strong>AccidentIQ Admin</strong>
              <span>Operations console</span>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>

            <div className="breadcrumb">
              Workspace <span>/</span> <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="live-status">
              <span className="live-dot" /> SYSTEM LIVE
            </div>

            <div className="top-date">
              <Clock3 size={15} /> Operations overview
            </div>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span />
            </button>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">
                <span /> ACCIDENT INTELLIGENCE PLATFORM
              </div>

              <h2>
                {activePage === "Dashboard"
                  ? "Good evening, Operator"
                  : activePage}
              </h2>

              <p>
                {activePage === "Dashboard"
                  ? "Here's what's happening across your incident network."
                  : `Monitor and explore your ${activePage.toLowerCase()} workspace.`}
              </p>
            </div>

            <div className="heading-actions">
              <CreateIncident onCreated={handleIncidentCreated} />

              <button className="primary-button" onClick={exportCsv}>
                <Activity size={17} /> Export incidents
              </button>
            </div>
          </section>

          {(statusMessage || statusError) && (
            <p
              className={`status-feedback ${
                statusError ? "error" : "success"
              }`}
              role={statusError ? "alert" : "status"}
            >
              {statusError || statusMessage}
            </p>
          )}

          {activePage === "Map" ? (
            <MapView incidents={incidents} apiStatus={apiStatus} />
          ) : activePage === "News & Alerts" ? (
  <RoadSafetyNews />
) : activePage === "Simulator" ? (
            <section className="panel simulator-panel">
              <div className="panel-heading">
                <div>
                  <h3>Accident scenario simulator</h3>
                  <p>
                    Configure a scenario for a demonstration severity estimate.
                  </p>
                </div>
                <span className="demo-badge">RULES-BASED DEMO</span>
              </div>

              <Simulator />
            </section>
          ) : (
            <>
              <section className="metrics-grid">
                <MetricCard
                  icon={CarFront}
                  label="Total incidents"
                  value={String(incidents.length)}
                  note="Records from your backend"
                  tone="amber"
                />

                <MetricCard
                  icon={AlertTriangle}
                  label="Critical incidents"
                  value={String(criticalCount)}
                  note="Currently in loaded records"
                  tone="red"
                />

                <MetricCard
                  icon={Siren}
                  label="Active responses"
                  value={String(activeCount)}
                  note="Reported or being handled"
                  tone="blue"
                />

                <MetricCard
                  icon={CheckCircle2}
                  label="API connection"
                  value={
                    apiStatus === "connected"
                      ? "Online"
                      : apiStatus === "offline"
                        ? "Offline"
                        : "Checking"
                  }
                  note="Spring Boot · Port 8080"
                  tone="green"
                />
              </section>

              {activePage === "Dashboard" ? (
                <>
                  <section className="charts-grid">
                    <div className="panel trend-panel">
                      <div className="panel-heading">
                        <div>
                          <h3>Incident activity</h3>
                          <p>Illustrative weekly trend · sample data</p>
                        </div>
                        <span className="chart-legend">
                          <i /> Incidents
                        </span>
                      </div>

                      <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={trendData}
                            margin={{
                              top: 12,
                              right: 8,
                              left: -18,
                              bottom: 0,
                            }}
                          >
                            <defs>
                              <linearGradient
                                id="trendFill"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#f4bd4f"
                                  stopOpacity={0.28}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#f4bd4f"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>

                            <CartesianGrid
                              stroke="#27303c"
                              strokeDasharray="4 5"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="day"
                              stroke="#778293"
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#778293"
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#151c26",
                                border: "1px solid #303b49",
                                borderRadius: 10,
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="incidents"
                              stroke="#f4bd4f"
                              strokeWidth={2.5}
                              fill="url(#trendFill)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="panel severity-panel">
                      <div className="panel-heading">
                        <div>
                          <h3>Severity distribution</h3>
                          <p>Illustrative breakdown · sample data</p>
                        </div>
                        <button
                          className="subtle-button"
                          onClick={() => setActivePage("Analysis")}
                        >
                          Details <TrendingUp size={14} />
                        </button>
                      </div>

                      <div className="severity-content">
                        <div className="donut-wrap">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={severityData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={57}
                                outerRadius={78}
                                paddingAngle={4}
                                stroke="none"
                              >
                                {severityData.map((entry) => (
                                  <Cell
                                    key={entry.name}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  background: "#151c26",
                                  border: "1px solid #303b49",
                                  borderRadius: 10,
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>

                          <div className="donut-center">
                            <strong>100%</strong>
                            <span>Sample</span>
                          </div>
                        </div>

                        <div className="severity-legend">
                          {severityData.map((item) => (
                            <div
                              className="severity-legend-row"
                              key={item.name}
                            >
                              <span className="legend-label">
                                <i style={{ background: item.color }} />
                                {item.name}
                              </span>
                              <strong>{item.value}%</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="panel">
                    <div className="panel-heading incident-heading">
                      <div>
                        <h3>Recent incidents</h3>
                        <p>Reports returned by the AccidentIQ API</p>
                      </div>

                      <div className="table-actions">
                        <label className="search-box">
                          <Search size={16} />
                          <input
                            value={search}
                            onChange={(event) =>
                              setSearch(event.target.value)
                            }
                            placeholder="Search incidents..."
                          />
                        </label>

                        <button
                          className="subtle-button"
                          onClick={exportCsv}
                        >
                          Export CSV
                        </button>
                      </div>
                    </div>

                    <IncidentTable {...tableProps} />
                  </section>
                </>
              ) : activePage === "Analysis" ? (
                <>
                  <section className="charts-grid">
                    <div className="panel">
                      <div className="panel-heading">
                        <div>
                          <h3>Weekly incident trend</h3>
                          <p>Sample data for layout demonstration</p>
                        </div>
                      </div>

                      <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={trendData}>
                            <CartesianGrid
                              stroke="#27303c"
                              strokeDasharray="4 5"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="day"
                              stroke="#778293"
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#778293"
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "#151c26",
                                border: "1px solid #303b49",
                                borderRadius: 10,
                              }}
                            />
                            <Bar
                              dataKey="incidents"
                              fill="#f4bd4f"
                              radius={[5, 5, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="panel">
                      <div className="panel-heading">
                        <div>
                          <h3>Severity mix</h3>
                          <p>Sample distribution, not live statistics</p>
                        </div>
                      </div>

                      <div className="analysis-severity">
                        {severityData.map((item) => (
                          <div
                            key={item.name}
                            className="severity-bar-row"
                          >
                            <div>
                              <span>{item.name}</span>
                              <strong>{item.value}%</strong>
                            </div>
                            <div className="bar-track">
                              <span
                                style={{
                                  width: `${item.value}%`,
                                  background: item.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="panel insights-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Data overview</h3>
                        <p>
                          Based on the records currently stored in your database
                        </p>
                      </div>
                    </div>

                    <div className="insights-grid">
                      <div>
                        <span>Loaded incidents</span>
                        <strong>{incidents.length}</strong>
                      </div>
                      <div>
                        <span>Critical records</span>
                        <strong>{criticalCount}</strong>
                      </div>
                      <div>
                        <span>Active records</span>
                        <strong>{activeCount}</strong>
                      </div>
                    </div>

                    <p className="notice">
                      <Activity size={16} /> The weekly trend and severity
                      distribution are illustrative sample data. Analysis of
                      real stored records will be added next.
                    </p>
                  </section>

                  <section className="panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Incident records</h3>
                        <p>Search and export your stored records</p>
                      </div>

                      <label className="search-box">
                        <Search size={16} />
                        <input
                          value={search}
                          onChange={(event) =>
                            setSearch(event.target.value)
                          }
                          placeholder="Search incidents..."
                        />
                      </label>
                    </div>

                    <IncidentTable {...tableProps} />
                  </section>
                </>
              ) : (
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Response queue</h3>
                      <p>
                        Update incident statuses here. Actual emergency
                        dispatch is not connected.
                      </p>
                    </div>
                    <span className="demo-badge">DISPATCH DEMO</span>
                  </div>

                  <IncidentTable {...tableProps} />
                </section>
              )}
            </>
          )}

          <footer className="footer">
            <span>
              ACCIDENTIQ <span>v0.1.0</span>
            </span>
            <span>
              <span className="live-dot" /> Backend{" "}
              {apiStatus === "connected"
                ? "connected"
                : apiStatus === "offline"
                  ? "disconnected"
                  : "checking"}
            </span>
            <span>For project demonstration only</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, note, tone }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <Icon size={20} />
      </div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{note}</span>
    </div>
  );
}

function IncidentTable({
  incidents,
  apiStatus,
  onStatusChange,
  updatingIncidentId,
}) {
  if (apiStatus === "offline") {
    return (
      <div className="empty-state">
        <AlertTriangle size={25} />
        <strong>Backend unavailable</strong>
        <p>Start Spring Boot on port 8080 and refresh the page.</p>
      </div>
    );
  }

  if (apiStatus === "checking") {
    return (
      <div className="empty-state">
        <Activity size={25} />
        <strong>Connecting to backend...</strong>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="empty-state">
        <CarFront size={25} />
        <strong>No incidents found</strong>
        <p>Create an incident to see it here.</p>
      </div>
    );
  }

  const statuses = [
    "REPORTED",
    "DISPATCHED",
    "IN PROGRESS",
    "RESOLVED",
  ];

  return (
    <div className="table-scroll">
      <table className="incident-table">
        <thead>
          <tr>
            <th>INCIDENT</th>
            <th>LOCATION</th>
            <th>SEVERITY</th>
            <th>STATUS</th>
            <th>TIME</th>
          </tr>
        </thead>

        <tbody>
          {incidents.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="incident-title">
                  <span className="incident-id">
                    #{String(item.id).padStart(3, "0")}
                  </span>
                  <strong>{item.title}</strong>
                </div>
              </td>

              <td>
                <span className="location-cell">
                  <MapPin size={14} />
                  {item.location}
                </span>
              </td>

              <td>
                <span
                  className={`severity-badge ${item.severity?.toLowerCase()}`}
                >
                  {item.severity}
                </span>
              </td>

              <td>
                <select
                  className={`status-select status-badge ${item.status
                    ?.toLowerCase()
                    .replaceAll(" ", "-")}`}
                  value={item.status}
                  disabled={updatingIncidentId === item.id}
                  aria-label={`Update status for incident ${item.id}`}
                  onChange={(event) =>
                    onStatusChange(item.id, event.target.value)
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {updatingIncidentId === item.id && (
                  <span className="status-saving">Saving...</span>
                )}
              </td>

              <td className="time-cell">{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Simulator() {
  const [speed, setSpeed] = useState(60);
  const [vehicles, setVehicles] = useState("2");
  const [weather, setWeather] = useState("Clear");
  const [road, setRoad] = useState("Dry");
  const [impact, setImpact] = useState("Front");
  const [result, setResult] = useState(null);

  function simulate(event) {
    event.preventDefault();

    let score =
      10 +
      Math.max(0, speed - 30) * 0.7 +
      (Number(vehicles) - 1) * 12;

    if (weather !== "Clear") score += 10;
    if (road !== "Dry") score += 12;
    if (impact === "Side") score += 10;
    if (impact === "Rollover") score += 25;

    score = Math.min(100, Math.round(score));

    setResult({
      score,
      severity:
        score >= 70
          ? "CRITICAL"
          : score >= 48
            ? "HIGH"
            : score >= 25
              ? "MEDIUM"
              : "LOW",
    });
  }

  return (
    <form className="simulator-form" onSubmit={simulate}>
      <div className="simulator-fields">
        <label>
          Impact speed <strong>{speed} km/h</strong>
          <input
            type="range"
            min="0"
            max="160"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
        </label>

        <label>
          Vehicles involved
          <select
            value={vehicles}
            onChange={(event) => setVehicles(event.target.value)}
          >
            <option value="1">1 vehicle</option>
            <option value="2">2 vehicles</option>
            <option value="3">3 vehicles</option>
            <option value="4">4+ vehicles</option>
          </select>
        </label>

        <label>
          Weather condition
          <select
            value={weather}
            onChange={(event) => setWeather(event.target.value)}
          >
            <option>Clear</option>
            <option>Rain</option>
            <option>Fog</option>
            <option>Heavy rain</option>
          </select>
        </label>

        <label>
          Road condition
          <select
            value={road}
            onChange={(event) => setRoad(event.target.value)}
          >
            <option>Dry</option>
            <option>Wet</option>
            <option>Slippery</option>
            <option>Damaged</option>
          </select>
        </label>

        <label>
          Impact type
          <select
            value={impact}
            onChange={(event) => setImpact(event.target.value)}
          >
            <option>Front</option>
            <option>Side</option>
            <option>Rollover</option>
          </select>
        </label>
      </div>

      <button className="primary-button" type="submit">
        <Activity size={17} /> Run simulation
      </button>

      {result && (
        <div className="simulation-result">
          <div className="result-score">
            <span>Estimated severity score</span>
            <strong>
              {result.score}
              <small>/100</small>
            </strong>
            <div className="score-track">
              <span style={{ width: `${result.score}%` }} />
            </div>
          </div>

          <div className="result-severity">
            <span>Estimated category</span>
            <strong
              className={`severity-badge ${result.severity.toLowerCase()}`}
            >
              {result.severity}
            </strong>
            <p>
              Rule-based educational estimate, not a validated medical or
              emergency prediction.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}

export default App;

# AccidentIQ 🚨
### Smart Accident Reporting and Emergency Response Management System

AccidentIQ is a web-based accident reporting and monitoring platform designed to help users report road accidents, visualize incident locations, monitor accident statistics, and access road safety news.

The platform combines a Java Spring Boot backend, MySQL database, and React frontend to provide a centralized system for accident management and awareness.

## ✨ Features

- **Accident Reporting:** Create and submit accident reports with relevant incident details.
- **GPS Location Mapping:** Select the accident location on an interactive map and save its latitude and longitude.
- **Interactive Accident Map:** Visualize reported incidents using real GPS coordinates.
- **Incident Management:** View reported accidents and update their statuses.
- **Dashboard:** Monitor accident information through a centralized dashboard.
- **Analysis:** Explore accident-related information and statistics.
- **Response Centre:** Access the incident response interface.
- **Road Safety News:** View recent road safety and accident-related news articles.
- **News Search and Refresh:** Search articles and refresh the latest available news.

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React.js, JavaScript, Vite |
| Backend | Java, Spring Boot |
| Database | MySQL |
| Database Migration | Flyway |
| ORM | Spring Data JPA, Hibernate |
| Maps | Leaflet, OpenStreetMap |
| News Integration | Google News RSS |
| Version Control | Git and GitHub |

## 📁 Project Structure

```text
AccidentIQ/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/accidentiq/backend/
│   │   │   │   ├── controller/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   ├── dto/
│   │   │   │   ├── BackendApplication.java
│   │   │   │   └── Incident.java
│   │   │   └── resources/
│   │   │       ├── db/migration/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── web/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── CreateIncident.jsx
│   │   ├── MapView.jsx
│   │   ├── RoadSafetyNews.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

## ⚙️ Prerequisites

Install the following before running the project:

- Java 21 or later
- Apache Maven
- Node.js and npm
- MySQL 8 or later
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SWETHA-221107/AccidentIQ.git
cd AccidentIQ
```

### 2. Configure MySQL

Create the database:

```sql
CREATE DATABASE accidentiq;
```

Make sure your MySQL database has a user named `accidentiq_app` with permission to access the database.

### 3. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Set your MySQL password as an environment variable in PowerShell:

```powershell
$env:DB_PASSWORD="your_mysql_password"
```

The backend reads its database configuration from `application.properties`.

### 4. Run the Backend

```bash
mvn spring-boot:run
```

Backend runs at:

`http://localhost:8080`

Health check:

`http://localhost:8080/actuator/health`

Flyway automatically manages database migrations when the backend starts.

### 5. Run the Frontend

Open another terminal:

```bash
cd AccidentIQ/web
npm install
npm run dev
```

Frontend runs at:

`http://localhost:5173`

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/actuator/health` | Check backend health |
| GET | `/api/incidents` | Retrieve incidents |
| POST | `/api/incidents` | Create an incident |
| PATCH | `/api/incidents/{id}/status` | Update incident status |
| GET | `/api/news/road-safety` | Retrieve road safety news |

## 🗺️ GPS Mapping

AccidentIQ uses Leaflet and OpenStreetMap to display incident locations.

Users can select a location on the map while creating an accident report. The selected latitude and longitude are stored in MySQL and used to display the corresponding incident marker.

## 📰 Road Safety News

The news module retrieves accident-related and road safety articles through Google News RSS.

Users can browse articles, search for news, refresh results, and open the original publisher's article.

**Note:** News articles are informational and are not verified emergency alerts or official live traffic updates.

## 📸 Screenshots

Screenshots of the following modules can be added here:

- Dashboard
- Create Incident / GPS Location Picker
- Accident Map
- Analysis
- Response Centre
- News & Alerts

Place your screenshots inside a `docs/screenshots/` folder and link them here.

## 🔮 Future Enhancements

- Real-time accident notifications.
- Emergency service integration.
- Accident hotspot analysis.
- Advanced analytics and visualization.
- User authentication and role-based access.
- Improved emergency response coordination.

## 👩‍💻 Author

**Swetha Muthukumar**

GitHub: [SWETHA-221107](https://github.com/SWETHA-221107)

## 📄 License

This project is currently available for educational and academic purposes.
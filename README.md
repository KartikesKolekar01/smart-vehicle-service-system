
# 🚗 Smart Vehicle Service & Maintenance System

A production-grade **microservices-based** vehicle service management platform built with **Spring Boot**, **Spring Cloud**, **MySQL**, and **React**. It enables customers to book services, admins to manage the entire workflow, and mechanics to track tasks — all through a beautiful, modern web interface.

---

## 📌 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Microservices](#-microservices)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Security](#-security)
- [Author](#-author)
- [License](#-license)

---

## ✨ Features

### 👤 Customer
- Register & Login with JWT authentication
- Add / Update / Delete vehicles
- Book service appointments
- Track service status in real-time
- View assigned mechanic details
- Receive automatic notifications (booking, assignment, completion)
- View and pay service bills
- Request refunds
- Full service history

### 👨‍💼 Admin
- Manage all appointments (assign mechanics, update statuses)
- Manage mechanics (add, update, delete)
- Manage spare parts inventory (with low-stock alerts)
- Generate and send bills to customers
- Process refunds
- View comprehensive reports

### 🔧 Mechanic
- View assigned tasks
- Update availability (AVAILABLE / BUSY / ON_LEAVE)
- Update service progress

### 🔔 Notifications
- Automatic in-app notifications for:
  - Appointment booked
  - Mechanic assigned
  - Service started / completed
  - Bill generated
  - Payment received
  - Refund processed
- Unread count badge in navbar
- Mark as read / Delete

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                        │
│                  (Vite + Tailwind CSS)                   │
│                  http://localhost:3001                   │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTP (JWT Auth)
                            ▼
┌──────────────────────────────────────────────────────────┐
│               API GATEWAY (Spring Cloud)                 │
│                  http://localhost:8083                   │
│         JWT Validation + Routing + CORS                  │
└───────────────────────────┬──────────────────────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ AUTH SERVICE  │  │VEHICLE SERVICE│  │  MECHANIC     │
│   port 8081   │  │   port 8082   │  │   SERVICE     │
│   auth_db     │  │  vehicle_db   │  │   port 8084   │
└───────────────┘  └───────────────┘  │  mechanic_db  │
                                       └───────────────┘
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ APPOINTMENT   │  │  SPARE-PARTS  │  │    BILLING    │
│   SERVICE     │  │    SERVICE    │  │    SERVICE    │
│   port 8085   │  │   port 8086   │  │   port 8087   │
│appointment_db │  │  sparepart_db │  │  billing_db   │
└───────────────┘  └───────────────┘  └───────────────┘
                            │
                            ▼
                   ┌───────────────┐
                   │ NOTIFICATION  │
                   │   SERVICE     │
                   │   port 8088   │
                   │notification_db│
                   └───────────────┘

        ┌─────────────────────────────┐
        │    EUREKA SERVER (8762)     │
        │   Service Discovery Registry│
        └─────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
| :--- | :--- |
| **Java 17** | Programming language |
| **Spring Boot 3.5.3** | Microservice framework |
| **Spring Cloud 2025.0.0** | Eureka, Gateway, OpenFeign |
| **Spring Security** | Authentication & Authorization |
| **JWT (JJWT 0.12.6)** | Stateless authentication |
| **Spring Data JPA** | ORM layer |
| **MySQL 8** | Database per service |
| **Maven** | Build tool |
| **Lombok** | Boilerplate reduction |

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI library |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling with dark mode |
| **React Router** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **React Hot Toast** | Notifications |
| **Lucide React** | Icons |

### DevOps (Optional)
- **Docker** & **Docker Compose** — Containerization

---

## 🧩 Microservices

| # | Service | Port | Database | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Eureka Server** | 8762 | — | Service discovery / registry |
| 2 | **API Gateway** | 8083 | — | Single entry point, JWT validation, routing, CORS |
| 3 | **Auth Service** | 8081 | `auth_db` | Registration, login, JWT, role management |
| 4 | **Vehicle Service** | 8082 | `vehicle_db` | Vehicle CRUD, service-due detection |
| 5 | **Mechanic Service** | 8084 | `mechanic_db` | Mechanic management, availability, specialization |
| 6 | **Appointment Service** | 8085 | `appointment_db` | Booking, status workflow, mechanic assignment |
| 7 | **Spare-Parts Service** | 8086 | `sparepart_db` | Inventory, low-stock alerts |
| 8 | **Billing Service** | 8087 | `billing_db` | Bills, payments, refunds, validation |
| 9 | **Notification Service** | 8088 | `notification_db` | In-app notifications |

---

## 📁 Project Structure

```
vehicle-service-center/
│
├── pom.xml                          # Parent POM
├── .gitignore
├── README.md
│
├── eureka-server/                   # Service discovery
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/eureka_server/
│       └── resources/application.properties
│
├── api-gateway/                     # Gateway
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/api_gateway/
│       │   ├── ApiGatewayApplication.java
│       │   ├── config/CorsConfig.java
│       │   ├── filter/JwtAuthenticationFilter.java
│       │   └── util/JwtUtil.java
│       └── resources/application.properties
│
├── auth-service/                    # Authentication
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/auth_service/
│       │   ├── config/
│       │   ├── controller/
│       │   ├── dto/
│       │   ├── entity/
│       │   ├── exception/
│       │   ├── repository/
│       │   ├── security/
│       │   └── service/
│       └── resources/application.properties
│
├── vehicle-service/                 # Vehicles
│   └── src/main/java/com/example/vehicle_service/...
│
├── mechanic-service/                # Mechanics
│   └── src/main/java/com/example/mechanic_service/...
│
├── appointment-service/             # Appointments
│   └── src/main/java/com/example/appointment_service/...
│
├── spare-parts-service/             # Inventory
│   └── src/main/java/com/example/spare_parts_service/...
│
├── billing-service/                 # Payments
│   └── src/main/java/com/example/billing_service/...
│
├── notification-service/            # Notifications
│   └── src/main/java/com/example/notification_service/...
│
└── frontend/                        # React app
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- ☕ **Java 17** ([Download](https://adoptium.net/))
- 📦 **Maven 3.8+** ([Download](https://maven.apache.org/))
- 🗄️ **MySQL 8** ([Download](https://dev.mysql.com/downloads/))
- 🟢 **Node.js 18+** & **npm** ([Download](https://nodejs.org/))
- 💡 **IntelliJ IDEA** (or any Java IDE) & **VS Code**
- 🔧 **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/KartikesKolekar01/vehicle-service-center.git
cd vehicle-service-center
```

### Step 2: Setup MySQL Databases

Open **MySQL Workbench** and run:

```sql
CREATE DATABASE auth_db;
CREATE DATABASE vehicle_db;
CREATE DATABASE mechanic_db;
CREATE DATABASE appointment_db;
CREATE DATABASE sparepart_db;
CREATE DATABASE billing_db;
CREATE DATABASE notification_db;
```

### Step 3: Configure Database Credentials

In each service's `application.properties`, update:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Files to update:
- `auth-service/src/main/resources/application.properties`
- `vehicle-service/src/main/resources/application.properties`
- `mechanic-service/src/main/resources/application.properties`
- `appointment-service/src/main/resources/application.properties`
- `spare-parts-service/src/main/resources/application.properties`
- `billing-service/src/main/resources/application.properties`
- `notification-service/src/main/resources/application.properties`

### Step 4: Build All Services

From project root:

```bash
mvn clean install -DskipTests
```

### Step 5: Start Services in Order

**Open a terminal for each** (or run from IntelliJ):

| Order | Service | Command | Wait Until |
| :--- | :--- | :--- | :--- |
| 1 | Eureka Server | `cd eureka-server && mvn spring-boot:run` | `Started EurekaServerApplication` |
| 2 | Auth Service | `cd auth-service && mvn spring-boot:run` | `Started AuthServiceApplication` |
| 3 | API Gateway | `cd api-gateway && mvn spring-boot:run` | `Netty started on port 8083` |
| 4 | Vehicle Service | `cd vehicle-service && mvn spring-boot:run` | `Started VehicleServiceApplication` |
| 5 | Mechanic Service | `cd mechanic-service && mvn spring-boot:run` | Started |
| 6 | Appointment Service | `cd appointment-service && mvn spring-boot:run` | Started |
| 7 | Spare-Parts Service | `cd spare-parts-service && mvn spring-boot:run` | Started |
| 8 | Billing Service | `cd billing-service && mvn spring-boot:run` | Started |
| 9 | Notification Service | `cd notification-service && mvn spring-boot:run` | Started |

**Verify:** Open http://localhost:8762 — you should see **8 services UP** in the Eureka dashboard.

### Step 6: Run Frontend

```bash
cd frontend
npm install
npm run dev
```

**Open:** http://localhost:3001

### Step 7: Register & Login

1. Click **Register** → create an account
2. Login with your credentials
3. Start booking services!

---

## 📡 API Endpoints

**Base URL:** `http://localhost:8083` (Gateway)

### 🔐 Auth Service (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get profile |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### 🚗 Vehicle Service (`/api/vehicles`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/vehicles` | Add vehicle |
| GET | `/api/vehicles` | Get my vehicles |
| GET | `/api/vehicles/{id}` | Get by ID |
| PUT | `/api/vehicles/{id}` | Update |
| PATCH | `/api/vehicles/{id}/km` | Update KM |
| DELETE | `/api/vehicles/{id}` | Delete |
| GET | `/api/vehicles/service-due` | Service-due vehicles |

### 🔧 Mechanic Service (`/api/mechanics`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/mechanics` | Add (Admin) |
| GET | `/api/mechanics` | Get all |
| GET | `/api/mechanics/available` | Available only |
| GET | `/api/mechanics/specialization/{spec}` | By specialization |
| PUT | `/api/mechanics/{id}` | Update |
| PATCH | `/api/mechanics/{id}/availability` | Update status |
| DELETE | `/api/mechanics/{id}` | Delete |

### 📅 Appointment Service (`/api/appointments`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/appointments` | Book |
| GET | `/api/appointments` | My appointments |
| GET | `/api/appointments/{id}` | Get by ID |
| PATCH | `/api/appointments/{id}/assign` | Assign mechanic |
| PATCH | `/api/appointments/{id}/status` | Update status |
| PATCH | `/api/appointments/{id}/cancel` | Cancel |

### 📦 Spare-Parts Service (`/api/parts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/parts` | Add part |
| GET | `/api/parts` | Get all |
| GET | `/api/parts/low-stock` | Low-stock parts |
| PUT | `/api/parts/{id}` | Update |
| PATCH | `/api/parts/{id}/stock` | Update stock |
| DELETE | `/api/parts/{id}` | Delete |

### 💰 Billing Service (`/api/payments`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/payments/bill` | Admin sends bill |
| POST | `/api/payments/{id}/pay` | Customer pays bill |
| GET | `/api/payments` | My payments |
| GET | `/api/payments/{id}` | Get by ID |
| POST | `/api/payments/{id}/refund` | Refund (Admin) |

### 🔔 Notification Service (`/api/notifications`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/notifications` | My notifications |
| GET | `/api/notifications/unread` | Unread only |
| GET | `/api/notifications/unread/count` | Unread count |
| PATCH | `/api/notifications/{id}/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/{id}` | Delete |

---

## 🗄️ Database Schema

Each service has its own **MySQL database** (Database-per-Service pattern):

| Service | Database | Main Tables |
| :--- | :--- | :--- |
| Auth | `auth_db` | `users`, `password_reset_tokens` |
| Vehicle | `vehicle_db` | `vehicles` |
| Mechanic | `mechanic_db` | `mechanics` |
| Appointment | `appointment_db` | `appointments` |
| Spare Parts | `sparepart_db` | `spare_parts` |
| Billing | `billing_db` | `payments` |
| Notification | `notification_db` | `notifications` |

---

## 📸 Screenshots

### 🔐 Login Page
![Login](./screenshots/login.png)

### 📊 Customer Dashboard
![Dashboard](./screenshots/dashboard.png)

### 🚗 My Vehicles
![Vehicles](./screenshots/vehicles.png)

### 📅 Appointments (with Bill Pending)
![Appointments](./screenshots/appointments.png)

### 👨‍💼 Admin Appointments
![Admin Appointments](./screenshots/admin-appointments.png)

### 🔧 Mechanics Management
![Mechanics](./screenshots/mechanics.p
## 🔒 Security

- **JWT-based authentication** — Access token (15 min) + Refresh token (7 days)
- **Role-Based Access Control (RBAC)** — CUSTOMER, MECHANIC, ADMIN
- **Password encryption** — BCrypt with strength 12
- **Password reset** — Token-based with 15-min expiry, one-time use
- **Gateway-level JWT validation** — Protects all downstream services
- **CORS configuration** — Whitelisted origins only
- **Input validation** — Jakarta Bean Validation on all DTOs
- **SQL injection prevention** — Spring Data JPA
- **Secrets via environment variables** — (in production)

---

## 🎯 Key Highlights

✅ **8 independent microservices** with single responsibility  
✅ **Eureka service discovery** for dynamic service lookup  
✅ **API Gateway** as single entry point  
✅ **OpenFeign** for inter-service communication  
✅ **Database-per-Service** pattern  
✅ **JWT dual-token strategy** (access + refresh)  
✅ **Role-based access** on both backend and frontend  
✅ **Automatic notifications** via Feign calls  
✅ **Payment validation** with 8-layer checks  
✅ **Low-stock alerts** for inventory  
✅ **Forgot password flow** with token verification  
✅ **Dark mode** in frontend  
✅ **Search & filters** on all list pages  
✅ **Responsive UI** with Tailwind CSS  

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👤 Author

**Kartikesh Kolekar**
- GitHub: [@KartikesKolekar01](https://github.com/KartikesKolekar01)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)
- Email: your-email@example.com

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Spring Boot & Spring Cloud documentation
- React & Vite communities
- Tailwind CSS
- Special thanks to all contributors

---

## 📈 Project Stats

- **9 Services** (8 business + 1 registry)
- **~60 API Endpoints**
- **7 MySQL Databases**
- **50+ Java classes**
- **30+ React components**
- **Built with ❤️ in India**

---

⭐ **If you find this project helpful, please give it a star!** ⭐
```

---

## 🎯 How to Use This README

### Step 1: Create the File

**In VS Code:**
- Right-click `vehicle-service-center` (root)
- **New File** → name: `README.md`
- **Paste** all the content above
- **Save** (Ctrl + S)

### Step 2: Push to GitHub

**In PowerShell:**

```powershell
cd C:\Users\HP\Desktop\vehicle-service-center

git add README.md
git commit -m "Add comprehensive README"
git push origin main
```

### Step 3: Verify

Refresh GitHub → you'll see the README rendered beautifully on the repo homepage.

---

## 📸 Optional: Add Screenshots Folder

**Create `screenshots/` folder:**

1. Take screenshots of each page
2. Save with the exact names in the README (`login.png`, `dashboard.png`, etc.)
3. Put them inside `screenshots/` at root
4. Push them:

```powershell
mkdir screenshots
# Copy your screenshot files here
git add screenshots/
git commit -m "Add screenshots"
git push origin main
```

---

## 🎯 Do This Now

1. **Create `README.md`** at root
2. **Paste the content** above
3. **Update:**
   - Your GitHub username (search for `KartikesKolekar01`)
   - LinkedIn URL
   - Email
4. **Push** to GitHub
5. **Refresh** the repo page

**Reply with:**
- ✅ "README added" → send the repo link
- ❌ Error → paste it

**Let me know!**

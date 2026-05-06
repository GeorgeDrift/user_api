

A RESTful API built with Node.js and Express that fetches user data from an external source, stores it in a normalized MySQL database, and provides endpoints for managing and filtering users.

## 🚀 Features

- **Normalization**: Data is organized into 3 relational tables: `users`, `addresses`, and `companies`.
- **Data Synchronization**: Automated fetch and upsert from JSONPlaceholder with full transaction support.
- **RESTful Endpoints**: Complete CRUD operations for user management.
- **Advanced Filtering**: Search users by name, city, or company using SQL JOINs.
- **Security**: Protected by HTTP Basic Authentication with timing-safe comparison.

---

## 🛠️ Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** (XAMPP/WAMP or Standalone)
- **npm**

---

## ⚙️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Log into your MySQL instance phpMyAdmin .
2. Run the provided schema file copy and press create new database and go to sql tab and paste the schema.sql or the users.sql whic was exported content by copying it and pasting it  to create the database and the 3 normalized tables:

DROP DATABASE IF EXISTS userapi;

CREATE DATABASE userapi
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE userapi;

-- 1. USERS
CREATE TABLE users (
  id            INT            NOT NULL,
  name          VARCHAR(255)   NOT NULL,
  username      VARCHAR(100)   NOT NULL,
  email         VARCHAR(255)   NOT NULL,
  phone         VARCHAR(50)    DEFAULT NULL,
  website       VARCHAR(255)   DEFAULT NULL,
  imported_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 2. ADDRESSES
CREATE TABLE addresses (
  user_id       INT            NOT NULL,
  street        VARCHAR(255)   DEFAULT NULL,
  suite         VARCHAR(100)   DEFAULT NULL,
  city          VARCHAR(100)   DEFAULT NULL,
  zipcode       VARCHAR(20)    DEFAULT NULL,
  geo_lat       VARCHAR(20)    DEFAULT NULL,
  geo_lng       VARCHAR(20)    DEFAULT NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. COMPANIES
CREATE TABLE companies (
  user_id       INT            NOT NULL,
  name          VARCHAR(255)   DEFAULT NULL,
  catch_phrase  VARCHAR(255)   DEFAULT NULL,
  bs            VARCHAR(255)   DEFAULT NULL,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_company_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

 
   *OR copy the content of `sql/schema.sql` and paste it into the SQL tab of phpMyAdmin.*

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=userapi

API_USER=admin
API_PASS=secret123

PORT=3000
```

---

## 🏃 Running the Application

### Start the Server
```bash
npm run dev
```

#### THE COMMAND ON HOW TO RUN THE API IS IN THE IN STRUCTION.MD OR DOWN B


### Import Data (First Time)
To fetch the users from the external API and save them to your database, run this command in a new terminal:
```bash
curl.exe -X POST http://localhost:3000/api/import -u admin:secret123
```

---

#### API ENDPOINTS FOR POST MAN AND POWER SHELL OR TERMINAL


# API Testing Instructions

This document contains the commands to test all points of the practical test.



---

## 📥 Point 3: Import Endpoint
Fetches data from the external API and stores it in the DB.

### PowerShell
```powershell
curl.exe -X POST http://localhost:3000/api/import -u admin:secret123
```

### Postman
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/import`
- **Auth**: Basic Auth (User: `admin`, Pass: `secret123`)

---

## 🔍 Point 4: User Endpoints
Retrieve or delete specific users.

### PowerShell
```powershell
# Get All Users
curl.exe http://localhost:3000/api/users -u admin:secret123

# Get Single User (ID 1)
curl.exe http://localhost:3000/api/users/1 -u admin:secret123

# Delete User (ID 1)
curl.exe -X DELETE http://localhost:3000/api/users/1 -u admin:secret123
```

### Postman
- **Method**: `GET` (for list/single) or `DELETE` (for delete)
- **URL**: `http://localhost:3000/api/users` or `http://localhost:3000/api/users/1`
- **Auth**: Basic Auth

---

## 📂 Point 5: Filter and Search
Advanced filtering across tables.

### PowerShell
```powershell
# Filter by Name
curl.exe "http://localhost:3000/api/users?name=Clem" -u admin:secret123

# Filter by City
curl.exe "http://localhost:3000/api/users?city=Gwenborough" -u admin:secret123

# Combined Filter (Name + City)
curl.exe "http://localhost:3000/api/users?name=Leanne&city=Gwenborough" -u admin:secret123
```

### Postman
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/users`
- **Params Tab**: Add keys for `name`, `city`, or `company`.
- **Auth**: Basic Auth

---

## 🔐 Point 6: Secure API
`curl.exe "http://localhost:3000/api/users?name=Clem"`
- All endpoints (except `/health`) require Basic Authentication.
- Unauthorized requests (wrong password or no password) will return **401 Unauthorized**.





## 🔌 API Endpoints

All endpoints (except `/health`) require **Basic Auth** (`admin` / `secret123`).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/import` | Sync users from external API to local DB |
| `GET` | `/api/users` | List all users (supports `name`, `city`, `company` filters) |
| `GET` | `/api/users/:id` | Get a specific user by ID |
| `DELETE` | `/api/users/:id` | Remove a user and their associated data |

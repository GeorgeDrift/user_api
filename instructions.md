# API Testing Instructions

This document contains the commands to test all points of the practical test.

---

## 🛠️ Database Setup 
Run this once to create the 3 normalized tables.

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

```

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
- All endpoints (except `/health`) require Basic Authentication.
- Unauthorized requests (wrong password or no password) will return **401 Unauthorized**.

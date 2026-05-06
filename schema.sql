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

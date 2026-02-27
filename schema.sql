-- ============================================================
-- Fit N Fresh — MySQL Database Schema
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS fit_n_fresh
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fit_n_fresh;

-- ─── Users ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)      NOT NULL,
  email         VARCHAR(255)      NOT NULL,
  password_hash VARCHAR(255)      NOT NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Addresses ───────────────────────────────────────────────────────────────

CREATE TABLE addresses (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED  NOT NULL,
  name       VARCHAR(100)  NOT NULL,
  line1      VARCHAR(255)  NOT NULL,
  line2      VARCHAR(255)          DEFAULT NULL,
  city       VARCHAR(100)  NOT NULL,
  state      VARCHAR(100)  NOT NULL,
  pincode    VARCHAR(10)   NOT NULL,
  phone      VARCHAR(15)   NOT NULL,
  is_default TINYINT(1)    NOT NULL DEFAULT 0,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Products ────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255)     NOT NULL,
  slug        VARCHAR(255)     NOT NULL,
  description TEXT             NOT NULL,
  price       DECIMAL(10, 2)   NOT NULL,
  stock       INT UNSIGNED     NOT NULL DEFAULT 0,
  images      JSON             NOT NULL,
  is_active   TINYINT(1)       NOT NULL DEFAULT 1,
  created_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  -- Partial index: only active products need fast slug lookups
  KEY idx_products_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Cart Items ───────────────────────────────────────────────────────────────
-- One row per (user, product) pair. Unique constraint enables atomic upsert
-- via ON DUPLICATE KEY UPDATE without a separate SELECT first.

CREATE TABLE cart_items (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity   INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_user_product (user_id, product_id),
  KEY idx_cart_user (user_id),
  CONSTRAINT fk_cart_items_user    FOREIGN KEY (user_id)    REFERENCES users    (id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Orders ──────────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id                INT UNSIGNED              NOT NULL AUTO_INCREMENT,
  user_id           INT UNSIGNED              NOT NULL,
  order_number      VARCHAR(32)               NOT NULL,
  status            ENUM('pending','confirmed','shipped','delivered','cancelled')
                                              NOT NULL DEFAULT 'pending',
  payment_status    ENUM('pending','paid','failed','refunded')
                                              NOT NULL DEFAULT 'pending',
  payment_id        VARCHAR(100)                       DEFAULT NULL,
  razorpay_order_id VARCHAR(100)                       DEFAULT NULL,
  total             DECIMAL(10, 2)            NOT NULL,
  -- Snapshot of shipping address at order time (immutable historical record)
  shipping_name     VARCHAR(100)              NOT NULL,
  shipping_line1    VARCHAR(255)              NOT NULL,
  shipping_line2    VARCHAR(255)                       DEFAULT NULL,
  shipping_city     VARCHAR(100)              NOT NULL,
  shipping_state    VARCHAR(100)              NOT NULL,
  shipping_pincode  VARCHAR(10)               NOT NULL,
  shipping_phone    VARCHAR(15)               NOT NULL,
  created_at        DATETIME                  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME                  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number),
  KEY idx_orders_user (user_id),
  KEY idx_orders_razorpay (razorpay_order_id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Order Items ─────────────────────────────────────────────────────────────

CREATE TABLE order_items (
  id         INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  order_id   INT UNSIGNED   NOT NULL,
  product_id INT UNSIGNED   NOT NULL,
  quantity   INT UNSIGNED   NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,

  PRIMARY KEY (id),
  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders   (id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

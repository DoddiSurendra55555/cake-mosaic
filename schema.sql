-- Drop tables if they already exist to start fresh
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS shops;
DROP TABLE IF EXISTS cakes;
DROP TABLE IF EXISTS flavors;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS chat_messages;

-- Shops Table
CREATE TABLE shops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL UNIQUE, 
  shop_name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users (id)
);

-- Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL, 
  shop_id INTEGER, 
  FOREIGN KEY (shop_id) REFERENCES shops (id)
);

-- Cakes Table
CREATE TABLE cakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  base_price REAL NOT NULL,
  shape TEXT NOT NULL,
  image_url TEXT,
  FOREIGN KEY (shop_id) REFERENCES shops (id)
);

-- Flavors Table
CREATE TABLE flavors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cake_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  price_modifier REAL NOT NULL DEFAULT 0.0,
  FOREIGN KEY (cake_id) REFERENCES cakes (id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  shop_id INTEGER NOT NULL,
  total_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  rating INTEGER,
  review_text TEXT,
  FOREIGN KEY (customer_id) REFERENCES users (id),
  FOREIGN KEY (shop_id) REFERENCES shops (id)
);

-- Order Items Table (--- UPDATED ---)
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  cake_id INTEGER NOT NULL,
  flavor TEXT,
  size TEXT NOT NULL,
  custom_text TEXT,
  price REAL NOT NULL,
  shape TEXT,
  coating TEXT,
  top_decoration TEXT,
  side_decoration TEXT,
  topping TEXT,
  
  -- NEW: To store the image
  snapshot_image TEXT, -- This will store the Base64 Data URL
  
  FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  FOREIGN KEY (cake_id) REFERENCES cakes (id)
);

-- Chat Messages Table
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops (id),
  FOREIGN KEY (customer_id) REFERENCES users (id),
  FOREIGN KEY (sender_id) REFERENCES users (id)
);
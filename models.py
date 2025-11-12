import sqlite3
from .db import get_db
from . import bcrypt
from flask import current_app, g
from collections import defaultdict

# --- USER & SHOP MODEL FUNCTIONS (Unchanged) ---
def create_user(email, password, role, shop_name=None):
    db = get_db()
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    try:
        if role == 'customer':
            cursor = db.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'customer')",
                (email, hashed_password),
            )
            db.commit()
            return cursor.lastrowid
        elif role == 'shopkeeper':
            if not shop_name:
                raise ValueError("Shop name is required for shopkeeper role")
            user_cursor = db.execute(
                "INSERT INTO users (email, password_hash, role, shop_id) VALUES (?, ?, 'shopkeeper', NULL)",
                (email, hashed_password)
            )
            user_id = user_cursor.lastrowid
            shop_cursor = db.execute(
                "INSERT INTO shops (owner_id, shop_name) VALUES (?, ?)",
                (user_id, shop_name)
            )
            shop_id = shop_cursor.lastrowid
            db.execute(
                "UPDATE users SET shop_id = ? WHERE id = ?",
                (shop_id, user_id)
            )
            db.commit()
            return user_id
    except sqlite3.IntegrityError:
        db.rollback() 
        return None 
    except Exception as e:
        db.rollback() 
        print(f"Error creating user/shop: {e}")
        return None
def get_user_by_email(email):
    db = get_db()
    cursor = db.execute(
        "SELECT u.*, s.shop_name FROM users u LEFT JOIN shops s ON u.shop_id = s.id WHERE u.email = ?",
        (email,)
    )
    return cursor.fetchone()
def get_user_by_id(user_id):
    db = get_db()
    cursor = db.execute(
        "SELECT u.*, s.shop_name FROM users u LEFT JOIN shops s ON u.shop_id = s.id WHERE u.id = ?",
        (user_id,)
    )
    return cursor.fetchone()

# --- CAKE & FLAVOR MODEL FUNCTIONS (Unchanged) ---
def get_all_cakes():
    db = get_db()
    cursor = db.execute(
        "SELECT c.*, s.shop_name FROM cakes c JOIN shops s ON c.shop_id = s.id"
    )
    return [dict(cake) for cake in cursor.fetchall()] 
def get_cake_details(cake_id):
    db = get_db()
    cake = db.execute("SELECT * FROM cakes WHERE id = ?", (cake_id,)).fetchone()
    if not cake: return None
    flavors = db.execute("SELECT * FROM flavors WHERE cake_id = ?", (cake_id,)).fetchall()
    return {"cake": dict(cake), "flavors": [dict(f) for f in flavors]}

# --- ORDER MODEL FUNCTIONS (UPDATED) ---
def create_order(customer_id, total_price, items_list, shop_id):
    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO orders (customer_id, total_price, shop_id) VALUES (?, ?, ?)",
            (customer_id, total_price, shop_id)
        )
        new_order_id = cursor.lastrowid
        items_to_insert = []
        for item in items_list:
            items_to_insert.append((
                new_order_id, item.get('cake_id', 1), item.get('flavor'),
                item.get('size'), item.get('custom_text'), item.get('price'),
                item.get('shape'), item.get('coating'), item.get('top_decoration'),
                item.get('side_decoration'), item.get('topping'),
                item.get('snapshot_image') # --- RE-ADDED ---
            ))
            
        db.executemany(
            """
            INSERT INTO order_items (
                order_id, cake_id, flavor, size, custom_text, 
                price, shape, coating, 
                top_decoration, side_decoration, topping, snapshot_image
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, items_to_insert
        )
        
        db.commit()
        return new_order_id
    except sqlite3.Error as e:
        db.rollback()
        print(f"Failed to create order: {e}")
        return None
def get_orders_by_customer(customer_id):
    db = get_db()
    cursor = db.execute(
        "SELECT o.*, s.shop_name FROM orders o JOIN shops s ON o.shop_id = s.id WHERE o.customer_id = ? ORDER BY o.created_at DESC",
        (customer_id,)
    )
    return [dict(order) for order in cursor.fetchall()]
def get_all_shop_orders(shop_id):
    db = get_db()
    cursor = db.execute(
        "SELECT o.id, o.status, o.total_price, o.created_at, o.rating, u.email as customer_email FROM orders o JOIN users u ON o.customer_id = u.id WHERE o.shop_id = ? ORDER BY o.created_at DESC",
        (shop_id,)
    )
    return [dict(order) for order in cursor.fetchall()]
def update_order_status(order_id, new_status, shop_id):
    db = get_db()
    try:
        cursor = db.execute(
            "UPDATE orders SET status = ? WHERE id = ? AND shop_id = ?",
            (new_status, order_id, shop_id)
        )
        db.commit()
        return cursor.rowcount
    except sqlite3.Error as e:
        db.rollback()
        return 0
def get_order_details(order_id, user_id):
    db = get_db()
    order = db.execute("SELECT * FROM orders WHERE id = ? AND customer_id = ?", (order_id, user_id)).fetchone()
    if not order: return None 
    items = db.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
    return {"order": dict(order), "items": [dict(item) for item in items]}
def get_shop_order_details(order_id, shop_id):
    db = get_db()
    order = db.execute(
        "SELECT o.*, u.email as customer_email FROM orders o JOIN users u ON o.customer_id = u.id WHERE o.id = ? AND o.shop_id = ?", 
        (order_id, shop_id)
    ).fetchone()
    if not order: return None 
    items = db.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
    return {"order": dict(order), "items": [dict(item) for item in items]}
def rate_order(order_id, customer_id, rating, review_text):
    db = get_db()
    try:
        cursor = db.execute(
            "UPDATE orders SET rating = ?, review_text = ? WHERE id = ? AND customer_id = ? AND status = 'Delivered'",
            (rating, review_text, order_id, customer_id)
        )
        db.commit()
        return cursor.rowcount
    except sqlite3.Error as e:
        db.rollback()
        print(f"Failed to rate order: {e}")
        return 0
# --- CAKE MANAGEMENT FUNCTIONS (Unchanged) ---
def create_cake(name, base_price, shape, image_url, shop_id):
    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO cakes (name, base_price, shape, image_url, shop_id) VALUES (?, ?, ?, ?, ?)",
            (name, base_price, shape, image_url, shop_id)
        )
        db.commit()
        return cursor.lastrowid
    except sqlite3.Error as e:
        db.rollback()
        return None
def update_cake(cake_id, name, base_price, shape, image_url, shop_id):
    db = get_db()
    try:
        cursor = db.execute(
            "UPDATE cakes SET name = ?, base_price = ?, shape = ?, image_url = ? WHERE id = ? AND shop_id = ?",
            (name, base_price, shape, image_url, cake_id, shop_id)
        )
        db.commit()
        return cursor.rowcount
    except sqlite3.Error as e:
        db.rollback()
        return 0
def delete_cake(cake_id, shop_id):
    db = get_db()
    try:
        cake = db.execute("SELECT id FROM cakes WHERE id = ? AND shop_id = ?", (cake_id, shop_id)).fetchone()
        if not cake: return 0 
        cursor = db.execute("DELETE FROM cakes WHERE id = ?", (cake_id,))
        db.commit()
        return cursor.rowcount
    except sqlite3.Error as e:
        db.rollback()
        return 0
def add_flavor(cake_id, name, color_hex, price_modifier, shop_id):
    db = get_db()
    try:
        cake = db.execute("SELECT id FROM cakes WHERE id = ? AND shop_id = ?", (cake_id, shop_id)).fetchone()
        if not cake: return None 
        cursor = db.execute(
            "INSERT INTO flavors (cake_id, name, color_hex, price_modifier) VALUES (?, ?, ?, ?)",
            (cake_id, name, color_hex, price_modifier)
        )
        db.commit()
        return cursor.lastrowid
    except sqlite3.Error as e:
        db.rollback()
        return None
def delete_flavor(flavor_id, shop_id):
    db = get_db()
    try:
        flavor = db.execute(
            "SELECT f.id FROM flavors f JOIN cakes c ON f.cake_id = c.id WHERE f.id = ? AND c.shop_id = ?",
            (flavor_id, shop_id)
        ).fetchone()
        if not flavor: return 0
        cursor = db.execute("DELETE FROM flavors WHERE id = ?", (flavor_id,))
        db.commit()
        return cursor.rowcount
    except sqlite3.Error as e:
        db.rollback()
        return 0
def get_all_cakes_with_flavors(shop_id):
    db = get_db()
    cakes_cursor = db.execute("SELECT * FROM cakes WHERE shop_id = ? ORDER BY name", (shop_id,))
    cakes = cakes_cursor.fetchall()
    products = []
    for cake in cakes:
        cake_dict = dict(cake)
        flavors_cursor = db.execute("SELECT * FROM flavors WHERE cake_id = ?", (cake_dict['id'],))
        cake_dict['flavors'] = [dict(f) for f in flavors_cursor.fetchall()]
        products.append(cake_dict)
    return products
# --- ANALYTICS FUNCTION (Unchanged) ---
def get_analytics_data(shop_id):
    db = get_db()
    revenue = db.execute("SELECT SUM(total_price) as total FROM orders WHERE status = 'Delivered' AND shop_id = ?", (shop_id,)).fetchone()['total'] or 0
    orders = db.execute("SELECT COUNT(id) as total FROM orders WHERE shop_id = ?", (shop_id,)).fetchone()['total'] or 0
    status_data = [dict(row) for row in db.execute("SELECT status, COUNT(id) as count FROM orders WHERE shop_id = ? GROUP BY status", (shop_id,)).fetchall()]
    revenue_time = [dict(row) for row in db.execute(
        "SELECT DATE(created_at) as date, SUM(total_price) as revenue FROM orders WHERE status = 'Delivered' AND shop_id = ? GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC",
        (shop_id,)
    ).fetchall()]
    rating_data = db.execute(
        "SELECT AVG(rating) as avg_rating, COUNT(rating) as total_reviews FROM orders WHERE shop_id = ? AND rating IS NOT NULL",
        (shop_id,)
    ).fetchone()
    return {"total_revenue": revenue, "total_orders": orders, "order_status_data": status_data, "revenue_over_time": revenue_time, "average_rating": rating_data['avg_rating'] or 0, "total_reviews": rating_data['total_reviews'] or 0}
# --- CHAT MODEL FUNCTIONS (Unchanged) ---
def save_chat_message(shop_id, customer_id, sender_id, message):
    db = get_db()
    try:
        db.execute(
            "INSERT INTO chat_messages (shop_id, customer_id, sender_id, message) VALUES (?, ?, ?, ?)",
            (shop_id, customer_id, sender_id, message)
        )
        db.commit()
    except sqlite3.Error as e:
        db.rollback()
        print(f"Failed to save chat message: {e}")
def get_chat_history(shop_id, customer_id):
    db = get_db()
    cursor = db.execute(
        "SELECT * FROM chat_messages WHERE shop_id = ? AND customer_id = ? ORDER BY created_at ASC",
        (shop_id, customer_id)
    )
    return [dict(msg) for msg in cursor.fetchall()]
def get_shop_customers_from_orders(shop_id):
    db = get_db()
    cursor = db.execute(
        """
        SELECT DISTINCT
            u.id as customer_id,
            u.email as customer_email
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        WHERE o.shop_id = ?
        ORDER BY u.email
        """,
        (shop_id,)
    )
    return [dict(conv) for conv in cursor.fetchall()]
def get_shop_reviews(shop_id):
    db = get_db()
    cursor = db.execute(
        """
        SELECT o.id, o.rating, o.review_text, o.created_at, u.email as customer_email
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        WHERE o.shop_id = ? AND o.rating IS NOT NULL
        ORDER BY o.created_at DESC
        """,
        (shop_id,)
    )
    return [dict(review) for review in cursor.fetchall()]
def update_shop_name(shop_id, new_shop_name):
    db = get_db()
    try:
        cursor = db.execute(
            "UPDATE shops SET shop_name = ? WHERE id = ?",
            (new_shop_name, shop_id)
        )
        db.commit()
        return cursor.rowcount
    except sqlite3.Error as e:
        db.rollback()
        print(f"Failed to update shop name: {e}")
        return 0
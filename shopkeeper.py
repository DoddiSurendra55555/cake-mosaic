from flask import Blueprint, jsonify, request
from app.models import (
    get_all_shop_orders, 
    update_order_status,
    create_cake,
    update_cake,
    delete_cake,
    add_flavor,
    delete_flavor,
    get_all_cakes_with_flavors,
    get_analytics_data,
    get_shop_customers_from_orders,
    get_chat_history,
    get_shop_reviews,
    update_shop_name,
    get_shop_order_details # --- 1. Import new function ---
)

bp = Blueprint('shopkeeper', __name__)

# --- Helper function to get shop_id ---
def get_shop_id():
    shop_id = request.args.get('shop_id', type=int)
    if not shop_id:
        data = request.get_json()
        if data:
            shop_id = data.get('shop_id')
    if not shop_id:
        raise ValueError("Shop ID is required for this operation")
    return shop_id

# --- ORDER MANAGEMENT ---
@bp.route('/orders')
def get_orders():
    try:
        shop_id = get_shop_id()
        orders = get_all_shop_orders(shop_id)
        return jsonify(orders), 200
    except Exception as e:
        return jsonify(error=str(e)), 500
        
# --- NEW: Get single order details ---
@bp.route('/order/<int:order_id>', methods=['GET'])
def get_order_details_for_shop(order_id):
    """
    Endpoint for shopkeeper to get details of a single order.
    """
    try:
        shop_id = get_shop_id()
        details = get_shop_order_details(order_id, shop_id)
        if details:
            return jsonify(details), 200
        else:
            return jsonify(error="Order not found or access denied"), 404
    except Exception as e:
        return jsonify(error=str(e)), 500
# -----------------------------------

@bp.route('/orders/<int:order_id>/status', methods=['POST'])
def set_order_status(order_id):
    try:
        shop_id = get_shop_id()
        data = request.get_json()
        new_status = data.get('status')
        if not new_status:
            return jsonify(error="New status is required"), 400
        rows_affected = update_order_status(order_id, new_status, shop_id)
        if rows_affected > 0:
            return jsonify(message=f"Order {order_id} status updated to {new_status}"), 200
        else:
            return jsonify(error="Order not found or no permission"), 404
    except Exception as e:
        return jsonify(error=str(e)), 500

# --- ANALYTICS ROUTE (Unchanged) ---
@bp.route('/analytics', methods=['GET'])
def get_analytics():
    try:
        shop_id = get_shop_id()
        data = get_analytics_data(shop_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

# --- REVIEWS ROUTE (Unchanged) ---
@bp.route('/reviews', methods=['GET'])
def get_reviews():
    try:
        shop_id = get_shop_id()
        reviews = get_shop_reviews(shop_id)
        return jsonify(reviews), 200
    except Exception as e:
        return jsonify(error=str(e)), 500
        
# --- SETTINGS ROUTE (Unchanged) ---
@bp.route('/settings', methods=['PUT'])
def put_shop_settings():
    try:
        shop_id = get_shop_id()
        data = request.get_json()
        new_shop_name = data.get('shop_name')
        if not new_shop_name:
            return jsonify(error="Shop name is required"), 400
        rows_affected = update_shop_name(shop_id, new_shop_name)
        if rows_affected > 0:
            return jsonify(message="Shop settings updated successfully"), 200
        else:
            return jsonify(error="Shop not found or no permission"), 404
    except Exception as e:
        return jsonify(error=str(e)), 500

# --- CAKE MANAGEMENT (Unchanged) ---
@bp.route('/all-products', methods=['GET'])
def get_all_products():
    try:
        shop_id = get_shop_id()
        products = get_all_cakes_with_flavors(shop_id)
        return jsonify(products), 200
    except Exception as e:
        return jsonify(error=str(e)), 500
@bp.route('/cakes', methods=['POST'])
def add_new_cake():
    try:
        shop_id = get_shop_id()
        data = request.get_json()
        name, base_price, shape = data.get('name'), data.get('base_price'), data.get('shape')
        image_url = data.get('image_url')
        if not all([name, base_price, shape]):
            return jsonify(error="Name, base_price, and shape are required"), 400
        cake_id = create_cake(name, base_price, shape, image_url, shop_id)
        if cake_id:
            return jsonify(message="Cake created successfully", cakeId=cake_id), 201
        else:
            return jsonify(error="Failed to create cake"), 500
    except Exception as e:
        return jsonify(error=str(e)), 500
@bp.route('/cakes/<int:cake_id>', methods=['PUT'])
def update_existing_cake(cake_id):
    try:
        shop_id = get_shop_id()
        data = request.get_json()
        name, base_price, shape = data.get('name'), data.get('base_price'), data.get('shape')
        image_url = data.get('image_url')
        if not all([name, base_price, shape]):
            return jsonify(error="Name, base_price, and shape are required"), 400
        rows_affected = update_cake(cake_id, name, base_price, shape, image_url, shop_id)
        if rows_affected > 0:
            return jsonify(message="Cake updated successfully"), 200
        else:
            return jsonify(error="Cake not found or no permission"), 404
    except Exception as e:
        return jsonify(error=str(e)), 500
@bp.route('/cakes/<int:cake_id>', methods=['DELETE'])
def delete_existing_cake(cake_id):
    try:
        shop_id = get_shop_id()
        rows_affected = delete_cake(cake_id, shop_id)
        if rows_affected > 0:
            return jsonify(message="Cake and associated flavors deleted"), 200
        else:
            return jsonify(error="Cake not found or no permission"), 404
    except Exception as e:
        return jsonify(error=str(e)), 500

# --- FLAVOR MANAGEMENT (Unchanged) ---
@bp.route('/cakes/<int:cake_id>/flavors', methods=['POST'])
def add_new_flavor(cake_id):
    try:
        shop_id = get_shop_id()
        data = request.get_json()
        name, color_hex = data.get('name'), data.get('color_hex')
        price_modifier = data.get('price_modifier', 0.0)
        if not all([name, color_hex]):
            return jsonify(error="Name and color_hex are required"), 400
        flavor_id = add_flavor(cake_id, name, color_hex, price_modifier, shop_id)
        if flavor_id:
            return jsonify(message="Flavor added successfully", flavorId=flavor_id), 201
        else:
            return jsonify(error="Failed to add flavor"), 500
    except Exception as e:
        return jsonify(error=str(e)), 500
@bp.route('/flavors/<int:flavor_id>', methods=['DELETE'])
def delete_existing_flavor(flavor_id):
    try:
        shop_id = get_shop_id()
        rows_affected = delete_flavor(flavor_id, shop_id)
        if rows_affected > 0:
            return jsonify(message="Flavor deleted"), 200
        else:
            return jsonify(error="Flavor not found or no permission"), 404
    except Exception as e:
        return jsonify(error=str(e)), 500

# --- CHAT ROUTES (Unchanged) ---
@bp.route('/conversations', methods=['GET'])
def get_conversations():
    try:
        shop_id = get_shop_id()
        conversations = get_shop_customers_from_orders(shop_id) 
        return jsonify(conversations), 200
    except Exception as e:
        return jsonify(error=str(e)), 500
@bp.route('/chat/<int:customer_id>', methods=['GET'])
def get_shop_chat_history(customer_id):
    try:
        shop_id = get_shop_id()
        history = get_chat_history(shop_id, customer_id)
        return jsonify(history), 200
    except Exception as e:
        return jsonify(error=str(e)), 500
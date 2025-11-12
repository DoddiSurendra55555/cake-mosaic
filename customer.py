from flask import Blueprint, jsonify, request
from app.models import (
    get_all_cakes, 
    get_cake_details, 
    create_order, 
    get_orders_by_customer, 
    get_order_details,
    get_chat_history,
    rate_order
)
from flask_socketio import emit

bp = Blueprint('customer', __name__)

@bp.route('/cakes')
def get_cakes():
    try:
        cakes = get_all_cakes()
        return jsonify(cakes), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@bp.route('/cakes/<int:cake_id>')
def get_single_cake(cake_id):
    try:
        details = get_cake_details(cake_id)
        if details:
            return jsonify(details), 200
        else:
            return jsonify(error="Cake not found"), 404
    except Exception as e:
        return jsonify(error=str(e)), 500

@bp.route('/orders', methods=['POST'])
def submit_order():
    """
    Endpoint to submit a new order.
    """
    data = request.get_json()
    
    customer_id = data.get('customer_id') 
    total_price = data.get('total_price')
    items_list = data.get('items')
    shop_id = data.get('shop_id')
    
    # --- NEW: Get snapshot from the payload ---
    snapshot_image = data.get('snapshot_image')
    if items_list and len(items_list) > 0:
        items_list[0]['snapshot_image'] = snapshot_image
    # ------------------------------------

    if not all([customer_id, total_price is not None, items_list, shop_id]):
        return jsonify(error="Missing required order data"), 400

    try:
        order_id = create_order(customer_id, total_price, items_list, shop_id)
        
        if order_id:
            return jsonify(message="Order placed successfully", orderId=order_id), 201
        else:
            return jsonify(error="Failed to create order"), 500
            
    except Exception as e:
        return jsonify(error=str(e)), 500

@bp.route('/orders/<int:customer_id>', methods=['GET'])
def get_my_orders(customer_id):
    try:
        orders = get_orders_by_customer(customer_id)
        return jsonify(orders), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@bp.route('/order/<int:order_id>/<int:customer_id>', methods=['GET'])
def get_single_order_details(order_id, customer_id):
    try:
        details = get_order_details(order_id, customer_id)
        if details:
            return jsonify(details), 200
        else:
            return jsonify(error="Order not found or access denied"), 404
    except Exception as e:
        return jsonify(error=str(e)), 500

@bp.route('/chat/<int:shop_id>/<int:customer_id>', methods=['GET'])
def get_customer_chat_history(shop_id, customer_id):
    try:
        history = get_chat_history(shop_id, customer_id)
        return jsonify(history), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@bp.route('/order/<int:order_id>/rate', methods=['POST'])
def submit_rating(order_id):
    data = request.get_json()
    customer_id = data.get('customer_id')
    rating = data.get('rating')
    review_text = data.get('review_text', '')

    if not all([customer_id, rating]):
        return jsonify(error="Customer ID and rating are required"), 400

    try:
        rows_affected = rate_order(order_id, customer_id, rating, review_text)
        if rows_affected > 0:
            return jsonify(message="Order rated successfully"), 200
        else:
            return jsonify(error="Failed to submit rating. Order may not be delivered or does not belong to user."), 403
    except Exception as e:
        return jsonify(error=str(e)), 500
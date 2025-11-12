from flask import Blueprint, jsonify, request
from app.models import create_user, get_user_by_email
from app import bcrypt
import sqlite3

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify(error="Email and password are required"), 400

    email = data['email']
    password = data['password']
    
    role = data.get('role', 'customer')
    shop_name = data.get('shop_name', None)
    
    if role == 'shopkeeper' and not shop_name:
        return jsonify(error="Shop name is required for shopkeepers"), 400

    if get_user_by_email(email):
        return jsonify(error="Email already registered"), 409

    try:
        user_id = create_user(email, password, role, shop_name)
        
        if user_id:
            return jsonify(message=f"User registered successfully as {role}", userId=user_id), 201
        else:
            return jsonify(error="Failed to create user"), 500
            
    except sqlite3.IntegrityError:
        return jsonify(error="Email already registered"), 409
    except Exception as e:
        return jsonify(error=str(e)), 500

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify(error="Email and password are required"), 400

    email = data['email']
    password = data['password']
    
    user = get_user_by_email(email) # This function now fetches shop_name too
    
    if user and bcrypt.check_password_hash(user['password_hash'], password):
        # Return all user data, including the new shop_name
        return jsonify(
            message="Login successful",
            token="YOUR_JWT_TOKEN_HERE",
            user={
                'id': user['id'], 
                'email': user['email'], 
                'role': user['role'],
                'shop_id': user['shop_id'],
                'shop_name': user['shop_name'] # --- NEW ---
            }
        ), 200
    else:
        return jsonify(error="Invalid email or password"), 401
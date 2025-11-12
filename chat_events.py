from app import socketio, db
from app.models import save_chat_message
from flask_socketio import emit, join_room, leave_room
from flask import request

# In-memory store for active users
# { sid: { user_id, role, shop_id } }
active_users = {}

# Reverse lookup for shopkeepers
# { shop_id: sid }
active_shops = {}

# Helper to find a customer's SID
def get_customer_sid(customer_id):
    for sid, user in active_users.items():
        if user['user_id'] == customer_id and user['role'] == 'customer':
            return sid
    return None

@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    emit('connected', {'sid': request.sid})

@socketio.on('register_user')
def handle_register_user(data):
    """
    User sends this after connecting to identify themselves.
    data = { "user_id": 123, "role": "customer" }
    OR
    data = { "user_id": 10, "role": "shopkeeper", "shop_id": 5 }
    """
    sid = request.sid
    user_id = data.get('user_id')
    role = data.get('role')
    shop_id = data.get('shop_id', None)
    
    if not user_id:
        return

    user_data = {
        "user_id": user_id,
        "role": role,
        "shop_id": shop_id
    }
    active_users[sid] = user_data
    
    if role == 'shopkeeper':
        # Shopkeeper joins a private room for their shop
        shop_room = f"shop_{shop_id}"
        join_room(shop_room)
        active_shops[shop_id] = sid # Add to shop lookup
        print(f"Shopkeeper {user_id} (Shop {shop_id}) joined room {shop_room}")
    else:
        # Customer joins a private room for their own ID
        customer_room = f"user_{user_id}"
        join_room(customer_room)
        print(f"Customer {user_id} joined room {customer_room}")

@socketio.on('send_message')
def handle_send_message(data):
    """
    Handles messages from both customers and admins.
    """
    sid = request.sid
    sender = active_users.get(sid)
    
    if not sender:
        print("Sender not registered")
        return

    message_text = data.get('message')
    
    message_data = {
        "sender_id": sender['user_id'],
        "message": message_text
    }
    
    if sender['role'] == 'customer':
        shop_id = data.get('shop_id')
        if not shop_id: return
            
        customer_id = sender['user_id']
        shop_room = f"shop_{shop_id}"
        shop_sid = active_shops.get(shop_id)
        
        save_chat_message(shop_id, customer_id, sender['user_id'], message_text)
        message_data['customer_id'] = customer_id 
        
        if shop_sid:
            # Emit to the specific shop's SID
            emit('receive_message', message_data, to=shop_sid)
            print(f"Message from Customer {customer_id} to Shop {shop_id}")
        else:
            print(f"Shop {shop_id} is not online.")

    elif sender['role'] == 'shopkeeper':
        customer_id = data.get('customer_id')
        shop_id = sender['shop_id']
        if not customer_id or not shop_id: return
            
        # --- THIS IS THE FIX ---
        # Instead of sending to a SID, we send to the room
        # that the customer joined: "user_{customer_id}"
        customer_room = f"user_{customer_id}"
        # ---------------------
        
        save_chat_message(shop_id, customer_id, sender['user_id'], message_text)
        message_data['shop_id'] = shop_id
        
        # --- THIS IS THE FIX ---
        # We now emit to the customer_room
        emit('receive_message', message_data, room=customer_room)
        print(f"Message from Shop {shop_id} to Customer {customer_id} in room {customer_room}")
        # ---------------------

@socketio.on('disconnect')
def handle_disconnect():
    """
    Called when a client disconnects.
    """
    sid = request.sid
    
    if sid in active_users:
        user = active_users[sid]
        user_id = user['user_id']
        
        if user['role'] == 'shopkeeper' and user['shop_id'] in active_shops:
            del active_shops[user['shop_id']]
            print(f"Shopkeeper {user_id} disconnected")
        else:
            print(f"Customer {user_id} disconnected")
        
        del active_users[sid]
    
    print(f"Client disconnected: {sid}")
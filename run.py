from app import create_app, socketio # 1. Import socketio

# Create the app instance using your factory
app = create_app()

if __name__ == '__main__':
    # 2. Use socketio.run() to start the server
    # This wraps the Flask app and adds WebSocket capabilities
    # We use eventlet as the async_mode
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
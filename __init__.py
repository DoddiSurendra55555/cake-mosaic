from flask import Flask, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from ..config import Config

# Initialize extensions
bcrypt = Bcrypt()
cors = CORS()

def create_app(config_class=Config):
    # __name__ points to the current Python module
    # instance_relative_config=True tells Flask that config files are relative to the 'instance' folder
    app = Flask(__name__, instance_relative_config=True)
    
    # Load configuration from the Config object
    app.config.from_object(config_class)

    # Initialize extensions with the app
    bcrypt.init_app(app)
    # Configure CORS to allow requests from your React frontend (Vite's default port is 5173)
    cors.init_app(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    # --- Initialize Database ---
    # Import the db module and register it with the app
    from . import db
    db.init_app(app)
    # ---------------------------

    # --- Register Blueprints (Routes) ---
    
    # Import your route blueprints
    from . import auth, customer, shopkeeper
    
    # Register them with the app, adding a URL prefix
    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(customer.bp, url_prefix='/api/customer')
    app.register_blueprint(shopkeeper.bp, url_prefix='/api/shopkeeper')
    
    # A simple test route to make sure the app is working
    @app.route('/api/hello')
    def hello():
        return jsonify(message="Hello from CakeMosaic API!")

    return app
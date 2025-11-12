import sqlite3
from flask import current_app, g

def get_db():
    """
    Connects to the database and returns the connection object.
    Stores the connection in the application context 'g' to reuse it
    within the same request.
    """
    if 'db' not in g:
        # Get the database path from the app config
        db_path = current_app.config['DATABASE_PATH']
        
        # Connect to the SQLite database
        # detect_types=sqlite3.PARSE_DECLTYPES allows parsing of declared types
        g.db = sqlite3.connect(
            db_path,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        # Set row_factory to sqlite3.Row to get results as dictionaries
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    """
    Closes the database connection if it exists.
    This function is automatically called by Flask at the end of each request.
    """
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_app(app):
    """
    Registers the close_db function with the Flask app.
    It will be called after each request.
    """
    # 'teardown_appcontext' calls this function when the app context ends
    app.teardown_appcontext(close_db)
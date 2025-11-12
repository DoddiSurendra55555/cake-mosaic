import sqlite3
import os
from app import create_app
from app.config import Config

# Create a minimal app instance to get the config
app = create_app()

def initialize_database():
    """
    Initializes the database by executing the schema.sql file.
    """
    # Get the database path from the config
    db_path = Config.DATABASE_PATH
    
    # Get the path to the schema.sql file
    # This assumes 'schema.sql' is in the same 'backend' directory
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')

    print(f"Database path: {db_path}")
    print(f"Schema path: {schema_path}")

    # Connect to the database (this will create the file if it doesn't exist)
    # It also creates the 'instance' folder if needed
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    try:
        connection = sqlite3.connect(db_path)
        print("Database connection established.")

        # Open and read the schema.sql file
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Execute the SQL commands in the schema file
        connection.executescript(schema_sql)
        connection.commit()
        print("Database schema successfully initialized.")

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
    finally:
        if connection:
            connection.close()
            print("Database connection closed.")

if __name__ == '__main__':
    # Run this function directly when the script is executed
    with app.app_context():
        initialize_database()
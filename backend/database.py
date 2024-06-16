import os

import psycopg2

# Database connection (temporary values for development)
connection = psycopg2.connect(
    host="127.0.0.1",
    database="lekkerveld",
    user="postgres",
    password="postgres",
)
cursor = connection.cursor()

# Initialize the user table if it does not exist
cursor.execute("""CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY, 
                                                        username VARCHAR(255))""")
connection.commit()


# Close connection
def close_connection():
    cursor.close()
    connection.close()

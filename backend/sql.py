import mysql.connector
import pandas as pd

def connect_to_db(username="rattatandygo", password=input("Please enter mysql password for rattatandygo: "), hostname="localhost", database="lekkerveld", port=3306):
    return mysql.connector.connect(user=username, password=password, host=hostname, database=database, port=port)

# Runs an sql query
# query is the query to run
# params are the parameters passed alongside the query (if no parameters are needed, this argument is optional)
# column_names are how the result columns should be called (if a single column is returned, this argument is optional)
def run_query(query, params = {}, column_names=["result"]):
    cursor = c.cursor()
    cursor.execute(query, params)
    df = res_to_df(cursor, column_names)  # Make DataFrame of result
    c.commit()

    return df

def res_to_df(query_result, column_names):
    return pd.DataFrame(query_result, columns=column_names)

# Runs an sql query that updates the database and returns no values
def run_update_query(query, params):
    cursor = c.cursor()
    cursor.execute(query, params)
    c.commit()

# Runs an sql query that returns a single value instead of a DataFrame
def get_value(query, params):
    df = run_query(query, params)
    return df.at[0, "result"]

c = connect_to_db()
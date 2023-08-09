from . import sql
import pandas as pd

def checkForUsed(username):
    df = sql.run_query("""
                    SELECT `username`
                    FROM master
                    WHERE username = %(username)s
                  """, {'username': username})
    
    if df.empty :
        return "unused"
    return "used"

def checkID(username, id):
    df = sql.run_query("""
                    SELECT `id`
                    FROM master
                    WHERE username = %(username)s
                        AND id = %(id)s
                    """, {'username': username, 'id': id})
    
    if df.empty:
        return "no match"
    return "match"


def insertIntoDB(username, id):
    sql.run_update_query("""
                            INSERT INTO master (`username`, `id`)
                            VALUES (%(username)s, %(id)s);
                        """, {"username": username, "id": id})
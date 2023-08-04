import random

def checkForUsed(username):
    # SQL query to check if username is already in use
    if random.randint(0, 1) == 0:   # Random for testing until database is set up
        return "unused"
    return "used"

def checkID(username, id):
    # SQL query to check if username and ID match up
    if random.randint(0, 1) == 0:   # Random for testing until database is set up
        return "match"
    return "no match"
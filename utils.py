"""
Provides a layer of abstraction between the app's business logic and the database's implementation.
"""

import hashlib
import os
import pandas as pd
from datetime import datetime
from time import time
import secrets


def create_user(username, hashed_password, salt, public_key):

    """
    Creates a new user with a username and a (hashed) password.
    """
        
    new_row = pd.DataFrame( [(username, hashed_password, salt, public_key, "", "")], columns= __USER_COLUMNS )
    t = __users_table()
    t = t.append(new_row)
    t.to_csv( __USERS_PATH , index=False)


def user_exists(username):

    """
    Returns true if username is already taken.
    """
    return (__users_table().username == username).sum() == 1

def delete_user(username):

    """
    Deletes a user and their messages.
    """
    pass
   
def get_hashed_password(username):

    """
    Get the (hashed) password of a user.
    """
    t = __users_table()
    return t.loc[ (t.username==username)  , "hashed_password"].to_list()[0]



def hash_password(password_or_password_attempt):
    
    """
    Return the hash of a password or password attempt.
    """
    return hashlib.sha256(password_or_password_attempt.encode()).hexdigest()
   
def append_to_inbox(username, message):
    
    """
    Add a new message to username's inbox.
    """
    new_row = pd.DataFrame( [(message["sender"], username, message["message_text"], message["timestamp"])], columns=__MESSAGE_COLUMNS )
    t = __message_table()
    t = t.append(new_row)
    t.to_csv(__MESSAGE_PATH, index=False)


def get_inbox(username):
    
    """
    Get the incoming messages of a user.
    """
    t = __message_table()
    json_array = t[(t.destname==username)].apply(lambda row : { "sendername":row["sendername"], "message_text": row["message_text"], "timestamp":row["timestamp"]  } , axis=1  )
    try:
        return json_array.to_list()
    except:
        return []

    


def del_inbox(username):

    """
    Delete a user's inbox messages.
    """
    t = __message_table()
    t = t[(t.destname!=username)]
    t.to_csv(__MESSAGE_PATH, index=False)




def get_session_id(username):
    
    """
    Get the current session id of a user.
    """
    t = __users_table()
    return t.loc[ (t.username==username)  , "session_id"].to_list()[0]
    
    
def generate_session_id():

    """
    Generate a new session id.
    """
    return secrets.token_hex(32)

def set_session_id(username, session_id):
    
    """
    Renew a user's session id and session expiration time.
    """
    SESSION_LENGTH = 5*60 # 5 minutes, duration
    t = __users_table()
    t.loc[ (t.username==username)  , "session_id"] = session_id
    t.loc[ (t.username==username)  , "expiration_session_id"] = int(time())+SESSION_LENGTH
    t.to_csv(__USERS_PATH, index=False)


def session_id_expired(username):
    """
    Return true if the session id of a user has expired.
    """
    t = __users_table()
    expiration_session_id = t.loc[ (t.username==username)  , "expiration_session_id"].to_list()[0]
    expiration_date = datetime.fromtimestamp(expiration_session_id)
    return datetime.now() >= expiration_date


def get_public_key(username):
    """
    Get the public key of a user.
    """
    t = __users_table()
    return t.loc[ (t.username==username)  , "public_key"].to_list()[0]



def get_salt(username):
    """
    Get a user's salt
    """
    t = __users_table()
    return t.loc[ (t.username==username)  , "salt"].to_list()[0]
    

# def set_salt(username, salt):
#     pass

def generate_salt():
    return secrets.token_hex(8)


def random_fill_in_the_blanks_question():
    """
    """
    return pd.read_csv("./res/fill_in_the_blanks.csv",sep="|").sample(n=1)["question"].to_list()[0]

def get_fill_in_the_blanks_answer(question):
    """
    """
    df = pd.read_csv("./res/fill_in_the_blanks.csv",sep="|")
    return df[df["question"]==question]["answer"].to_list()[0] 


# ----- methods that depend on the implementation --------

__ROOT_PATH = "./dynamic/tables"

__USERS_PATH = __ROOT_PATH+"/users.csv"
__MESSAGE_PATH = __ROOT_PATH+"/messages.csv"

__USER_COLUMNS =  ("username", "hashed_password", "salt", "public_key", "session_id", "expiration_session_id")

__MESSAGE_COLUMNS = ("sendername", "destname", "message_text", "timestamp")


def __users_table():
    path =__USERS_PATH
    df = pd.DataFrame( [], columns=__USER_COLUMNS )

    if not os.path.isfile(path):
        with open(path, "w+") as f:
            pass
        df.to_csv(path, index=False)
    
    return pd.read_csv(path)

def __message_table():
    path = __MESSAGE_PATH
    df = pd.DataFrame( [], columns=__MESSAGE_COLUMNS )

    if not os.path.isfile(path):
        with open(path, "w+") as f:
            pass
        df.to_csv(path, index=False)
    
    return pd.read_csv(path)









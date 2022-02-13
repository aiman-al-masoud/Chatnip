"""
Provides a layer of abstraction between the app's business logic and the database's implementation.
"""

import hashlib
import os
import pandas as pd
from datetime import datetime
from time import time
import secrets


import database 



ROOT_PATH = None
DB = None

def set_root_path(root_path):
    global ROOT_PATH, DB
    ROOT_PATH  = root_path
    # sql db is still a work in progress...
    DB = database.SqlDatabase('mysql+pymysql://root:@127.0.0.1/cats')
    # DB = database.CsvDatabase(f"{ROOT_PATH}/dynamic/tables")



def create_user(username, hashed_password, salt, public_key):

    """
    Creates a new user with a username and a (hashed) password.
    """
        
    new_row = pd.DataFrame( [(username, hashed_password, salt, public_key, "", "")], columns= database.Database.USER_COLUMNS )
    t = DB.get_users_table()
    t = t.append(new_row)
    DB.save_table(t)


def user_exists(username):

    """
    Returns true if username is already taken.
    """

    try:
        return (DB.get_users_table().username == username).sum() == 1
    except Exception as e:
        print(e)
        return False     

def delete_user(username):

    """
    Deletes a user and their messages.
    """
    pass
   
def get_hashed_password(username):

    """
    Get the (hashed) password of a user.
    """
    t = DB.get_users_table()
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
    new_row = pd.DataFrame( [(message["sender"], username, message["message_text"], message["timestamp"])], columns= database.Database.MESSAGE_COLUMNS )
    t = DB.get_messages_table()
    t = t.append(new_row)
    DB.save_table(t)


def get_inbox(username):
    
    """
    Get the incoming messages of a user.
    """
    t = DB.get_messages_table()
    json_array = t[(t.destname==username)].apply(lambda row : { "sendername":row["sendername"], "message_text": row["message_text"], "timestamp":row["timestamp"]  } , axis=1  )
    try:
        return json_array.to_list()
    except:
        return []


def del_inbox(username):

    """
    Delete a user's inbox messages.
    """
    t = DB.get_messages_table()
    t = t[(t.destname!=username)]
    DB.save_table(t)


def get_session_id(username):
    
    """
    Get the current session id of a user.
    """
    t = DB.get_users_table()
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
    t = DB.get_users_table()
    t.loc[ (t.username==username)  , "session_id"] = session_id
    t.loc[ (t.username==username)  , "expiration_session_id"] = int(time())+SESSION_LENGTH
    DB.save_table(t)


def session_id_expired(username):
    """
    Return true if the session id of a user has expired.
    """
    try:
        t = DB.get_users_table()
        expiration_session_id = t.loc[ (t.username==username)  , "expiration_session_id"].to_list()[0]
        expiration_date = datetime.fromtimestamp(int(expiration_session_id))
        return datetime.now() >= expiration_date
    except Exception as e:
        print(e)
        return True
    


def get_public_key(username):
    """
    Get the public key of a user.
    """
    t = DB.get_users_table()
    return t.loc[ (t.username==username)  , "public_key"].to_list()[0]


def get_salt(username):
    """
    Get a user's salt
    """
    t = DB.get_users_table()
    return t.loc[ (t.username==username)  , "salt"].to_list()[0]
    

def generate_salt():
    return secrets.token_hex(8)


def random_fill_in_the_blanks_question():
    """
    """
    
    return pd.read_csv(f"{ROOT_PATH}/res/fill_in_the_blanks.csv",sep="|").sample(n=1)["question"].to_list()[0]

def get_fill_in_the_blanks_answer(question):
    """
    """
    df = pd.read_csv(f"{ROOT_PATH}/res/fill_in_the_blanks.csv",sep="|")
    return df[df["question"]==question]["answer"].to_list()[0] 


def reset_password(username, hashed_password, salt):
    t = DB.get_users_table()
    t.loc[ (t.username==username)  , "hashed_password"] = hashed_password
    t.loc[ (t.username==username)  , "salt"] = salt
    DB.save_table(t)

def reset_public_key(username, public_key):
    t = DB.get_users_table()
    t.loc[ (t.username==username)  , "public_key"] = public_key
    DB.save_table(t)

def delete_user(username):
    u = DB.get_users_table()
    u = u[u.username!=username]
    m = DB.get_messages_table()
    m = m[(m.sendername!=username)&(m.destname!=username)]
    DB.save_table(u)
    DB.save_table(m)
    delete_avatar(username)


def get_avatar_path(username):
    try:
        filename = [filename for filename in  os.listdir(f"{ROOT_PATH}/static/avatars") if username in filename][0]
        return f"/avatars/{filename}"
    except:
        return "/avatars/default/default.png"


def reset_avatar(username, file):   
    
    delete_avatar(username)
    _, extension = os.path.splitext(file.filename)
    file.save(f"{ROOT_PATH}/static/avatars/{username}{extension}")


def delete_avatar(username):

    oldpath = f"{ROOT_PATH}/static{get_avatar_path(username)}"
    if oldpath == f"{ROOT_PATH}/static/avatars/default/default.png":
        return
    os.remove(oldpath)
      

def lang_pack(language):
    return {row[0] : row[1] for i, row in  pd.read_csv(f"{ROOT_PATH}/static/lang_packs/{language}.csv", sep="|", header=None).iterrows()}

def available_lang_packs():
    return [l.split(".")[0] for l in os.listdir(f"{ROOT_PATH}/static/lang_packs")]


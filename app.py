from flask import Flask, render_template, request, send_file
from flask_cors import CORS
import json
import utils as U
import logging


app = Flask(__name__)
app.config["DEBUG"] = True
logging.basicConfig( level=logging.DEBUG, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')
CORS(app)


@app.route("/", methods=["GET"])
def on_index():
    """
    Render the website's homepage.
    """
    return render_template("index.html")


@app.route("/login_page", methods=["GET", "POST"])
def on_login_page():
    """
    Render the login/signup page.
    """
    return render_template("login_page.html")


@app.route("/user_home", methods=["GET", "POST"])
def on_user_home():
    """
    Render the user's main 'console'.
    Deny access, if requesting user's session-id is expired or invalid.
    """
    
    # get from request
    username = request.form["username"]
    session_id = request.form["session_id"]
    app.logger.info(f"on_user_home: Username: {username}, Session Id: {session_id}")
    

    if U.session_id_expired(username):
        return "session expired!"# fail

    if int(U.get_session_id(username))!=int(session_id):
        return "wrong session id!"# fail

    return render_template("user_home.html")




@app.route("/create_user", methods=["GET", "POST"])
def on_create_user():

    """
    Api: create a new user.
    """

    # get from request
    username = request.json["username"]
    password = request.json["password"]

    if U.user_exists(username):
        #return json.dumps({"error":"username_already_taken"}) # fail
        return f"Username '{username}' is already taken!" # fail
    
    U.create_user(username, U.hash_password(password))
    
    return "" # success



@app.route("/authenticate", methods=["GET", "POST"])
def on_authenticate():

    """
    Api: open a new session if the user successfully authenticates.
    """

    # get from request
    username = request.json["username"]
    password_attempt = request.json["password"]

    if not U.user_exists(username):
        return "ERROR: INVALID USERNAME!"

    if U.get_hashed_password(username)==U.hash_password(password_attempt):
        session_id = U.generate_session_id()
        U.set_session_id(username, session_id)
        return json.dumps({"session_id": session_id})
    else:
        return "ERROR, INVALID USERNAME OR PASSWORD!"

    
@app.route("/upload_message", methods=["POST", "GET"])
def on_upload_message():
    """
    Api: Listen for users posting messages.
    """
    
    # get from request
    username = request.json["username"]
    destname = request.json["destname"]
    session_id = request.json["session_id"]
    message_text = request.json["message_text"]
    timestamp = request.json["timestamp"]
    

    if U.session_id_expired(username):
        return "" # fail

    if int(U.get_session_id(username))!=int(session_id):
        return "" # fail

    

    U.append_to_inbox(destname, {"sender":username, "message_text":message_text, "timestamp":timestamp})
    
    return "" #success
    

@app.route("/download_messages", methods=["GET", "POST"])
def on_download_messages():
    """
    Api: Listen for users requesting messages from their own inbox.
    """

    # get from request
    username = request.json["username"]
    session_id = request.json["session_id"]

        
    if U.session_id_expired(username):
        return "" # fail

    if int(U.get_session_id(username))!=int(session_id):
        return "" # fail

    return json.dumps(U.get_inbox(username))
    
    





















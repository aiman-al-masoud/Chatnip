from flask import Flask, render_template, request, send_file, redirect, url_for
from flask_cors import CORS
import json
import utils as U
import logging
# from werkzeug.utils import secure_filename
from os.path import splitext



app = Flask(__name__)
app.config["DEBUG"] = True
logging.basicConfig( level=logging.DEBUG, format=f'%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')
CORS(app)


UPLOAD_FOLDER = "."
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif']



@app.route("/", methods=["GET"])
def on_index():
    """
    Render the website's homepage.
    """

    try: lang = request.cookies["language"]
    except: lang = "english"

    return render_template("index.html" , lang=U.lang_pack(lang) )



@app.route("/about", methods=["GET"])
def on_about():
    """
    Render the 'about' page.
    """

    try: lang = request.cookies["language"]
    except: lang = "english"

    return render_template("about.html"  , lang=U.lang_pack(lang) )


@app.route("/login_page", methods=["GET", "POST"])
def on_login_page():
    """
    Render the login page.
    """


    try: lang = request.cookies["language"]
    except: lang = "english"

    return render_template("login_page.html", lang=U.lang_pack(lang))



@app.route("/signup_page", methods=["GET", "POST"])
def on_signup_page():
    """
    Render the signup page.
    """

    try: lang = request.cookies["language"]
    except: lang = "english"
    
    return render_template("signup_page.html", sentence=U.random_fill_in_the_blanks_question(), lang=U.lang_pack(lang))
    

@app.route("/user_home", methods=["GET", "POST"])
def on_user_home():
    """
    Render the user's main 'console'.
    Deny access, if requesting user's session-id is expired or invalid.
    """
    
    # get from cookies
    username = request.cookies["username"]
    session_id = request.cookies["session_id"]

    app.logger.info(f"on_user_home: Username: {username}, Session Id: {session_id}")
    
    if U.session_id_expired(username):
        return redirect("/login_page")

    if U.get_session_id(username)!=session_id:
        return redirect("/login_page")

    
    try: lang = request.cookies["language"]
    except: lang = "english"

    return render_template("user_home.html", avatar=U.get_avatar_path(username), lang=U.lang_pack(lang))



@app.route("/settings", methods=["GET", "POST"])
def on_settings():
    # get from cookies
    username = request.cookies["username"]
    session_id = request.cookies["session_id"]

    if U.session_id_expired(username):
        return redirect("/login_page")

    if U.get_session_id(username)!=session_id:
        return redirect("/login_page")

    
    try: lang = request.cookies["language"]
    except: lang = "english"
    
    return render_template("settings.html", avatar=U.get_avatar_path(username), lang=U.lang_pack(lang))


@app.route("/create_user", methods=["GET", "POST"])
def on_create_user():

    """
    Api: create a new user.
    """

    # get from request
    username = request.json["username"]
    password = request.json["password"]
    public_key = request.json["public_key"]
    dict_fill_in_the_blanks = request.json["dict_fill_in_the_blanks"]


    if dict_fill_in_the_blanks["answer"] != U.get_fill_in_the_blanks_answer(dict_fill_in_the_blanks["question"]):
        app.logger.info(f"on_create_user: a bot just tried to sign up and was stopped.")
        return "You may be a bot!", 400 # bad request 

    if U.user_exists(username):
        return f"Username '{username}' is already taken!", 400 # bad request 
    
    salt = U.generate_salt()
    salted_and_hashed_password = U.hash_password(password+salt)

    U.create_user(username, salted_and_hashed_password , salt , public_key)
    
    return "OK" # success



@app.route("/authenticate", methods=["GET", "POST"])
def on_authenticate():

    """
    Api: open a new session if the user successfully authenticates.
    """

    # get from request
    username = request.json["username"]
    password_attempt = request.json["password"]

    if not U.user_exists(username):
        return f"Username '{username}' doesn't exist!", 400 # bad request 

    if U.get_hashed_password(username)==U.hash_password(password_attempt+U.get_salt(username)):
        session_id = U.generate_session_id()
        U.set_session_id(username, session_id)
        return json.dumps({"session_id": session_id})
    else:
        return f"Wrong password!", 400 # bad request 

    
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
        return redirect("/login_page")

    if U.get_session_id(username)!=session_id:
        return redirect("/login_page")

    U.append_to_inbox(destname, {"sender":username, "message_text":message_text, "timestamp":timestamp})
    
    return "" #success
    

@app.route("/download_messages", methods=["GET", "POST"])
def on_download_messages():
    """
    Api: Listen for users requesting messages from their own inbox.
    """

    # get from cookies
    username = request.cookies["username"] 
    session_id = request.cookies["session_id"]

    if U.session_id_expired(username):
        return redirect("/login_page")

    if U.get_session_id(username)!=session_id:
        return redirect("/login_page")

    inbox = U.get_inbox(username)
    U.del_inbox(username)
    return json.dumps(inbox)
    
    

@app.route("/get_public_key", methods=["POST", "GET"])
def on_get_public_key():
    """
    Api: Returns the public key of any user.
    """
    username = request.json["username"]

    if not U.user_exists(username):
        return f"Username '{username}' doesn't exist!", 400 # bad request 
    
    return json.dumps({"public_key" : U.get_public_key(username) })



@app.route("/delete_user", methods=["POST", "GET"])
def on_delete_user():
    """
    Api:
    """
    # get from cookies
    username = request.cookies["username"] 
    session_id = request.cookies["session_id"]

    if U.session_id_expired(username):
        return redirect("/login_page")

    if U.get_session_id(username)!=session_id:
        return redirect("/login_page")
    
    U.delete_user(username)

    return "OK" # success


@app.route("/reset_password", methods=["POST", "GET"])
def on_reset_password():
    """
    Api:
    """
    # get from cookies
    username = request.cookies["username"] 
    session_id = request.cookies["session_id"]    
    old_password = request.json["old_password"]
    new_password = request.json["new_password"]

    if U.session_id_expired(username):
        return redirect("/login_page")

    if U.get_session_id(username)!=session_id:
        return redirect("/login_page")
    
    if U.get_hashed_password(username)!=U.hash_password(old_password+U.get_salt(username)):
        return "Wrong password!", 400 # bad request
    
    salt = U.generate_salt()
    U.reset_password(username,  U.hash_password(new_password+salt), salt)

    return "OK" # success

    
@app.route("/reset_public_key", methods=["POST", "GET"])
def on_reset_public_key():
    """
    Api:
    """
    # get from cookies
    username = request.cookies["username"] 
    session_id = request.cookies["session_id"]
    password = request.json["password"]
    new_public_key = request.json["new_public_key"]

    if U.session_id_expired(username):
        return redirect("/login_page")

    if U.get_session_id(username)!=session_id:
        return redirect("/login_page")

    if U.get_hashed_password(username)!=U.hash_password(password+U.get_salt(username)):
        return "Wrong password!", 400 # bad request

    U.reset_public_key(username, new_public_key)
    return "OK" # success



@app.route("/upload_avatar", methods=["POST", "GET"])
def on_upload_avatar():

    username = request.cookies["username"] 
    session_id = request.cookies["session_id"]

    if U.session_id_expired(username):
        return redirect("/login_page")

    if U.get_session_id(username)!=session_id:
        return redirect("/login_page")
    
    f = request.files["avatar"]

    U.reset_avatar(username, f)
    
    return redirect("/settings")



@app.route("/delete_avatar", methods=["POST", "GET"])
def on_delete_avatar():
    
    username = request.cookies["username"] 
    session_id = request.cookies["session_id"]

    if U.session_id_expired(username):
        return redirect("/login_page")

    if U.get_session_id(username)!=session_id:
        return redirect("/login_page")
    
    U.delete_avatar(username)
    
    return "OK"
    

@app.route("/get_avatar", methods=["POST", "GET"])
def on_get_avatar():
    username = request.json["username"]
    return json.dumps(  {"avatar":url_for('static', filename=U.get_avatar_path(username), _external=True)} )





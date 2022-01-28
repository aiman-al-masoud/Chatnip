# A minimalist online instant-messenger.
<a href="https://www.gnu.org/licenses/gpl-3.0"><img src="https://img.shields.io/badge/License-GPLv3-blue.svg"/></a>

<div style="display: flex; flex-direction: row;">
<img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54" />
<img src="https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white"/>
<img src="https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white"/>
<img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white"/>
<img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white"/>
<img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E"/>
</div>

<img src="https://github.com/aiman-al-masoud/Chatnip/blob/main/static/icons/intro.gif" title="dumb demo"></img>

<details>
 <summary><strong>Description</strong></summary>
  
  This is a fully functioning client-server-achitecture IM-service, complete with RSA encryption.
  
  The project is free software, licensed under GPLv3.
  
It is meant as a project, for didactical reasons and for leisure. I strongly DISENCOURAGE you to use it for really important business! (Unless you've thoroughly read, and trust the code to work for your use-case). In any case, I have NO LIABILITIES for any potential misuse of this software.
 
 ## Some examples of what you can do with it:
 
 * Deploy it on an online hosting service
 * Fork it and improve it
 * Or even create a mobile app client for it (which I'm also (maybe) planning to do some day).
 * etc... 
 
  The API documentation is fully available in the 'APIs Documentation' section of this README.
  
   * Thank you for having read this! *
  
 </details>


<details>
  <summary><strong>APIs Documentation</strong></summary>
  
  # /create_user
  
  If successful, creates a new account on the server.

  ## User agent's request:

  ```
{
username:"username",
password:"password",
public_key:"PUBLIC_KEY",  
dict_fill_in_the_blanks:{question:"Fyyyill in de ____ hooman.", answer:"blanks"}
}
  ```

* username: a new username that doesn't already exist on the server.
* password: a password.
* public_key: the RSA public-key that will be used to encrypt messages for the new user.
* dict_fill_in_the_blanks: a security measure against bots. (Users have to complete a simple sentence that is incorrectly spelled to prove they're human beings).



# /authenticate

If authentication succeeds, the user will be sent a new session id.

## Useragent's request:

 ```
{
username:"username",
password:"password_attempt"
}
  ```


## Server's OK response:

  ```
{
session_id:"session_id"
}
```
  
* session_id: it's a N-char alphanumeric string that expires in M minutes. It gets sent back to the server as a cookie. It serves to prove a user is authorized to send and receive messages without them having to re-enter their password every time. 

(On Fri Jan 28 2022 it's: N=32 and M=5)


# /upload_message

If successful, uploads a message to the server.

## Useragent's request:

  ```
{
username:"sendersname",
destname : "recipientsname",
message_text : "text of the message",
timestamp : 1643365746,
session_id : "session_id"
}
  ```

* username: name of the sender.
* destname: name of the recipient.
* message_text: text of the message
* timestamp: UNIX epoch in seconds (ie: seconds elapsed since 00:00 1st Jan 1970). It represents the time at which the message got sent (NOT the time at which the sever received) the message.
* session_id: session id (see up).



# /download_messages


## User agent's request:

  ```
username  
session_id 

(as cookies)
```
  
## Server's OK response:

  ```
List of json objects, each object is a message. 
  ```

The server also deletes the messages from the database right before sending the json list.

### A message that a user receives from the server looks like this:


  ```
{ 
"sendername":"nameofthesender", 
"message_text": "kwjeojqijmmj(MASNDU2JHJSKDSI2874jjjansJMN0TevenTRyINGakisndh", 
"timestamp":1643365746
}
  ```

* message_text: a message encrypted with the recipient's public key. The recipient has to have the corresponding private key stored on their localStorage to decrypt it. The message also contains a signature to verify the identity of the sender.



# /get_public_key

If successful returns the public key associated to any requested username.

## Useragent's request:

  ```
{
username:"anyusername"
}
  ```

## Server's OK response:

  ```
{
public_key:"PUBLIC_KEY_OF_ANYUSERNAME"
}
```
  



# /delete_user

If successful, deletes an account from the server, along with all of its associated messages (sent and received*), and avatar.

*Albeit the received ones already shouldn't be on the server anymore, beacause if the user is logged in and active, they get downloaded and deleted from the server automatically.


## Useragent's request:

    
``` 
{
password:"password"
}
  
username
session_id
(as cookies)
  ```


# /reset_password

If successful, the password of a user is reset.


## Useragent's request:

```
{
old_password:"old_password",
new_password:"new_password"
}
 
  
  username
session_id
  
(as cookies)
  
  ```


# /reset_public_key

If successful, the public key of a user is reset.

## Useragent's request:

```
{
password:"password",
new_public_key:"NEW_PUBLIC_KEY"
}

  
username
session_id

(as cookies)
  
  ```




# /upload_avatar


If successful, the avatar (profile-picture/thumbnail-image) of the user is updated.

```
username
session_id

(as cookies)
    
avatar

(an image file)

  ```


NB: on the current implemenation of the client, this is the only endpoint that uses an html-form to send the data to the server, rather than just posting a JSON request.



# /delete_avatar


If successful, deletes the custom avatar (profile-picture/thumbnail-image) of the user from the server.

## Useragent's request:

  ```
username
session_id

(as cookies)
```



# /get_avatar

If successful, returns a link to the avatar (profile-picture/thumbnail-image) of any user.


## Useragent's request:

  ```
{
username:"anyusername"
}
  ```

Server's OK response:

  ```
{
avatar:"https://url/to/avatar.png"
}
```
  
  
</details>






<details>
  <summary><b><strong>Setting up a Local Testing Environment</strong></b></summary>

## 1) Clone this repo
...and navigate to its root directory.

## 2) Create a python virtual environment 
...calling it '.my_env' 

(For gitignore-related reasons).

```
$ python3 -m venv .my_env
```

(You'll be prompted to install the 'venv' module if you don't have it yet).

## 3) Activate the virtual environment:

```
$ source .my_env/bin/activate
```

If this command doesn't work try with:

```
$ . .my_env/bin/activate
```

(You should notice that the console starts displaying the virtual environment's name before your username and the dollar-sign).


## 4) Install this app's dependencies 
... on the virtual environment you just created:

```
(.my_env)$ pip install -r requirements.txt
```
## 5) Run the app on localhost!

```
(.my_env)$ python3 -m flask run
```

#### Sample output:

```
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

Click on the link, and the homepage will be launched on your default browser.

</details>

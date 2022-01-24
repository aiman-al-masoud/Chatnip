# A minimalist online instant-messenger.

<img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54" />



<img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E"/>

<img src="https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white"/>

<img src="https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white"/>

<img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white"/>

<img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white"/>


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

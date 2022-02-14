# start the dev-server and open two different windows on the website 
# Ctrl+C to shut down dev-server when done debugging 
python3 -m flask run & 
chromium http://127.0.0.1:5000/ & 
chromium --new-window --incognito  http://127.0.0.1:5000/ &
# https://unix.stackexchange.com/questions/87831/how-to-send-keystrokes-f5-from-terminal-to-a-gui-program
# refresh the pages
#xdotool search --class chromium windowactivate --sync %1 key F5 windowactivate $(xdotool getactivewindow) & disown &
# open the dev-console
#xdotool search --class Chromium windowactivate --sync %1 key F12 windowactivate $(xdotool getactivewindow) 

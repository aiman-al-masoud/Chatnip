// some global constants
localStorage.setItem("bits", 1024)// The length of the RSA key, in bits.


/**
 * Sets the value of a cookie.
 * @param {*} cname: cookie name 
 * @param {*} cvalue: cookie value
 */
function setCookie(cname, cvalue) {
    const exdays = 0.1
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Get the value of a cookie.
 * @param {*} cname: cookie name.
 * @returns 
 */
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

/**
 * Waits for the server to return a new session id, stores it as a cookie if received.
 * @param {*} username 
 * @param {*} password 
 */
function authenticate(username, password) {

    //storing the password's hash (to be used to generate the private key when needed)
    localStorage.setItem("password", sha256.hex(password))

    let data = { username: username, password: password };
    let url = "/authenticate"

    return fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then((res) => { return res.json(); })

        .then((data) => {
            console.log(data["session_id"])
            setCookie("session_id", data["session_id"]);
            setCookie("username", username);
        })

}

/**
 * Waits for the server to return a response.
 * Positive reponse should be that the user was created successfully.
 * @param {*} username 
 * @param {*} password 
 */
function createUser(username, password, honeypot) {

    let rsaKeyPair = cryptico.generateRSAKey(sha256.hex(password), parseInt(localStorage.getItem("bits")));
    let publicKey = cryptico.publicKeyString(rsaKeyPair);

    let data = { username: username, password: password, public_key: publicKey, honeypot:honeypot };
    let url = "/create_user"

    return fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then((res) => { alert("Signup Successful! Please log in.") })// TODO remove

}

/**
 * Uploads a message to the server.
 * @param {*} destname: id of message recipient.
 * @param {*} message_text: text pf the message.
 * @returns 
 */
function uploadMessage(destname, message_text) {

    fetch("/get_public_key", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: destname })
    })
    .then((res)=>{return res.json();})
    .then((pubkdata)=>{

        let encryptedMsg = cryptico.encrypt(message_text, pubkdata["public_key"], cryptico.generateRSAKey(localStorage.getItem("password"), parseInt(localStorage.getItem("bits")))  ).cipher;

        let msgdata = { username: getCookie("username"), destname: destname, message_text: encryptedMsg, timestamp: Math.round((new Date()).getTime() / 1000), session_id: getCookie("session_id") };
        fetch("/upload_message", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msgdata)
        })

    })

}

/**
 * Returns a promise that should resolve into messages from the current user's inbox.
 * @returns 
 */
function downloadMessages() {
    return fetch("/download_messages")
}






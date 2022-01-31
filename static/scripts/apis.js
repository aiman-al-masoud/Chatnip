// set some useful global constants
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

    let data = { username: username, password: password };
    let url = "/authenticate"

    return fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })

    //if request is bad, display the error message from the sever and break the chain.
    .then((res)=> {if(!res.ok){res.text().then(((text)=> {alert(text); return null;}   )) }else{return res;}   })
    
    .then((res) => { return res.json(); })

    .then((data) => {
            console.log(data["session_id"])
            setCookie("session_id", data["session_id"]);
            setCookie("username", username);
        })
    .then((res) => {
            window.location.href = "/user_home" //redirect user to /user_home
    })

    


}

/**
 * Waits for the server to return a response.
 * Positive reponse should be that the user was created successfully.
 * @param {*} username 
 * @param {*} password 
 */
function createUser(username, password, keypass, dict_fill_in_the_blanks) {

    localStorage.setItem("keypass", sha256.hex(keypass))

    
    let rsaKeyPair = cryptico.generateRSAKey(sha256.hex(keypass), parseInt(localStorage.getItem("bits")));
    let publicKey = cryptico.publicKeyString(rsaKeyPair);
    
    let data = { username: username, password: password, public_key: publicKey, dict_fill_in_the_blanks: dict_fill_in_the_blanks };
    let url = "/create_user"

    return fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    //if request is bad, display the error message from the sever and break the chain.
    .then((res)=> {if(!res.ok){res.text().then(((text)=> {alert(text); return null;}   )) }else{return res;}   })
    
    .then((res)=>{  if(res){ 
        setCookie("username", username)
        window.location.href = "/login_page";
    }})
    

}

/**
 * Uploads a message to the server.
 * @param {*} destname: id of message recipient.
 * @param {*} message_text: text pf the message.
 * @returns 
 */
function uploadMessage(destname, message_text) {

    return fetch("/get_public_key", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: destname })
    })


    //if request is bad, display the error message from the sever and break the chain.
    .then((res)=> {if(!res.ok){res.text().then(((text)=> {alert(text); return null;}   )) }else{return res;}   })
    
    .then((res)=>{return res.json();})

    .then((pubkdata)=>{

        let encryptedMsg = cryptico.encrypt(message_text, pubkdata["public_key"], cryptico.generateRSAKey(localStorage.getItem("keypass"), parseInt(localStorage.getItem("bits")))  ).cipher;

        let msgdata = { username: getCookie("username"), destname: destname, message_text: encryptedMsg, timestamp: Math.round((new Date()).getTime() / 1000), session_id: getCookie("session_id") };
        fetch("/upload_message", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msgdata)
        })

    })

}

/**
 * Returns a promise that should resolve into deciphered and ready-to-use messages from the current user's inbox.
 * @returns 
 */
function downloadMessages() {
    return fetch("/download_messages")


      //if request is bad throw user back to the login page.
      .then((res)=> {if(!res.ok){ window.location.href="/login_page"; return null;}else{return res;}   })
    
    .then((res) => { return res.json(); })

    .then((data) => {
            let messages = []
            let myKeyPair = cryptico.generateRSAKey(localStorage.getItem("keypass"), parseInt(localStorage.getItem("bits")));
            let options = { year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric" };

            for (let message of data) {

                let decryptionRes = cryptico.decrypt(message["message_text"], myKeyPair);
                let messageText = decryptionRes.plaintext;
                let signature = decryptionRes.signature;
                let date = new Date(message["timestamp"] * 1000).toLocaleDateString("en-US", options);

                messages.push({ sendername: message.sendername, date: date, signature: signature, message_text: messageText })
            }
            return messages;
    })
}



function saveToComp(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}







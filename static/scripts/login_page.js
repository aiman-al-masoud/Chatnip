/**
 * On load.
 */
window.addEventListener("load", function (elem, event) {
    document.getElementById("input_username").value = getCookie("username")
    window.keypassWrongAttemptsCounter = 0;
})

/**
 * Clicking on login.
 */
document.getElementById("button_login").addEventListener("click", function (elem, event) {

    let username = document.getElementById("input_username").value
    let password = document.getElementById("input_password").value

    // delete the other user's local data if you're switching accounts or no previous log-ins
    if (username != getCookie("username") ?? "") {
        localStorage.removeItem("keypass")
        localStorage.removeItem("messages")
    }

    isOldKeypassOk()

    .then((ok) => {

        console.log(ok)

        if (ok || window.keypassWrongAttemptsCounter>=1) {
            authenticate(username, password)
        } else {
            document.getElementById("div_wrong_keypass").style = "display: block; visibility : visible;"
            window.keypassWrongAttemptsCounter++;
        }

    })

});

/**
 * Click to check and set keypass.
 */
document.getElementById("button_check_keypass").addEventListener("click", function () {

    isKeypassOk()

        .then((ok) => {

            let keypass_attempt = document.getElementById("input_keypass").value
            let username = document.getElementById("input_username").value        

            setCookie("username", username) 
            localStorage.setItem("keypass", sha256.hex(keypass_attempt)) 

            if (ok) {
                document.getElementById("keypass_ok").style = "display: block; visibility : visible; color: green;"  
                document.getElementById("keypass_wrong").style = "display: none; visibility : hidden;"  

            } else {
                document.getElementById("keypass_wrong").style = "display: block; visibility : visible; color:red;" 
                document.getElementById("keypass_ok").style = "display: none; visibility : hidden;"  
 
            }

        })

})


/**
 * Checks if the keypass entered by the user in the specific text-field is ok.
 * @returns 
 */
function isKeypassOk() {

    let keypass_attempt = document.getElementById("input_keypass").value
    let username = document.getElementById("input_username").value

    //does keypass entered by user generate public-key present on server?
    return fetch("/get_public_key", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
    })
        .then((res) => { return res.json(); })
        .then((pubkdata) => {
            let supposedPublicKey = cryptico.publicKeyString(cryptico.generateRSAKey(sha256.hex(keypass_attempt), parseInt(localStorage.getItem("bits"))));
            return supposedPublicKey == pubkdata.public_key;
        })
}


/**
 * Checks if the keypass currently stored on localStorage is ok.
 * @returns  
 */
function isOldKeypassOk() {

    let username = document.getElementById("input_username").value

    return fetch("/get_public_key", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
    })
        .then((res) => { return res.json(); })
        .then((pubkdata) => {
            let supposedPublicKey = cryptico.publicKeyString(cryptico.generateRSAKey(localStorage.getItem("keypass")??"", parseInt(localStorage.getItem("bits"))));
            return supposedPublicKey == pubkdata.public_key;
        })
}
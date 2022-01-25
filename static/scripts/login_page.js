/**
 * On load.
 */
 window.addEventListener("load", function (elem, event) {
    document.getElementById("input_username").value = getCookie("username")
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

    // if keypass is null, wait till you get it from the user.
    if (localStorage.getItem("keypass") == null) {
        checkKeypass(username);
    } else {
        authenticate(username, password)
    }

});


/**
 * Bother user with prompts till he sets it correclty.
 * To avoid incomprehensible (badly deciphered) messages. 
 */
function checkKeypass(username) {

    //get it from the user.
    keypass = prompt(`Keypass not found/incorrect for ${username}, please re-enter it:`)

    //does keypass entered by user generate public-key present on server?
    fetch("/get_public_key", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username })
    })
        .then((res) => { return res.json(); })
        .then((pubkdata) => {
            let supposedPublicKey = cryptico.publicKeyString(cryptico.generateRSAKey(sha256.hex(keypass), parseInt(localStorage.getItem("bits"))));
            if (supposedPublicKey != pubkdata.public_key) {
                checkKeypass(username);
            } else {
                localStorage.setItem("keypass", sha256.hex(keypass));
                let password = document.getElementById("input_password").value
                authenticate(username, password)
            }
        });

}


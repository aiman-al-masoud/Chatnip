
/**
 * Clicking on login.
 */
document.getElementById("button_login").addEventListener("click", function (elem, event) {
    let username = document.getElementById("input_username").value
    let password = document.getElementById("input_password").value

    // set keypass to null if you're switching accounts
    if(username!=getCookie("username")){
        localStorage.removeItem("keypass")
    }
    
    let keypass = localStorage.getItem("keypass")
    
    // if the keypass is null, bother the user with prompts till he sets it.
    while(keypass==null){
        keypass = prompt(`Keypass not found for ${username}, please enter it:`)
        localStorage.setItem("keypass", sha256.hex(keypass))
    }

    // authenticate
    authenticate(username, password)
        .then((res) => {
            window.location.href = "/user_home" //redirect user to /user_home
        })
})



/**
 * On load.
 */
//body.addEventListener("onload", function(elem, event){
// document.getElementById("input_username").value = getCookie("username")
//})



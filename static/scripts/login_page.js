
/**
 * Clicking on login.
 */
document.getElementById("button_login").addEventListener("click", function (elem, event) {
    let username = document.getElementById("input_username").value
    let password = document.getElementById("input_password").value
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



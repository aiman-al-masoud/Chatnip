
/**
 * Clicking on login.
 */
document.getElementById("button_login").addEventListener("click", function(elem, event){
    let username = document.getElementById("input_username").value 
    let password =  document.getElementById("input_password").value 
    authenticate(username, password)
    .then((res)=> { 
        //redirect user to /user_home 
        window.location.href = "/user_home"
      })
})


/**
 * Clicking on signup.
 */
document.getElementById("button_signup").addEventListener("click", function(elem, event){
    let username = document.getElementById("input_username").value 
    let password =  document.getElementById("input_password").value 

    createUser(username, password)

})


/**
 * On load.
 */
//body.addEventListener("onload", function(elem, event){
// document.getElementById("input_username").value = getCookie("username")
//})



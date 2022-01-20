
/**
 * Clicking on login.
 */
document.getElementById("button_login").addEventListener("click", function(elem, event){
    let username = document.getElementById("input_username").value 
    let password =  document.getElementById("input_password").value 
    authenticate(username, password)
    .then((res)=> { 
        //redirect user to /user_home 
        document.getElementById("input_session_id").value = getCookie("session_id");
        document.forms["login_form"].submit();
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
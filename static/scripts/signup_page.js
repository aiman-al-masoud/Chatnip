
/**
 * Clicking on signup.
 */
 document.getElementById("button_signup").addEventListener("click", function (elem, event) {
    let username = document.getElementById("input_username").value
    let password = document.getElementById("input_password").value
    let password_repeat = document.getElementById("input_password_repeat").value
    let keypass = document.getElementById("input_keypass").value

    
    if(password!=password_repeat){
        alert("Passwords don't match!")
        return;
    }
    
    let question_fill_in_the_blanks = document.getElementById("question_fill_in_the_blanks").innerHTML
    let fill_in_the_blanks = document.getElementById("fill_in_the_blanks").value
    let dict = {}

    dict["question"] = question_fill_in_the_blanks
    dict["answer"] = fill_in_the_blanks

    createUser(username, password, keypass, dict)

})

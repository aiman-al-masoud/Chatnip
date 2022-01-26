document.getElementById("button_reset_password").addEventListener("click", function(){
    let old_password = document.getElementById("input_old_password").value
    let new_password = document.getElementById("input_new_password").value
    
    fetch("/reset_password", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"old_password":old_password, "new_password":new_password})
    })

})


document.getElementById("button_reset_public_key").addEventListener("click", function(){
    let password = document.getElementById("input_password").value
    let newKeyPass = document.getElementById("input_new_keypass").value

    localStorage.setItem("keypass", sha256.hex(newKeyPass))
    let rsaKeyPair = cryptico.generateRSAKey(sha256.hex(newKeyPass), parseInt(localStorage.getItem("bits")));
    let publicKey = cryptico.publicKeyString(rsaKeyPair);

    fetch("/reset_public_key", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"password":password, "new_public_key":  publicKey })
    })
    
})


document.getElementById("button_delete_account").addEventListener("click", function(){
    fetch("/delete_user")
})


document.getElementById("button_delete_local_storage_messages").addEventListener("click", function(){
    localStorage.removeItem("messages")
})



document.getElementById("button_save_messages").addEventListener("click", function(){
    saveToComp(localStorage.getItem("messages"), `messages_backup_${new Date()}`, "text/plain")
})



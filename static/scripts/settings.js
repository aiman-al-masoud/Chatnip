document.getElementById("button_reset_password").addEventListener("click", function(){
    let old_password = document.getElementById("input_old_password").value
    let new_password = document.getElementById("input_new_password").value
    
    fetch("/reset_password", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"old_password":old_password, "new_password":new_password})
    })
    //if request is bad, display the error message from the sever and break the chain.
    .then((res)=> {if(!res.ok){res.text().then(((text)=> {alert(text); return null;}   )) }else{return res;}   })

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

    //if request is bad, display the error message from the sever and break the chain.
    .then((res)=> {if(!res.ok){res.text().then(((text)=> {alert(text); return null;}   )) }else{return res;}   })
    

})


document.getElementById("button_delete_account").addEventListener("click", function(){
    fetch("/delete_user",{
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"password":document.getElementById("input_password_delete_account").value})
    })    
    //if request is bad, display the error message from the sever and break the chain.
    .then((res)=> {if(!res.ok){res.text().then(((text)=> {alert(text); return null;}   )) }else{return res;}   })
    .then((res)=>{
        if(res){document.location.href = "/"}
    })
})




document.getElementById("button_delete_local_storage_messages").addEventListener("click", function(){
    localStorage.removeItem("messages")
})


document.getElementById("button_save_messages").addEventListener("click", function(){
    saveToComp(localStorage.getItem("messages"), `messages_backup_${new Date()}`, "text/plain")
})

document.getElementById("button_delete_avatar").addEventListener("click", function(){
    fetch("/delete_avatar").then(function(){window.location.href="/settings"})
})


document.getElementById("avatar").addEventListener("change", function(){


    document.getElementById("submit_avatar").style = "display: inline; visibility:visible;"
    
})
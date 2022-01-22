

/**
 * On click send.
 */
document.getElementById("button_send_message").addEventListener("click", function(elem, event){
    const destname = document.getElementById("input_destname").value
    const messageText = document.getElementById("input_message_text").value
    document.getElementById("input_destname").value=""
    document.getElementById("input_message_text").value=""
    console.log(destname)
    console.log(messageText)
    uploadMessage(destname, messageText)
    
})


function displayMessages(messages){
    const div_inbox = document.getElementById("div_inbox")
    div_inbox.innerHTML = ""
    
    //myKeyPair should be globally accessible from any page 
    //but alas, it is not
    myKeyPair = cryptico.generateRSAKey(getCookie("password"), 1024);
    
    
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour:"numeric", minute:"numeric"};


    for(let message of messages){
        
        console.log(message)
        console.log(message["message_text"])
        console.log(myKeyPair)
        let messageText = cryptico.decrypt(message["message_text"], myKeyPair).plaintext
        
        let date = new Date(message["timestamp"]*1000).toLocaleDateString("en-US", options)

        div_inbox.innerHTML+= `<p>${date.toString()}\n${message["sendername"]}: ${messageText}</p>`
    }
}

function checkForMessages() {
    const millisecs = 2000
    setTimeout(checkForMessages, millisecs);
    downloadMessages().then((res)=> {return res.json();}).then((data)=> {displayMessages(data)})
}


checkForMessages()
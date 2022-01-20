

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
    for(let message of messages){
        console.log(message)
        div_inbox.innerHTML+= `<p>${message["sendername"]}: ${message["message_text"]}</p>`
    }
}

function checkForMessages() {
    const millisecs = 1000
    setTimeout(checkForMessages, millisecs);
    downloadMessages().then((res)=> {return res.json();}).then((data)=> {displayMessages(data)})
}


checkForMessages()
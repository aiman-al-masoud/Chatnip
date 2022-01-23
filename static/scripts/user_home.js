var messages = []
var myKeyPair = cryptico.generateRSAKey(getCookie("password"), 1024);
const options = { year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric" };


/**
 * On click send.
 */
document.getElementById("button_send_message").addEventListener("click", function (elem, event) {
    const destname = document.getElementById("input_destname").value
    const messageText = document.getElementById("input_message_text").value
    document.getElementById("input_destname").value = ""
    document.getElementById("input_message_text").value = ""

    // if sending msg to smn other than self, display own msg.
    if(destname!=getCookie("username")){
        messages.push({sendername:"myself",message_text: messageText})
    }

    uploadMessage(destname, messageText)
})


function displayMessages() {
    const div_inbox = document.getElementById("div_inbox")
    div_inbox.innerHTML = ""
    for(let message of messages){
        div_inbox.innerHTML += `<p>${message.date}\n\n${message.signature}\n${message.sendername}: ${message.message_text}</p>`
    }
}

function checkForMessages() {
    const millisecs = 2000
    setTimeout(checkForMessages, millisecs);
    
    downloadMessages()
    
    .then((res) => { return res.json(); })      
    
    .then((data)=>  
    {
        for (let message of data) {
           
            let decryptionRes = cryptico.decrypt(message["message_text"], myKeyPair);
            let messageText = decryptionRes.plaintext;
            let signature = decryptionRes.signature;
            let date = new Date(message["timestamp"] * 1000).toLocaleDateString("en-US", options);
            
            messages.push({sendername : message.sendername, date:date, signature:signature, message_text:messageText })
        }
    }).then(function(){
        displayMessages()

    })
    
    displayMessages()
}

checkForMessages()




// storage = (function () {
//     let messages = [];
//     return function () {
//     }
// })();




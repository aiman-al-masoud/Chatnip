/**
 * On click send.
 */
document.getElementById("button_send_message").addEventListener("click", function (elem, event) {
    const destname = document.getElementById("input_destname").value
    const messageText = document.getElementById("input_message_text").value
    //document.getElementById("input_destname").value = ""
    document.getElementById("input_message_text").value = ""

    // if sending msg to smn other than self, display own msg.
    if (destname != getCookie("username")) {
        messages.push({ sendername: "myself", message_text: messageText, date: new Date().toString().split("GMT")[0], signature: "" })
    }

    uploadMessage(destname, messageText)
})


/**
 * Display messages.
 */
function displayMessages() {
    const div_inbox = document.getElementById("div_inbox")
    div_inbox.innerHTML = ""
    const currentChat = document.getElementById("input_destname").value;
    for (let message of messages) {
        if(message.sendername==currentChat ||  message.sendername=="myself"){
            //div_inbox.innerHTML += `<p>${message.date}\n\n${message.signature}\n${message.sendername}: ${message.message_text}</p>`
            div_inbox.appendChild(ChatMsg(message))
        }
    }
}


/**
 * Download incoming messages.
 */
function checkForMessages() {
    const millisecs = 2000
    setTimeout(checkForMessages, millisecs);

    downloadMessages()

        .then((res) => { return res.json(); })

        .then((data) => {
            for (let message of data) {

                let decryptionRes = cryptico.decrypt(message["message_text"], myKeyPair);
                let messageText = decryptionRes.plaintext;
                let signature = decryptionRes.signature;
                let date = new Date(message["timestamp"] * 1000).toLocaleDateString("en-US", options);

                messages.push({ sendername: message.sendername, date: date, signature: signature, message_text: messageText })
            }
        }).then(function () {
            displayMessages()

        })

    displayMessages()
}


/**
 * Onload init.
 */
window.addEventListener("load", function () {
    window.messages = []
    window.myKeyPair = cryptico.generateRSAKey(getCookie("password"), 1024);
    window.options = { year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric" };
    checkForMessages()
})







function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes.
    //return div.firstChild;
    return div
}


/**
 * Creates an element to display the name of a chat.
 * @param {string} name 
 * @returns 
 */
function ChatName(name) {
    let html = `
    <div class="chat_name">
    <a onclick="displayChatByName('${name}')"  href="">${name}</a>
    </div>
    `
    return createElementFromHTML(html)
}


/**
 * Create an element to display a message from a chat.
 * @param {object} message 
 * @returns 
 */
function ChatMsg(message) {

    //get signature from message
    //let signature = "verified";
    let signature = message.signature

    //useful constants 
    const v = "verified"; const f = "forged"; const u = "unsigned";

    const v_img = document.getElementById("verified").src; const f_img = document.getElementById("forged").src; const u_img = document.getElementById("unsigned").src;

    

    const v_txt = "This message was duly verified"; const f_txt = "Caution! This message is forged!"; const u_txt = "This message wasn't signed. Could be forged.";

    let html = `
    <div class="chat_msg">
    
    <p style='font-size:x-large'>${message.message_text}</p>
    
    <br>
    <p>${message.date}</p>
    <br>
    <span> from: ${message.sendername}</span>
    <img  src="${signature == v ? v_img : (signature == f ? f_img : u_img)}"
          title= "${signature == v ? v_txt : (signature == f ? f_txt : u_txt)}"
          width="50"
    ></img>

    </div>
    `
    return createElementFromHTML(html)
}

function displayChatByName(name){
    alert(name)//TOREMOVE OFC
    //  TODO
}

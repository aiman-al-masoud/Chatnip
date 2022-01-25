/**
 * On click send.
 */
document.getElementById("button_send_message").addEventListener("click", function (elem, event) {
    const destname = document.getElementById("input_destname").value
    const messageText = document.getElementById("input_message_text").value
    document.getElementById("input_message_text").value = ""

    // if sending msg to smn other than self, add own msg for display.
    if (destname != getCookie("username")) {
        messages.push({ isSentByMe:true, destname:destname, message_text: messageText, date: new Date().toString().split("GMT")[0] })
    }

    uploadMessage(destname, messageText)
})


/**
 * Display messages.
 */
function displayMessages() {

    const currentChat = document.getElementById("input_destname").value;
    const div_inbox = document.getElementById("div_inbox")

    document.getElementById("title_one").innerHTML = currentChat //set title to name of chat

    // if (div_inbox.childElementCount == messages.length) {  return;}//instead of messages.length, lenght of messages in CURRENT CHAT

    div_inbox.innerHTML = ""
    for (let message of messages) {
        if(isInCurrentChat(message, currentChat)){
            div_inbox.appendChild(ChatMsg(message))
        }
    }
}


/**
 * Download incoming messages.
 * Recursive function that calls itself every n milliseconds.
 */
function checkForMessages() {
 
    downloadMessages()
    .then((newMessages)=>{window.messages = window.messages.concat(newMessages);   })
    
    displayChatNames()
    displayMessages()
    
    const millisecs = 2000
    setTimeout(checkForMessages, millisecs);
}


/**
 * Onload init.
 */
window.addEventListener("load", function () {
    window.messages = []
    checkForMessages()
})


/**
 * The name says it all.
 * @param {string} htmlString 
 * @returns 
 */
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
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
    <input type="button" onclick="displayChatByName('${name}')" value="${name}"></input>
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

    if(message.isSentByMe??false){
        return createElementFromHTML(`<div><p>${message.message_text}</p></div>`)
    }

    //useful constants 
    const v = "verified"; const f = "forged"; const u = "unsigned";
    const v_img = document.getElementById("verified").src; const f_img = document.getElementById("forged").src; const u_img = document.getElementById("unsigned").src;
    const v_txt = "This message was duly verified"; const f_txt = "Caution! This message is forged!"; const u_txt = "This message wasn't signed. Could be forged.";

    let html = `
    <div class="chat_msg">
    
      <h2 style="margin-right: 200px; margin-left: 50px; margin-top: 10px;">${message.message_text}</h2>

        <div style="margin-right: 10px;">
          <p>${message.date}</p>        
          <div style="display: flex; flex-direction: row;">
            <p> from: ${message.sendername}</p>
            <img  src="${message.signature == v ? v_img : (message.signature == f ? f_img : u_img)}"
            title= "${message.signature == v ? v_txt : (message.signature == f ? f_txt : u_txt)}"
            width="20" /img>
          </div>
        </div>   

    </div>
    `
    return createElementFromHTML(html)
}

function displayChatByName(name) {
    document.getElementById("input_destname").value = name
}


function displayChatNames(){
    document.getElementById("navbar_list").innerHTML=""

    let names = []

    for(let message of messages){

        if(message.isSentByMe??false){
            names.push(message.destname);
        }else{
            names.push(message.sendername);
        }
    }   

    for(let name of new Set(names)){
        document.getElementById("navbar_list").appendChild(ChatName(name))
    }
}

/**
 * Checks if a message is part of the current chat.
 * (ie: current chat name must be either sender or recipient).
 * @param {object} message 
 * @returns 
 */
function isInCurrentChat(message, currentChat){
    return message.destname==currentChat ||  message.sendername==currentChat
}



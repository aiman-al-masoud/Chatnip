
/**
 * Onload init.
 */
 window.addEventListener("load", function () {
    window.chatname = ""
    window.messages = []
    window.allChatnames = []

    // load messages stored locally
    window.messages=  window.messages.concat(JSON.parse(localStorage.getItem("messages")))
    window.messages = window.messages.filter((x) => !!x)
    displayChatNames(window.messages)

    checkForMessages()
})


/**
 * Scroll to the bottom of a div.
 * @param {*} id 
 */
 function scrollToBottom (id) {
    var div = document.getElementById(id);
    div.scrollTop = div.scrollHeight - div.clientHeight;
 }




/**
 * On click send.
 */
document.getElementById("button_send_message").addEventListener("click", function (elem, event) {

    const messageText = document.getElementById("input_message_text").value
    document.getElementById("input_message_text").value = ""

    uploadMessage(window.chatname, messageText).then((res)=>{

    // if sending msg to smn other than self, add own msg for display.
    if (window.chatname != getCookie("username")) {
        let newMessage = { isSentByMe: true, destname: window.chatname, message_text: messageText, date: new Date().toString().split("GMT")[0] };
        messages.push(newMessage);
        document.getElementById("div_inbox").appendChild(ChatMsg(newMessage));
        displayChatNames([newMessage]);
        scrollToBottom("div_inbox");

        (async () => {localStorage.setItem("messages", JSON.stringify(window.messages))})();

        
    }})

})


/**
 * On typing in a new chatname switch chat.
 */
document.getElementById("input_destname").addEventListener("change", function (elem, event) {
    let newChatname = document.getElementById("input_destname").value
    console.log("switching to chat after typing in: ", newChatname)
    switchToChat(newChatname);
})



/**
 * Download incoming messages.
 * Recursive function that calls itself every n milliseconds.
 */
function checkForMessages() {

    downloadMessages()
    
    .then((newMessages) => {

            if(newMessages.length!=0){

                window.messages = window.messages.concat(newMessages);
                for(let newMessage of newMessages){
                    document.getElementById("div_inbox").appendChild(ChatMsg(newMessage))
                }
                displayChatNames(newMessages)
    
                //TODO: make this more efficient MAKE THIS MORE EFFICIENTTTTTTT 
                localStorage.setItem("messages", JSON.stringify(window.messages))
    
                scrollToBottom("div_inbox")

            }

            const millisecs = 2000
            setTimeout(checkForMessages, millisecs);

        })
}


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
    
    <input class="chat_name " type="button" onclick="switchToChat('${name}')" value="${name}"></input>
    
    `
    return createElementFromHTML(html)
}

/**
 * Create an element to display a message from a chat.
 * @param {object} message 
 * @returns 
 */
function ChatMsg(message) {

    if (message.isSentByMe ?? false) {
        return createElementFromHTML(`<div class="chat_msg   sent_by_me"><h2 style="margin-right: 200px; margin-left: 50px; margin-top: 10px;">${message.message_text}</h2></div>`)
    }

    //useful constants 
    const v = "verified"; const f = "forged"; const u = "unsigned";
    const v_img = document.getElementById("verified").src; const f_img = document.getElementById("forged").src; const u_img = document.getElementById("unsigned").src;
    const v_txt = "This message is verified"; const f_txt = "Caution! This message is forged!"; const u_txt = "This message wasn't signed. Could be forged.";

    let html = `
    <div class=" chat_msg  sent_by_others ">
      <h2  style="margin:0px;">${message.message_text}</h2>
      <p style="margin:0px;">${message.date}</p>        
      <p  style="margin:0px;"> from: ${message.sendername}</p>
      <img  style="margin:0px;" src="${message.signature == v ? v_img : (message.signature == f ? f_img : u_img)}"
      title= "${message.signature == v ? v_txt : (message.signature == f ? f_txt : u_txt)}"/img>
    </div>
    `
    return createElementFromHTML(html)
}


/**
 * Adds new chatnames to the navbar based on incoming messages.
 * @param {object[]} messages 
 */
function displayChatNames(messages) {

    let newChatNames = []

    for (let message of messages) {

        if (message.isSentByMe ?? false) {
            newChatNames.push(message.destname);
        } else {
            newChatNames.push(message.sendername);
        }
    }

    // remove chatnames that are already in allChatnames
    newChatNames = newChatNames.filter(name => !window.allChatnames.includes(name)) 

    window.allChatnames = window.allChatnames.concat(newChatNames)

    let navbar_list = document.getElementById("navbar_list");
    for (let name of new Set(newChatNames)) {
        navbar_list.appendChild(ChatName(name))
    }
}


/**
 * Called when chat button is pressed or chat name is typed in.
 * Has to remove all currently displayed messages and only display the ones from the current chat.
 * @param {string} chatname 
 */
function switchToChat(chatname) {

    if(window.chatname == chatname){
        return;
    }

    //set current chatname
    window.chatname = chatname;

    //change displayed chat name
    document.getElementById("title_chat_name").innerHTML = chatname

    //clear displayed messages
    const div_inbox = document.getElementById("div_inbox")
    div_inbox.innerHTML = ""

    //get and display only messages from 'chatname'
    let toDisplay = []
    for (let message of window.messages) {

        if (  message.destname == chatname || message.sendername == chatname) {
            toDisplay.push(message);
        }
    }

    for (let message of toDisplay) {
        div_inbox.appendChild(ChatMsg(message))
    }


    fetch("/get_avatar", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"username": chatname})
    }).then( (res)=> {return res.json()} ).then((data)=> { 
        document.getElementById("image_other_guys_avatar").src=  data.avatar;
    })

}























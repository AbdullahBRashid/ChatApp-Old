import { websocket } from './socket.js'

// Description: Main javascript file for the chat app

// Get elements
const chatDiv = document.getElementById('messages-container')
const chatText = document.getElementById('chat-text-box')
const nameEl = document.getElementById('name-p')

// Check if user is logged in
let username = localStorage.getItem('name')

if (username == null) {
    window.location.href = 'index.html'
}

// Set username
nameEl.innerText = username

// Check if color is stored
let colorPicker = document.getElementById('color-picker')

if (localStorage.getItem('color') == null) {
    localStorage.setItem('color', '#000000')
} else {
    colorPicker.value = localStorage.getItem('color')
}

// Enter to send function

chatText.addEventListener('keyup', (event) => {
    if (event.keyCode == '13') {
        event.preventDefault()
        document.getElementById('send-button').click()
    }
})

let colorChangeButton = document.getElementById('color-picker')
// Change color of mine sent text with color picker
colorChangeButton.onchange = () => {
    let color = document.getElementById('color-picker').value
    localStorage.setItem('color', color)

    // Change color of previous messages sent by me
    let messagesSent = document.getElementsByClassName('message-sent')
    for (let i = 0; i < messagesSent.length; i++) {
        messagesSent[i].querySelector('.message-name').style.color = color
    }

    // Send color to server
    let message = `{"type": "color", "name": "${username}", "color": "${color}"}`
    websocket.send(message)
}

let sendButton = document.getElementById('send-button')

sendButton.onclick =  () => {
    // Collect input
    let input = chatText.value
    let color = localStorage.getItem('color')

    // Empty Verification
    if (input == '') {
        return
    }

    // Make message
    let message = `{"type": "message", "name": "${username}", "message": "${input}", "color": "${color}"}`

    // Send message
    websocket.send(message)
    
    // Create message element
    let messageBox = document.createElement('div')

    // Add classes
    messageBox.classList.add('message-box')
    messageBox.classList.add('message-sent')
    
    // Add message
    let messageName = document.createElement('h4')
    messageName.classList.add('message-name')
    messageName.textContent = `You`
    
    let messageText = document.createElement('p')
    messageText.classList.add('message-text')

    // Verify if link with regex and put in a tag
    if (input.includes('http' || 'https')) {
        console.log('link')
        let link = document.createElement('a')
        link.setAttribute('href', input)
        link.textContent = input
        messageText.append(link)
    } else {
        messageText.textContent = input
    }
    
    // Add color
    if (color == null) {
        messageName.style.color = '#000000'
    } else {
        messageName.style.color = color
    }

    messageBox.appendChild(messageName)
    messageBox.appendChild(messageText)
    chatDiv.appendChild(messageBox)

    // Empty input
    chatText.value = ''

    // Scroll to bottom
    toBottom()

    // Focus on input
    chatText.focus()
}

// On websocket open
websocket.addEventListener('message', (message) => {
    let obj

    try {
        obj = JSON.parse(message.data)
        
    } catch (error) {
        let chunks = [];

        chunks.push(message.data)

        let blob = new Blob(chunks, { type: "audio/webm; codecs=opus" })

        let audio = document.createElement('audio')
        audio.setAttribute("controls", "");
        audio.src = window.URL.createObjectURL(blob)

        let audioBox = document.createElement('div')
        audioBox.classList.add('message-box')
        audioBox.classList.add('message-got')

        let audioName = document.createElement('h4')
        audioName.classList.add('message-name')
        audioName.textContent = `${username}`

        audioBox.appendChild(audioName)
        audioBox.appendChild(audio)

        chatDiv.appendChild(audioBox)

        return
    }

    // Check if message or color
    if (obj.type == 'color') {
        let color = obj.color
        let name = obj.name
        
        // change color of previous messages sent by name
        let messagesGot = document.getElementsByClassName('message-got')
        for (let i = 0; i < messagesGot.length; i++) {
            if (messagesGot[i].innerHTML.includes(name)) {
                messagesGot[i].querySelector('.message-name').style.color = color
            }
        }
        return
    }

    if (obj.type == 'audio') {
        let audio = new Audio(obj.audio)
        audio.play()
        return
    }

    if (obj.type != 'message') {
        return
    }

    // Get message
    let usersname = obj.name
    let userMessage = obj.message
    let messageColor = obj.color

    // Create message element
    let messageBox = document.createElement('div')
    messageBox.classList.add('message-box')
    messageBox.classList.add('message-got')

    let messageName = document.createElement('h4')
    messageName.classList.add('message-name')
    messageName.textContent = `${usersname}`
    messageName.style.color = messageColor

    // if link then make it a link
    
    let messageText = document.createElement('p')
    messageText.classList.add('message-text')

    if (userMessage.includes('http' || 'https')) {
        let link = document.createElement('a')
        link.setAttribute('href', userMessage)
        link.textContent = userMessage
        messageText.append(link)
    } else {
        messageText.textContent = userMessage
    }

    messageBox.appendChild(messageName)
    messageBox.appendChild(messageText)
    chatDiv.appendChild(messageBox)

    // Send notification
    if (document.hidden) {
        // Send a sound notification
        let audio = new Audio('/static/notification.mp3')
        audio.play()
        let notification = new Notification('New Message', {
            body: `${usersname}: ${userMessage}`
        })

        notification.onclick = () => {
            window.focus()
        }
    }

    // Scroll to bottom
    toBottom()

});


// Logout function
function logout() {
    localStorage.removeItem('name')
    localStorage.removeItem('color')
    window.location.href = 'index.html'
}

// To bottom function
function toBottom() {
    chatDiv.scrollTo(0, chatDiv.scrollHeight)
}

// If user not at bottom of page show to bottom button

chatDiv.addEventListener('scroll', () => {
    if (chatDiv.scrollTop + chatDiv.clientHeight >= chatDiv.scrollHeight) {
        document.getElementById('to-bottom').style.display = 'none'
    } else {
        document.getElementById('to-bottom').style.display = 'block'
    }
})
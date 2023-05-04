import { createPopup } from 'https://unpkg.com/@picmo/popup-picker@latest/dist/index.js?module';


let emojiButton = document.getElementById('emoji-picker')
let textChat = document.getElementById('chat-text')

const popup = createPopup({
    rootElement: emojiButton,
    position: 'top',
    autoFocus: 'search',
    emojisize: '90px',
}, {
    referenceElement: emojiButton,
    triggerElement: emojiButton,
});

emojiButton.addEventListener('click', () => {
    popup.toggle()
})

popup.addEventListener('emoji:select', (event) => {
    textChat.value += event.emoji;
    textChat.focus()
})


// textChat.addEventListener('keyup', (event) => {
//     if (event.keyCode === 186) {
//         popup.toggle()
//         textChat.value = textChat.value.slice(0, -1)
//         document.querySelector('.picmo__searchField').focus()
//     }
// })

// Ctrl+/ focuses on text box 

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === '/') {
        textChat.focus()
    }})

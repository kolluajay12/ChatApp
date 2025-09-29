const socket = io.connect("http://localhost:3001");

let username = "";
let room = "";

const joinChatContainer = document.getElementById('joinChatContainer');
const chatWindow = document.getElementById('chatWindow');
const usernameInput = document.getElementById('usernameInput');
const roomInput = document.getElementById('roomInput');
const joinRoomButton = document.getElementById('joinRoomButton');
const messageContainer = document.getElementById('messageContainer');
const currentMessageInput = document.getElementById('currentMessageInput');
const sendMessageButton = document.getElementById('sendMessageButton');
const groupNameElement = document.getElementById('groupName');


function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

/**
 * @returns {string} 
 */
function formatTime() {
    const date = new Date(Date.now());
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; 
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
}

/**
 * @param {string} author 
 * @returns {HTMLElement} 
 */
function createAvatar(author) {
    const avatar = document.createElement('div');
    avatar.className = 'avatar-placeholder';
    avatar.textContent = author.charAt(0);
    
    let color;
    if (author === "Kirtidan Gadhvi") {
        color = '#ff5252'; 
    } else if (author === "Anonymous") {
        color = '#444'; 
    } else {
        color = '#9d2e7d'; 
    }
    avatar.style.backgroundColor = color;
    
    return avatar;
}

/**
 * @param {object} messageData 
 */
function displayMessage(messageData) {
    const isYou = username === messageData.author;
    const shouldShowMeta = !isYou; 
    
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper';

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.id = isYou ? 'you' : 'other';

    if (shouldShowMeta) {
        const avatar = createAvatar(messageData.author);
        messageDiv.appendChild(avatar);
    }
    
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (shouldShowMeta) {
        const authorP = document.createElement('p');
        authorP.id = 'author';
        authorP.className = 'message-author';
        authorP.textContent = messageData.author;
        contentDiv.appendChild(authorP);
    }

    const messageP = document.createElement('p');
    messageP.className = 'message-text';
    messageP.textContent = messageData.message;
    contentDiv.appendChild(messageP);

    const metaDiv = document.createElement('div');
    metaDiv.className = 'message-meta';

    const timeP = document.createElement('p');
    timeP.id = 'time';
    timeP.textContent = messageData.time;
    metaDiv.appendChild(timeP);
    
    if (isYou) {
        const statusSpan = document.createElement('span');
        statusSpan.className = 'read-status';
        statusSpan.textContent = '✓';
        metaDiv.appendChild(statusSpan);
    }
    
    contentDiv.appendChild(metaDiv);
    messageBox.appendChild(contentDiv);
    messageDiv.appendChild(messageBox);
    wrapper.appendChild(messageDiv);
    messageContainer.appendChild(wrapper);

    scrollToBottom();
}


function joinRoom() {
    username = usernameInput.value.trim();
    room = roomInput.value.trim();

    if (username !== "" && room !== "") {
        socket.emit("join_room", room);
        
        joinChatContainer.classList.add('hide');
        chatWindow.classList.remove('hide');
        groupNameElement.textContent = room;
        
        messageContainer.innerHTML = ''; 
        initialMessages.forEach(msg => {
            displayMessage({ ...msg, room: room }); 
        });
    } else {
        alert("Please enter both a username and a room ID.");
    }
}

function sendMessage() {
    const currentMessage = currentMessageInput.value.trim();

    if (currentMessage !== "") {
        const messageData = {
            room: room,
            author: username,
            message: currentMessage,
            time: formatTime(),
        };

        socket.emit("send_message", messageData);
        displayMessage(messageData); 
        currentMessageInput.value = ""; 
    }
}


socket.on("receive_message", (data) => {
    displayMessage(data);
});


joinRoomButton.addEventListener('click', joinRoom);
currentMessageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
sendMessageButton.addEventListener('click', sendMessage);

const initialMessages = [
    { author: "Anonymous", message: "Someone order Bornvita!!", time: "11:35 AM" },
    { author: "Anonymous", message: "hahahahah!!", time: "11:38 AM" },
    { author: "Anonymous", message: "I'm Excited For this Event! Ho-Ho", time: "11:56 AM" },
    { author: "Kirtidan Gadhvi", message: "Hi Guysss ❤️", time: "12:31 PM" },
    { author: "Anonymous", message: "Hello!", time: "12:35 PM" },
    { author: "Anonymous", message: "Yessss!!!!!!", time: "12:42 PM" },
    { author: "Kirtidan Gadhvi", message: "Maybe I am not attending this event!", time: "1:36 PM" },
    { author: "Kirtidan Gadhvi", message: "We have Surprise For you!!", time: "11:35 AM" },
];


initialMessages.forEach(msg => {
    username = "Kirtidan Gadhvi"; 
    displayMessage({ ...msg, room: "Fun Friday Group" }); 
});
username = "";

document.addEventListener('DOMContentLoaded', () => {
    scrollToBottom();
});
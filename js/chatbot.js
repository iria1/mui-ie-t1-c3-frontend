let chatbotSessionToken = null;

const input = document.getElementById('userInput');
const btnSend = document.getElementById('btnSend');
const chatWindow = document.getElementById('chatWindow');
const converter = new showdown.Converter({
    noHeaderId: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tables: true,
    tasklists: true,
    ghCompatibleHeaderId: true,
    openLinksInNewWindow: true,
    disableForced4SpacesIndentedSublists: true
});

$(document).ready(function () {
    // adjust chat window height to ensure everything fits with no need for scrolling
    chatWindow.style.height = (window.innerHeight - 200) + 'px';

    const hasVisited = localStorage.getItem("hasVisitedBefore");

    if (!hasVisited) {
        // Show the modal using Bootstrap 5
        const myModal = new bootstrap.Modal(document.getElementById('modalChatbotInfo'));
        myModal.show();

        // Mark as visited
        localStorage.setItem("hasVisitedBefore", "true");
    }

    chatbotSessionToken = sessionStorage.getItem('chatbot_session_token');
    if (!chatbotSessionToken) {
        getChatbotSessionToken();
    }

    addBubble("Hello, I'm Caro! Ask me anything about cyberbullying!", 'bot');

    restoreMessages();
});

//////////////
// API call //
//////////////

async function sendMessage() {
    const message = input.value.trim();
    if (message === '') return;

    btnSend.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    btnSend.disabled = true;

    // Add user bubble
    addBubble(message, 'user');

    // Clear input
    input.value = '';

    // Send to backend
    $.ajax({
        url: `${window.location.origin}/api/v1/chatbot/get_response_from_chatbot`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        data: JSON.stringify({ 
            message: message,
            token: chatbotSessionToken
        }),
        success: function (data) {
            const reply = data.data.response || '[No response]';
            addBubble(reply, 'bot');

            saveMessage(message, 'user');
            saveMessage(reply, 'bot');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
            addBubble('[Error contacting server]', 'bot');
        },
        complete: function (data) {
            btnSend.innerHTML = 'Send';
            btnSend.disabled = false;
        }
    });
}

async function getChatbotSessionToken() {
    $.ajax({
        url: `${window.location.origin}/v1/chatbot/get_session_token`,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        success: function (data) {
            const token = data.data.token;

            sessionStorage.setItem('chatbot_session_token', token);

            chatbotSessionToken = token;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        }
    });
}

///////////////////
// Event handler //
///////////////////

input.addEventListener('keypress', function (event) {
    if (event.key === 'Enter' && !btnSend.disabled) {
        event.preventDefault(); // Stop default form submission if inside a form
        sendMessage();
    }
});

/////////////////////
// Helper function //
/////////////////////

function addBubble(text, type) {
    const chat = document.getElementById('chatWindow');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble shadow mb-3 ${type}`;

    let mdTextInHtml = converter.makeHtml(text);
    let cleanHtml = DOMPurify.sanitize(mdTextInHtml, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'] });
    bubble.innerHTML = cleanHtml;

    chat.appendChild(bubble);

    // Auto scroll to bottom
    chat.scrollTop = chat.scrollHeight;
}

function saveMessage(text, type) {
    const savedMessages = JSON.parse(sessionStorage.getItem('chatHistory')) || [];
    savedMessages.push({ text, type });
    sessionStorage.setItem('chatHistory', JSON.stringify(savedMessages));
}

function restoreMessages() {
    const savedMessages = JSON.parse(sessionStorage.getItem('chatHistory')) || [];
    savedMessages.forEach(msg => addBubble(msg.text, msg.type)); 
}
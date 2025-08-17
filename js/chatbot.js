const input = document.getElementById('userInput');
const btnSend = document.getElementById('btnSend');
const chatWindow = document.getElementById('chatWindow');
const converter = new showdown.Converter();

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

    addBubble("Hello, I'm Caro! Ask me anything about cyberbullying!", 'bot');
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
        url: `${endpointRoot}/v1/chatbot/get_response_from_chatbot`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        data: JSON.stringify({ message: message }),
        success: function (data) {
            const reply = data.data.response || '[No response]';
            addBubble(reply, 'bot');
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
    bubble.innerHTML = mdTextInHtml;

    chat.appendChild(bubble);

    // Auto scroll to bottom
    chat.scrollTop = chat.scrollHeight;
}

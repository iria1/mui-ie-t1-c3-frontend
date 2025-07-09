//var endpointRoot = "http://localhost:5000/api";
var endpointRoot = "https://childcybercare.duckdns.org/api";

const input = document.getElementById('userInput');

input.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Stop default form submission if inside a form
        sendMessage();
    }
});

async function sendMessage() {
    const message = input.value.trim();
    if (message === '') return;

    // Add user bubble
    addBubble(message, 'user');

    // Clear input
    input.value = '';

    // Send to backend
    $.post({
        url: `${endpointRoot}/chatbot/get_response_from_chatbot`,
        contentType: 'application/json',
        data: JSON.stringify({ message: message }),
        success: function (data) {
            const reply = data.data.response || '[No response]';
            addBubble(reply, 'bot');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
            addBubble('[Error contacting server]', 'bot');
        }
    });
}

function addBubble(text, type) {
    const chat = document.getElementById('chatWindow');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble shadow mb-3 ${type}`;
    bubble.innerText = text;
    chat.appendChild(bubble);

    // Auto scroll to bottom
    chat.scrollTop = chat.scrollHeight;
}

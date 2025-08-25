const input = document.getElementById('userInput');
const btnSend = document.getElementById('btnSend');

//////////////
// API call //
//////////////

async function analyzeMessage() {
    const message = input.value.trim();
    if (message === '') return;

    btnSend.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    btnSend.disabled = true;

    // Send to backend
    $.ajax({
        url: `${window.location.origin}/api/v1/message_analyzer/foo`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        data: JSON.stringify({ 
            message: message
        }),
        success: function (data) {
            console.log(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', errorThrown);
        },
        complete: function (data) {
            btnSend.innerHTML = 'Analyze';
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
        analyzeMessage();
    }
});
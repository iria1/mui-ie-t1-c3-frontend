const input = document.getElementById('userInput');
const btnSend = document.getElementById('btnSend');
const analyzedMessage = document.getElementById('analyzedMessage');
const analysisResult = document.getElementById('analysisResult');
const recipientBox = document.getElementById('recipientBox');
const senderBox = document.getElementById('senderBox');

let myProgressBar = null;

$(document).ready(function () {
    myProgressBar = new CircularProgressBar(200, 200, 'messageScore', {
        strokeSize: 20,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        strokeColor: '#006fb1',
        showProgressNumber: true
    });

    new bootstrap.Tooltip(analyzedMessage, {
        selector: '[data-bs-toggle="tooltip"]', // children only
        trigger: 'hover focus'
    });
});

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
        url: `${window.location.origin}/api/v1/message_analyzer/analyze`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwt_token")
        },
        data: JSON.stringify({
            message: message
        }),
        success: function (response) {
            analysisResult.classList.remove('d-none')

            recipientBox.innerHTML = response.data.response.recipient;
            senderBox.innerHTML = response.data.response.sender;

            renderAnalysis(response.data.analysis);
            setProgressBar(response.data.score);
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

/////////////////////
// Helper function //
/////////////////////

function setProgressBar(percent) {
    // update progress bar
    myProgressBar.setProgress(percent);

    // change color according to value
    const progressText = document.querySelector('#messageScore .progress-text');
    if (progressText) {
        if (percent > 50) {
            progressText.style.color = 'red';
        } else {
            progressText.style.color = 'yellow';
        }

        progressText.innerHTML = progressText.innerHTML + '%';
    }
}

function renderAnalysis(analysis) {
    // clear all content
    analyzedMessage.innerHTML = "";

    analysis.forEach(item => {
        const lineDiv = document.createElement("div");

        item.tokens.forEach(token => {
            const span = document.createElement("span");
            span.textContent = token.word + " ";

            // color the word if it's a no-no word
            if (token.label === 1) {
                span.style.color = "orange";
                span.style.fontWeight = "bold";
            } else if (token.label === 2) {
                span.style.color = "red";
                span.style.fontWeight = "bold";
            }

            // Add tooltip only if explanation is non-empty
            if (token.explanation) {
                let labelText = token.label === 1 ? "Not Cool" : "No Go";
                let tooltipHtml = `<div><strong>This is a ${labelText} word</strong><br>${token.explanation}</div>`;
                span.setAttribute("data-bs-toggle", "tooltip");
                span.setAttribute("data-bs-html", "true");
                span.setAttribute("title", tooltipHtml);
            }

            lineDiv.appendChild(span);
        });

        analyzedMessage.appendChild(lineDiv);
    });
}
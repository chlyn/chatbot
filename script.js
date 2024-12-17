
document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');

    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            sendMessage();
        }
    });
});

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const userText = userInput.value.trim();
    if (userText !== '') {
        addMessage(userText, 'user');
        userInput.value = '';
        const botResponse = await fetchBotResponse(userText);
        addMessage(botResponse, 'bot');
        askIfNeedsHelp();
    }
}

function addMessage(message, sender) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function fetchBotResponse(userText) {
    try {
        const response = await fetch("http://127.0.0.1:5000/get-bot-response", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: userText }),
        });

        if (response.ok) {
            const data = await response.json();
            return data.bot_response || "Sorry, I couldn't understand your request.";
        } else {
            return `Request failed with status code ${response.status}`;
        }
    } catch (error) {
        return "There was an error connecting to the backend.";
    }
}

function startConversation() {
    const content = document.querySelector('.content');
    content.classList.add('active');

    const chatInput = document.getElementById('chat-input');
    chatInput.classList.add('active');

    const getStartedButton = document.getElementById('get-started-btn');
    getStartedButton.style.display = 'none';
    
    addMessage("Hello! How can I assist you today?", 'bot');

    const specificResponses = [
        "How do I pay my water bill",
        "I want to start a new service",
        "Where do I get a permit",
        "I need assistance with my water bill",
        "My water is turned off",
        "I need to report a water emergency",
        "My meter is not working",
        "Estimated bills",
        "Speak to a customer service agent"
    ];
    displaySuggestedResponses(specificResponses);
}

function displaySuggestedResponses(responses) {
    const chatbox = document.getElementById('chatbox');

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.classList.add('suggested-responses');

    responses.forEach((response) => {
        const button = document.createElement('button');
        button.textContent = response;

        button.onclick = async () => {
            addMessage(response, 'user');
            const botResponse = await fetchBotResponse(response);
            addMessage(botResponse, 'bot');
            askIfNeedsHelp();

            if (suggestionsContainer.parentNode) {
                suggestionsContainer.parentNode.removeChild(suggestionsContainer);
            }
        };

        suggestionsContainer.appendChild(button);
    });

    chatbox.appendChild(suggestionsContainer);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function askIfNeedsHelp() {
    const chatbox = document.getElementById('chatbox');

    const promptElement = document.createElement('div');
    promptElement.classList.add('message', 'bot');
    promptElement.textContent = "Do you still need help?";

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('need-help-container');

    const yesButton = document.createElement('button');
    yesButton.textContent = "Yes";
    yesButton.classList.add('need-help');
    yesButton.onclick = () => {
        addMessage("Yes", 'user');
        addMessage("Here are some options for assistance:", 'bot');
        const specificResponses = [
            "How do I pay my water bill",
            "I want to start a new service",
            "Where do I get a permit",
            "I need assistance with my water bill",
            "My water is turned off",
            "I need to report a water emergency",
            "My meter is not working",
            "Estimated bills",
            "Speak to a customer service agent"
        ];
        displaySuggestedResponses(specificResponses);
        buttonContainer.remove();
    };

    const noButton = document.createElement('button');
    noButton.textContent = "No";
    noButton.classList.add('need-help');
    noButton.onclick = () => {
        addMessage("No", 'user');
        addMessage("Alright, have a great day!", 'bot');
        buttonContainer.remove();
    };

    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);

    chatbox.appendChild(promptElement);
    chatbox.appendChild(buttonContainer);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Your browser does not support speech recognition. Please use Google Chrome.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = function () {
        console.log("Voice recognition started. Speak into the microphone.");
    };

    recognition.onerror = function (event) {
        console.error("Speech recognition error detected: " + event.error);
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('user-input').value = transcript;
    };

    recognition.onend = function () {
        console.log("Voice recognition ended.");
    };

    recognition.start();
}

document.querySelector('.mic').addEventListener('click', startVoiceRecognition);

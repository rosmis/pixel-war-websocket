const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const ctas = document.querySelectorAll(".cta");
const ctaMessage = document.querySelector(".cta-send");
const ctaUserName = document.querySelector(".userName");

const promptUserModal = document.querySelector(".prompt-user");
const messagesWrapper = document.querySelector(".messages-wrapper");

let action = "add";

let isUserFirstConnection = false;
let userInfos;

const colorArray = [
    "green",
    "red",
    "yellow",
    "blue",
    "orange",
    "purple",
    "white",
];

const ws = new WebSocket("ws://localhost:8080");

// STORE IN LOCALSTORAGE USER IF FIRST CONNECTION

window.addEventListener("DOMContentLoaded", () => {
    const userStorage = localStorage.getItem("user");

    if (!userStorage) {
        isUserFirstConnection = true;
        promptUserModal.classList.add("display");

        return;
    }

    userInfos = JSON.parse(userStorage);
});

ctaUserName.addEventListener("click", () => {
    const userName = document.getElementById("userInput").value;
    const errorMessage = document.querySelector(".error");

    if (!userName) {
        errorMessage.classList.add("opacity");
        return;
    }

    errorMessage.classList.remove("opacity");

    setUserData(userName);
});

ctas.forEach((cta, index) => {
    cta.addEventListener("click", () => {
        if (!cta.classList.contains("active")) {
            cta.classList.add("active");
            ctas[index === 1 ? 0 : 1].classList.remove("active");

            action = cta.classList.contains("remove") ? "remove" : "add";
        }
    });
});

canvas.addEventListener("click", (event) => {
    if (ws.readyState === WebSocket.OPEN) {
        const rect = canvas.getBoundingClientRect();

        // get position clicked cursor in canvas
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const id = `${x},${y}`;

        const data = {
            action,
            data: {
                id,
                x,
                y,
                color: action === "add" ? colorArray[userInfos.id] : "black",
            },
        };

        ws.send(JSON.stringify(data));
    }
});

ctaMessage.addEventListener("click", () => sendUserMessage());

// LOGIC FOR DISPLAYING PIXEL OR MESSAGE
ws.onmessage = (event) => {
    const { action, data } = JSON.parse(event.data);

    if (action === "add") {
        ctx.fillStyle = data.color;
        ctx.fillRect(data.x, data.y, 10, 10);
    } else if (action === "remove") {
        ctx.fillStyle = data.color;
        ctx.fillRect(data.x, data.y, 50, 50);
    } else {
        console.log("message received");
        displayUserMessage(data);
    }
};

function setUserData(userName) {
    const userData = { id: Math.floor(Math.random() * 6), userName };

    localStorage.setItem("user", JSON.stringify(userData));

    userInfos = userData;

    promptUserModal.classList.remove("display");

    isUserFirstConnection = false;
}

function sendUserMessage() {
    const userMessage = document.getElementById("chat-input").value;
    const userData = JSON.parse(localStorage.getItem("user"));
    const userName = userData.userName;

    if (!userMessage) return;

    if (ws.readyState === WebSocket.OPEN) {
        const data = {
            action: "message",
            data: { userName, userMessage },
        };

        ws.send(JSON.stringify(data));
    }

    document.getElementById("chat-input").value = "";
}

function displayUserMessage(event) {
    const { userName, userMessage } = event;

    const content = document.createElement("div");
    content.setAttribute("class", "message");

    // possible xss injection but that was the only way i could do it using plain js
    content.innerHTML = `
        <p class="userName">by ${userName}</p>
        <p class="content">${userMessage}</p>
    `;

    messagesWrapper.appendChild(content);
}

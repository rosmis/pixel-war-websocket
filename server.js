const express = require("express");
const http = require("http");
const webSocket = require("ws");

const app = express();
const server = http.createServer(app);
const ws = new webSocket.Server({ server });

ws.on("connection", (socket) => {
    socket.on("message", (message) => {
        const { action, data } = JSON.parse(message);

        if (["add", "remove", "message"].includes(action)) {
            ws.clients.forEach((client) => {
                if (client.readyState === webSocket.OPEN) {
                    client.send(JSON.stringify({ action, data }));
                }
            });
        }
    });
});

server.listen(8080, () => {
    console.log("server on");
});

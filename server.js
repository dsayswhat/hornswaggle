const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from 'public' directory
app.use(express.static('public'));

// Object to store the state of checkboxes and their labels
// Format: { id: { checked: boolean, label: string } }
const checkboxes = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    // Initialize client with current checkboxes and their states
    socket.emit('initCheckboxes', checkboxes);

    socket.on('createCheckbox', (data) => {
        const { id, label } = data;
        checkboxes[id] = { checked: false, label };
        io.emit('createCheckbox', data); // Broadcast creation to all clients
    });

    socket.on('updateLabel', (data) => {
        const { id, label } = data;
        if (checkboxes[id]) {
            checkboxes[id].label = label;
        }
        io.emit('updateLabel', data); // Broadcast label update to all clients
    });

    socket.on('deleteCheckbox', (id) => {
        delete checkboxes[id];
        io.emit('deleteCheckbox', id); // Broadcast deletion to all clients
    });

    socket.on('toggleCheckbox', (data) => {
        const { id, checked } = data;
        if (checkboxes[id]) {
            checkboxes[id].checked = checked;
        }
        io.emit('toggleCheckbox', data); // Broadcast toggle state to all clients
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Listening on *:3000');
});

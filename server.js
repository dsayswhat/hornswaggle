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
        socket.broadcast.emit('createCheckbox', data); // Broadcast creation to all clients
    });

    socket.on('updateLabel', (data) => {
        const { id, label } = data;
        if (checkboxes[id]) {
            checkboxes[id].label = label;
        }
        socket.broadcast.emit('updateLabel', data); // Broadcast label update to all clients
    });
/*
    socket.on('removeCheckbox', (id) => {
        delete checkboxes[id];
        socket.emit('deleteCheckbox', id); // Broadcast deletion to all clients
    });
*/
    socket.on('toggleCheckbox', (data) => {
        const { id, checked } = data;
        if (checkboxes[id]) {
            checkboxes[id].checked = checked;
        }
        socket.broadcast.emit('toggleCheckbox', data); // Broadcast toggle state to all clients
    });

    socket.on('disconnect', () => {
      //  console.log('User disconnected');
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening');
    
});

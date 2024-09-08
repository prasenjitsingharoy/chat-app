// this is the server side js
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
// create server
const server = http.createServer(app);
// register the server for sockets
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');

app.use(express.static(publicDirectory));

// on connection with the socket (everytime a new user is using the server)
io.on('connection', (socket) => {
    console.log('New websocket connection!');
    
    // on recieving socket for joining the room
    socket.on('join', ({ username, room }, callback) => {
        // function to add an user
        const { user, error } = addUser({ id: socket.id, username, room });

        if(error){
            return callback(error);
        }

        socket.join(user.room);

        // emit message socket 
        socket.emit('message', generateMessage('Admin', 'Welcome!'));
    
        // only notify the other users and not the user who has joined
        // socket.broadcast.emit -> sends message to every socket accept the socket that sends it
        // socket.broadcast.to.emit -> sends message to every socket joining a particular room accept the socket that sends it
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} joined the room!`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })
    

    // callback is called for acknowledging
    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id);

        const filter = new Filter();
        
        // checking for profanity
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        // io.emit emits message to all the sockets
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback('The message was delivered!');
    });

    // on recieving sendLocation socket
    socket.on('sendLocation', (position, callback) => {

        const user = getUser(socket.id);

        //io.emit('message', `https://google.com/maps?q=${position.latitude},${position.longitude}`);
        io.to(user.room).emit('locationMesage', generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`));
        // callback for acknowledgement
        callback('Your location was shared successfully!');
    })

    // when an user disconnects
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the chat!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });

    // just to understand the concept
    // //socket.emit('countUpdated', count);
    // socket.on('increment', () => {
    //     count++;
    //     // socket.emit('countUpdated', count); // emits connection to a single socket
    //     io.emit('countUpdated', count);        // emits connection to all sockets
    // })
});

server.listen(port, () => {
    console.log('Express is running on port ' + port);
});
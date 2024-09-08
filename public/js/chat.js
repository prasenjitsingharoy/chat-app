// this is the client side js
const socket = io();

// elements for manipulating form data
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// options 
// location.search contains the query string
//avoid ? in the query string
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// function to autoscroll the messages
const autoscroll = () => {
    // select the new message from the messages
    const $newMessage = $messages.lastElementChild;

    //get the height of the new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container 
    const containerHeight = $messages.scrollHeight

    // how far user have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }

}

// on recieving message
socket.on('message', (message) => {
    //console.log(`Message: ${msg}`);

    // render messageTemplate
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.msg,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    // insert html at the end of message
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

// on recieving locationMessage
socket.on('locationMesage', (message) => {
    // console.log(url);

    // render locationTemplate
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    // insert html at the end of message
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData', ({ room, users }) => {
    // console.log(room);
    // console.log(users);

    // render sidebarTemplate
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });

    // insert html at the end of message
    document.querySelector('#sidebar').innerHTML = html;
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    // prevents page from refreshing
    e.preventDefault();

    //disable the form until the previous msg was delivered
    $messageFormButton.setAttribute('disabled', 'disabled');

    //const msg = document.querySelector('#message').value;
    const msg = e.target.elements.message.value;

    // emit sendMessage socket
    socket.emit('sendMessage', msg, (error) => {

        // enable the form after the msg was delivered
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }

        console.log('Message delivered!');
    });
});

// add event listener to send location button
$sendLocationButton.addEventListener('click', () => {

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!');
    }

    // disable send location button
    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position);

        // emit sendLocation socket
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (message) => {
            // enable send location button
            $sendLocationButton.removeAttribute('disabled');
            console.log(message);
        });
    });
});

// emit join socket for joining a room with a particular username
socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error);
        location.href = '/';
    }
});

// for understanding concept only
// // On recieving 'countUpdated' event, run the following
// socket.on('countUpdated', (count) => {
//     console.log('count has been updated!', count++);
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked!');
//     // when the button is clicked, emit the increment event
//     socket.emit('increment');
// });

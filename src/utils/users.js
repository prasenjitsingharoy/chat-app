// This js file keep track of the users
const users = [];

// add user
const addUser = ({id, username, room}) => {
    // clean the data
    // trim the whitespaces and convert to lower case
    username =username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // check if username and room exists
    if(!username || !room){
        return {
            error: 'Username and room are required!'
        };
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    })

    // validate username
    if(existingUser){
        return {
            error: 'username is in use!'
        };
    }

    // store user
    const user = { id, username, room};
    users.push(user);
    return { user }; 
};

//remove an existing user
const removeUser = (id) => {

    // find the index of the user whose id matches with the current id
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

// get an user by its id
const getUser = (id) => {
    const userById = users.find((user) => {
        return user.id === id;
    })

    return userById;
}

// get all users in a particular room
const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return user.room === room;
    })

    return usersInRoom;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
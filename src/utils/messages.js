const generateMessage = (username, text) => {
    return {
        username,
        msg: text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, text) => {
    return {
        username,
        url: text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
};
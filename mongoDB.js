require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL)

const userSchema = new mongoose.Schema({
    username: String
})

const User = mongoose.model('User', userSchema)

function addUser(userName) {
    let user = new User({ username: userName })
    
    user.save((err) => {
        if (err) {
            console.log(err)
        }
    })
    
    return {
        username: user.username,
        _id: user.id
    }
}

module.exports = {
    addUser: addUser
}
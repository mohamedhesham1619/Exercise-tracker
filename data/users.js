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

async function getUsers() {
    // get all users in the collection
    let users = await User.find()

    return users
}

async function getUsernameById(userId) {

    let user = await User.findById(userId)
    return user['username']
}


module.exports = {
    addUser: addUser,
    getUsers: getUsers,
    getUsernameById: getUsernameById,
    
}
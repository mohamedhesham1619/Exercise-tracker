require('dotenv').config()
const mongoose = require('mongoose')
const { getUsernameById } = require('./users')

mongoose.connect(process.env.MONGODB_URL)

const exerciseSchema = new mongoose.Schema({
    id: String,
    username: String,
    description: String,
    duration: Number,
    date: String
})

const exerciseModel = mongoose.model('exercise', exerciseSchema)

// details is the request body for '/api/users/:_id/exercises' endpoint
async function addExcercise(details) {
    let userName = await getUsernameById(details[':_id'])

    // if the date is empty use the current date
    let date = (details['date'] == '') ? new Date(Date.now()).toDateString() : new Date(details['date']).toDateString()

    let exercise = new exerciseModel({
        '_id': details[':_id'],
        username: userName,
        date: date,
        duration: details['duration'],
        description: details['description'],
    })

    exercise.save((err) => {
        if (err) console.log(err)
    })
    return exercise
}

module.exports = {
    addExcercise: addExcercise
}
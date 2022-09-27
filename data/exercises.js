require('dotenv').config()
const mongoose = require('mongoose')
const { getUsernameById } = require('./users')

mongoose.connect(process.env.MONGODB_URL)

const exerciseSchema = new mongoose.Schema({
    description: String,
    duration: Number,
    date: String
}, {_id: false})

const logsSchema = new mongoose.Schema({
    username: String,
    count: Number,
    '_id': String,
    log: [exerciseSchema]
    
}, {_id: false})

const exerciseModel = mongoose.model('exercise', exerciseSchema)
const logsModel = mongoose.model('logs', logsSchema)

// save the exercise in user logs for every user and return response object with user info and exercise details
// details is the request body for '/api/users/:_id/exercises' endpoint
async function addExcercise(details) {
    let userName = await getUsernameById(details[':_id'])

    // if the date is empty use the current date
    let date = (details['date'] == '') ? new Date(Date.now()).toDateString() : new Date(details['date']).toDateString()

    let exercise = new exerciseModel({
        date: date,
        duration: details['duration'],
        description: details['description'],
    })

    let userLogs = await logsModel.findOne({'_id': details[':_id']})
    console.log('found log: ', userLogs, typeof userLogs)
    if(!userLogs){
        let newUserLogs = new logsModel({
            '_id': details[':_id'],
            username: userName,
            count: 1,
            log: [exercise]
        })
        
        newUserLogs.save()
    }
    else{
        userLogs.count++
        userLogs.log.push(exercise)
        userLogs.save()
    }
    

    let response = {
        '_id': details[':_id'],
        username: userName,
        date: date,
        duration: details['duration'],
        description: details['description'],
    }
    return response
}

// return all logs for the given user id
async function getLogs(userId){
    let userLogs = await logsModel.find({'_id': userId})
    return userLogs
}

module.exports = {
    addExcercise: addExcercise,
    getLogs: getLogs
}
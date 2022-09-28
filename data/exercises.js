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
async function addExcercise(userId, exerciseDetails) {
    
    if(! userId){
        return{
            error: "id not found"
        }
    }
    let userName = await getUsernameById(userId)

    if(! userName){
        return {
            error: "user not found"
        }
    }

    // if the date in request body is empty use the current date
    let date = (!exerciseDetails['date']) ? new Date(Date.now()).toDateString() : new Date(exerciseDetails['date']).toDateString()

    let exercise = new exerciseModel({
        date: date,
        duration: exerciseDetails['duration'],
        description: exerciseDetails['description'],
    })

    let userLogs = await logsModel.findOne({'_id': userId})

    // if the user is new and doesn't have logs create a new logs document for him
    if(!userLogs){
        let newUserLogs = new logsModel({
            '_id': userId,
            username: userName,
            count: 1,
            log: [exercise]
        })
        
        newUserLogs.save()
    }
    // if the user already has logs add the exercise to it and increse the count by one
    else{
        userLogs.count++
        userLogs.log.push(exercise)
        userLogs.save()
    }
    

    let response = {
        '_id': userId,
        username: userName,
        date: date,
        duration: Number(exerciseDetails['duration']),
        description: exerciseDetails['description'],
    }
    return response
}

// return logs for the given user id
// options can be ('from', 'to') for date and 'limit' for limiting the logs number
async function getLogs(userId, options){
    let optionFrom = options['from']
    let optionTo = options['to']
    let optionLimit = options['limit']

    // make deep copy of user logs to avoid edittig the original one
    let userLogs = JSON.parse(JSON.stringify(await logsModel.findOne({'_id': userId})))

    if(! userLogs){
        return {
            error: "logs not found"
        }
    }
    
    // if no options provided return the user logs without any filters
    if(!optionFrom && !optionTo && !optionLimit){
        return userLogs
    }
    
    let logsList = userLogs['log']
    let filteredLogsList = []

    let optionFromValue = new Date(optionFrom)
    let optionToValue = new Date(optionTo)
    let optionLimitValue = Number(optionLimit)

    // if options from and to provided
    if(optionFrom && optionTo){
        filteredLogsList = logsList.filter((log)=>{
            let logDate = new Date(log['date'])
            return (logDate >= optionFromValue && logDate <= optionToValue)
        })
    }
    // if only option from provided
    else if(optionFrom){
        filteredLogsList = logsList.filter((log)=>{
            let logDate = new Date(log['date'])
            return (logDate >= optionFromValue)
        })
    }
    // if only option to provided
    else if(optionTo){
        filteredLogsList = logsList.filter((log)=>{
            let logDate = new Date(log['date'])
            return (logDate <= optionTo)
        })
    }
    // if only option limit provided, limit the full list
    if(optionLimit && !optionFrom && !optionTo){
        filteredLogsList = logsList.slice(0, optionLimitValue)
    }
    // if option limit provided with option from or to or both, limit the filtered list
    else if(optionLimit && (optionFrom || optionTo)){
        filteredLogsList = filteredLogsList.slice(0, Number(optionLimitValue))
    }
    
    userLogs.log = filteredLogsList
    return userLogs
}

module.exports = {
    addExcercise: addExcercise,
    getLogs: getLogs
}
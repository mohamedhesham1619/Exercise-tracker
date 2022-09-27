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
    console.log('id: ', details[':_id'])
    if(details[':_id']){
        return{
            error: "id not found"
        }
    }
    let userName = await getUsernameById(details[':_id'])

    if(! userName){
        return {
            error: "user not found"
        }
    }

    // if the date is empty use the current date
    let date = (details['date'] == '') ? new Date(Date.now()).toDateString() : new Date(details['date']).toDateString()

    let exercise = new exerciseModel({
        date: date,
        duration: details['duration'],
        description: details['description'],
    })

    let userLogs = await logsModel.findOne({'_id': details[':_id']})
    
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
        duration: Number(details['duration']),
        description: details['description'],
    }
    return response
}

// return logs for the given user id
// options can be ('from', 'to') for date and 'limit' for limiting the logs number
async function getLogs(userId, options){
    let optionFromDate = options['from']
    let optionToDate = options['to']
    let optionLimitNumber = options['limit']

    // make deep copy of user logs to avoid edittig the original one
    let userLogs = JSON.parse(JSON.stringify(await logsModel.findOne({'_id': userId})))
    
    // if no options provided return the user logs without any filters
    if(!optionFromDate && !optionToDate && !optionLimitNumber){
        return userLogs
    }
    
    let logsList = userLogs['log']
    let filteredLogsList = []

    // if options from and to provided
    if(optionFromDate && optionToDate){
        filteredLogsList = logsList.filter((log)=>{
            let logDate = new Date(log['date'])
            return (logDate >= optionFromDate && logDate <= optionToDate)
        })
    }
    // if only option from provided
    else if(optionFromDate){
        filteredLogsList = logsList.filter((log)=>{
            let logDate = new Date(log['date'])
            return (logDate >= optionFromDate)
        })
    }
    // if only option to provided
    else if(optionToDate){
        filteredLogsList = logsList.filter((log)=>{
            let logDate = new Date(log['date'])
            return (logDate <= optionToDate)
        })
    }
    // if only option limit provided, limit the full list
    if(optionLimitNumber && !optionFromDate && !optionToDate){
        filteredLogsList = logsList.slice(0, Number(optionLimitNumber))
    }
    // if option limit provided with option from or to or both, limit the filtered list
    else if(optionLimitNumber && (optionFromDate || optionToDate)){
        filteredLogsList = filteredLogsList.slice(0, Number(optionLimitNumber))
    }
    
    userLogs.log = filteredLogsList
    return userLogs
}

module.exports = {
    addExcercise: addExcercise,
    getLogs: getLogs
}
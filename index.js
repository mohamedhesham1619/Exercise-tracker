const express = require('express')
const app = express()
const cors = require('cors')
const { addUser, getUsers } = require('./data/users')
const { addExcercise, getLogs } = require('./data/exercises')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  res.json(addUser(req.body.username))
})

app.get('/api/users', async(req, res)=>{
  let users = await getUsers()
  res.json(users)
})

app.post('/api/users/:_id/exercises',async (req, res)=>{
  let userId = req.params['_id']
  let exerciseDetails = req.body
  let response = await addExcercise(userId, exerciseDetails)
  res.json(response)
})

app.get('/api/users/:_id/logs', async (req, res)=>{
  let options =  req.query
  let userId = req.params._id
  
  res.json(await getLogs(userId, options))
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

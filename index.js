const express = require('express')
const app = express()
const cors = require('cors')
const { addUser, getUsers, getUsernameById, getCollections } = require('./data/users')
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
  
  res.json(await addExcercise(req.body))
})

app.get('/api/users/:_id/logs', async (req, res)=>{
  let options =  req.query
  let userId = req.params._id
  
  res.json(await getLogs(userId))
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

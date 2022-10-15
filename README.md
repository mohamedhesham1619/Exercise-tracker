# Exercise Tracker

## Overview
This project uses mongoDB to store users and their exercises.
### Url: https://exercise-tracker1122.herokuapp.com/

## Api endpoints
### Add new user
```
post: /api/users

Request: {
  username: String
}

Response: {
  username: String,
  _id: String
}
```

### Add an exercise for the user
Note: if no date provided the current date will be used.
```
post: /api/users/{_id}/exercises

Request: {
  date: String (format: "yyyy-mm-dd"),
  description: String,
  duration: Number
}

Response: {
  username: String,
  _id: String,
  description: String,
  duration: Number,
  date: String  
}
```

### Get all the users in the database
```
get: api/users

Response: [
  {
    _id: String,
    username: String
  }
]
```

### Get all the exercises of any user
Note: options "from", "to", "limit" can be used as paramaters to filter the logs, ex: "api/users/{_id}/logs?from=2022-10-1&to=2022-11-1&limit=3".
```
get: api/users/{_id}/logs

Response: {
  username: String,
  count: Number,
  log: [
    {
      description: String,
      duration: Number,
      date: String
    }
  ]
}
```

## Built with
- Node.js
- Express
- MongoDB

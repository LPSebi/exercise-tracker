import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { v4 as uuid } from 'uuid'
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({ origin: '*' }))
const exercises = []

const users = []

const logs = []

app.post('/api/users', (req, res) => {
    const username = req.body.username
    const user = { username, _id: uuid() }
    users.push(user)
    // logs.push({ username, _id: user._id })
    res.json(user)
})

app.get('/api/users', (req, res) => {
    res.json(users)
})

app.post('/api/users/:_id/exercises', (req, res) => {
    const { _id } = req.params
    const { description, duration } = req.body
    const date = req.body.date
        ? new Date(req.body.date).toDateString()
        : new Date().toDateString()
    const user = users.find((user) => user._id === _id)
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    const exercise = {
        description,
        duration: Number(duration),
        date,
        _id,
    }
    exercises.push(exercise)
    logs.push(exercise)

    res.json({ ...exercise, ...user })
})

app.get('/api/users/:_id/logs/:from?/:to?/:limit?', (req, res) => {
    const { _id, from, to, limit } = req.params
    let foundLogs = logs.filter((log) => {
        console.log(log)
        return log._id === _id
    })

    if (from) {
        foundLogs = foundLogs.filter(
            (log) => new Date(log.date) >= new Date(from)
        )
    }
    if (to) {
        foundLogs = foundLogs.filter(
            (log) => new Date(log.date) <= new Date(to)
        )
    }
    if (limit) {
        foundLogs = foundLogs.slice(0, limit)
    }

    const user = users.find((user) => user._id === _id)
    if (!user) {
        return res.status(404).json({ error: 'User not found' })
    }
    res.json({ ...user, log: foundLogs, count: foundLogs.length })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

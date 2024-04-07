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
    logs.push({ username, _id: user._id })
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
        _id: uuid(),
    }
    exercises.push(exercise)
    if (!logs.find((log) => log._id === _id)) {
        logs.push({ log: [exercise], count: 1 })
    } else {
        logs.find((log) => log._id === _id).count++
    }
    res.json({ ...exercise, ...user })
})

app.get('/api/users/:_id/logs', (req, res) => {
    const { _id } = req.params
    const { from, to, limit } = req.body
    let foundLogs = logs

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
    const userLogs = foundLogs.filter((log) => log._id === _id)
    res.json({ ...user, log: userLogs })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

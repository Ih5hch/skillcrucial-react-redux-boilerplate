import express from 'express'
import path from 'path'
import cors from 'cors'
import axios from 'axios'
// import { nanoid } from 'nanoid'
import sockjs from 'sockjs'
import cookieParser from 'cookie-parser'

import config from './config'
import Html from '../client/html'

require('colors')

let connections = []

const port = process.env.PORT || 8090
const server = express()

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist')),
  express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  express.json({ limit: '50mb', extended: true }),
  cookieParser()
]

middleware.forEach((it) => server.use(it))

let usersP = []

server.get('/api/user/:id', (req, res) => {
  const user = req.body
  const id = req.params
  res.json({ ...user, ...id, test: 'Test13' })
})

server.get('/api/user/dash', (req, res) => {
  const user = req.body
  res.json({ ...user, test: 'Test13' })
})

server.get('/api/users/find/:id', (req, res) => {
  const { id } = req.params
  const findUser = usersP.find((user) => user.id === +id)
  if (!findUser) {
    res.json({ status: 'null' })
  }
  res.json(findUser)
})

server.get('/api/users', (req, res) => {
  res.json(usersP)
})

server.post('/api/user', (req, res) => {
  const currentUser = { ...req.body, id: Math.trunc(Math.random() * 1000_000_000) }
  usersP = [...usersP, currentUser]
  res.json(currentUser)
})

server.get('/', (req, res) => {
  res.send(`
    <h2>This is SkillCrucial Express Server!</h2>
    <h3>Client hosted at <a href="http://localhost:8087">localhost:8087</a>!</h3>
  `)
})

// server.get('/api/v1/users', (req, res) => {
//   res.json({ name: 'Oleksii' })
// })

server.get('/api/v1/users', async (req, res) => {
  const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')
  res.json(users)
})

server.get('/api/v1/users/take/:number', async (req, res) => {
  const { number } = req.params
  const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')

  res.json(users.slice(0, +number))
})

server.get('/api/v1/users/:name', (req, res) => {
  const { name } = req.params
  res.json({ name })
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }

  return res.send(
    Html({
      body: '',
      initialState
    })
  )
})

server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})

const app = server.listen(port)

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.on('data', async () => {})

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
console.log(`Serving at http://localhost:${port}`)

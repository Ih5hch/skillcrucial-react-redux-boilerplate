import express from 'express'
import path from 'path'
import cors from 'cors'
import axios from 'axios'
// import { nanoid } from 'nanoid'
import sockjs from 'sockjs'
import cookieParser from 'cookie-parser'

import config from './config'
import Html from '../client/html'

const { readFile, writeFile } = require('fs').promises

require('colors')

let connections = []

const port = process.env.PORT || 8090
const server = express()

const setHeader = (req, res, next) => {
  res.set('x-skillcrucial-user', 'c2b01230-e471-4abc-bb6f-fa594c3bd195')
  res.set('Access-Control-Expose-Headers', 'X-SKILLCRUCIAL-USER')
  next()
}

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist')),
  express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  express.json({ limit: '50mb', extended: true }),
  cookieParser(),
  setHeader
]

middleware.forEach((it) => server.use(it))

let usersP = []
const usersPath = `${__dirname}/data/users.json`

server.get('/api/fakeusers', async (req, res) => {
  try {
    const strData = await readFile(usersPath, 'utf-8')
    res.json(JSON.parse(strData))
  } catch (e) {
    console.log(e)

    try {
      const { data } = await axios('https://jsonplaceholder.typicode.com/users')
      usersP = [...usersP, ...data]
      writeFile(usersPath, JSON.stringify(data), 'utf-8')
      res.json({ status: 'success', users_amount: usersP.length, users: data })
    } catch (err) {
      console.log(err)
      res.json({ status: 'Error', case: err.message })
    }
  }
})

server.post('/api/fakeusers', async (req, res) => {
  const newUser = { ...req.body, id: '993ff78' }
  const readUser = await readFile(usersPath, 'utf-8')
    .then((usersStored) => {
      return JSON.parse(usersStored)
    })
    .catch(() => {
      return []
    })
  const newUsersList = [...readUser, newUser]
  await writeFile(usersPath, JSON.stringify(newUsersList), 'utf-8')
  res.json({ status: 'success', newUser })
})

server.get('/api/user/:id', (req, res) => {
  const user = req.body
  const id = req.params
  res.json({ ...user, ...id, test: 'Test13' })
})

server.get('/api/user/test', (req, res) => {
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

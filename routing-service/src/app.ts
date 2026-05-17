import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import rotasRouter from './routes/routes'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/rotas', rotasRouter)
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

export default app

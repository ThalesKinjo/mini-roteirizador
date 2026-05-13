import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { AppDataSource } from './db/dataSource'
import rotasRouter from './routes/routes'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/rotas', rotasRouter)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 4000

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`Routing service rodando na porta ${PORT}`))
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco:', err)
    process.exit(1)
  })

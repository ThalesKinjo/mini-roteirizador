import dotenv from 'dotenv'
import { AppDataSource } from './db/dataSource'
import app from './app'

dotenv.config()

const PORT = process.env.PORT || 4000

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => console.log(`Routing service rodando na porta ${PORT}`))
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco:', err)
    process.exit(1)
  })

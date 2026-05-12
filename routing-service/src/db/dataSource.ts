import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Route } from '../entities/Route'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [Route],
  migrations: [],
  subscribers: []
})

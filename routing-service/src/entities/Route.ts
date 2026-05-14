import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm'

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  vehicleId!: string

  @Column({ type: 'varchar', nullable: true })
  motoristaId!: string | null

  @Column({ type: 'jsonb' })
  addressIds!: string[]

  @Column({ default: 'calculada' })
  status!: string

  @Column({ type: 'float', default: 0 })
  distanciaTotalKm!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

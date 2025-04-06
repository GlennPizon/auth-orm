import { Entity, PrimaryColumn, Column } from 'typeorm';
@Entity()
export class RefreshToken {
  @PrimaryColumn({
    type: 'varchar',
  })
  id: string;

  @Column()
  token: string;

  @Column({ nullable: true })
  replacedByToken: string | null;  // New refresh token replaces the old one

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}

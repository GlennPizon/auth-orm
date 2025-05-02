import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
  } from "typeorm";
  import { Accounts } from "./Accounts";
  
  @Entity('refreshToken')
  export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'varchar' })
    token: string;
  
    @Column()
    expires: Date;
  
    @Column()
    created: Date;
  
    @Column({ type: 'varchar' })
    createdByIp: string;
  
    @Column({ type: 'date', nullable: true })
    revoked: Date;
  
    @Column({ type: 'varchar', nullable: true })
    revokedByIp: string;
  
    @Column({ type: 'varchar', nullable: true })
    replacedByToken: string;
  
    @ManyToOne(() => Accounts, (account) => account.refreshToken, {
      onDelete: 'CASCADE',
    })
    account: Accounts;
  
    get isExpired(): boolean {
      return new Date() >= this.expires;
    }
  
    get isActive(): boolean {
      return !this.revoked && !this.isExpired;
    }
  }
  
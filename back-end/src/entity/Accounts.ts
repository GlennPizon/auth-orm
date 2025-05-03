// src/entities/User.ts
import {Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from "typeorm";
import {Role} from '../utils/role';
import { RefreshToken } from "./RefreshToken";
  
  @Entity()
  export class Accounts {
    @PrimaryColumn(
        {
            type: "varchar",
            length: 36
        }
    )
    id: string;
  
    @Column({ type: 'varchar', nullable:false })
    email: string;
  
    @Column({type: 'varchar', nullable:false, select: false })
    passwordHash: string;

    @Column({type: 'varchar'})
    title: string;
    
    @Column({type: 'varchar', nullable:false })
    firstName: string;

    @Column({type: 'varchar', nullable:false })
    lastName: string;

    @Column({type: 'boolean', nullable:false })
    acceptTerms: boolean;

    @Column({type: 'varchar', default: Role.User})
    role: Role;
  
    @Column({type: 'varchar', nullable: true })
    verificationToken: string;

    @Column({type: 'date'})
    verified: Date;

    @OneToMany(() => RefreshToken, (token) => token.account)
    refreshToken: RefreshToken[]

    @Column({type: 'varchar', nullable: true })
    resetToken: string;

    @Column({type: 'date'})
    resetTokenExpires: Date;

    @Column({type: 'date'})
    passwordReset: Date;

    @CreateDateColumn({type: 'date', default: () => 'CURRENT_TIMESTAMP'}) 
    created: Date;

    @UpdateDateColumn({type: 'date', default: () => 'CURRENT_TIMESTAMP'})
    updated: Date;

    get isVerified(): boolean {
      return !!this.verified || !!this.passwordReset
    }
    

  }

  export default Accounts;
  
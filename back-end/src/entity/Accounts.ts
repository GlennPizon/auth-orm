import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Role } from '../utils/role';
import { RefreshToken } from "./RefreshToken";

@Entity()
export class Accounts {
  @PrimaryColumn({
    type: "varchar",
    length: 36
  })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: false, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50 })
  title: string;
  
  @Column({ type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  acceptTerms: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationToken: string;

  @Column({ type: 'datetime', nullable: true })
  verified: Date | null;

  @OneToMany(() => RefreshToken, (token) => token.account)
  refreshTokens: RefreshToken[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetTokenExpires: Date | null;

  @Column({ type: 'datetime', nullable: true })
  passwordReset: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  created: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated: Date;

  get isVerified(): boolean {
    return !!this.verified || !!this.passwordReset;
  }
}
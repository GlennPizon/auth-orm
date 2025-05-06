import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Accounts } from "./Accounts";

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryColumn({
    type: 'varchar',
    length: 36
  })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  token: string;

  @Column({ type: 'datetime' })
  expires: Date;

  @CreateDateColumn({ type: 'datetime' })
  created: Date;

  @Column({ type: 'varchar', length: 50 })
  createdByIp: string;

  @Column({ type: 'datetime', nullable: true })
  revoked: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  revokedByIp: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  replacedByToken: string | null;

  @ManyToOne(() => Accounts, (account) => account.refreshTokens, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'account_id' })
  account: Accounts;

  get isExpired(): boolean {
    return new Date() >= this.expires;
  }

  get isActive(): boolean {
    return !this.revoked && !this.isExpired;
  }
}
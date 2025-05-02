import { Entity, PrimaryColumn, Column , ManyToOne} from "typeorm";
import { Accounts } from "./Accounts";

@Entity('refreshToken')
export class RefreshToken{
    @PrimaryColumn()
    id: string;

    @Column({type:'varchar'})
    token: string;

    @Column()
    expires: Date;

    @Column()
    created: Date;

    @Column({type:'varchar'})
    createdByIp: string;

    @Column({type:'date'})
    revoked: Date;

    @Column({type:'varchar'})
    revokedByIp: string;

    @Column({type:'varchar'})
    replacedByToken: string;


    get isExpired(): boolean {
        return new Date() >= this.expires;

    }

    get isActive(): boolean {
        return !this.revoked && !this.isExpired;
    }
    
    
    @ManyToOne( () => Accounts, (accounts)=> accounts.refreshToken, {onDelete: 'CASCADE'})
    accounts: Accounts;


}
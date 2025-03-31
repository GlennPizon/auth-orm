import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    passwordHash: string;

    
}

export default Account;
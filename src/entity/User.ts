// src/entities/User.ts
import {Entity, PrimaryColumn, Column} from "typeorm";
  
  @Entity()
  export class User {
    @PrimaryColumn(
        {
            type: "varchar"
        }
    )
    id: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column({ default: false })
    isVerified: boolean;
  
    @Column({ nullable: true })
    verificationToken: string;

    @Column({ default: "User" })
    role: "Admin" | "User";

  }
  
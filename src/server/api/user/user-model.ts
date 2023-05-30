import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("identity")
  id!: string;

  @Column()
  name!: string;
}

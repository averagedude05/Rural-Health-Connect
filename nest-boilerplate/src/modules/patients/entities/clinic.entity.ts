import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "clinics" })
export class Clinic {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({
    type: "varchar",
    length: 160,
    name: "name",
  })
  name!: string;

  @Column({
    type: "text",
    name: "address",
  })
  address!: string;

  @Column({
    type: "varchar",
    length: 160,
    name: "location",
    nullable: true,
  })
  location!: string | null;

  @Column({
    type: "varchar",
    length: 20,
    name: "contact_number",
  })
  contactNumber!: string;

  @Column({
    type: "text",
    name: "description",
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: "varchar",
    length: 20,
    name: "status",
  })
  status!: string;
}
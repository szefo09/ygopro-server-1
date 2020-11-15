import {Column, Entity, Index, OneToMany, PrimaryColumn} from "typeorm";
import {UserDialog} from "./UserDialog";

@Entity()
export class User {
    @PrimaryColumn({type: "varchar", length: 128})
    key: string;

    @Column("varchar", {length: 16, nullable: true})
    chatColor: string;

    @Index()
    @Column("datetime", {nullable: true})
    vipExpireDate: string;

    @Column("text", {nullable: true})
    victory: string;

    @Column("text", {nullable: true})
    words: string;

    @OneToMany(() => UserDialog, dialog => dialog.user)
    dialogues: UserDialog[];
}

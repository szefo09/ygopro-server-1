import {Column, Entity, Index, OneToMany, PrimaryColumn} from "typeorm";
import {UserDialog} from "./UserDialog";
import {VipKey} from "./VipKey";

@Entity()
export class User {
    @PrimaryColumn({type: "varchar", length: 128})
    key: string;

    @Column("varchar", {length: 16, nullable: true})
    chatColor: string;

    @Index()
    @Column("datetime", {nullable: true})
    vipExpireDate: Date;

    @Column("text", {nullable: true})
    victory: string;

    @Column("text", {nullable: true})
    words: string;

    @OneToMany(() => UserDialog, dialog => dialog.user)
    dialogues: UserDialog[];

    @OneToMany(() => VipKey, vipKey => vipKey.usedBy)
    usedKeys: VipKey[];
}

import {Column, Entity, Index, PrimaryGeneratedColumn, Unique} from "typeorm";

@Entity()
export class VipKey {
    @PrimaryGeneratedColumn({unsigned: true, type: "bigint"})
    id: number;

    @Index({unique: true})
    @Column("varchar", {length: 30})
    key: string;

    @Column("int", {unsigned: true})
    type: number;

    toJSON() {
        return {key: this.key, type: this.type};
    }
}

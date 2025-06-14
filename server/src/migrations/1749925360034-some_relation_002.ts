import { MigrationInterface, QueryRunner } from "typeorm";

export class SomeRelation0021749925360034 implements MigrationInterface {
    name = 'SomeRelation0021749925360034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "FK_06dcbcd88c5647753f0f0a4f1cc" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel_participants" ADD CONSTRAINT "FK_421314e9ea0216b6da90f27b919" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocked_users" ADD CONSTRAINT "FK_171336109e6fd263f27351b9a7a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocked_users" ADD CONSTRAINT "FK_1b5a450358925b1cd4da21ead5f" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats" ADD CONSTRAINT "FK_1011eb862c8712f3f6cdea6983b" FOREIGN KEY ("replied_to") REFERENCES "chats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats" ADD CONSTRAINT "FK_d3d5c049f59f0f7266900e6adc1" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats" DROP CONSTRAINT "FK_d3d5c049f59f0f7266900e6adc1"`);
        await queryRunner.query(`ALTER TABLE "chats" DROP CONSTRAINT "FK_1011eb862c8712f3f6cdea6983b"`);
        await queryRunner.query(`ALTER TABLE "blocked_users" DROP CONSTRAINT "FK_1b5a450358925b1cd4da21ead5f"`);
        await queryRunner.query(`ALTER TABLE "blocked_users" DROP CONSTRAINT "FK_171336109e6fd263f27351b9a7a"`);
        await queryRunner.query(`ALTER TABLE "channel_participants" DROP CONSTRAINT "FK_421314e9ea0216b6da90f27b919"`);
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "FK_06dcbcd88c5647753f0f0a4f1cc"`);
    }

}

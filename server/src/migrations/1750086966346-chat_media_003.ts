import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatMedia0031750086966346 implements MigrationInterface {
    name = 'ChatMedia0031750086966346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_medias" ADD "channel_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_medias" ADD "iv" character varying(24) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_medias" ADD "file_size" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_medias" ADD "status" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "iv"`);
        await queryRunner.query(`ALTER TABLE "chats" ADD "iv" character varying(16) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_medias" ALTER COLUMN "cloud_storage_url" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_medias" ALTER COLUMN "cloud_storage_url" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "iv"`);
        await queryRunner.query(`ALTER TABLE "chats" ADD "iv" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat_medias" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "chat_medias" DROP COLUMN "file_size"`);
        await queryRunner.query(`ALTER TABLE "chat_medias" DROP COLUMN "iv"`);
        await queryRunner.query(`ALTER TABLE "chat_medias" DROP COLUMN "channel_id"`);
    }

}

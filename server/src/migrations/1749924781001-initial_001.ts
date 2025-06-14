import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial0011749924781001 implements MigrationInterface {
    name = 'Initial0011749924781001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "name" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "email_verified" boolean NOT NULL DEFAULT false, "dp" text, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f600be4d3e93115da5bb7b0d8e" ON "users" ("search") `);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "user_chat_interactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "chat_id" uuid NOT NULL, "channel_id" uuid NOT NULL, "status" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_28dd77083568ef888c90361ecf8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bf5d3232c043400a51d542c052" ON "user_chat_interactions" ("search") `);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "user_id" uuid NOT NULL, "user_ip" inet NOT NULL, "user_agent" text NOT NULL, "refresh_token" text NOT NULL, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7d8d012dbc89a498c5d63fa6e9" ON "sessions" ("search") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c862499023be8feec98129d4e9" ON "sessions" ("refresh_token") `);
        await queryRunner.query(`CREATE TABLE "reset_password_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "user_id" uuid NOT NULL, "hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_160a92fb6721b4085807e4936e0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b3dc87884072d610423131c3f9" ON "reset_password_requests" ("search") `);
        await queryRunner.query(`CREATE TABLE "secrets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "encrypted_shared_secret" character varying NOT NULL, "channel_id" character varying NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "PK_d4ff48ddba1883d4dc142b9c697" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_48b7c7f57d2c2e3d868b99d00e" ON "secrets" ("search") `);
        await queryRunner.query(`CREATE TABLE "passwords" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "user_id" uuid NOT NULL, "password" text NOT NULL, CONSTRAINT "PK_c5629066962a085dea3b605e49f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5cf211a4b5f4f1c11d0ec6182c" ON "passwords" ("search") `);
        await queryRunner.query(`CREATE TABLE "oauths" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "title" character varying NOT NULL, CONSTRAINT "PK_c3a2382f78ddee47a6657018c37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_65883c36b217718f36e113261c" ON "oauths" ("search") `);
        await queryRunner.query(`CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "name" character varying NOT NULL, "description" character varying, "member_ids" uuid array NOT NULL, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bb73e1ed2899ec61d77f828dc0" ON "groups" ("search") `);
        await queryRunner.query(`CREATE TABLE "group_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "group_id" uuid NOT NULL, "user_id" uuid NOT NULL, "has_pinned" boolean NOT NULL DEFAULT false, "has_muted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_86446139b2c96bfd0f3b8638852" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5fcb331957ab9d0b3143efff04" ON "group_members" ("search") `);
        await queryRunner.query(`CREATE TABLE "email_verification_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "user_id" uuid NOT NULL, "hash" text NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_0b42bb490b5503208b8724c3850" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3c0d4901f72f0e777014288d4d" ON "email_verification_requests" ("search") `);
        await queryRunner.query(`CREATE TABLE "contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "nickname" character varying NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fb3cc47402df1f6fff0f5a80ee" ON "contacts" ("search") `);
        await queryRunner.query(`CREATE TABLE "chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "channel_id" uuid NOT NULL, "encrypted_message" text NOT NULL, "iv" character varying(100) NOT NULL, "replied_to" uuid, CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_321d9ad26a8367cbfc8c3d0e5f" ON "chats" ("search") `);
        await queryRunner.query(`CREATE TABLE "chat_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "title" character varying NOT NULL, CONSTRAINT "PK_902717bbcdbf18a529bf32b2de1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4cbd178597bb37621e3f8b78f9" ON "chat_statuses" ("search") `);
        await queryRunner.query(`CREATE TABLE "chat_reactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "chat_id" uuid NOT NULL, "emoji" text NOT NULL, CONSTRAINT "PK_b7996d25cac88b0b98dd010f34a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1e8ca67df55162e37def8e16db" ON "chat_reactions" ("search") `);
        await queryRunner.query(`CREATE TABLE "chat_medias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "name" text NOT NULL, "chat_id" uuid NOT NULL, "cloud_storage_url" text NOT NULL, "mime_type" character varying(100) NOT NULL, CONSTRAINT "PK_13f4bd5cd167f01628c9850779b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_efaaae4bcabb9758fcc37770e7" ON "chat_medias" ("search") `);
        await queryRunner.query(`CREATE TABLE "direct_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "member_ids" uuid array NOT NULL, CONSTRAINT "PK_8373c1bb93939978ef05ae650d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8ede44e9af4169f92ae4fa5870" ON "direct_messages" ("search") `);
        await queryRunner.query(`CREATE TYPE "public"."channels_type_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "channels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "type" "public"."channels_type_enum" NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_bc603823f3f741359c2339389f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0030394b74dca1073f1254e3cb" ON "channels" ("search") `);
        await queryRunner.query(`CREATE TABLE "blocked_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "user_id" uuid NOT NULL, CONSTRAINT "PK_93760d788a31b7546c5424f42cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0540353595bf741392767a10ba" ON "blocked_users" ("search") `);
        await queryRunner.query(`CREATE TABLE "channel_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "user_id" uuid NOT NULL, "channel_id" uuid NOT NULL, "has_muted" boolean NOT NULL DEFAULT false, "has_pinned" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_7a12a3d33e51542e48d485c6a94" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_42dfaf141920512355a1a15c8c" ON "channel_participants" ("search") `);
        await queryRunner.query(`CREATE TABLE "public_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "user_id" uuid NOT NULL, "key" text NOT NULL, CONSTRAINT "PK_35191e079da7902972477d26c77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ed28fd6bf24b0511d0f9d41413" ON "public_keys" ("search") `);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "FK_af0a71ac1879b584f255c49c99a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "FK_af0a71ac1879b584f255c49c99a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ed28fd6bf24b0511d0f9d41413"`);
        await queryRunner.query(`DROP TABLE "public_keys"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_42dfaf141920512355a1a15c8c"`);
        await queryRunner.query(`DROP TABLE "channel_participants"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0540353595bf741392767a10ba"`);
        await queryRunner.query(`DROP TABLE "blocked_users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0030394b74dca1073f1254e3cb"`);
        await queryRunner.query(`DROP TABLE "channels"`);
        await queryRunner.query(`DROP TYPE "public"."channels_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8ede44e9af4169f92ae4fa5870"`);
        await queryRunner.query(`DROP TABLE "direct_messages"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_efaaae4bcabb9758fcc37770e7"`);
        await queryRunner.query(`DROP TABLE "chat_medias"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e8ca67df55162e37def8e16db"`);
        await queryRunner.query(`DROP TABLE "chat_reactions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4cbd178597bb37621e3f8b78f9"`);
        await queryRunner.query(`DROP TABLE "chat_statuses"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_321d9ad26a8367cbfc8c3d0e5f"`);
        await queryRunner.query(`DROP TABLE "chats"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb3cc47402df1f6fff0f5a80ee"`);
        await queryRunner.query(`DROP TABLE "contacts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c0d4901f72f0e777014288d4d"`);
        await queryRunner.query(`DROP TABLE "email_verification_requests"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5fcb331957ab9d0b3143efff04"`);
        await queryRunner.query(`DROP TABLE "group_members"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bb73e1ed2899ec61d77f828dc0"`);
        await queryRunner.query(`DROP TABLE "groups"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65883c36b217718f36e113261c"`);
        await queryRunner.query(`DROP TABLE "oauths"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5cf211a4b5f4f1c11d0ec6182c"`);
        await queryRunner.query(`DROP TABLE "passwords"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_48b7c7f57d2c2e3d868b99d00e"`);
        await queryRunner.query(`DROP TABLE "secrets"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3dc87884072d610423131c3f9"`);
        await queryRunner.query(`DROP TABLE "reset_password_requests"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c862499023be8feec98129d4e9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d8d012dbc89a498c5d63fa6e9"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bf5d3232c043400a51d542c052"`);
        await queryRunner.query(`DROP TABLE "user_chat_interactions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f600be4d3e93115da5bb7b0d8e"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}

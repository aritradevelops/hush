import { MigrationInterface, QueryRunner } from "typeorm";

export class Call0041752399379773 implements MigrationInterface {
    name = 'Call0041752399379773'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "calls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "updated_by" uuid, "deleted_by" uuid, "search" tsvector, "channel_id" uuid NOT NULL, "channel_type" character varying(10) NOT NULL, "iv" character varying(24) NOT NULL, "ended_at" TIMESTAMP WITH TIME ZONE, "ended_by" uuid, CONSTRAINT "PK_d9171d91f8dd1a649659f1b6a20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae7a4fb2ee40832028076d65c6" ON "calls" ("search") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ae7a4fb2ee40832028076d65c6"`);
        await queryRunner.query(`DROP TABLE "calls"`);
    }

}

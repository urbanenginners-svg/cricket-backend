import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGenderType1772980772490 implements MigrationInterface {
    name = 'UpdateGenderType1772980772490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "academies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "address" character varying, "city" character varying, "pinCode" character varying, "state" character varying, "googleMapLink" character varying, "coverMedia" json, "headCoach" character varying, "establishedYear" integer, "feesRange" character varying, "startTime" character varying, "endTime" character varying, "ageGroups" json, "phone" character varying, "email" character varying, "instagramLink" character varying, "websiteLink" character varying, "groundName" character varying, "availableTurfs" json, "numberOfPitches" integer, "practiceNets" integer, "boundaryLength" character varying, "media" json, "facilities" json, "ownerId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "owner_id" uuid, CONSTRAINT "PK_abce78680fbad7d56c23118f9e0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female', 'other', 'prefer_not_to_say')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "gender" "public"."users_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "academies" ADD CONSTRAINT "FK_f3b451ec2bda9eaa81145af0da2" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "academies" DROP CONSTRAINT "FK_f3b451ec2bda9eaa81145af0da2"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "gender" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isVerified"`);
        await queryRunner.query(`DROP TABLE "academies"`);
    }

}

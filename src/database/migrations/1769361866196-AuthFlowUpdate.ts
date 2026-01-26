import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthFlowUpdate1769361866196 implements MigrationInterface {
    name = 'AuthFlowUpdate1769361866196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."player_profiles_playerrole_enum" AS ENUM('batter', 'bowler', 'keeper', 'all_rounder')`);
        await queryRunner.query(`CREATE TABLE "player_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "playerRole" "public"."player_profiles_playerrole_enum" NOT NULL, "battingType" character varying, "battingOrder" character varying, "bowlingType" character varying, "bowlingStyle" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_03f7484ff0d724537b22f741fa" UNIQUE ("user_id"), CONSTRAINT "PK_60488bbe49c4612fce78e0a1875" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coach_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "coachingRole" character varying, "experience" character varying, "certifications" character varying, "specialization" character varying, "preferredAgeGroupToCoach" character varying, "currentCity" character varying, "visibilityPreference" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_77eb16742643d240469e09912c" UNIQUE ("user_id"), CONSTRAINT "PK_0f4001455b40350665f589642dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneNumber" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293" UNIQUE ("phoneNumber")`);
        await queryRunner.query(`CREATE TYPE "public"."users_authprovider_enum" AS ENUM('local', 'google', 'facebook', 'mobile')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "authProvider" "public"."users_authprovider_enum" NOT NULL DEFAULT 'local'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isOnboardingCompleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "gender" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "dateOfBirth" date`);
        await queryRunner.query(`ALTER TABLE "users" ADD "placeOfBirth" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "otp" character varying(10)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "otpExpiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "player_profiles" ADD CONSTRAINT "FK_03f7484ff0d724537b22f741fa3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coach_profiles" ADD CONSTRAINT "FK_77eb16742643d240469e09912c8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coach_profiles" DROP CONSTRAINT "FK_77eb16742643d240469e09912c8"`);
        await queryRunner.query(`ALTER TABLE "player_profiles" DROP CONSTRAINT "FK_03f7484ff0d724537b22f741fa3"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otpExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otp"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "placeOfBirth"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isOnboardingCompleted"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "authProvider"`);
        await queryRunner.query(`DROP TYPE "public"."users_authprovider_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_1e3d0240b49c40521aaeb953293"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`DROP TABLE "coach_profiles"`);
        await queryRunner.query(`DROP TABLE "player_profiles"`);
        await queryRunner.query(`DROP TYPE "public"."player_profiles_playerrole_enum"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration041711647141810 implements MigrationInterface {
    name = 'Gration041711647141810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`food\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`food\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`purchased_food\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`purchased_food\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`movie\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`movie\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`shedule\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`shedule\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`room\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`room\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`seat\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`seat\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`bill\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`bill\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`bill\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`bill\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`ticket\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`seat\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`seat\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`room\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`room\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`shedule\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`shedule\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`movie\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`movie\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`purchased_food\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`purchased_food\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`food\` CHANGE \`updatedAt\` \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`food\` CHANGE \`createdAt\` \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    }

}

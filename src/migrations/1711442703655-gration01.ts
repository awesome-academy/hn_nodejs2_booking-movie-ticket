import { MigrationInterface, QueryRunner } from "typeorm";

export class Gration011711442703655 implements MigrationInterface {
    name = 'Gration011711442703655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`food\` (\`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`id\` int NOT NULL AUTO_INCREMENT, \`imagurl\` varchar(255) NOT NULL, \`price\` int NOT NULL, \`quantity\` int NOT NULL, \`unit\` varchar(45) NOT NULL, \`description\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`purchased_food\` (\`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`id\` int NOT NULL AUTO_INCREMENT, \`current_price\` int NOT NULL, \`food_id\` int NOT NULL, \`bill_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`review\` (\`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`id\` int NOT NULL AUTO_INCREMENT, \`comment\` text NOT NULL, \`star\` enum ('1', '2', '3', '4', '5') NOT NULL, \`deleted_at\` timestamp NULL, \`user_id\` int NOT NULL, \`movie_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`movie\` (\`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`id\` int NOT NULL AUTO_INCREMENT, \`direction\` varchar(500) NOT NULL, \`actors\` varchar(500) NOT NULL, \`duration\` int NOT NULL, \`start_date_showing\` date NOT NULL, \`end_date_showing\` date NOT NULL, \`large_imgurl\` varchar(255) NOT NULL, \`small_imgurl\` varchar(255) NOT NULL, \`long_description\` text NOT NULL, \`short_description\` text NOT NULL, \`name\` varchar(255) NOT NULL, \`release_date\` date NOT NULL, \`trailerurl\` varchar(255) NOT NULL, \`language\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`shedule\` (\`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`id\` int NOT NULL AUTO_INCREMENT, \`start_date\` date NOT NULL, \`end_date\` date NOT NULL, \`movie_id\` int NOT NULL, \`room_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`room\` (\`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`id\` int NOT NULL AUTO_INCREMENT, \`capacity\` int NOT NULL, \`imgurl\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`total_area\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`seat\` (\`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(45) NOT NULL, \`price\` int NOT NULL, \`type\` enum ('NORMAL', 'VIP') NOT NULL, \`room_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`current_price\` int NOT NULL, \`bill_id\` int NOT NULL, \`seat_id\` int NOT NULL, \`schedule_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`bill\` (\`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`id\` int NOT NULL AUTO_INCREMENT, \`total_price_from_ticket\` int NOT NULL, \`total_price_from_food\` int NOT NULL, \`status\` enum ('SUCCESS', 'FAILE') NOT NULL, \`type\` enum ('VNPAY', 'MOMO') NOT NULL, \`bank_code\` varchar(255) NOT NULL, \`pay_time\` datetime NOT NULL, \`user_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0), \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0), \`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`phone\` varchar(45) NULL, \`address\` varchar(255) NULL, \`role\` enum ('USER', 'ADMIN') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`purchased_food\` ADD CONSTRAINT \`FK_747917d050e5ba30cd1737b7191\` FOREIGN KEY (\`food_id\`) REFERENCES \`food\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchased_food\` ADD CONSTRAINT \`FK_f752cf84ff8e6ad981fd496f093\` FOREIGN KEY (\`bill_id\`) REFERENCES \`bill\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_81446f2ee100305f42645d4d6c2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_fc8ca25a3c9fe90af4a4b42a310\` FOREIGN KEY (\`movie_id\`) REFERENCES \`movie\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shedule\` ADD CONSTRAINT \`FK_405e5066050c698641d09cea518\` FOREIGN KEY (\`movie_id\`) REFERENCES \`movie\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shedule\` ADD CONSTRAINT \`FK_efb6f39b285d1b5d2897d50aeef\` FOREIGN KEY (\`room_id\`) REFERENCES \`room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`seat\` ADD CONSTRAINT \`FK_5d28198242955d0e31856a44306\` FOREIGN KEY (\`room_id\`) REFERENCES \`room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_60717bb00da535fef38bee3d78c\` FOREIGN KEY (\`bill_id\`) REFERENCES \`bill\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_bc6a9497287b609dbd2806850c7\` FOREIGN KEY (\`seat_id\`) REFERENCES \`seat\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_84511c90ef2f16a9ff644a75609\` FOREIGN KEY (\`schedule_id\`) REFERENCES \`shedule\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bill\` ADD CONSTRAINT \`FK_34e537d6261c55286aa58921ada\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`bill\` DROP FOREIGN KEY \`FK_34e537d6261c55286aa58921ada\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_84511c90ef2f16a9ff644a75609\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_bc6a9497287b609dbd2806850c7\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_60717bb00da535fef38bee3d78c\``);
        await queryRunner.query(`ALTER TABLE \`seat\` DROP FOREIGN KEY \`FK_5d28198242955d0e31856a44306\``);
        await queryRunner.query(`ALTER TABLE \`shedule\` DROP FOREIGN KEY \`FK_efb6f39b285d1b5d2897d50aeef\``);
        await queryRunner.query(`ALTER TABLE \`shedule\` DROP FOREIGN KEY \`FK_405e5066050c698641d09cea518\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_fc8ca25a3c9fe90af4a4b42a310\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_81446f2ee100305f42645d4d6c2\``);
        await queryRunner.query(`ALTER TABLE \`purchased_food\` DROP FOREIGN KEY \`FK_f752cf84ff8e6ad981fd496f093\``);
        await queryRunner.query(`ALTER TABLE \`purchased_food\` DROP FOREIGN KEY \`FK_747917d050e5ba30cd1737b7191\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`bill\``);
        await queryRunner.query(`DROP TABLE \`ticket\``);
        await queryRunner.query(`DROP TABLE \`seat\``);
        await queryRunner.query(`DROP TABLE \`room\``);
        await queryRunner.query(`DROP TABLE \`shedule\``);
        await queryRunner.query(`DROP TABLE \`movie\``);
        await queryRunner.query(`DROP TABLE \`review\``);
        await queryRunner.query(`DROP TABLE \`purchased_food\``);
        await queryRunner.query(`DROP TABLE \`food\``);
    }

}

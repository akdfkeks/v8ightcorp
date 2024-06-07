import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1717765965100 implements MigrationInterface {
    name = 'Migration1717765965100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` DROP FOREIGN KEY \`FK_16d4ce4c84bd9b8562c6f396262\``);
        await queryRunner.query(`CREATE TABLE \`image\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`url\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`article_id\` int UNSIGNED NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`article\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`article\` CHANGE \`author_id\` \`author_id\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`image\` ADD CONSTRAINT \`FK_6ab057143620cf637e0c7a0ee72\` FOREIGN KEY (\`article_id\`) REFERENCES \`article\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`article\` ADD CONSTRAINT \`FK_16d4ce4c84bd9b8562c6f396262\` FOREIGN KEY (\`author_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` DROP FOREIGN KEY \`FK_16d4ce4c84bd9b8562c6f396262\``);
        await queryRunner.query(`ALTER TABLE \`image\` DROP FOREIGN KEY \`FK_6ab057143620cf637e0c7a0ee72\``);
        await queryRunner.query(`ALTER TABLE \`article\` CHANGE \`author_id\` \`author_id\` int UNSIGNED NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`article\` CHANGE \`deleted_at\` \`deleted_at\` timestamp(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`image\``);
        await queryRunner.query(`ALTER TABLE \`article\` ADD CONSTRAINT \`FK_16d4ce4c84bd9b8562c6f396262\` FOREIGN KEY (\`author_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

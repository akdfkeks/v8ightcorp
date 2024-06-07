import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1717743043298 implements MigrationInterface {
    name = 'Migration1717743043298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`article\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`category\` enum ('notice', 'qna') NOT NULL DEFAULT 'qna', \`title\` varchar(255) NOT NULL, \`content\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`author_id\` int UNSIGNED NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`article\` ADD CONSTRAINT \`FK_16d4ce4c84bd9b8562c6f396262\` FOREIGN KEY (\`author_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` DROP FOREIGN KEY \`FK_16d4ce4c84bd9b8562c6f396262\``);
        await queryRunner.query(`DROP TABLE \`article\``);
    }

}

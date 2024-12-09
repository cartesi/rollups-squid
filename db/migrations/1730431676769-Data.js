module.exports = class Data1730431676769 {
    name = 'Data1730431676769'

    async up(db) {
        await db.query(`ALTER TABLE "application" ADD "rollup_version" character varying(2)`)
        await db.query(`CREATE INDEX "IDX_8f14b85dc18d81b891d9ce5151" ON "application" ("rollup_version") `)
    }

    async down(db) {
        await db.query(`ALTER TABLE "application" DROP COLUMN "rollup_version"`)
        await db.query(`DROP INDEX "public"."IDX_8f14b85dc18d81b891d9ce5151"`)
    }
}

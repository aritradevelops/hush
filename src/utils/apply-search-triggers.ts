import { DataSource } from "typeorm";
import { searchMap } from "../decorators/searchable";
import { mapToString } from "../lib/helper";

export async function applySearchTriggers(dataSrc: DataSource) {
  const queryRunner = dataSrc.createQueryRunner();

  // Start a transaction for safety
  await queryRunner.startTransaction();
  try {
    // Ensure `search_meta` table exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS search_meta (
        id SERIAL PRIMARY KEY,
        search_schema TEXT
      );
    `);

    // Fetch the latest search schema
    const [existingSearchSchema] = await queryRunner.query(`
      SELECT search_schema FROM search_meta ORDER BY id DESC LIMIT 1;
    `);

    const normalizedSearchSchema = mapToString(searchMap);
    const hasChanges = existingSearchSchema?.search_schema !== normalizedSearchSchema;

    if (hasChanges) {
      // Insert new schema if changes are detected
      await queryRunner.query(
        `INSERT INTO search_meta (search_schema) VALUES ($1);`,
        [normalizedSearchSchema]
      );
    }

    // Iterate over searchMap to update triggers and `tsvector` parts
    for (const [className, columns] of searchMap.entries()) {
      const tableName = dataSrc.getRepository(className).metadata.tableName;
      const tsvectorParts = columns
        .map(([column, coalesce, weight]) => {
          const coalesceExpr = coalesce ? `coalesce(NEW.${column}, '')` : `NEW.${column}`;
          return `setweight(to_tsvector('english', ${coalesceExpr}), '${weight}')`;
        })
        .join(' || ');

      // Ensure the trigger function exists
      await queryRunner.query(`
        CREATE OR REPLACE FUNCTION ${tableName}_tsvector_trigger() RETURNS trigger AS $$
        BEGIN
          NEW.search = ${tsvectorParts};
          RETURN NEW;
        END
        $$ LANGUAGE plpgsql;
      `);

      // Ensure the trigger exists
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = '${tableName}_tsvector_update'
          ) THEN
            CREATE TRIGGER ${tableName}_tsvector_update
            BEFORE INSERT OR UPDATE ON "${tableName}"
            FOR EACH ROW EXECUTE FUNCTION ${tableName}_tsvector_trigger();
          END IF;
        END
        $$;
      `);

      // Update the `search` column if changes exist
      if (hasChanges) {
        const updatedTsvectorParts = columns
          .map(([column, coalesce, weight]) => {
            const coalesceExpr = coalesce ? `coalesce(${column}, '')` : `${column}`;
            return `setweight(to_tsvector('english', ${coalesceExpr}), '${weight}')`;
          })
          .join(' || ');

        await queryRunner.query(`
          UPDATE "${tableName}"
          SET search = ${updatedTsvectorParts};
        `);
      }
    }

    // Commit the transaction
    await queryRunner.commitTransaction();
  } catch (error) {
    // Rollback on error
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    // Release the query runner
    await queryRunner.release();
  }
}


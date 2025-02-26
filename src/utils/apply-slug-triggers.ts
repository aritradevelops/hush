import { DataSource } from "typeorm";
import { slugMap } from "../decorators/slugify";

// TODO: check whether it can be done for multiple columns of a table.

export async function applySlugTriggers(dataSrc: DataSource) {
  const queryRunner = dataSrc.createQueryRunner();
  // Start a transaction for safety
  await queryRunner.startTransaction();
  try {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "unaccent";
    `);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION slugify("value" TEXT)
      RETURNS TEXT AS $$
      BEGIN
        RETURN regexp_replace(
                regexp_replace(
                  lower(unaccent("value")), -- Lowercase and remove accents in one step
                  '[^a-z0-9\\-_]+', '-', 'gi' -- Replace non-alphanumeric characters with hyphens
                ),
                '(^-+|-+$)', '', 'g' -- Remove leading and trailing hyphens
              );
      END
      $$ LANGUAGE plpgsql STRICT IMMUTABLE;
      `)

    for (const [className, columns] of slugMap.entries()) {
      const tableName = dataSrc.getRepository(className).metadata.tableName;
      for (const [columnName, onColumn, isUnique] of columns) {
        await queryRunner.query(`
          CREATE OR REPLACE FUNCTION public.${tableName}_set_${columnName}_from_${onColumn}() RETURNS trigger
              LANGUAGE plpgsql
              AS $$
          DECLARE
              base_slug TEXT;
              final_slug TEXT;
              counter INTEGER := 1;
          BEGIN
              -- Generate the initial slug based on the 'name' field
              base_slug := slugify(NEW.${onColumn});
              final_slug := base_slug;

              ${isUnique ? `-- Loop to ensure uniqueness of the slug
              LOOP
                  -- Check if the slug already exists in the table
                  IF EXISTS (SELECT 1 FROM "${tableName}" WHERE ${columnName} = final_slug AND id != COALESCE(NEW.id, NULL::uuid)) THEN
                      -- If it exists, append a numeric suffix and increment the counter
                      final_slug := base_slug || '-' || counter;
                      counter := counter + 1;
                  ELSE
                      -- If it's unique, exit the loop
                      EXIT;
                  END IF;
              END LOOP;` : ''}

              -- Set the unique slug to the 'slug' field of the NEW record
              NEW.${columnName} := final_slug;
              RETURN NEW;
          END
          $$;
        `)
        await queryRunner.query(`
          DROP TRIGGER IF EXISTS ${tableName}_set_${columnName}_from_${onColumn}  ON "${tableName}";
          CREATE TRIGGER ${tableName}_set_${columnName}_from_${onColumn}
          BEFORE INSERT ON "${tableName}"
          FOR EACH ROW
          EXECUTE FUNCTION public.${tableName}_set_${columnName}_from_${onColumn}();
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
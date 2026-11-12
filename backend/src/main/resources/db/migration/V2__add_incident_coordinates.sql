-- Add latitude only if it does not already exist
SET @latitude_sql = IF(
    (SELECT COUNT(*)
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'incidents'
       AND COLUMN_NAME = 'latitude') = 0,
    'ALTER TABLE incidents ADD COLUMN latitude DOUBLE NULL',
    'SELECT 1'
);

PREPARE latitude_stmt FROM @latitude_sql;
EXECUTE latitude_stmt;
DEALLOCATE PREPARE latitude_stmt;


-- Add longitude only if it does not already exist
SET @longitude_sql = IF(
    (SELECT COUNT(*)
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'incidents'
       AND COLUMN_NAME = 'longitude') = 0,
    'ALTER TABLE incidents ADD COLUMN longitude DOUBLE NULL',
    'SELECT 1'
);

PREPARE longitude_stmt FROM @longitude_sql;
EXECUTE longitude_stmt;
DEALLOCATE PREPARE longitude_stmt;
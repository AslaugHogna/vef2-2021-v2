import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;
const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Framkvæmir SQL fyrirspurn á gagnagrunn sem keyrir á `DATABASE_URL`,
 * skilgreint í `.env`
 *
 * @param {string} q Query til að keyra
 * @param {array} values Fylki af gildum fyrir query
 * @returns {object} Hlut með niðurstöðu af því að keyra fyrirspurn
 */
async function query(q, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(q, values);

    return result;
  } catch (err) { // eslint-disable-line   
    throw err;
  } finally {
    await client.end();
  }
}

/**
 * Bætir við umsókn.
 *
 * @param {array} data Fylki af gögnum fyrir umsókn
 * @returns {object} Hlut með niðurstöðu af því að keyra fyrirspurn
 */
export async function insert(data) {
  const q = `
INSERT INTO signatures
(name, nationalId, comment, aLista)
VALUES
($1, $2, $3, $4)`;
  const values = [data.name, data.nationalId, data.comment, data.aLista === ''];

  return query(q, values);
}

/**
 * Sækir allar undirskriftir
 *
 * @returns {array} Fylki af öllum undirskriftum
 */
export async function select() {
  const result = await query('SELECT * FROM signatures ORDER BY id');

  return result.rows;
}

/**
 * Uppfærir umsókn sem unna.
 *
 * @param {string} id Id á umsókn
 * @returns {object} Hlut með niðurstöðu af því að keyra fyrirspurn

export async function update(id) {
  const q = `
UPDATE signatures
SET processed = true, updated = current_timestamp
WHERE id = $1`;

  return query(q, [id]);
}

 * Eyðir umsókn.
 *
 * @param {string} id Id á umsókn
 * @returns {object} Hlut með niðurstöðu af því að keyra fyrirspurn

export async function deleteRow(id) {
  const q = 'DELETE FROM signatures WHERE id = $1';

  return query(q, [id]);
} */

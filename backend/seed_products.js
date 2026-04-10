require('./load-env.js');

const db = require('./db');
const products = require('./products.json');

const EXPECTED_PRODUCT_COUNT = 267;
const SORTED_PRODUCTS = [...products].sort((a, b) => a.id - b.id);

if (SORTED_PRODUCTS.length !== EXPECTED_PRODUCT_COUNT) {
  throw new Error(
    `products.json must contain exactly ${EXPECTED_PRODUCT_COUNT} products; found ${SORTED_PRODUCTS.length}.`
  );
}

const uniqueIds = new Set(SORTED_PRODUCTS.map((product) => product.id));
if (uniqueIds.size !== SORTED_PRODUCTS.length) {
  throw new Error('products.json contains duplicate product IDs.');
}

async function seedProducts() {
  let connection;
  try {
    connection = await db.getConnection();
    const datasetIds = SORTED_PRODUCTS.map((product) => product.id);
    const placeholders = datasetIds.map(() => '?').join(', ');

    await connection.beginTransaction();

    await connection.query(
      `DELETE FROM products WHERE id NOT IN (${placeholders})`,
      datasetIds
    );

    const upsertSql = `
      INSERT INTO products (
        id,
        name,
        category,
        subcategory,
        price,
        brand,
        description,
        avg_rating,
        total_reviews,
        total_sold,
        total_returned,
        return_rate,
        image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        category = VALUES(category),
        subcategory = VALUES(subcategory),
        price = VALUES(price),
        brand = VALUES(brand),
        description = VALUES(description),
        avg_rating = VALUES(avg_rating),
        total_reviews = VALUES(total_reviews),
        total_sold = VALUES(total_sold),
        total_returned = VALUES(total_returned),
        return_rate = VALUES(return_rate),
        image_url = VALUES(image_url)
    `;

    for (const product of SORTED_PRODUCTS) {
      await connection.query(upsertSql, [
        product.id,
        product.name,
        product.category,
        product.subcategory,
        product.price,
        product.brand,
        product.description,
        product.avg_rating,
        product.total_reviews,
        product.total_sold,
        product.total_returned,
        product.return_rate,
        product.image_url ?? null
      ]);
    }

    await connection.query(
      `DELETE FROM products WHERE id NOT IN (${placeholders})`,
      datasetIds
    );

    await connection.query(
      `ALTER TABLE products AUTO_INCREMENT = ${Math.max(...datasetIds) + 1}`
    );

    const [[result]] = await connection.query(
      'SELECT COUNT(*) AS count FROM products'
    );

    if (Number(result.count) !== EXPECTED_PRODUCT_COUNT) {
      throw new Error(
        `Expected ${EXPECTED_PRODUCT_COUNT} products after seeding, found ${result.count}.`
      );
    }

    await connection.commit();

    console.log(`Seeded ${EXPECTED_PRODUCT_COUNT} products from backend/products.json.`);
    console.log('Verification query: SELECT COUNT(*) FROM products;');
    console.log(`Result: ${result.count}`);
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Product seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

seedProducts();

const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'kizilsakal',
  password: process.env.POSTGRES_PASSWORD || 'nopassword',
  database: process.env.POSTGRES_DB || 'booking_db',
  host: process.env.POSTGRES_URL || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  ssl: { rejectUnauthorized: false }
});

const getListing = (id, callback) => {
  const queryString = 'SELECT * FROM listings WHERE id=$1';
  const queryArgs = [Number(id)];
  pool.connect((err, client, release) => {
    if (err) {
      callback(err, null);
      return;
    }
    client.query(queryString, queryArgs, (err, result) => {
      release();
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, result.rows);
    });
  });
};

const insertListing = (
  {ownerName, rating, numRatings, pricePerNight, discountAmount }, callback
) => {
  const queryString = 'INSERT INTO listings ('
  + '"ownerName", "rating", "numRatings", "pricePerNight", "discountAmount")'
  + ' VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const queryArgs = [ownerName, rating, numRatings, pricePerNight, discountAmount];
  pool.connect((err, client, release) => {
    if (err) {
      callback(err, null);
      return;
    }
    client.query(queryString, queryArgs, (err, result) => {
      release();
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, result.rows);
    });
  });
};

const modifyListing = (listing, callback) => {
  const options = [
    'ownerName',
    'rating',
    'numRatings',
    'pricePerNight',
    'discountAmount',
  ];
  const queryArgs = [Number(listing.id)];
  const columns = [];
  const params = [];
  options.forEach(option => {
    if (listing[option] !== undefined) {
      columns.push(`"${option}"`);
      params.push('$' + (params.length + 2));
      queryArgs.push(listing[option]);
    }
  });
  const queryString = `UPDATE listings SET (id, ${columns.toString()}) `
  + `= ($1, ${params.toString()}) WHERE id = $1 RETURNING *`;
  pool.connect((err, client, release) => {
    if (err) {
      callback(err, null);
      return;
    }
    client.query(queryString, queryArgs, (err, result) => {
      release();
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, result.rows);
    });
  });
};

const deleteListing = (id, callback) => {
  const queryString = 'DELETE FROM listings WHERE id=$1 RETURNING *';
  const queryArgs = [Number(id)];
  pool.connect((err, client, release) => {
    if (err) {
      callback(err, null);
      return;
    }
    client.query(queryString, queryArgs, (err, result) => {
      release();
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, result.rows);
    });
  });
};

module.exports = {
  getListing,
  insertListing,
  modifyListing,
  deleteListing,
};

import OpenAI from 'openai';
import 'dotenv/config';
import pkg from 'pg';
const { Client } = pkg;

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const system_prompt = `Given the following database schema:
"CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    registration_date DATE,
    last_login TIMESTAMP,
    is_active BOOLEAN,
    tier VARCHAR(20) CHECK (tier IN ('basic', 'premium', 'vip'))
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2),
    stock_quantity INT,
    release_date DATE,
    is_available BOOLEAN,
    specs JSONB
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    product_id INT REFERENCES products(product_id),
    quantity INT,
    order_date TIMESTAMP,
    delivery_date DATE,
    status VARCHAR(20) CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
    discount DECIMAL(5,2)
);

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id),
    user_id INT REFERENCES users(user_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN
);

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    department VARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE,
    is_full_time BOOLEAN
);"
Respond only with the sql query.
Write a SQL query to answer: `;

const user_prompt = process.argv.slice(2).join(' ');

if (!user_prompt) {
  console.error('Error: Please provide a query as a command-line argument.');
  process.exit(1);
}

const fetchSQLQuery = async () => {
  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: user_prompt },
      ],
      model: 'gpt-4o-mini',
      temperature: 0,
    });

    const rawResponse = response.choices[0]?.message.content;

    if (rawResponse) {
      const sqlQuery = rawResponse.replace(/```sql|```/g, '').trim();
      console.log('Extracted SQL Query:', sqlQuery);
      await executeSQLQuery(sqlQuery);
    } else {
      throw new Error('No response from OpenAI');
    }
  } catch (error) {
    console.error('Error fetching response from OpenAI:', error);
  }
};

const executeSQLQuery = async (query: string) => {
  const dbClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });

  try {
    await dbClient.connect();
    console.log('Connected to the database.');
    const result = await dbClient.query(query);
    console.log('Query Result:', result.rows);
  } catch (error) {
    console.error('Error executing SQL query:', error);
  } finally {
    await dbClient.end();
    console.log('Database connection closed.');
  }
};

fetchSQLQuery();

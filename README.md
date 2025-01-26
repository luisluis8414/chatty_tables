# Chatty Tables - A Natural Language Interface for PostgreSQL

This project is a Node.js application that integrates with OpenAI's API to generate SQL queries based on natural language input and executes those queries against a PostgreSQL database. It uses OpenAI's GPT model to interpret user queries and dynamically generate SQL statements.

---

## Features

- Accepts natural language queries from the command line.
- Uses OpenAI's API to generate SQL queries based on a predefined database schema.
- Executes the generated SQL queries against a PostgreSQL database.
- Outputs the query results to the console.

---

## Prerequisites

Before running this application, ensure you have the following installed:

1. **Node.js** (v22.5.1)
2. **npm**
3. **Docker**
4. **OpenAI API Key**

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/luisluis8414/chatty_tables.git
cd chatty_tables
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```bash
OPENAI_API_KEY=your_openai_api_key
```

Replace `your_openai_api_key` with your actual OpenAI API key.

### 4. Set Up PostgreSQL

Ensure you have a PostgreSQL database running. You can use the following Docker Compose configuration to set up a PostgreSQL container:

```bash
services:
  postgres:
    image: postgres:17-alpine
    container_name: postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Run the container:

```bash
docker-compose up -d
```

## Usage

### Run the Application

To run the application, use the following command:

```bash
node index.js "<your natural language query>"
```

Replace `<your natural language query>` with your desired query. For example:

```bash
node index.js "List all products that are out of stock"
```

## Example Prompts

Here are some example natural language queries you can use to test the application:

### **Users Table Queries**

1. **"List all active users."**
2. **"Find all users who registered in 2023."**
3. **"Show all VIP users."**
4. **"List users who have never logged in."**
5. **"Find all users with the 'basic' tier."**
6. **"Show the most recently registered user."**
7. **"Count the number of users in each tier."**
8. **"List all users who registered before 2022."**

### **Products Table Queries**

1. **"List all products that are out of stock."**
2. **"Show all products in the 'Electronics' category."**
3. **"Find all products with a price greater than $100."**
4. **"List all products released after July 2023."**
5. **"Show all products that are currently available."**
6. **"Find the cheapest product in the 'Groceries' category."**
7. **"List all products with a warranty in their specs."**
8. **"Show all products with stock quantities less than 50."**

### **Orders Table Queries**

1. **"List all orders that are still pending."**
2. **"Find all orders placed by the user 'alice123'."**
3. **"Show all orders with a discount greater than $5."**
4. **"List all orders that were delivered."**
5. **"Find the total quantity of products ordered by each user."**
6. **"Show the most recent order placed."**
7. **"List all orders for products in the 'Fitness' category."**
8. **"Find the total revenue generated from all orders."**

### **Reviews Table Queries**

1. **"List all verified reviews."**
2. **"Find all reviews with a rating of 5."**
3. **"Show all reviews for the product 'Gaming Chair'."**
4. **"List all reviews written by the user 'bob_tech'."**
5. **"Find the average rating for the product 'UltraBook Pro'."**
6. **"Show all reviews that do not have a comment."**
7. **"List all reviews with a rating less than 3."**
8. **"Find the total number of reviews for each product."**

### **Employees Table Queries**

1. **"List all employees in the 'Engineering' department."**
2. **"Find all employees with a salary greater than $80,000."**
3. **"Show all employees hired after January 2023."**
4. **"List all part-time employees."**
5. **"Find the highest-paid employee in the company."**
6. **"Show the total salary expense for the 'HR' department."**
7. **"List all employees sorted by their hire date."**
8. **"Find the average salary of employees in each department."**

### **Join Queries**

1. **"List all orders along with the username of the user who placed them."**
2. **"Show all reviews along with the product name and username of the reviewer."**
3. **"Find all products ordered by the user 'data_dave'."**
4. **"List all employees along with the total number of orders they have processed."**
5. **"Show all products along with the total number of reviews they have received."**
6. **"Find all users who have placed at least one order."**
7. **"List all products that have been reviewed along with their average rating."**
8. **"Show all orders along with the product name and category."**

### Example Output

```bash
Extracted SQL Query: SELECT * FROM products WHERE stock_quantity = 0;
Connected to the database.
Query Result: [
  {
    product_id: 4,
    product_name: 'Smart Thermostat',
    category: 'Home Automation',
    price: '199.00',
    stock_quantity: 0,
    release_date: 2023-10-04T22:00:00.000Z,
    is_available: false,
    specs: { wifi: true, compatibility: [Array] }
  }
]
Database connection closed.
```

## Configuration

### Database Connection

The database connection is configured in the `index.js` file. If your PostgreSQL setup differs, update the following section:

```bash
const dbClient = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
});
```

### OpenAI API

The OpenAI API key is loaded from the `.env` file. Ensure the key is valid and has access to the GPT model specified in the code.

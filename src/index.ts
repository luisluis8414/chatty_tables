import OpenAI from "openai";
import "dotenv/config";
import pkg from "pg";
const { Client } = pkg;

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const validateSQLQuery = (query: string): boolean => {
  const lowerCaseQuery = query.toLowerCase();

  if (!lowerCaseQuery.trim().startsWith("select")) {
    console.error("Error: Only SELECT queries are allowed.");
    return false;
  }

  const prohibitedKeywords = [
    "insert",
    "update",
    "delete",
    "drop",
    "alter",
    "create",
    "truncate",
    "merge",
    "grant",
    "revoke",
  ];

  for (const keyword of prohibitedKeywords) {
    if (lowerCaseQuery.includes(keyword)) {
      console.error(`Error: Query contains prohibited keyword: ${keyword}`);
      return false;
    }
  }

  return true;
};

const getSchemaDescription = async () => {
  const dbClient = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "postgres",
  });

  try {
    await dbClient.connect();
    console.log("Connected to the database to fetch schema.");

    const query = `
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

    const result = await dbClient.query(query);

    const schema: Record<string, string[]> = {};
    result.rows.forEach((row) => {
      const { table_name, column_name, data_type, is_nullable } = row;
      if (!schema[table_name]) {
        schema[table_name] = [];
      }
      schema[table_name].push(
        `${column_name} ${data_type.toUpperCase()}${
          is_nullable === "NO" ? " NOT NULL" : ""
        }`
      );
    });

    let schemaDescription = "";
    for (const [table, columns] of Object.entries(schema)) {
      schemaDescription += `CREATE TABLE ${table} (\n  ${columns.join(
        ",\n  "
      )}\n);\n\n`;
    }

    return schemaDescription.trim();
  } catch (error) {
    console.error("Error fetching schema from the database:", error);
    throw error;
  } finally {
    await dbClient.end();
    console.log("Database connection closed after fetching schema.");
  }
};

const executeSQLQuery = async (query: string) => {
  const dbClient = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "postgres",
  });

  try {
    await dbClient.connect();
    console.log("Connected to the database.");

    const queries = query
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q);

    for (const singleQuery of queries) {
      if (!validateSQLQuery(singleQuery)) {
        throw new Error("Invalid query. Only SELECT queries are allowed.");
      }

      console.log("Executing Query:", singleQuery);
      const result = await dbClient.query(singleQuery);
      console.log("Query Result:", result.rows);
    }
  } catch (error) {
    console.error("Error executing SQL query:", error);
  } finally {
    await dbClient.end();
    console.log("Database connection closed.");
  }
};

const fetchSQLQuery = async () => {
  try {
    const schemaDescription = await getSchemaDescription();
    const postgresVersion = await getPostgresVersion();

    const system_prompt = `You are a SQL expert. Write only SELECT queries for PostgreSQL version ${postgresVersion}. Given the following database schema:\n${schemaDescription}\nWrite a SQL query to answer the user's question. Respond only with the SQL query.`;

    const user_prompt = process.argv.slice(2).join(" ");

    if (!user_prompt) {
      console.error(
        "Error: Please provide a query as a command-line argument."
      );
      process.exit(1);
    }

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: user_prompt },
      ],
      model: "gpt-4o",
      temperature: 0,
    });

    const rawResponse = response.choices[0]?.message.content;

    if (rawResponse) {
      const sqlQuery = rawResponse.replace(/```sql|```/g, "").trim();
      console.log("Extracted SQL Query:", sqlQuery);
      await executeSQLQuery(sqlQuery);
    } else {
      throw new Error("No response from OpenAI");
    }
  } catch (error) {
    console.error("Error fetching response from OpenAI:", error);
  }
};

const getPostgresVersion = async () => {
  const dbClient = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "postgres",
  });

  try {
    await dbClient.connect();
    console.log("Connected to the database.");

    const result = await dbClient.query("SHOW server_version;");
    const version = result.rows[0].server_version;

    console.log("PostgreSQL Version:", version);
    return version;
  } catch (error) {
    console.error("Error fetching PostgreSQL version:", error);
    throw error;
  } finally {
    await dbClient.end();
    console.log("Database connection closed.");
  }
};

console.time("fetchSQLQuery");
await fetchSQLQuery();
console.timeEnd("fetchSQLQuery");

const mysql = require("mysql2");

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'X8OO?I?],MrCW&:3aSa]![le?',
    database: 'employee_db'
  },
  console.log(`Connected to the employee_db database.`)
);

module.exports = db;
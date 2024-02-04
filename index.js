const inquirer = require("inquirer");
const db = require("./config/connect");
const DataOption = require("./models/data-option");
const menuItems = require("./models/menu");
const Role = require("./models/role");
const Employee = require("./models/employee");

function mainMenu() {
    inquirer.prompt([
        {
            type: "list",
            message: "\nWhat would you like to do?",
            choices: menuItems,
            name: "menuItem"
        }
    ])
        .then(response => {
            if (response.menuItem === 0) {
                displayDepartments();
            }
            else if (response.menuItem === 1) {
                displayRoles();
            }
            else if (response.menuItem === 2) {
                displayEmployees();
            }
            else if (response.menuItem === 3) {
                addDepartment();
            }
            else if (response.menuItem === 4) {
                addRole();
            }
            else if (response.menuItem === 5) {
                addEmployee();
            }
            else if (response.menuItem === 6) {
                updateEmployee();
            }
            else if (response.menuItem === 7) {
                if (db) {
                    db.end();// Closes database connection
                    console.log("Database connection has been closed.")
                }
                return;
            }
        });
}

async function executeQuery(sqlString = "", queryData = null, ackMessage = null) {
    try {
        // Queries with passed in variables
        if (queryData) {
            db.query(sqlString, queryData, (err, data, fields) => {
                if (err) { throw err; }
                else {
                    if (ackMessage) { console.log(ackMessage) }
                    return;
                }
            });
        }
        // Queries requesting data to be returned
        // else if (menuQuery) {
        //     db.query(sqlString, queryData, (err, data, fields) => {
        //         if (err) { throw err; }
        //         else {
        //             if (ackMessage) { console.log(ackMessage) }
        //             const records = data.map((record) => {
        //                 return new DataOption(record.id, record.name);
        //             })
        //             return records;
        //         }
        //     });
        // }
        // Queries without passed in variables
        else {
            db.query(sqlString, (err, data) => {
                if (err) { throw err; }
                else {
                    if (data) {
                        console.log("\n\n");
                        console.table(data);
                        console.log("\n\n");
                    }
                    return data;
                }
            });
        }
    }
    catch (err) {
        console.log(err.message);
    }
}

function displayDepartments() {
    console.log("\n\n");
    executeQuery("SELECT id, name FROM department;");
    console.log("\n\n");
    mainMenu();
    return;
}

function displayRoles() {
    console.log("\n\n");
    executeQuery(`SELECT role.title AS Title, role.id AS roleId, 
        department.name AS department, role.salary AS salary
        FROM role
            INNER JOIN department ON role.department_id = department.id;`);
    console.log("\n\n");
    mainMenu();
    return;
}

function displayEmployees() {
    console.log("\n\n");
    executeQuery(`SELECT employee.id AS id, employee.first_name AS fname, 
        employee.last_name AS lname, role.title AS title,
        department.name AS department, role.salary AS salary, employee.manager_id AS manager
        FROM employee
            INNER JOIN role ON role.id = employee.role_id
                INNER JOIN department on department.id = role.department_id;`);
    console.log("\n\n");
    mainMenu();
    return;
}

async function addDepartment() {
    console.log("\n\n");
    inquirer.prompt([
        {
            type: "input",
            message: "Department: ",
            name: "department"
        }
    ])
        .then((response) => {
            executeQuery(`INSERT INTO department (name)
                VALUES (?);`, response.department,
                "\nThe new department has been added to the database.\n");
            console.log("\n\n");
            mainMenu();
            return;
        }
        );

}

//
async function addRole() {
    try {
        console.log("\n\n");
        db.query("SELECT id, name FROM department;", (err, data, fields) => {
            if (err) { throw err; }
            const departments = data.map(dept => {
                return new DataOption(dept.id, dept.name);
            });

            inquirer.prompt([
                {
                    type: "input",
                    message: "Title: ",
                    name: "title"
                },
                {
                    type: "number",
                    message: "Salary: ",
                    name: "salary"
                },
                {
                    type: "list",
                    message: "Select a department for the role.",
                    choices: departments,
                    name: "department"
                }

            ])
                .then((response) => {
                    executeQuery(`INSERT INTO role (department_id, title, salary)
                        VALUES (?, ?, ?);`, [response.department.value, response.title, response.salary],
                        "\nThe new role has been added to the database.\n");
                    console.log("\n\n");
                    mainMenu();
                    return;
                });
        });
    }
    catch (err) {
        console.log(err.message);
    }
}

async function addEmployee() {
    try {
        console.log("\n\n");
        db.query(`SELECT role.title AS title, role.id AS id, 
        department.name AS department, role.salary AS salary
        FROM role
            INNER JOIN department ON role.department_id = department.id;`, (err, data, fields) => {
            if (err) { throw err; }
            const roles = data.map(role => {
                return new Role(role.id, role.title, role.department);
            })

            inquirer.prompt([
                {
                    type: "input",
                    message: "First Name: ",
                    name: "first_name"
                },
                {
                    type: "input",
                    message: "Last name: ",
                    name: "last_name"
                },
                {
                    type: "list",
                    message: "Select role for the new employee.",
                    choices: roles,
                    name: "role"
                }

            ])
                .then((response) => {
                    db.query(`SELECT employee.id AS id, employee.first_name AS first_name,
                 employee.last_name AS last_name
                    FROM employee
                        INNER JOIN role ON role.id = employee.role_id
                            INNER JOIN department on department.id = role.department_id
                                WHERE department.id IN (
                                SELECT role.id
                                FROM role 
                                WHERE role.id = ?);`, response.role.value, (er, dat, flds) => {
                        if (er) { throw er; }
                        const managers = dat.map(mngr => {
                            return new Employee(mngr.id, mngr.first_name, mngr.last_name);
                        })
                        managers.push(new DataOption(null, "none"));  // Has no manager
                        inquirer.prompt([
                            {
                                type: "list",
                                message: "Select a manager for the new employee.",
                                choices: managers,
                                name: "manager"
                            }
                        ]).then((res) => {
                            executeQuery(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                            VALUES (?);`, [response.first_name, response.last_name, response.role.value,
                            res.manager.value], "\nThe employee role has been updated.\n");
                            console.log("\n\n");
                            mainMenu();
                            return;
                        })
                    })
                });
        });
    }
    catch (err) {
        console.log(err.message);
    }

}

async function updateEmployee() {
    try {
        console.log("\n\n");
        db.query(`select id, first_name, last_name
        FROM employee;`, (err, data, fields) => {
            if (err) { throw err; }
            const employees = data.map(emp => {
                return new Employee(emp.id, emp.first_name, emp.last_name);
            });


            inquirer.prompt([
                {
                    type: "list",
                    message: "Select an employee to update their role.",
                    choices: employees,
                    name: "employee"
                }
            ])
                .then((response) => {
                    db.query(`SELECT role.title, department.name
                        FROM employee
                            INNER JOIN role ON role.id = employee.role_id
                                INNER JOIN department on department.id = role.department_id
                                WHERE department.id IN (
                                SELECT role.department_id
                                FROM role
                                WHERE role.id IN (SELECT role_id
                                FROM employee
                                WHERE id = ?));`, response.employee.value,
                        (er, dat, flds) => {
                            if (er) { throw er; }
                            const roles = dat.map(role => {
                                return new Role(role.id, role.title, role.department);
                            });
                            inquirer.prompt([
                                {
                                    type: "list",
                                    message: "Select a role for the employee.",
                                    choices: roles,
                                    name: "role"
                                }
                            ]).then((res) => {
                                executeQuery(`UPDATE employee
                                    SET role_id = ?
                                    INNER JOIN role ON role.id = employee.role_id
                                    WHERE id = ?`, [res.role.value, response.employee.value],
                                    "\nThe employee role has been updated.\n");
                                console.log("\n\n");
                                mainMenu();
                                return;
                            })
                        })
                });
        });
    }
    catch (err) {
        console.log(err.message);
    }
}

function init() {
    mainMenu();
}

init();
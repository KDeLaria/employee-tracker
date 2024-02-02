const inquirer = require("inquirer");
const db = require("./config/connect");

const menu = ["View all departments", "View all roles", "View all empolyees", "Add department",
    "Add a role", "Add an employee", "Update an employee role", "Quit"];

function mainMenu() {
    inquirer.prompt([
        {
            type: "list",
            message: "\nWhat would you like to do?",
            choices: menu,
            name: "menuItem"
        }
    ])
        .then(response => {
            if (menu[0]) {
                displayDepartments();
            }
            else if (menu[1]) {
                displayRoles();
            }
            else if (menu[2]) {
                displayEmployees();
            }
            else if (menu[3]) {
                addDepartment();
            }
            else if (menu[4]) {
                /////////////////////////////////////////////////////////////////////////////
                db.query(`INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?);`, [newRole.title, newRole.salary, newRole.department_id], (err, data) => {
                    if (err) { console.log(err); }
                    else { console.log("\nThe new role has been added to the database.\n") }
                }
                );
            }
            else if (menu[5]) {
                db.query(`INSERT INTO employee (first_name, last_name, role_id, manager)
                        VALUES (?);`, [newEmployee.first_name, newEmployee.last_name, newEmployee.role_id,
                newEmployee.manager], (err, data) => {
                    if (err) { console.log(err); }
                    else {
                        console.log("\nThe new employee has been added to the database.\n")
                    }
                }
                )
            }
            else if (menu[6]) {
                db.query(`UPDATE employee
                    SET role_id = ?
                    WHERE id = ?
                        INNER JOIN role ON role.id = employee.role_id`, [employee.id, newRole], (err, data) => {
                    if (err) { console.log(err); }
                    else { console.log("\nThe employee role has been updated.\n") }
                }
                )
            }/////////////////////////////////////////////////////////////////////////////////////////
            else if (menu[7]) { return null; }
        });
}

function executeQuery(sqlString = "", queryData = null, ackMessage = null) {
    if (queryData) {
        db.query(sqlString, queryData, (err, data) => {
            if (err) { console.log(err); }
            else {
                if (ackMessage) {console.log(ackMessage)}
                return data;
            }
        });
    }
    else {
        db.query(sqlString, (err, data) => {
            if (err) { console.log(err); }
            else {
                if (data) { console.table(data); }
                return data;
            }
        });
    }
}

function displayDepartments() {
    executeQuery("SELECT id, name FROM department");
}

function displayRoles() {
    executeQuery(`SELECT role.title AS Title, role.id AS roleId, department.name AS department, role.salary AS salary
    FROM role
        INNER JOIN department ON role.department_id = department.id;`)
}

function displayEmployees() {
    executeQuery(`SELECT employee.id AS id, employee.first_name AS fname, employee.last_name AS lname, role.title AS title,
    department.name AS department, role.salary AS salary, employee.manager_id AS manager
    FROM employee
        INNER JOIN role ON role.id = employee.role_id
            INNER JOIN department on department.id = role.department_id;`)
}

function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "Department: ",
            name: "department"
        }
    ])
        .then((response) => {
            executeQuery(`INSERT INTO department (name)
            VALUES (?);`, response.department, "\nThe new employee has been added to the database.\n");
        }
    );

}

function addRole () {
    const departments = db.query("SELECT id, name FROM department", (err, data) => {return data;});
    inquirer.prompt([
        {
            type: "list",
            message: "Select a department for the role.",
            choices: departments.name,
            name: departments.id ////////////////////////////////////
        },
        {
            type: "input",
            message: "Title: ",
            name: "title"
        },
        {
            type: "number",
            message: "Salary: ",
            name: "salary"
        }
        
    ])
        .then((response) => {
            executeQuery(`INSERT INTO role (title, salary, department_id)
            VALUES (?, ?, ?);`, response, "\nThe new role has been added to the database.\n");
        }
    );
}

function init() {
    //if (mainMenu() !== null) { mainMenu(); };
    mainMenu();
}

init();
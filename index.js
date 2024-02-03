const inquirer = require("inquirer");
const db = require("./config/connect");
const DataOptions = require("./models/data-options");

const menu = ["View all departments", "View all roles", "View all empolyees", "Add department",
    "Add a role", "Add an employee", "Update an employee role", "Quit"];

async function mainMenu() {
    inquirer.prompt([
        {
            type: "list",
            message: "\nWhat would you like to do?",
            choices: menu,
            name: "menuItem"
        }
    ])
        .then(response => {
            if (response.menuItem === menu[0]) {
                displayDepartments();
            }
            else if (response.menuItem === menu[1]) {
                displayRoles();
            }
            else if (response.menuItem === menu[2]) {
                displayEmployees();
            }
            else if (response.menuItem === menu[3]) {
                addDepartment();
            }
            else if (response.menuItem === menu[4]) {
                addRole();
            }
            else if (response.menuItem === menu[5]) {
                // db.query(`INSERT INTO employee (first_name, last_name, role_id, manager)
                //         VALUES (?);`, [newEmployee.first_name, newEmployee.last_name, newEmployee.role_id,
                // newEmployee.manager], (err, data) => {
                //     if (err) { console.log(err); }
                //     else {
                //         console.log("\nThe new employee has been added to the database.\n")
                //     }
                // }
                // )
            }
            else if (response.menuItem === menu[6]) {
                // db.query(`UPDATE employee
                //     SET role_id = ?
                //     WHERE id = ?
                //         INNER JOIN role ON role.id = employee.role_id`, [employee.id, newRole], (err, data) => {
                //     if (err) { console.log(err); }
                //     else { console.log("\nThe employee role has been updated.\n") }
                // }
                // )
            }/////////////////////////////////////////////////////////////////////////////////////////
            else if (response.menuItem === menu[7]) {
                db.end();
                return null;
            }
            mainMenu();
        });
}

async function executeQuery(sqlString = "", dataObj = false, queryData = null, ackMessage = null) {
    try {
        // Queries with passed in variables
        if (queryData || dataObj) {
            if (!(dataObj)) {

                db.query(sqlString, queryData, (err, data) => {
                    if (err) { throw err; }
                    else {
                        if (ackMessage) { console.log(ackMessage) }
                        return data;
                    }
                });
            }
            else { /////////////////////////////////////////////////////
                db.query(sqlString, (err, results, fields) => {
                    if (err) { throw err; }
                    else {
                        if (ackMessage) { console.log(ackMessage) }
                        console.log(results);
                        console.log("name: "+ results["name"]);
                        return results;
                    }
                });
            } ///////////////////////////////////////////////////////////////
        }
        // Queries without passed in variables
        else {
            db.query(sqlString, (err, data) => {
                if (err) { throw err; }
                else {
                    if (data) {
                        console.table(data);
                        console.log("Selected: " + results.indexOf({ id: 1, name: 'Warehouse' }));
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
    executeQuery("SELECT id, name FROM department;");
}

function displayRoles() {
    executeQuery(`SELECT role.title AS Title, role.id AS roleId, department.name AS department, role.salary AS salary
    FROM role
        INNER JOIN department ON role.department_id = department.id;`);
}

function displayEmployees() {
    executeQuery(`SELECT employee.id AS id, employee.first_name AS fname, employee.last_name AS lname, role.title AS title,
    department.name AS department, role.salary AS salary, employee.manager_id AS manager
    FROM employee
        INNER JOIN role ON role.id = employee.role_id
            INNER JOIN department on department.id = role.department_id;`);
}

async function addDepartment() {
    inquirer.prompt([
        {
            type: "input",
            message: "Department: ",
            name: "department"
        }
    ])
        .then((response) => {
            executeQuery(`INSERT INTO department (name)
            VALUES (?);`, response.department, "\nThe new department has been added to the database.\n");
        }
        );

}

/////////////////////////////////////////////////////////////////////////////////////
async function addRole() {
    try {
        //const department = await executeQuery("SELECT id, name FROM employee_db.department;", true);

        //db.query("SELECT id, name FROM department;", (err, data) => {console.log(JSON.parse(data))})
        //console.log("dept 1: " + department)
        // const departments = department.map(dept =>{
        //     return {value: dept.id, name: dept.name};
        // });
        // console.log("Department: ", departments.name);

        db.query("SELECT id, name FROM department;", (err, data, fields) => {if (err) {throw err;}
        
        const departments = data.map(dept =>{
                return new DataOptions(dept.id, dept.name);
            });
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select a department for the role.",
                    choices: departments,
                    name: "department" ////////////////////////////////////
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
                    executeQuery(`INSERT INTO role (department_id, title, salary)
            VALUES (?, ?, ?);`, response, "\nThe new role has been added to the database.\n");
                }
                );
        })
    }
    catch (err) {
        console.log(err.message);
    }
}//////////////////////////////////////////////////////////////////////////////////////////////////////

async function addEmployee() {
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    const department = executeQuery("SELECT id, name FROM department");
    const role = executeQuery(`SELECT role.title AS title, role.id AS id, 
    department.name AS department, role.salary AS salary
    FROM role
        INNER JOIN department ON role.department_id = department.id;`);
    //newEmployee.first_name, newEmployee.last_name, newEmployee.role_id, newEmployee.manager
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
            message: "Select department for the new employee.",
            choices: department,
            name: "department"
        }

    ])
        .then((response) => {
            executeQuery(`INSERT INTO employee (first_name, last_name, role_id, manager)
            VALUES (?);`, response, "\nThe employee role has been updated.\n");
        }
        );/////////////////////////////////////////////////////////////////////////////////////////////

    async function updateEmployee() {
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
                message: "Select department for the new employee.",
                choices: department,
                name: "department"
            }

        ])
            .then((response) => {
                executeQuery(`UPDATE employee
                    SET role_id = ?
                    WHERE id = ?
                    INNER JOIN role ON role.id = employee.role_id`, false, [newRole, employee.id],
                    "\nThe employee role has been updated.\n");
            })
    }
}

function init() {
    mainMenu();
}

init();
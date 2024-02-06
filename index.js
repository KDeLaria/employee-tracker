const inquirer = require("inquirer");
const db = require("./config/connect");
const menuItems = require("./models/menu");
const DataOption = require("./models/data-option");
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
                updateEmployeeManager();
            }
            else if (response.menuItem === 8) {
                displayManagerSEmployees();
            }
            else if (response.menuItem === 9) {
                viewEmployeesByDept();
            }
            else if (response.menuItem === 10) {
                deleteDept();
            }
            else if (response.menuItem === 11) {
                deleteRole();
            }
            else if (response.menuItem === 12) {
                deleteEmployee();
            }
            else if (response.menuItem === 13) {
                if (db) {
                    db.end();// Closes database connection
                    console.log("Database connection has been closed.")
                }
                return;
            }
        });
}


async function executeQuery(sqlString = "", queryData = null, ackMessage = null, displayTable = false) {
    try {
        // Queries with passed in variables
        if (queryData && displayTable == false) {
            db.query(sqlString, queryData, (err, data, fields) => {
                if (err) { throw err; }
                else {
                    if (ackMessage) { console.log(ackMessage) }
                    return;
                }
            });
        }
        // Displays a table
        else if (displayTable) {
            db.query(sqlString, queryData, (err, data) => {
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
        // Queries without passed in variables
        // Displays a table
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
    console.clear();
    executeQuery("SELECT id, name FROM department;");
    mainMenu();
    return;
}

function displayRoles() {
    console.clear();
    executeQuery(`SELECT department.name AS Department, role.title AS Title,
         role.id AS 'Role ID', role.salary AS Salary
        FROM role
            INNER JOIN department ON role.department_id = department.id;`);
    mainMenu();
    return;
}

function displayEmployees() {
    console.clear();
    executeQuery(`SELECT DISTINCT employee.id AS ID, employee.first_name AS 'First Name', 
    employee.last_name AS 'Last Name', department.name AS Department,
     role.title AS Title, role.salary AS Salary, employee.manager_id AS ManagerID, 
     managers_view.manager_first_name AS "Manager's",
     managers_view.manager_last_name AS Name
    FROM employee
     LEFT JOIN managers_view ON managers_view.id = employee.manager_id
        INNER JOIN role ON role.id = employee.role_id
            INNER JOIN department on department.id = role.department_id
            order by id;`);
    mainMenu();
    return;
}

// Adds a department to the database
async function addDepartment() {
    console.clear();
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
            mainMenu();
            return;
        }
        );

}

// Adds a new role once the title and salary are entered and the department is
// seleted
async function addRole() {
    try {
        console.clear();
        db.query("SELECT id, name FROM department;", (err, data, fields) => {
            if (err) { throw err; }
            const departments = data.map(dept => {
                return new DataOption(dept.id, dept.name);
            });

            inquirer.prompt([
                {
                    type: "list",
                    message: "Select a department for the role.",
                    choices: departments,
                    name: "department"
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
                        VALUES (?, ?, ?);`, [response.department, response.title, response.salary],
                        "\nThe new role has been added to the database.\n");
                    mainMenu();
                    return;
                });
        });
    }
    catch (err) {
        console.log(err.message);
    }
}

// Enters a new employee into the database after the first name and last name are entered
// and the role and manager are selected for the employee
async function addEmployee() {
    try {
        console.clear();
        db.query(`SELECT department.name AS department, role.title AS title, 
        role.id AS id 
        FROM role
            INNER JOIN department ON role.department_id = department.id;`, (err, data, fields) => {
            if (err) { throw err; }
            const roles = data.map(role => {
                return new Role(role.id, role.department, role.title);
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
                                    WHERE department.id = (
                                    SELECT role.department_id
                                    FROM role 
                                    WHERE role.id = ?);`, 
                                    response.role, (er, dat, flds) => {
                        if (er) { throw er; }
                        const managers = dat.map(mngr => {
                            return new Employee(mngr.id, mngr.first_name, mngr.last_name);
                        })
                        managers.push({value: null, name: "none"});
                        inquirer.prompt([
                            {
                                type: "list",
                                message: "Select a manager for the new employee.",
                                choices: managers,
                                name: "manager"
                            }
                        ]).then((res) => {
                            executeQuery(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                            VALUES (?, ?, ?, ?);`, [response.first_name, response.last_name, response.role,
                            res.manager], "\nThe employee role has been updated.\n");
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

// Populates a list of employees and roles from the employee's department
// the new selected role will be updated in the database
async function updateEmployee() {
    try {
        console.clear();
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
                    db.query(`SELECT role.id AS id, department.name AS department, role.title AS title
                        FROM role
                            INNER JOIN department on department.id = role.department_id
                                WHERE department.id = (
                                    SELECT role.department_id
                                    FROM role
                                        WHERE role.id IN (SELECT role_id
                                        FROM employee
                                        WHERE id = ?));`, response.employee,
                        (er, dat, flds) => {
                            if (er) { throw er; }
                            const roles = dat.map(role => {
                                return new Role(role.id, role.title, role.department);
                            });
                            inquirer.prompt([
                                {
                                    type: "list",
                                    message: "Select a new role for the employee.",
                                    choices: roles,
                                    name: "role"
                                }
                            ]).then((res) => {
                                executeQuery(`UPDATE employee
                                    SET role_id = ?
                                    WHERE id = ?`, [res.role, response.employee],
                                    "\nThe employee role has been updated.\n");
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

// Populates a list of employees and managers for the employee's department
// updates the employee's manager to the selected one
async function updateEmployeeManager () {
    try {
        console.clear();
        db.query(`select id, first_name, last_name
        FROM employee;`, (err, data, fields) => {
            if (err) { throw err; }
            const employees = data.map(emp => {
                return new Employee(emp.id, emp.first_name, emp.last_name);
            });
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select an employee update their manager.",
                    choices: employees,
                    name: "employee"
                }
            ])
                .then((response) => {
                    db.query(`SELECT employee.id AS id, employee.first_name AS first_name,
                    employee.last_name AS last_name
                    FROM employee
                        INNER JOIN role ON role.id = employee.role_id
                            INNER JOIN department on department.id = role.department_id
                                WHERE department.id = (
                                SELECT role.department_id
                                FROM role 
                                WHERE role.id = (SELECT role_id FROM employee WHERE id = ?)) AND employee.id != ?;`, 
                                [response.employee, response.employee], (er, dat, flds) => {
                        if (er) { throw er; }
                        const managers = dat.map(mngr => {
                            return new Employee(mngr.id, mngr.first_name, mngr.last_name);
                        })
                        managers.push({value: null, name: "none"});
                        inquirer.prompt([
                            {
                                type: "list",
                                message: "Select a manager for the new employee.",
                                choices: managers,
                                name: "manager"
                            }
                        ]).then((res) => {
                            executeQuery(`UPDATE employee
                                    SET manager_id = ?
                                    WHERE id = ?`, [res.manager, response.employee],
                                    "\nThe employee's manager has been updated.\n");
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




// Populates a list of managers and displays the employees that directly report to the selected manager
async function displayManagerSEmployees () {
    try {
        console.clear();
        db.query(`SELECT id, first_name, last_name
            FROM employee
            WHERE id IN (SELECT manager_id FROM employee
                WHERE manager_id IS NOT NULL);`, (err, data, fields) => {
            if (err) { throw err; }
            const managers = data.map(mngr => {
                return new Employee(mngr.id, mngr.first_name, mngr.last_name);
            });
            inquirer.prompt([
                {
                    type: "list",
                    message: "Select a manager to view the employees that directly report to them.",
                    choices: managers,
                    name: "manager"
                }
            ])
                .then((response) => {
                    executeQuery(`SELECT employee.id AS id, employee.first_name AS fname, 
                        employee.last_name AS lname, department.name AS department,
                        role.title AS title,role.salary AS salary, employee.manager_id AS manager
                        FROM employee
                            INNER JOIN role ON role.id = employee.role_id
                                INNER JOIN department on department.id = role.department_id
                                    WHERE manager_id = ?;`, response.manager, null, true);
                    mainMenu();
                    return;
                });
        });
    }
    catch (err) {
        console.log(err.message);
    }
}

// Populates a list of departments that the user can select and view the employees from that department
async function viewEmployeesByDept () {
    try {
        console.clear();
        db.query("SELECT id, name FROM department;", (err, data, fields) => {
            if (err) { throw err; }
            const departments = data.map(dept => {
                return new DataOption(dept.id, dept.name);
            });

            inquirer.prompt([
                {
                    type: "list",
                    message: "Select a department to view the employees in that department.",
                    choices: departments,
                    name: "department"
                }
            ])
                .then((response) => {
                    executeQuery(`SELECT DISTINCT employee.id AS ID, employee.first_name AS 'First Name', 
                    employee.last_name AS 'Last Name', department.name AS Department,
                     role.title AS Title, role.salary AS Salary, employee.manager_id AS ManagerID, 
                     managers_view.manager_first_name AS "Manager's",
                     managers_view.manager_last_name AS Name
                    FROM employee
                     LEFT JOIN managers_view ON managers_view.id = employee.manager_id
                        INNER JOIN role ON role.id = employee.role_id
                            INNER JOIN department on department.id = role.department_id
                            WHERE department.id = ?
                            order by id;`, response.department, null, true);
                    mainMenu();
                    return;
                });
        });
    }
    catch (err) {
        console.log(err.message);
    }
}

// Populates a list of departments that the user can select and delete from the database
async function deleteDept () {
    try {
        console.clear();
        db.query("SELECT id, name FROM department;", (err, data, fields) => {
            if (err) { throw err; }
            const departments = data.map(dept => {
                return new DataOption(dept.id, dept.name);
            });

            inquirer.prompt([
                {
                    type: "list",
                    message: "Select a department to delete.",
                    choices: departments,
                    name: "department"
                }
            ])
                .then((response) => {
                    executeQuery(`DELETE FROM department
                        WHERE id = ?;`, response.department,
                        "\nThe department has been deleted.\n");
                    mainMenu();
                    return;
                });
        });
    }
    catch (err) {
        console.log(err.message);
    }
}

// Populates a list of roles that the user can select from and delete from the database
async function deleteRole () {
    console.clear();
    db.query(`SELECT role.id AS id, department.name AS name, role.title AS title
        FROM role
        INNER JOIN department on department.id = role.department_id`, (err, data, fields) => {
        if (err) { throw err; }
        const roles = data.map(role => {
            return new Role(role.id, role.department, role.title);
        });
        inquirer.prompt([
            {
                type: "list",
                message: "Select a role to delete.",
                choices: roles,
                name: "role"
            }
        ])
            .then((response) => {
                executeQuery(`DELETE FROM role
                    WHERE id = ?;`, response.role, "\nThe role has been deleted.\n");
                mainMenu();
                return;
            });
    });

}

// Populates a list of employees that the user can select from and delete from the database
async function deleteEmployee () {
    console.clear();
    db.query(`SELECT employee.id AS id, employee.first_name AS first_name, employee.last_name AS last_name,
     department.name AS department, role.title AS title, employee.manager_id Manager
    FROM employee
        INNER JOIN role ON role.id = employee.role_id
            INNER JOIN department on department.id = role.department_id;`, (err, data, fields) => {
        if (err) { throw err; }
        const employees = data.map(emp => {
            return new Employee(emp.id, emp.first_name, emp.last_name);
        });
        inquirer.prompt([
            {
                type: "list",
                message: "Select a manager to view their employees.",
                choices: employees,
                name: "employee"
            }
        ])
            .then((response) => {
                executeQuery(`DELETE FROM employee
                    WHERE id = ?;`, response.employee, "\nThe employee has been deleted.\n");
                mainMenu();
                return;
            });
    });
}

function init() {
    mainMenu();
}

init();
const inquirer = require("inquirer");
const db = require("./config/connect");

const dataQuery = [];


function mainMenu() {
    inquirer.prompt([
        {
            type: "list",
            message: "\nWhat would you like to do?",
            choices: ["View all departments", "View all roles", "View all empolyees", "Add department", 
            "Add a role", "Add an employee", "Update an employee role", "Quit"],
            name: "menuItem"
        }
    ])
        .then(response => {
            if (response.manuItem === "View all departments"){
                db.query("SELECT id, name FROM department", (err, data) => {
                    if (err) {console.log(err);}
                    else {  dataQuery = data; }
                    console.log("Department ID\t\tDepartment Name");
                    dataQuery.forEach(record => {
                        console.log(`${record.id}\t\t${record.name}`);
                    });
                });
            }
            else if (response.manuItem === "View all roles") {
                db.query(`SELECT role.title AS Title, role.id AS roleId, department.name AS department, role.salary AS salary
                FROM role
                    INNER JOIN department ON role.department_id = department.id;`, (err, data) => {
                        if (err) {console.log(err);}
                        else {  dataQuery = data; }
                        console.log("Title\t\tRole ID\t\tDepartment\t\tSalary");
                        dataQuery.forEach(record => {
                            console.log(`${record.title}\t\t${record.roleId}\t\t${record.department}\t\t${record.salary}`);
                        });
                });
            }
            else if (response.manuItem === "View all employees") {
                db.query(`SELECT employee.id AS id, employee.fname AS fname, employee.lname AS lname, role.title AS title,
                department.name AS department, role.salary AS salary, employee.manager AS manager
                FROM employee
                    INNER JOIN role ON role.id = employee.role_id
                        INNER JOIN department on department.id = role.department_id;`, (err, data) => {
                            if (err) {console.log(err);}
                            else {  dataQuery = data; }
                            console.log("Employee ID\t\tFirst Name\t\tLast Name\t\tTitle\t\tDepartment\t\tSalary\t\tManager");
                            dataQuery.forEach(record => {
                                console.log(record.id,"\t\t",record.fname,"\t\t",record.lname,"\t\t",record.title,"\t\t",record.name,
                                "\t\t",record.salary,"\t\t",record.manager);
                            });
                        });
            }
            else if (response.manuItem === "Add department") {
                db.query(`INSERT INTO department (name)
                        VALUES (?);`, [newDepartment], (err, data) => {
                            if (err) {console.log(err);}
                            else {console.log("\nThe new department has been added to the database.\n")}}
                        );
            }
            else if (response.manuItem === "Add role") {
                /////////////////////////////////////////////////////////////////////////////
                db.query(`INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?);`, [newRole.title, newRole.salary, newRole.department_id], (err, data) => {
                            if (err) {console.log(err);}
                            else {console.log("\nThe new role has been added to the database.\n")}}
                        );
                    }
            else if (response.manuItem === "Add an employee") {
                db.query(`INSERT INTO employee (fname, lname, role_id, manager)
                        VALUES (?);`, [newEmployee.fname, newEmployee.lname, newEmployee.role_id, 
                            newEmployee.manager], (err, data) => {
                            if (err) {console.log(err);}
                            else {console.log("\nThe new employee has been added to the database.\n")
                        }}
                )}
            else if (response.manuItem === "Update an employee role") {
                db.query(`UPDATE employee
                    SET role_id = ?
                    WHERE id = ?
                        INNER JOIN role ON role.id = employee.role_id`, [employee.id, newRole], (err, data) => {
                            if (err) {console.log(err);}
                            else {console.log("\nThe employee role has been updated.\n")}}
                        )
            }/////////////////////////////////////////////////////////////////////////////////////////
            else if (response.manuItem === "Quit") {return null;}
        });
}



function init () {
    if (mainMenu() !== null) {mainMenu();};
}

init();
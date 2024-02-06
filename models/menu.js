const DataOption = require("./data-option");

const menu = ["View all departments",
    "View all roles",
    "View all empolyees",
    "Add department",
    "Add a role",
    "Add an employee",
    "Update an employee's role",
    "Update employee's manager",
    "View employees by manager",
    "View employees by department",
    "Delete department",
    "Delete role",
    "Delete employee",
    "View Utilized budget by department",
    "Quit"];

    function prepMenu (arr = []) {
    let items = [];
    for (let i = 0; i < arr.length; i++) {
        items[i] = new DataOption(i, arr[i])
    }
    return items;
}

const menuItems = prepMenu(menu);

module.exports = menuItems;
class Employee {

    // Creates an options objects that can be used by inquirer
    constructor (id = 0, first_name = "", last_name = "") {
        this.value = id;
        this.name = first_name + " " + last_name;
    }
}

module.exports = Employee;
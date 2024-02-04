class Role {

    // Creates an options objects that can be used by inquirer
    constructor (id = 0, department = "", title = "") {
        this.value = id;
        this.name = department + " " + title;
    }
}

module.exports = Role;
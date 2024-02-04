class DataOption {

    // Creates an options objects that can be used by inquirer
    constructor (id = 0, name = "") {
        this.value = id;
        this.name = name;
    }
}

module.exports = DataOption;
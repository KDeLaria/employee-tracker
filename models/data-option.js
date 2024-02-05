class DataOption {

    // Creates an options objects that can be used by inquirer
    constructor (id = 0, name = "", labelArgs = [""]) {
        this.value = id;
        this.name = name + " " + labelArgs.map((label) => {
            return label + " ";
        });
    }
}

module.exports = DataOption;
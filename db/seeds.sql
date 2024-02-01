INSERT INTO department (name)
VALUES  ("Warehouse"),
        ("Human Resources"),
        ("Sales"),
        ("Marketing");

INSERT INTO role (title, salary, department_id)
VALUES  ("Associate", 25000, 1),
        ("Director", 112000, 2),
        ("Associate", 52000, 3),
        ("Manager", 102000, 3),
        ("Lift Operator", 40000, 1),
        ("Manager", 45000, 1),
        ("Director", 115000, 4),
        ("Associate", 88000, 4),
        ("Lead", 83000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("John", "Smith", 5, 2),
        ("Daniel", "Johnson", 6, null),
        ("Jane", "Martin", 4, null),
        ("Rachael", "Nelson", 8, 5),
        ("Tami", "Grant", 7, null),
        ("George", "Martin", 1, 1),
        ("Sarah", "Dwemer", 2, null),
        ("Steve", "Andersen", 1, 2),
        ("Emily", "Thompson", 9, 7),
        ("James", "Larson", 3, 3),
        ("Brian", "Jensen", 3, 3);
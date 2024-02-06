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
VALUES  ("Daniel", "Johnson", 6, null),
        ("Jane", "Martin", 4, null),
        ("Tami", "Grant", 7, null),
        ("Sarah", "Dwemer", 2, null),
        ("John", "Smith", 5, 1),
        ("Steve", "Andersen", 1, 1),
        ("Rachael", "Nelson", 8, 3),
        ("Emily", "Thompson", 9, 4),
        ("George", "Martin", 1, 5),
        ("James", "Larson", 3, 2),
        ("Brian", "Jensen", 3, 2);
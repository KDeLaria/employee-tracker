DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL);

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(10,2),
  department_id INT,
  FOREIGN KEY (department_id)
  REFERENCES department(id)
  ON DELETE CASCADE);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT,
  FOREIGN KEY (role_id)
  REFERENCES role(id)
  ON DELETE CASCADE,
  manager_id INT DEFAULT NULL
  FOREIGN KEY (manager_id)
  REFERENCES employee(id)
  ON DELETE SET NULL);


CREATE VIEW managers_view AS SELECT employee2.id, employee2.first_name as manager_first_name, 
employee2.last_name AS manager_last_name
	FROM employee, employee employee2
    WHERE employee2.id = employee.manager_id OR employee.manager_id IS NULL
    ORDER BY employee.id;

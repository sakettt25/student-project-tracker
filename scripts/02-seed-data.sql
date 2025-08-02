-- Insert sample faculty users
INSERT INTO users (email, password_hash, role, name, university) VALUES
('faculty1@university.edu', '$2a$10$example_hash_1', 'faculty', 'Dr. John Smith', 'Tech University'),
('faculty2@university.edu', '$2a$10$example_hash_2', 'faculty', 'Dr. Sarah Johnson', 'Tech University');

-- Insert sample student users
INSERT INTO users (email, password_hash, role, name, roll_number, semester, faculty_id) VALUES
('student1@university.edu', '$2a$10$example_hash_3', 'student', 'Alice Brown', 'CS2021001', 6, (SELECT id FROM users WHERE email = 'faculty1@university.edu')),
('student2@university.edu', '$2a$10$example_hash_4', 'student', 'Bob Wilson', 'CS2021002', 6, (SELECT id FROM users WHERE email = 'faculty1@university.edu')),
('student3@university.edu', '$2a$10$example_hash_5', 'student', 'Carol Davis', 'CS2021003', 6, (SELECT id FROM users WHERE email = 'faculty2@university.edu'));

-- Insert sample projects
INSERT INTO projects (student_id, faculty_id, name, description, tech_stack, real_life_application, expected_completion_date, status) VALUES
((SELECT id FROM users WHERE email = 'student1@university.edu'), (SELECT id FROM users WHERE email = 'faculty1@university.edu'), 'E-commerce Platform', 'A full-stack e-commerce platform with payment integration', 'React, Node.js, MongoDB, Stripe', 'Online retail business solution', '2024-12-15', 'in_review'),
((SELECT id FROM users WHERE email = 'student2@university.edu'), (SELECT id FROM users WHERE email = 'faculty1@university.edu'), 'Task Management App', 'A collaborative task management application', 'Vue.js, Express.js, PostgreSQL', 'Team productivity tool', '2024-11-30', 'approved'),
((SELECT id FROM users WHERE email = 'student3@university.edu'), (SELECT id FROM users WHERE email = 'faculty2@university.edu'), 'Weather Dashboard', 'Real-time weather monitoring dashboard', 'React, Python, FastAPI', 'Weather forecasting service', '2024-12-20', 'pending');

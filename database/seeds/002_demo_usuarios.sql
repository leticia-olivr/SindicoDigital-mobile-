-- Usuários fictícios para demonstração. Senha de todos: Demo@123
-- Os valores de senha_hash foram gerados com bcrypt (10 rounds).
INSERT INTO usuarios (nome, email, senha_hash, tipo)
VALUES
    ('Administrador Demo', 'admin@sindicodigital.test',
     '$2b$10$Il9QApTBdFDCGPoMdnN35eJQZe7SgrtsFxWo1ZJft0EkE.jVHDSSa', 'ADMIN'),
    ('Síndica Demo', 'sindica@sindicodigital.test',
     '$2b$10$DphVGeCJcIvnoJef0faWY.DgZ685Yppo/0vZjYoQAcOHqUeymxvvW', 'SINDICO'),
    ('Morador Demo Um', 'morador1@sindicodigital.test',
     '$2b$10$Ube0AA.oRK5td/P7SbWGA.mVwllA518E0XJc/msbNiWqvvHpTt5hi', 'MORADOR'),
    ('Morador Demo Dois', 'morador2@sindicodigital.test',
     '$2b$10$btNyg7NbF2aAEXsdLzjFQOfsmYb5SeCXlUS5njf9kuRUrLNDqqJ6y', 'MORADOR')
ON CONFLICT (email) DO NOTHING;

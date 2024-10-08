const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'smart_locker'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

const JWT_SECRET = 'your_jwt_secret_key'; // Cambia esto a una clave secreta segura

// Registrar un nuevo administrador
app.post('/api/register', async (req, res) => {
    const { nombre, apellidos, cedula, contrasena } = req.body;
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    db.query('INSERT INTO administrador (nombre, apellidos, cedula, contrasena) VALUES (?, ?, ?, ?)', 
        [nombre, apellidos, cedula, hashedPassword], (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ id: result.insertId });
            }
        });
});

// Iniciar sesión como administrador
app.post('/api/login', (req, res) => {
    const { cedula, contrasena } = req.body;
    db.query('SELECT * FROM administrador WHERE cedula = ?', [cedula], async (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else if (results.length === 0) {
            res.status(400).send('Administrador no encontrado');
        } else {
            const administrador = results[0];
            const isPasswordValid = await bcrypt.compare(contrasena, administrador.contrasena);
            if (isPasswordValid) {
                const token = jwt.sign({ id: administrador.id, cedula: administrador.cedula }, JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(400).send('Contraseña inválida');
            }
        }
    });
});

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Token es requerido');
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).send('Token inválido');
    }
};

// CRUD operations for "administrador" table

// Get all administrators
app.get('/api/administradores', (req, res) => {
    db.query('SELECT * FROM administrador', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// Get a single administrator by ID
app.get('/api/administradores/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM administrador WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});

// Create a new administrator
app.post('/api/administradores', (req, res) => {
    const { nombre, apellidos, cedula, contrasena } = req.body;
    db.query('INSERT INTO administrador (nombre, apellidos, cedula, contrasena) VALUES (?, ?, ?, ?)',
        [nombre, apellidos, cedula, contrasena], (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ id: result.insertId });
            }
        });
});

// Update an administrator
app.put('/api/administradores/:id', (req, res) => {
    const id = req.params.id;
    const { nombre, apellidos, cedula, contrasena } = req.body;
    db.query('UPDATE administrador SET nombre = ?, apellidos = ?, cedula = ?, contrasena = ? WHERE id = ?',
        [nombre, apellidos, cedula, contrasena, id], (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(result);
            }
        });
});

// Delete an administrator
app.delete('/api/administradores/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM administrador WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});

// CRUD operations for "tipo_paquete" table

// Get all package types
app.get('/api/tipo_paquetes', (req, res) => {
    db.query('SELECT * FROM tipo_paquete', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// Get a single package type by ID
app.get('/api/tipo_paquetes/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM tipo_paquete WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});

// Create a new package type
app.post('/api/tipo_paquetes', (req, res) => {
    const { tipo } = req.body;
    db.query('INSERT INTO tipo_paquete (tipo) VALUES (?)', [tipo], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ id: result.insertId });
        }
    });
});

// Update a package type
app.put('/api/tipo_paquetes/:id', (req, res) => {
    const id = req.params.id;
    const { tipo } = req.body;
    db.query('UPDATE tipo_paquete SET tipo = ? WHERE id = ?', [tipo, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});

// Delete a package type
app.delete('/api/tipo_paquetes/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM tipo_paquete WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});

// CRUD PAQUETE

// Get all package 
app.get('/api/paquete', (req, res) => {
    db.query('SELECT * FROM paquete', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// Get a single package type by ID
app.get('/api/paquete/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM paquete WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});

// Create a new package type
app.post('/api/paquete', (req, res) => {
    const { tipo_paquete_id, residentes_cedula } = req.body;

    // Verifica los valores recibidos
    console.log('Tipo recibido:', tipo_paquete_id);
    console.log('Cédula recibida:', residentes_cedula);

    // Realiza la consulta SQL
    db.query('INSERT INTO paquete (tipo_paquete_id, residentes_cedula) VALUES (?, ?)', [tipo_paquete_id, residentes_cedula], (err, result) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            res.status(500).send('Error al insertar el paquete');
        } else {
            res.json({ id: result.insertId });
        }
    });
});



// Update a package type
app.put('/api/paquete/:id', (req, res) => {
    const id = req.params.id;
    const { tipo } = req.body;
    db.query('UPDATE paquete SET tipo = ? WHERE id = ?', [tipo, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});

// Delete a package type
app.delete('/api/paquete/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM paquete WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});

// Get all residents
app.get('/api/residentes', (req, res) => {
    db.query('SELECT * FROM residentes', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// Obtener un residente por ID
app.get('/api/residentes/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM residentes WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result[0]); // Devuelve el primer elemento del array de resultados
        }
    });
});


// Crear un nuevo residente
app.post('/api/residentes', (req, res) => {
    const { nombres, apellidos, telefono, cedula, contrasena, numero_apartamento } = req.body;
    console.log('Datos recibidos:', req.body); // Verifica que `numero_apartamento` esté presente

    db.query(
        'INSERT INTO residentes (nombres, apellidos, telefono, cedula, contrasena, numero_apartamento) VALUES (?, ?, ?, ?, ?, ?)',
        [nombres, apellidos, telefono, cedula, contrasena, numero_apartamento],
        (err, result) => {
            if (err) {
                console.error('Error en la consulta SQL:', err); // Agrega más detalles si es necesario
                res.status(500).send('Error al insertar el residente');
            } else {
                res.json({ id: result.insertId });
            }
        }
    );
});


// Actualizar un residente
app.put('/api/residentes/:id', (req, res) => {
    const id = req.params.id;
    const { nombres, apellidos, telefono, cedula, contrasena, numero_apartamento } = req.body;
    db.query(
        'UPDATE residentes SET nombres = ?, apellidos = ?, telefono = ?, cedula = ?, contrasena = ?, numero_apartamento = ? WHERE id = ?',
        [nombres, apellidos, telefono, cedula, contrasena, numero_apartamento, id],
        (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(result);
            }
        }
    );
});

// Eliminar un residente
app.delete('/api/residentes/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM residentes WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});


// Get all owners
app.get('/api/propietarios', (req, res) => {
    db.query('SELECT * FROM propietarios', (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// Get a single owner by ID
app.get('/api/propietarios/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM propietarios WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});

// Create a new owner
app.post('/api/propietarios', (req, res) => {
    const { nombres, apellidos, telefono, cedula, contrasena } = req.body;
    db.query('INSERT INTO propietarios (nombres, apellidos, telefono, cedula, contrasena) VALUES (?, ?, ?, ?, ?)',
        [nombres, apellidos, telefono, cedula, contrasena], (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json({ id: result.insertId });
            }
        });
});

// Update an owner
app.put('/api/propietarios/:id', (req, res) => {
    const id = req.params.id;
    const { nombres, apellidos, telefono, cedula, contrasena } = req.body;
    db.query('UPDATE propietarios SET nombres = ?, apellidos = ?, telefono = ?, cedula = ?, contrasena = ? WHERE id = ?',
        [nombres, apellidos, telefono, cedula, contrasena, id], (err, result) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(result);
            }
        });
});

// Delete an owner
app.delete('/api/propietarios/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM propietarios WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

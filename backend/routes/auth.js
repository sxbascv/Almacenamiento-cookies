const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Base de datos en memoria
let users = [];
let nextId = 1;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('📥 Registro recibido:', req.body);
  
  try {
    const { email, password, name } = req.body;

    // Validaciones básicas
    if (!email || !password || !name) {
      console.log('❌ Faltan campos');
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password.length < 6) {
      console.log('❌ Contraseña muy corta');
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar si existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log('❌ Email ya existe');
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = {
      id: nextId++,
      email,
      password: hashedPassword,
      name,
      role: 'user',
      createdAt: new Date()
    };

    users.push(newUser);
    console.log('✅ Usuario creado:', newUser.email);

    // Generar token
    console.log('🎫 Generando token...');
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        role: newUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🍪 Estableciendo cookie...');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    const { password: _, ...userWithoutPassword } = newUser;

    console.log('📤 Enviando respuesta...');
    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('💥 ERROR en registro:', error);
    return res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('📥 Login recibido:', req.body);
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    const { password: _, ...userWithoutPassword } = user;

    console.log('✅ Login exitoso:', email);

    return res.json({
      message: 'Inicio de sesión exitoso',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('💥 ERROR en login:', error);
    return res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  console.log('✅ Sesión cerrada');
  return res.json({ message: 'Sesión cerrada exitosamente' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword });
});

module.exports = router;
'use strict';

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const cookieParser = require('cookie-parser');

const path    = require('path');

const apiRoutes      = require('./routes/index');
const errorHandler   = require('./middleware/errorHandler.middleware');

const app = express();

// ── Middleware chain (order matters) ─────────────────────────────────────────

// 1. CORS — must be first so preflight OPTIONS requests are handled correctly
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true,                // allow cookies (httpOnly JWTs in later phases)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 2. Security headers — disable Cross-Origin Resource Policy to allow displaying uploads on frontend
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Serve local static file uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 3. HTTP request logger
app.use(morgan('dev'));

// 4. Cookie parser (used in auth phases)
app.use(cookieParser(process.env.COOKIE_SECRET));

// 5. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// 404 handler (must be after all routes, before error handler)
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error:   'NOT_FOUND',
  });
});

// ── Error handler — MUST be last ─────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;

import mongoose from 'mongoose';

export function getHealth(req, res) {
  res.json({
    ok: true,
    service: 'sigca-api',
    database: mongoose.connection.readyState === 1 ? 'conectada' : 'desconectada',
    timestamp: new Date().toISOString()
  });
}

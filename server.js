const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inizializza Firebase Admin con variabili ambiente
const serviceAccount = {
  type: "service_account",
  project_id: "premiere-padel-de-noantri",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Endpoint per ricevere dati dall'ESP32
app.post('/save-match', async (req, res) => {
  try {
    console.log('Ricevuto match:', req.body);
    
    const matchData = {
      mode: req.body.mode || 'UNKNOWN',
      playerA1: req.body.playerA1 || 'Player_A1',
      playerA2: req.body.playerA2 || 'Player_A2',
      playerB1: req.body.playerB1 || 'Player_B1',
      playerB2: req.body.playerB2 || 'Player_B2',
      setsA: parseInt(req.body.setsA) || 0,
      setsB: parseInt(req.body.setsB) || 0,
      gamesA: parseInt(req.body.gamesA) || 0,
      gamesB: parseInt(req.body.gamesB) || 0,
      pointsA: parseInt(req.body.pointsA) || 0,
      pointsB: parseInt(req.body.pointsB) || 0,
      winner: req.body.winner || 'N/A',
      duration: parseInt(req.body.duration) || 0,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('matches').add(matchData);
    
    console.log('✓ Salvato su Firebase con ID:', docRef.id);
    res.json({ status: 'success', id: docRef.id });
    
  } catch (error) {
    console.error('✗ Errore:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.send('🎾 Padel Firebase Bridge - Server Running');
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    status: 'ok',
    firebase: admin.apps.length > 0 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
});

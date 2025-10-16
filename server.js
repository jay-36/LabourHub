const express = require('express');
const app = express();
app.use(express.static('public'));

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.listen(5000, () => {
  console.log('✅ Simple server running on http://localhost:5000');
});
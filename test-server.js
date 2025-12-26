const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('.'));

app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 Test server on port ${PORT}`);
    console.log(`📡 http://localhost:${PORT}/api/test`);
});
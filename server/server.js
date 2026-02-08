require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// Routes
app.use('/api/topics', require('./routes/topic.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/hints', require('./routes/hint.routes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

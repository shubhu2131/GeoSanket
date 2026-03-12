const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
require('dotenv').config();

const fenceRoutes = require('./routes/fence');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', fenceRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status:  'running',
    project: 'Hyper-Local Targeting Engine',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

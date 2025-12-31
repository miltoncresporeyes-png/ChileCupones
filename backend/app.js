const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Discount = require('./models/Discount');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/auth');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'ChileCupones API is running' });
});

// API Routes
app.get('/api/discounts', async (req, res) => {
  try {
    let discounts = [];
    if (mongoose.connection.readyState === 1) {
       discounts = await Discount.find({ active: true })
        .populate('store')
        .populate('paymentMethods')
        .sort({ createdAt: -1 });
    }

    if (discounts.length === 0) {
      // Fallback to JSON file
      const jsonPath = path.join(__dirname, 'data', 'discounts.json');
      if (fs.existsSync(jsonPath)) {
        const data = fs.readFileSync(jsonPath, 'utf-8');
        discounts = JSON.parse(data);
      }
    }
    
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify Discount Endpoint
app.patch('/api/discounts/:id/verify', async (req, res) => {
  const { id } = req.params;
  const { verified } = req.body;

  try {
    let updated = false;
    
    // Try MongoDB first
    if (mongoose.connection.readyState === 1) {
      const discount = await Discount.findOne({ $or: [{ _id: id }, { externalId: id }] });
      if (discount) {
        discount.verified = verified;
        discount.lastVerifiedAt = new Date();
        await discount.save();
        updated = true;
      }
    }

    // Fallback to JSON
    if (!updated) {
      const jsonPath = path.join(__dirname, 'data', 'discounts.json');
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const index = data.findIndex(d => d._id === id || d.externalId === id);
        if (index !== -1) {
          data[index].verified = verified;
          data[index].lastVerifiedAt = new Date();
          fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
          updated = true;
        }
      }
    }

    if (updated) {
      res.json({ message: 'Discount verification updated' });
    } else {
      res.status(404).json({ message: 'Discount not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Tracking Endpoint (Monetization)
app.get('/api/track/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let url = null;
    let updated = false;

    // 1. Try MongoDB
    if (mongoose.connection.readyState === 1) {
      const discount = await Discount.findOne({ $or: [{ _id: id }, { externalId: id }] });
      if (discount) {
        discount.clicks += 1;
        await discount.save();
        url = discount.url;
        updated = true;
      }
    }

    // 2. Fallback JSON
    if (!updated) {
      const jsonPath = path.join(__dirname, 'data', 'discounts.json');
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const index = data.findIndex(d => d._id === id || d.externalId === id);
        if (index !== -1) {
          data[index].clicks = (data[index].clicks || 0) + 1;
          url = data[index].url;
          fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        }
      }
    }

    if (url) {
      res.redirect(url);
    } else {
      res.status(404).send('Discount URL not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Feedback Endpoint (Social Validation)
app.post('/api/discounts/:id/feedback', async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'like' or 'dislike'

  if (!['like', 'dislike'].includes(type)) {
    return res.status(400).json({ message: 'Invalid feedback type' });
  }

  try {
    let updated = false;
    let newCounts = { likes: 0, dislikes: 0 };

    // 1. Try MongoDB
    if (mongoose.connection.readyState === 1) {
      const discount = await Discount.findOne({ $or: [{ _id: id }, { externalId: id }] });
      if (discount) {
        if (type === 'like') discount.likes += 1;
        else discount.dislikes += 1;
        await discount.save();
        newCounts = { likes: discount.likes, dislikes: discount.dislikes };
        updated = true;
      }
    }

    // 2. Fallback JSON
    if (!updated) {
      const jsonPath = path.join(__dirname, 'data', 'discounts.json');
      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        const index = data.findIndex(d => d._id === id || d.externalId === id);
        if (index !== -1) {
          if (type === 'like') data[index].likes = (data[index].likes || 0) + 1;
          else data[index].dislikes = (data[index].dislikes || 0) + 1;
          
          newCounts = { likes: data[index].likes, dislikes: data[index].dislikes };
          fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
          updated = true;
        }
      }
    }

    if (updated) {
      res.json(newCounts);
    } else {
      res.status(404).json({ message: 'Discount not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crawler Automation
const runCrawler = () => {
  return new Promise((resolve, reject) => {
    console.log('Starting Crawler...');
    
    // Determine Python path based on OS and environment
    const isWin = process.platform === "win32";
    const venvDir = path.join(__dirname, '..', 'crawler-scripts', '.venv'); // Docker/Linux structure
    const localVenvDir = path.join(__dirname, '..', '.venv'); // Local Windows structure
    
    let pythonPath;
    if (fs.existsSync(path.join(localVenvDir, 'Scripts', 'python.exe'))) {
        pythonPath = path.join(localVenvDir, 'Scripts', 'python.exe');
    } else if (fs.existsSync(path.join(venvDir, 'bin', 'python'))) {
        pythonPath = path.join(venvDir, 'bin', 'python');
    } else {
        pythonPath = 'python'; // Fallback to global python
    }

    const scriptPath = path.join(__dirname, '..', 'crawler-scripts', 'main.py');
    
    // Check if venv exists, otherwise try global python
    const cmd = fs.existsSync(pythonPath) && pythonPath !== 'python' ? `"${pythonPath}" "${scriptPath}"` : `python "${scriptPath}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Crawler Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Crawler Stderr: ${stderr}`);
      }
      console.log(`Crawler Output: ${stdout}`);
      resolve(stdout);
    });
  });
};

// Manual Trigger Endpoint
app.post('/api/crawl', async (req, res) => {
  try {
    const output = await runCrawler();
    res.json({ message: 'Crawler executed successfully', output });
  } catch (error) {
    res.status(500).json({ message: 'Crawler failed', error: error.message });
  }
});

// Scheduled Task (Every day at 3 AM)
cron.schedule('0 3 * * *', () => {
  console.log('Running scheduled crawler task...');
  runCrawler();
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

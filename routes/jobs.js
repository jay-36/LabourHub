const express = require('express');
const Job = require('../models/Job');

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open' })
      .populate('employer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create job
router.post('/', async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
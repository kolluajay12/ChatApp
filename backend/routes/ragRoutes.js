
const express = require('express');
const performRAGSearch = require('../utils/ragSearchUtils.js'); 

const router = express.Router();

/**
 * @route POST /api/ask
 * @desc Handles the RAG query: searches candidates based on a prompt and job ID.
 * @access Public (or protected if you add auth middleware)
 */
router.post('/ask', async (req, res) => {
    const { query, jobId } = req.body; 

    if (!query) {
        return res.status(400).json({ 
            message: 'A search query is required to perform RAG matching.' 
        });
    }

    try {
        const results = await performRAGSearch(query, jobId);
        
        res.json(results);

    } catch (error) {
        console.error("RAG Search Error:", error.message);
        
        res.status(500).json({ 
            message: 'Failed to perform RAG search. Check server logs for details.' 
        });
    }
});

module.exports =  router;
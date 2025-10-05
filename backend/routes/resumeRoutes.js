
const express = require('express');
const Resume = require('../models/Resume.js');
const multer = require('multer');
const router = express.Router();


const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,'./uploads');
    },
    filename:(req,file,cb) => {
        cb(null,file.originalname);
    }
})
const upload = multer({storage}); 


const processAndEmbed = (filePath, originalFileName) => {
    const parsedText = `Parsed content of ${originalFileName}: John Doe, 5 years experience, MERN Stack, Node.js, React. PII: (555) 123-4567, john@example.com.`;
    const baseName = originalFileName.split('.').slice(0,-1).join('.');
    const cleanName = baseName.replace(/[-_]/g,'').split(' ').map(word=>word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const candidateName = `Candidate: ${cleanName}`;
    const redactedText = parsedText
        .replace(/\(\d{3}\) \d{3}-\d{4}/g, '[PHONE REDACTED]')
        .replace(/[\w\.-]+@[\w\.-]+/g, '[EMAIL REDACTED]');

    const mockEmbedding = [Math.random(), Math.random(), Math.random()];

    return {
        parsedText,
        redactedText,
        embedding: mockEmbedding,
        candidateName: candidateName, 
    };
};

const ragAnswer = (query, topK_Resumes) => {
   
    const evidence = topK_Resumes.map(r => `...snippet from ${r.candidateName}: ${r.redactedText.substring(0, 50)}...`);

    return {
        answer: `Based on the top ${topK_Resumes.length} resumes, the answer to "${query}" is a **simulated RAG response**.`,
        evidence: evidence
    };
};

router.post('/', upload.single('resumeFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }

    try {
        const { parsedText, redactedText, embedding, candidateName } = processAndEmbed(req.file.path, req.file.originalname);

        const newResume = new Resume({
            fileName: req.file.originalname,
            candidateName,
            parsedText,
            redactedText,
            embedding
        });

        await newResume.save();
        res.status(201).send({ message: 'Resume processed and uploaded.', resumeId: newResume._id });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).send({ message: 'Failed to process resume.' });
    }
});

router.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const query = req.query.q || '';

    const filter = query
        ? { redactedText: { $regex: query, $options: 'i' } } 
        : {};

    const resumes = await Resume.find(filter)
        .skip(offset)
        .limit(limit)
        .select('-embedding'); 

    const total = await Resume.countDocuments(filter);

    res.send({ resumes, total, offset, limit });
});

router.get('/:id', async (req, res) => {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
        return res.status(404).send({ message: 'Resume not found.' });
    }
    const data = {
        _id: resume._id,
        fileName: resume.fileName,
        candidateName: resume.candidateName,
        uploadedAt: resume.uploadedAt,
        content: resume.redactedText,
        originalContent: 'Recruiter only: ' + resume.parsedText
    };
    res.send(data);
});

router.post('/ask', async (req, res) => {
    const { query, k = 3 } = req.body;

    if (!query) {
        return res.status(400).send({ message: 'Query is required.' });
    }

    
    const topK_Resumes = await Resume.find().sort({ uploadedAt: -1 }).limit(k);

    if (topK_Resumes.length === 0) {
        return res.send({ answer: 'No resumes available to search.', evidence: [] });
    }

    const { answer, evidence } = ragAnswer(query, topK_Resumes);

    res.send({ answer, evidence });
});

module.exports = router;
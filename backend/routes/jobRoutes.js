
const express = require('express');
const Job = require('../models/Job.js');
const Resume  = require('../models/Resume.js');


const router = express.Router();

const matchCandidates = (jobDescription, requiredSkills, topN) => {
        return Resume.find({})
        .limit(20) 
        .then(candidates => {
            const rankedCandidates = candidates.map(candidate => {
                const resumeSkills = candidate.redactedText.toLowerCase().match(/\b(react|node\.js|mern|python)\b/g) || [];
                let matchScore = 0;
                requiredSkills.forEach(skill => {
                    if (candidate.redactedText.toLowerCase().includes(skill.toLowerCase())) {
                        matchScore += 1;
                    }
                });

                const missingRequirements = requiredSkills.filter(skill => 
                    !candidate.redactedText.toLowerCase().includes(skill.toLowerCase())
                );

                const evidence = requiredSkills
                    .filter(skill => !missingRequirements.includes(skill))
                    .map(skill => `Found skill '${skill}' near: ${candidate.redactedText.substring(candidate.redactedText.indexOf(skill) - 10, candidate.redactedText.indexOf(skill) + 20)}...`);

                return {
                    candidateId: candidate._id,
                    candidateName: candidate.candidateName,
                    matchScore,
                    missingRequirements,
                    evidence: evidence.slice(0, 3) 
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, topN);

            return rankedCandidates;
        });
};

router.post('/', async (req, res) => {
    try {
        const newJob = new Job(req.body);
        await newJob.save();
        res.status(201).send(newJob);
    } catch (error) {
        res.status(400).send({ message: 'Error creating job.', error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).send({ message: 'Job not found.' });
        }
        res.send(job);
    } catch (error) {
        res.status(500).send({ message: 'Server error.', error: error.message });
    }
});

router.post('/:id/match', async (req, res) => {
    const { top_n = 5 } = req.body;
    
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).send({ message: 'Job not found.' });
        }

        const topCandidates = await matchCandidates(job.description, job.requiredSkills, top_n);

        res.send({
            jobTitle: job.title,
            topMatches: topCandidates,
            matchCount: topCandidates.length
        });
    } catch (error) {
        console.error('Match Error:', error);
        res.status(500).send({ message: 'Failed to perform candidate matching.', error: error.message });
    }
});

module.exports =  router;
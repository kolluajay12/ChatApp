const mongoose= require('mongoose');
const ResumeSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    candidateName: { type: String, required: true }, 
    parsedText: { type: String, required: true },
    redactedText: { type: String, required: true }, 
    embedding: { type: [Number], default: [] },
    uploadedAt: { type: Date, default: Date.now }
});

const Resume = mongoose.model('Resume', ResumeSchema);
module.exports =  Resume;
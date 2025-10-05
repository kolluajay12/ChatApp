
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], default: [] }, 
    minExperience: { type: Number, default: 0 }
});

const Job = mongoose.model('Job', JobSchema);
module.exports =  Job;
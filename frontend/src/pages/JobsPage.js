import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [newJob, setNewJob] = useState({ title: '', description: '', requiredSkills: '' });
    const [matchResults, setMatchResults] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      
    }, []);

    const handleJobChange = (e) => {
        setNewJob({ ...newJob, [e.target.name]: e.target.value });
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const skillsArray = newJob.requiredSkills.split(',').map(s => s.trim()).filter(s => s);
            
            const response = await axios.post('/api/jobs', {
                ...newJob,
                requiredSkills: skillsArray
            });
            alert(`Job "${response.data.title}" created successfully!`);
            setJobs([...jobs, response.data]);
            setSelectedJobId(response.data._id); 
        } catch (error) {
            alert(`Error creating job: ${error.response?.data?.message || 'Failed.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleMatchCandidates = async (e) => {
        e.preventDefault();
        if (!selectedJobId) return;
        setLoading(true);
        setMatchResults(null);

        try {
            const response = await axios.post(`/api/jobs/${selectedJobId}/match`, { top_n: 5 });
            setMatchResults(response.data);
        } catch (error) {
            alert(`Error matching candidates: ${error.response?.data?.message || 'Failed.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <h2>💼 Job Match & Candidate Ranking</h2>
            <p>Define a new role and instantly match all uploaded candidates based on skill requirements.</p>

            <div className="card mb-4">
                <div className="card-header bg-primary text-white">Create New Job </div>
                <div className="card-body">
                    <form onSubmit={handleCreateJob}>
                        <div className="mb-3">
                            <input type="text" className="form-control" name="title" placeholder="Job Title (e.g., Senior MERN Developer)" onChange={handleJobChange} required />
                        </div>
                        <div className="mb-3">
                            <textarea className="form-control" name="description" placeholder="Full Job Description..." onChange={handleJobChange} rows="3" required></textarea>
                        </div>
                        <div className="mb-3">
                            <input type="text" className="form-control" name="requiredSkills" placeholder="Required Skills (comma-separated: React, Node.js, MongoDB)" onChange={handleJobChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Create Job & Prepare for Match'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="card">
                <div className="card-header bg-dark text-white">Run Matching Algorithm </div>
                <div className="card-body">
                    <div className="mb-3">
                        <label className="form-label">Select Job to Match</label>
                        <select className="form-select" onChange={(e) => setSelectedJobId(e.target.value)} value={selectedJobId}>
                            <option value="">-- Select a Job --</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                            <option value="mock-job" disabled={jobs.length > 0}>[Mock Job - Create one first]</option>
                        </select>
                    </div>

                    <button className="btn btn-success" onClick={handleMatchCandidates} disabled={!selectedJobId || loading}>
                        Run Deterministic Match (Top 5)
                    </button>
                </div>
            </div>

            {matchResults && (
                <div className="mt-4">
                    <h3>Top Matches for "{matchResults.jobTitle}"</h3>
                    <p className="text-success">Found {matchResults.matchCount} potential candidates.</p>
                    
                    {matchResults.topMatches.map((match, index) => (
                        <div key={match.candidateId} className="card mb-3 border-success">
                            <div className="card-body">
                                <h5 className="card-title">{index + 1}. {match.candidateName} 
                                    <span className="badge bg-success ms-2">Score: {match.matchScore}</span>
                                </h5>
                                
                                <h6>✅ Evidence Found:</h6>
                                <ul className="small text-muted">
                                    {match.evidence.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>

                                {match.missingRequirements.length > 0 && (
                                    <>
                                        <h6>❌ Missing Requirements:</h6>
                                        <p className="text-danger small">{match.missingRequirements.join(', ')}</p>
                                    </>
                                )}

                                <Link to={`/candidates/${match.candidateId}`} className="btn btn-sm btn-outline-primary">
                                    View Full Candidate Profile
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobsPage;
import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('resumeFile', file); 
        
       

        setLoading(true);
        setMessage('Processing and embedding resume(s)...');

        try {
            const response = await axios.post('/api/resumes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(`✅ Success! Resume processed. ID: ${response.data.resumeId}`);
            setFile(null); 
            document.getElementById('resumeFile').value = ''; 
        } catch (error) {
            setMessage(`❌ Error: ${error.response?.data?.message || 'Upload failed.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
            <h4 className="mb-3">Single/Bulk Resume Upload</h4>
            <div className="mb-3">
                <label htmlFor="resumeFile" className="form-label">Select File (.pdf, .docx, or .zip)</label>
                <input
                    className="form-control"
                    type="file"
                    id="resumeFile"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.zip"
                    required
                />
            </div>
            <button type="submit" className="btn btn-success w-100" disabled={loading}>
                {loading ? 'Processing...' : 'Upload & Embed Resume(s)'}
            </button>
            {message && <p className={`mt-3 alert ${message.includes('Error') ? 'alert-danger' : 'alert-info'}`}>{message}</p>}
        </form>
    );
};

export default UploadForm;
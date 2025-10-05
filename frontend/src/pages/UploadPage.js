import React, { useState } from 'react';
import axios from 'axios';

const UploadPage = () => {
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
        setMessage('Processing and embedding resume...');

        try {
            const response = await axios.post('/api/resumes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage(`✅ Success! Resume ID: ${response.data.resumeId}`);
            setFile(null); 
        } catch (error) {
            setMessage(`❌ Error: ${error.response?.data?.message || 'Upload failed.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>📄 Resume Upload (Supports Single/ZIP)</h2>
            <p>Use this page to upload a resume file (PDF, DOCX) or a ZIP archive for bulk processing.</p>
            <hr />
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="resumeFile" className="form-label">Select File</label>
                    <input
                        className="form-control"
                        type="file"
                        id="resumeFile"
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.zip"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Processing...' : 'Upload & Embed Resume'}
                </button>
            </form>
            {message && <p className={`mt-3 alert ${message.includes('Error') ? 'alert-danger' : 'alert-info'}`}>{message}</p>}
        </div>
    );
};

export default UploadPage;
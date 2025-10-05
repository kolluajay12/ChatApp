const express = require('express');
const connectDB  = require('./config/db.js');
const resumeRoutes = require('./routes/resumeRoutes.js');
const jobRoutes = require('./routes/jobRoutes.js');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json()); 

app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);


// --- Production Setup (for MERN deployment) ---
// If running in production (e.g., deployed to Heroku)
// const __dirname = path.resolve();
// if (process.env.NODE_ENV === 'production') {
//     // Serve static files from the React build directory
//     app.use(express.static(path.join(__dirname, '/frontend/build')));

//     // For any other GET request, send back the React index.html
//     app.get('*', (req, res) => 
//         res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
//     );
// } else {
//     // Simple route for development status check
//     app.get('/', (req, res) => {
//         res.send('ResumeRAG API is running...');
//     });
// }

app.get('/', (req, res) => {
    res.send('ResumeRAG API is running...');
});


app.listen(PORT, () => console.log(` Server running in on port ${PORT}`));
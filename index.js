const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const UserRoutes = require('./routes/User');
const NoteRoutes = require('./routes/Note');
const app = express();
app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use('/api', UserRoutes);


const PORT = process.env.PORT || 5000;
app.get('/api/ping', (req, res) => {
    res.send('Welcome to the Task Manager API');
});
app.use('/api', NoteRoutes);
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
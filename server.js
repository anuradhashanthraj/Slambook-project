require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3099;

// Environment variables
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/mydatabase';
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log("MongoDB URI:", MONGO_URI);
console.log("Node Environment:", NODE_ENV);

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Define schema and model for form data
const formDataSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    dob: Date,
    address: String,
    email: String,
    instagram: String,
    facebook: String,
    food: String,
    colour: String,
    crush: String,
    thoughts: String,
    autograph: String,
});

const FormData = mongoose.model('FormData', formDataSchema);

// Serve button.html on the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'buttonmiddle.html'));
});

// Serve vahini.html form page
app.get('/vahini', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vahini.html'));
});

// Define route for form submission
app.post('/submit-form', (req, res) => {
    const { name, mobile, dob, address, email, instagram, facebook, food, colour, crush, thoughts, autograph } = req.body;

    // Basic server-side validation
    const errors = {};
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        errors.name = 'Name must only contain letters';
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
        errors.mobile = 'Mobile number must be 10 digits';
    }
    if (!/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/.test(email)) {
        errors.email = 'Invalid email format';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    // Save the data to MongoDB
    const formData = new FormData(req.body);
    formData.save()
        .then(() => {
            console.log('Form Data Saved:', formData);
            res.redirect('thankyou.html'); // Redirect to thank you page
        })
        .catch((err) => {
            console.error('Error saving form data:', err);
            res.status(500).send('Internal Server Error');
        });
});

// Serve static files like HTML, CSS, and JS
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

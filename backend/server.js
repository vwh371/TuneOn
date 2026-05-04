const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database connection
const { connectDB } = require('./src/config/database');

// Import models
const { User } = require('./src/models');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const songRoutes = require('./src/routes/songRoutes');
const playlistRoutes = require('./src/routes/playlistRoutes');
const youtubeRoutes = require('./src/routes/youtubeRoutes');
const lyricsRoutes = require('./src/routes/lyricsRoutes');

// Initialize express app
const app = express();

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', limiter);

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/lyrics', lyricsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    
    res.status(status).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Create default admin user
const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({
            where: { email: process.env.ADMIN_EMAIL }
        });
        
        if (!adminExists) {
            await User.create({
                name: 'Administrator',
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin'
            });
            console.log(' Default admin user created successfully');
            console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
            console.log(`   Password: ${process.env.ADMIN_PASSWORD}`);
        } else {
            console.log(' Admin user already exists');
        }
    } catch (error) {
        console.error(' Error creating admin user:', error.message);
    }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        
        // Create default admin
        await createDefaultAdmin();
        
        // Start listening
        app.listen(PORT, () => {
            console.log(`\n Server running on port ${PORT}`);
            console.log(` http://localhost:${PORT}`);
            console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('\n Available endpoints:');
            console.log(`   POST   /api/auth/register`);
            console.log(`   POST   /api/auth/login`);
            console.log(`   GET    /api/songs`);
            console.log(`   GET    /api/playlists/public`);
            console.log(`   GET    /api/youtube/search`);
            console.log(`   GET    /health`);
            console.log('\n Server ready!\n');
        });
    } catch (error) {
        console.error(' Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
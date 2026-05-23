const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDir = 'uploads/';
const songsDir = 'uploads/songs/';
const imagesDir = 'uploads/images/';

[uploadDir, songsDir, imagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, songsDir);
        } else if (file.mimetype.startsWith('image/')) {
            cb(null, imagesDir);
        } else {
            cb(new Error('Invalid file type'), null);
        }
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (allowedAudioTypes.includes(file.mimetype) || allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only audio and image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 // 50MB default
    },
    fileFilter: fileFilter
});

// Middleware for uploading single audio file
const uploadAudio = upload.single('audio');

// Middleware for uploading single image file
const uploadImage = upload.single('image');

// Middleware for uploading multiple files
const uploadMultiple = upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]);

module.exports = { upload, uploadAudio, uploadImage, uploadMultiple };
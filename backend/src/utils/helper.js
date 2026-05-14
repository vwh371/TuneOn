// Format duration from seconds to MM:SS
const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Generate random string
const generateRandomString = (length = 8) => {
    return Math.random().toString(36).substring(2, 2 + length);
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

// Clean filename for upload
const sanitizeFilename = (filename) => {
    return filename
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-');
};

module.exports = {
    formatDuration,
    generateRandomString,
    isValidEmail,
    sanitizeFilename
};
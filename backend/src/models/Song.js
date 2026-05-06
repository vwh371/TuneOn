const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Song = sequelize.define('Song', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    artist: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    album: {
        type: DataTypes.STRING(100),
        defaultValue: null
    },
    genre: {
        type: DataTypes.STRING(50),
        defaultValue: 'Other'
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    audioUrl: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    coverImage: {
        type: DataTypes.STRING(500),
        defaultValue: '/uploads/images/default-cover.jpg'
    },
    uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    uploadType: {
        type: DataTypes.ENUM('local', 'youtube'),
        defaultValue: 'local'
    },
    youtubeVideoId: {
        type: DataTypes.STRING(50),
        defaultValue: null
    },
    plays: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'songs',
    timestamps: true,
    indexes: [
        {
            fields: ['title']
        },
        {
            fields: ['artist']
        },
        {
            fields: ['genre']
        },
        {
            fields: ['uploadType']
        }
    ]
});

module.exports = Song;
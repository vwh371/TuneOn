const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Playlist = sequelize.define('Playlist', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            len: [1, 100],
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: null,
        validate: {
            len: [0, 500]
        }
    },
    coverImage: {
        type: DataTypes.STRING(500),
        defaultValue: '/uploads/images/default-playlist.jpg'
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'playlists',
    timestamps: true
});

module.exports = Playlist;
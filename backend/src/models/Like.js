const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Like = sequelize.define('Like', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    songId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'songs',
            key: 'id'
        }
    },
    playlistId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'playlists',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('song', 'playlist'),
        allowNull: false
    }
}, {
    tableName: 'likes',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'songId', 'type'],
            where: {
                type: 'song'
            }
        },
        {
            unique: true,
            fields: ['userId', 'playlistId', 'type'],
            where: {
                type: 'playlist'
            }
        }
    ],
    validate: {
        validLike() {
            if (this.type === 'song' && !this.songId) {
                throw new Error('Song ID is required for song likes');
            }
            if (this.type === 'playlist' && !this.playlistId) {
                throw new Error('Playlist ID is required for playlist likes');
            }
        }
    }
});

module.exports = Like;
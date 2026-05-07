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
        references: {
            model: 'songs',
            key: 'id'
        }
    },
    playlistId: {
        type: DataTypes.INTEGER,
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
    timestamps: true,
    tableName: 'likes'
});

module.exports = Like;
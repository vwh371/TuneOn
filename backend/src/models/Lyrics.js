const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lyrics = sequelize.define('Lyrics', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    songId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'songs',
            key: 'id'
        }
    },
    lyricsText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    syncedLyrics: {
        type: DataTypes.TEXT, // Store as JSON string
        get() {
            const raw = this.getDataValue('syncedLyrics');
            return raw ? JSON.parse(raw) : null;
        },
        set(value) {
            this.setDataValue('syncedLyrics', value ? JSON.stringify(value) : null);
        }
    },
    language: {
        type: DataTypes.STRING(10),
        defaultValue: 'en'
    },
    contributorId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    tableName: 'lyrics'
});

module.exports = Lyrics;
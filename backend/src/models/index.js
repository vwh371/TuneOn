const User = require('./User');
const Song = require('./Song');
const Playlist = require('./Playlist');
const PlaylistSong = require('./PlaylistSong');
const Lyrics = require('./Lyrics');
const Like = require('./Like');

// User - Song relationships
User.hasMany(Song, { foreignKey: 'uploadedBy', as: 'uploadedSongs' });
Song.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// User - Playlist relationships
User.hasMany(Playlist, { foreignKey: 'ownerId', as: 'playlists' });
Playlist.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Playlist - Song relationships (Many-to-Many)
Playlist.belongsToMany(Song, {
    through: PlaylistSong,
    foreignKey: 'playlistId',
    otherKey: 'songId',
    as: 'songs'
});

Song.belongsToMany(Playlist, {
    through: PlaylistSong,
    foreignKey: 'songId',
    otherKey: 'playlistId',
    as: 'playlists'
});

// Song - Lyrics relationships (One-to-One)
Song.hasOne(Lyrics, { foreignKey: 'songId', as: 'lyrics' });
Lyrics.belongsTo(Song, { foreignKey: 'songId', as: 'song' });

// User - Lyrics relationships
User.hasMany(Lyrics, { foreignKey: 'contributorId', as: 'contributedLyrics' });
Lyrics.belongsTo(User, { foreignKey: 'contributorId', as: 'contributor' });

// Like relationships
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Song, { foreignKey: 'songId', as: 'song' });
Like.belongsTo(Playlist, { foreignKey: 'playlistId', as: 'playlist' });

User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Song.hasMany(Like, { foreignKey: 'songId', as: 'likes' });
Playlist.hasMany(Like, { foreignKey: 'playlistId', as: 'likes' });

module.exports = {
    User,
    Song,
    Playlist,
    PlaylistSong,
    Lyrics,
    Like
};
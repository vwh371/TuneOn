import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Player from './components/Layout/Player';
import PrivateRoute from './components/Auth/PrivateRoute';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Library from './pages/Library';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Trending from './pages/Trending';
import SongDetail from './components/Songs/SongDetail';
import PlaylistDetail from './components/Playlists/PlaylistDetail';
import UploadSong from './components/Songs/UploadSong';
import LikedSongs from './pages/LikedSongs';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 pb-32">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/song/:id" element={<SongDetail />} />
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route
              path="/library"
              element={
                <PrivateRoute>
                  <Library />
                </PrivateRoute>
              }
            />
            <Route
              path="/liked-songs"
              element={
                <PrivateRoute>
                  <LikedSongs />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <UploadSong />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      <Player />
    </div>
  );
}

export default App;
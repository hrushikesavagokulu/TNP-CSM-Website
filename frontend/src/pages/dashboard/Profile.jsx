import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profile.service';
import SearchStudents from '../../components/shared/SearchStudents';
import ProfileForm from '../../components/profile/ProfileForm';
import PeerProfileView from '../../components/profile/PeerProfileView';

export default function Profile() {
  const { rollNo } = useParams();
  const { user, setUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  // Check if viewing own profile
  const isOwnProfile = !rollNo || rollNo.toUpperCase() === user?.rollNo.toUpperCase();

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (isOwnProfile) {
      // Fetch own profile
      profileService.getOwnProfile()
        .then((data) => {
          setProfileData(data);
          // Sync AuthContext user data if updated
          setUser((curr) => ({ ...curr, ...data }));
        })
        .catch((err) => setError(err.response?.data?.message || 'Failed to load profile.'))
        .finally(() => setLoading(false));
    } else {
      // Fetch peer profile
      profileService.getProfileByRollNo(rollNo)
        .then((data) => setProfileData(data))
        .catch((err) => setError(err.response?.data?.message || 'Failed to load peer profile.'))
        .finally(() => setLoading(false));
    }
  }, [rollNo, isOwnProfile, setUser]);

  // Callback to sync form updates instantly without full page refresh
  const handleProfileUpdated = (updated) => {
    setProfileData(updated);
    setUser((curr) => ({ ...curr, ...updated }));
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* Local Navigation Header with Search Widget */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)]">
            {isOwnProfile ? 'My Profile' : 'Student Directory'}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {isOwnProfile ? 'Manage your credentials, tech stack and achievements' : `Viewing ${profileData?.name || 'Student'}'s profile`}
          </p>
        </div>
        <div className="w-full md:w-auto flex-1 md:max-w-md">
          <SearchStudents />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 flex flex-col items-center gap-4 text-[var(--color-text-secondary)]">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-accent)] animate-spin" />
          <p className="text-xs font-semibold animate-pulse">Loading profile data...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="py-12 text-center glass-card p-6 flex flex-col items-center gap-3">
          <span className="text-2xl">⚠</span>
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">Profile Unavailable</h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm">{error}</p>
        </div>
      )}

      {/* Profile Render Coordinator */}
      {!loading && !error && profileData && (
        isOwnProfile ? (
          <ProfileForm user={profileData} onUpdate={handleProfileUpdated} />
        ) : (
          <PeerProfileView peerUser={profileData} />
        )
      )}

    </div>
  );
}

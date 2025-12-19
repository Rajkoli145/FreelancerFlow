import React, { useState, useEffect } from "react";
import { User, Camera, Mail, DollarSign, Lock, Bell, Moon, FileText } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getMe, updateProfile, updatePassword } from "../../api/authApi";
import { getCurrencySymbol, CURRENCY_OPTIONS } from "../../utils/formatCurrency";
import Loader from "../../components/ui/Loader";
import NeuInput from "../../components/ui/NeuInput";
import NeuButton from "../../components/ui/NeuButton";
import '../../styles/global/neumorphism.css';

const SettingsPage = () => {
  // Profile Settings State
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    hourlyRate: "",
    currency: "INR"
  });

  // Account Settings State
  const [accountSettings, setAccountSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    weeklyEmails: true,
  });

  // Password Settings State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const { user, setUser } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await getMe();
        const userData = response.data || response.user || response;
        setProfileData({
          fullName: userData.fullName || "",
          email: userData.email || "",
          hourlyRate: userData.defaultHourlyRate?.toString() || "",
          currency: userData.currency || "INR"
        });
        // Set existing profile picture if available
        if (userData.profilePicture) {
          setAvatarPreview(userData.profilePicture);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleAccountToggle = (field) => {
    setAccountSettings({ ...accountSettings, [field]: !accountSettings[field] });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
    setPasswordError("");
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large (max 500px)
          const maxSize = 500;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression (0.8 quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setAvatarPreview(compressedBase64);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setError(null);
      setSuccessMessage("");

      const updateData = {
        fullName: profileData.fullName,
        email: profileData.email,
        defaultHourlyRate: parseFloat(profileData.hourlyRate) || 0,
        currency: profileData.currency,
        ...(avatarPreview && { profilePicture: avatarPreview })
      };

      const response = await updateProfile(updateData);
      const updatedUser = response.data || response.user || response;

      // Update AuthContext user
      if (setUser) {
        setUser(updatedUser);
      }

      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.error || err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setUpdatingPassword(true);
      setPasswordError("");
      setError(null);
      setSuccessMessage("");

      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccessMessage("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError(err.error || err.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin" style={{ color: 'var(--neu-primary)' }}>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="neu-container space-y-6">
      {/* Header Section */}
      <div className="neu-card">
        <h1 className="text-3xl font-bold neu-heading">Settings</h1>
        <p className="neu-text-light mt-1">
          Manage your account preferences and system settings.
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="neu-card-inset p-4" style={{ borderLeft: '4px solid #22c55e' }}>
          <p className="text-sm font-medium" style={{ color: '#166534' }}>{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="neu-card-inset p-4" style={{ borderLeft: '4px solid #ef4444' }}>
          <p className="text-sm font-medium" style={{ color: '#991b1b' }}>{error}</p>
        </div>
      )}

      {/* Profile Information Section */}
      <div className="neu-card space-y-6">
        <div className="pb-4" style={{ borderBottom: '1px solid var(--neu-dark)' }}>
          <h2 className="text-xl font-semibold neu-heading flex items-center gap-2">
            <User className="w-5 h-5" style={{ color: 'var(--neu-primary)' }} />
            Profile Information
          </h2>
          <p className="text-sm neu-text-light mt-1">
            Update your personal details and profile picture
          </p>
        </div>

        {/* Avatar Upload */}
        <div className="flex items-center gap-10">
          {/* Avatar Container */}
          <div className="relative" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}>
            <div
              className="rounded-full overflow-hidden"
              style={{
                width: '120px',
                height: '120px',
                background: avatarPreview ? '#ffffff' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '8px 8px 16px #c9ced6, -8px -8px 16px #ffffff',
                border: '3px solid #eef1f6',
                padding: avatarPreview ? '0' : '0',
              }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-14 h-14 text-white" style={{ strokeWidth: 1.5 }} />
                </div>
              )}
            </div>

            {/* Camera Badge */}
            <label
              htmlFor="avatar-upload"
              className="absolute rounded-full cursor-pointer transition-all duration-200"
              style={{
                width: '46px',
                height: '46px',
                bottom: '4px',
                right: '4px',
                backgroundColor: '#4A5FFF',
                boxShadow: '0 4px 12px rgba(74, 95, 255, 0.4), 0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #eef1f6'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.92)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(74, 95, 255, 0.3), inset 0 2px 4px rgba(0,0,0,0.2)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 95, 255, 0.4), 0 2px 4px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 95, 255, 0.4), 0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <Camera className="w-5 h-5 text-white" style={{ strokeWidth: 2.5 }} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1.5" style={{ color: '#1f2937' }}>
              {profileData.fullName || 'RAJ KOLI'}
            </h3>
            <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
              Freelance Professional
            </p>

            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center gap-2 rounded-xl font-medium text-sm cursor-pointer transition-all duration-200"
              style={{
                padding: '0.75rem 1.5rem',
                color: '#4A5FFF',
                backgroundColor: '#eef1f6',
                boxShadow: '5px 5px 10px #c9ced6, -5px -5px 10px #ffffff'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
                e.currentTarget.style.boxShadow = 'inset 3px 3px 6px #c9ced6, inset -3px -3px 6px #ffffff';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '5px 5px 10px #c9ced6, -5px -5px 10px #ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '5px 5px 10px #c9ced6, -5px -5px 10px #ffffff';
              }}
            >
              <Camera className="w-4 h-4" style={{ strokeWidth: 2 }} />
              Upload new photo
            </label>
          </div>
        </div>

        {/* Profile Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium neu-text mb-2">
              Full Name *
            </label>
            <NeuInput
              icon={User}
              type="text"
              value={profileData.fullName}
              onChange={(e) => handleProfileChange("fullName", e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium neu-text mb-2">
              Email Address *
            </label>
            <NeuInput
              icon={Mail}
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange("email", e.target.value)}
              placeholder="Enter your email"
              disabled={savingProfile}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium neu-text mb-2">
              Default Hourly Rate ({getCurrencySymbol(profileData.currency)})
            </label>
            <NeuInput
              icon={DollarSign}
              type="number"
              value={profileData.hourlyRate}
              onChange={(e) => handleProfileChange("hourlyRate", e.target.value)}
              placeholder="150"
              min="0"
              disabled={savingProfile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium neu-text mb-2">
              Preferred Currency
            </label>
            <select
              value={profileData.currency}
              onChange={(e) => handleProfileChange("currency", e.target.value)}
              className="neu-input w-full px-4 py-2.5"
              disabled={savingProfile}
            >
              {CURRENCY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs neu-text-light mt-1.5">
              This will be the default currency for new clients and invoices
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4" style={{ borderTop: '1px solid var(--neu-dark)' }}>
          <NeuButton
            variant="primary"
            onClick={handleSaveProfile}
            disabled={savingProfile}
          >
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </NeuButton>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="neu-card space-y-6">
        <div className="pb-4" style={{ borderBottom: '1px solid var(--neu-dark)' }}>
          <h2 className="text-xl font-semibold neu-heading flex items-center gap-2">
            <Bell className="w-5 h-5" style={{ color: 'var(--neu-primary)' }} />
            Account Settings
          </h2>
          <p className="text-sm neu-text-light mt-1">
            Manage your preferences and notifications
          </p>
        </div>

        <div className="space-y-5">
          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--neu-dark)' }}>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 neu-text-light mt-1" />
              <div>
                <p className="font-medium neu-heading">Email Notifications</p>
                <p className="text-sm neu-text-light">Receive important updates via email</p>
              </div>
            </div>
            <button
              onClick={() => handleAccountToggle("emailNotifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${accountSettings.emailNotifications ? "" : ""
                }`}
              style={{ backgroundColor: accountSettings.emailNotifications ? 'var(--neu-primary)' : '#d1d9e6', boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${accountSettings.emailNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
              />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--neu-dark)' }}>
            <div className="flex items-start gap-3">
              <Moon className="w-5 h-5 neu-text-light mt-1" />
              <div>
                <p className="font-medium neu-heading">Dark Mode</p>
                <p className="text-sm neu-text-light">Toggle dark theme (coming soon)</p>
              </div>
            </div>
            <button
              onClick={() => handleAccountToggle("darkMode")}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ backgroundColor: accountSettings.darkMode ? 'var(--neu-primary)' : '#d1d9e6', boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${accountSettings.darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
              />
            </button>
          </div>

          {/* Weekly Summary Toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 neu-text-light mt-1" />
              <div>
                <p className="font-medium neu-heading">Weekly Summary Emails</p>
                <p className="text-sm neu-text-light">Get weekly reports of your activity</p>
              </div>
            </div>
            <button
              onClick={() => handleAccountToggle("weeklyEmails")}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ backgroundColor: accountSettings.weeklyEmails ? 'var(--neu-primary)' : '#d1d9e6', boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${accountSettings.weeklyEmails ? "translate-x-6" : "translate-x-1"
                  }`}
                style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security / Password Change Section */}
      <div className="neu-card space-y-6">
        <div className="pb-4" style={{ borderBottom: '1px solid var(--neu-dark)' }}>
          <h2 className="text-xl font-semibold neu-heading flex items-center gap-2">
            <Lock className="w-5 h-5" style={{ color: 'var(--neu-primary)' }} />
            Security & Password
          </h2>
          <p className="text-sm neu-text-light mt-1">
            Update your password to keep your account secure
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }} className="space-y-5">
          <div>
            <label className="block text-sm font-medium neu-text mb-2">
              Current Password *
            </label>
            <NeuInput
              icon={Lock}
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                New Password *
              </label>
              <NeuInput
                icon={Lock}
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={updatingPassword}
              />
            </div>

            <div>
              <label className="block text-sm font-medium neu-text mb-2">
                Confirm New Password *
              </label>
              <NeuInput
                icon={Lock}
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={updatingPassword}
              />
            </div>
          </div>

          {passwordError && (
            <div className="neu-card-inset p-4 flex items-start gap-3" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#fee2e2' }}>
                <span className="text-xs font-bold" style={{ color: '#dc2626' }}>!</span>
              </div>
              <p className="text-sm" style={{ color: '#991b1b' }}>{passwordError}</p>
            </div>
          )}

          <div className="flex justify-end pt-4" style={{ borderTop: '1px solid var(--neu-dark)' }}>
            <NeuButton
              variant="primary"
              type="submit"
              disabled={updatingPassword}
            >
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </NeuButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;

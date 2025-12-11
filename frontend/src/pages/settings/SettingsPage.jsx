import React, { useState, useEffect } from "react";
import { User, Camera, Mail, DollarSign, Lock, Bell, Moon, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMe, updateProfile, updatePassword } from "../../api/authApi";
import Loader from "../../components/ui/Loader";

const SettingsPage = () => {
  // Profile Settings State
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    hourlyRate: "",
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
        });
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
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
        defaultHourlyRate: parseFloat(profileData.hourlyRate) || 0
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
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your account preferences and system settings.
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-600 text-sm font-medium">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Profile Information Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Profile Information
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update your personal details and profile picture
            </p>
          </div>

          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-indigo-600" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer transition-colors shadow-lg"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{profileData.fullName}</h3>
              <p className="text-sm text-gray-500">Freelance Professional</p>
              <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Upload new photo
              </button>
            </div>
          </div>

          {/* Profile Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => handleProfileChange("fullName", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:opacity-50"
                  placeholder="Enter your email"
                  disabled={savingProfile}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Hourly Rate ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={profileData.hourlyRate}
                  onChange={(e) => handleProfileChange("hourlyRate", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:opacity-50"
                  placeholder="150"
                  min="0"
                  disabled={savingProfile}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Account Settings Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Account Settings
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your preferences and notifications
            </p>
          </div>

          <div className="space-y-5">
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive important updates via email</p>
                </div>
              </div>
              <button
                onClick={() => handleAccountToggle("emailNotifications")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  accountSettings.emailNotifications ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    accountSettings.emailNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <Moon className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-500">Toggle dark theme (coming soon)</p>
                </div>
              </div>
              <button
                onClick={() => handleAccountToggle("darkMode")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  accountSettings.darkMode ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    accountSettings.darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Weekly Summary Toggle */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Weekly Summary Emails</p>
                  <p className="text-sm text-gray-500">Get weekly reports of your activity</p>
                </div>
              </div>
              <button
                onClick={() => handleAccountToggle("weeklyEmails")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  accountSettings.weeklyEmails ? "bg-indigo-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    accountSettings.weeklyEmails ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security / Password Change Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              Security & Password
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update your password to keep your account secure
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:opacity-50"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={updatingPassword}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:opacity-50"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={updatingPassword}
                  />
                </div>
              </div>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-red-700">{passwordError}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={updatingPassword}
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

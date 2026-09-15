import { useEffect, useState } from "react";

import {
  User,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Settings = () => {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);

  const [loadingProfile, setLoadingProfile] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");

  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [avatarMessage, setAvatarMessage] = useState("");

  const [avatarError, setAvatarError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setProfileError("");

      const response = await api.get("/users/profile");

      const data = response.data.data;

      setProfile({
        name: data?.name || "",
        email: data?.email || "",
      });
    } catch (error) {
      setProfileError(
        error.response?.data?.message || "Failed to load profile.",
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setProfileMessage("");
    setProfileError("");
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const name = profile.name.trim();

    const email = profile.email.trim().toLowerCase();

    if (name.length < 2) {
      setProfileError("Name must be at least 2 characters.");
      return;
    }

    if (name.length > 50) {
      setProfileError("Name cannot exceed 50 characters.");
      return;
    }

    if (!email) {
      setProfileError("Email is required.");
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setProfileError("");

      const response = await api.patch("/users/profile", {
        name,
        email,
      });

      const updatedUser = response.data.data;

      setProfile({
        name: updatedUser?.name || name,
        email: updatedUser?.email || email,
      });

      setUser((previous) => ({
        ...previous,
        ...updatedUser,
      }));

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileError(
        error.response?.data?.message || "Failed to update profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Only JPG, PNG, and WEBP images are allowed.");

      event.target.value = "";

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAvatarError("Avatar image cannot exceed 10 MB.");

      event.target.value = "";

      return;
    }

    setAvatarFile(file);

    setAvatarError("");

    setAvatarMessage("");

    const previewUrl = URL.createObjectURL(file);

    setAvatarPreview(previewUrl);
  };

  const handleAvatarSubmit = async () => {
    if (!avatarFile) {
      setAvatarError("Please select an avatar image.");

      return;
    }

    try {
      setUploadingAvatar(true);

      setAvatarError("");

      setAvatarMessage("");

      const formData = new FormData();

      formData.append("avatar", avatarFile);

      const response = await api.patch("/users/avatar", formData);

      const updatedUser = response.data.data;

      setUser((previous) => ({
        ...previous,
        ...updatedUser,
      }));

      setAvatarFile(null);

      setAvatarPreview(null);

      setAvatarMessage("Avatar updated successfully.");
    } catch (error) {
      setAvatarError(
        error.response?.data?.message || "Failed to update avatar.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswords((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPasswordMessage("");

    setPasswordError("");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword) {
      setPasswordError("Current password is required.");

      return;
    }

    if (!newPassword) {
      setPasswordError("New password is required.");

      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation password do not match.");

      return;
    }

    try {
      setChangingPassword(true);

      setPasswordMessage("");

      setPasswordError("");

      await api.patch("/users/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage("Password changed successfully.");
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-[#68746E]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full">

      <div>
        <p className="text-sm text-[#68746E]">Account</p>

        <h1 className="mt-1 text-3xl font-semibold text-[#18211D]">Settings</h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68746E]">
          Manage your profile information, profile picture, and account
          password.
        </p>
      </div>

      {profileError && (
        <div className="mt-6">
          <Message
            type="error"
            message={profileError}
            onClose={() => setProfileError("")}
          />
        </div>
      )}

      <section className="mt-6 border border-[#DDE3DF] bg-white">
        <div className="border-b border-[#E7EBE8] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
              <Camera size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#18211D]">
                Profile picture
              </h2>

              <p className="mt-1 text-sm text-[#68746E]">
                Upload a profile picture for your account.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="shrink-0">
              {avatarPreview || user?.avatar ? (
                <img
                  src={avatarPreview || user.avatar}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border border-[#D6DDD8] object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#DCEBDF] text-2xl font-semibold text-[#315C4B]">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            <div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <label
                htmlFor="avatar-upload"
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#315C4B] bg-white px-4 text-sm font-medium text-[#315C4B] transition hover:bg-[#EAF1EC]"
              >
                <Camera size={16} />
                Choose image
              </label>

              <p className="mt-2 text-xs text-[#89938E]">
                JPG, PNG or WEBP. Maximum 10 MB.
              </p>

              {avatarFile && (
                <p className="mt-2 max-w-sm truncate text-xs font-medium text-[#315C4B]">
                  Selected: {avatarFile.name}
                </p>
              )}
            </div>
          </div>

          {avatarError && (
            <div className="mt-5 max-w-xl">
              <Message
                type="error"
                message={avatarError}
                onClose={() => setAvatarError("")}
              />
            </div>
          )}

          {avatarMessage && (
            <div className="mt-5 max-w-xl">
              <Message type="success" message={avatarMessage} />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleAvatarSubmit}
              disabled={!avatarFile || uploadingAvatar}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white transition hover:bg-[#274D3F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingAvatar ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera size={16} />
                  Update picture
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 border border-[#DDE3DF] bg-white">
        <div className="border-b border-[#E7EBE8] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
              <User size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#18211D]">Profile</h2>

              <p className="mt-1 text-sm text-[#68746E]">
                Update your basic account information.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="p-5">
          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium text-[#18211D]">
                Full name
              </label>

              <div className="relative">
                <User
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938E]"
                />

                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="Your name"
                  className="h-11 w-full rounded-lg border border-[#D6DDD8] bg-white pl-10 pr-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                />
              </div>

              <p className="mt-1.5 text-xs text-[#89938E]">2–50 characters</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#18211D]">
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938E]"
                />

                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="you@example.com"
                  className="h-11 w-full rounded-lg border border-[#D6DDD8] bg-white pl-10 pr-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                />
              </div>

              <p className="mt-1.5 text-xs text-[#89938E]">
                Used for your account
              </p>
            </div>
          </div>

          {profileMessage && (
            <div className="mt-5">
              <Message type="success" message={profileMessage} />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white transition hover:bg-[#274D3F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 border border-[#DDE3DF] bg-white">
        <div className="border-b border-[#E7EBE8] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
              <Lock size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#18211D]">Password</h2>

              <p className="mt-1 text-sm text-[#68746E]">
                Change your account password.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="p-5">
          <div className="max-w-xl space-y-5">
            <PasswordInput
              label="Current password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              visible={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((previous) => !previous)}
            />

            <PasswordInput
              label="New password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((previous) => !previous)}
            />

            <PasswordInput
              label="Confirm new password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((previous) => !previous)}
            />

            <p className="text-xs text-[#89938E]">
              Your new password must be at least 6 characters.
            </p>
          </div>

          {passwordError && (
            <div className="mt-5 max-w-xl">
              <Message
                type="error"
                message={passwordError}
                onClose={() => setPasswordError("")}
              />
            </div>
          )}

          {passwordMessage && (
            <div className="mt-5 max-w-xl">
              <Message type="success" message={passwordMessage} />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={changingPassword}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white transition hover:bg-[#274D3F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changingPassword ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Change password
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 border border-[#DDE3DF] bg-[#F7F8F6] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#315C4B]">
            <User size={17} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#18211D]">
              Account information
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#68746E]">
              Your account is protected by JWT authentication using a secure
              HTTP-only cookie. Passwords are securely hashed on the server.
            </p>

            {user?.createdAt && (
              <p className="mt-2 text-xs text-[#89938E]">
                Account created {formatDate(user.createdAt)}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const PasswordInput = ({ label, name, value, onChange, visible, onToggle }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#18211D]">
        {label}
      </label>

      <div className="relative">
        <Lock
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938E]"
        />

        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={
            name === "currentPassword" ? "current-password" : "new-password"
          }
          className="h-11 w-full rounded-lg border border-[#D6DDD8] bg-white px-10 pr-11 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#89938E] transition hover:text-[#315C4B]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
};

const Message = ({ type, message, onClose }) => {
  const success = type === "success";

  return (
    <div
      className={`flex items-start justify-between gap-3 border p-3 ${
        success
          ? "border-[#C9DDCE] bg-[#EFF6F0] text-[#315C4B]"
          : "border-[#E8C9C7] bg-[#F8ECEB] text-[#8A2638]"
      }`}
    >
      <div className="flex items-start gap-2">
        {success ? (
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
        ) : (
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
        )}

        <p className="text-sm">{message}</p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-current"
          aria-label="Close message"
        >
          ×
        </button>
      )}
    </div>
  );
};

const formatDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default Settings;

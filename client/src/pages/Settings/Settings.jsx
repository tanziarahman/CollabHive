import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import {
  getSettings,
  updateSettings,
  updateAccount,
  changePassword,
  deactivateAccount,
  deleteAccount,
} from "../../api/settings";
import { clearSession } from "../../utils/session";
import "./Settings.css";

const NOTIFICATION_TOGGLES = [
  {
    key: "notifyFollowRequests",
    label: "Follow requests",
    description: "When someone wants to follow you",
  },
  {
    key: "notifyFollowAccepted",
    label: "Follow accepted",
    description: "When someone accepts your follow request",
  },
  {
    key: "notifyJoinRequests",
    label: "Join requests & invites",
    description: "When someone applies to your project, or invites you to theirs",
  },
  {
    key: "notifyJoinRequestUpdates",
    label: "Join request updates",
    description: "When your application or invite is accepted or declined",
  },
];

function ToggleRow({ label, description, checked, onChange, disabled }) {
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-text">
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      <label className="settings-switch">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="settings-switch-slider" />
      </label>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [accountError, setAccountError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [settings, setSettings] = useState({
    notifyFollowRequests: true,
    notifyFollowAccepted: true,
    notifyJoinRequests: true,
    notifyJoinRequestUpdates: true,
    discoverable: true,
    autoAcceptFollowRequests: false,
  });
  const [savingSettingKey, setSavingSettingKey] = useState("");

  const [deactivating, setDeactivating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettings();
        setUsername(data.username || "");
        setEmail(data.email || "");
        if (data.settings) setSettings((s) => ({ ...s, ...data.settings }));
      } catch (err) {
        setLoadError(err.response?.data?.message || "Could not load your settings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSavingAccount(true);
    setAccountMessage("");
    setAccountError("");
    try {
      const data = await updateAccount({ username, email });
      setUsername(data.username);
      setEmail(data.email);
      setAccountMessage("Saved!");
    } catch (err) {
      setAccountError(err.response?.data?.message || "Could not update your account.");
    } finally {
      setSavingAccount(false);
      window.setTimeout(() => setAccountMessage(""), 2500);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMessage("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Could not update your password.");
    } finally {
      setChangingPassword(false);
      window.setTimeout(() => setPasswordMessage(""), 2500);
    }
  };

  const handleToggle = async (key, value) => {
    const previous = settings[key];
    setSettings((s) => ({ ...s, [key]: value }));
    setSavingSettingKey(key);
    try {
      await updateSettings({ [key]: value });
    } catch {
      setSettings((s) => ({ ...s, [key]: previous }));
    } finally {
      setSavingSettingKey("");
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Deactivate your account? Log back in anytime to reactivate it.")) return;
    setDeactivating(true);
    try {
      await deactivateAccount();
      clearSession();
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Could not deactivate your account.");
      setDeactivating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      clearSession();
      navigate("/");
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Could not delete your account.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="settings-page">
          <div className="settings-container">
            <div className="loading-state">Loading settings...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <h1>Settings</h1>
            <p>Manage your account, privacy, and notification preferences.</p>
          </div>

          {loadError && <div className="settings-alert error">{loadError}</div>}

          {/* Account */}
          <section className="settings-section">
            <div className="settings-section-header">
              <h2>Account</h2>
              <p>Update your username and email address.</p>
            </div>
            <form onSubmit={handleSaveAccount}>
              <div className="settings-form-row">
                <div className="settings-field">
                  <label>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              {accountError && <p className="settings-error-text">{accountError}</p>}
              <div className="settings-actions">
                <button type="submit" className="settings-btn-primary" disabled={savingAccount}>
                  {savingAccount ? "Saving..." : "Save changes"}
                </button>
                {accountMessage && <span className="settings-inline-message">{accountMessage}</span>}
              </div>
            </form>
          </section>

          {/* Password */}
          <section className="settings-section">
            <div className="settings-section-header">
              <h2>Change password</h2>
              <p>Choose a strong password you don't use anywhere else.</p>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="settings-form-row">
                <div className="settings-field">
                  <label>Current password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="settings-field">
                  <label>Confirm new password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              {passwordError && <p className="settings-error-text">{passwordError}</p>}
              <div className="settings-actions">
                <button type="submit" className="settings-btn-primary" disabled={changingPassword}>
                  {changingPassword ? "Updating..." : "Update password"}
                </button>
                {passwordMessage && <span className="settings-inline-message">{passwordMessage}</span>}
              </div>
            </form>
          </section>

          {/* Notifications */}
          <section className="settings-section">
            <div className="settings-section-header">
              <h2>Notifications</h2>
              <p>Choose what you want to be notified about.</p>
            </div>
            <div className="settings-toggle-list">
              {NOTIFICATION_TOGGLES.map((toggle) => (
                <ToggleRow
                  key={toggle.key}
                  label={toggle.label}
                  description={toggle.description}
                  checked={Boolean(settings[toggle.key])}
                  disabled={savingSettingKey === toggle.key}
                  onChange={(value) => handleToggle(toggle.key, value)}
                />
              ))}
            </div>
          </section>

          {/* Privacy & discovery */}
          <section className="settings-section">
            <div className="settings-section-header">
              <h2>Privacy & discovery</h2>
              <p>Control who can find and connect with you.</p>
            </div>
            <div className="settings-toggle-list">
              <ToggleRow
                label="Show me in suggested connections"
                description="Turn off to hide your profile from other people's Dashboard suggestions"
                checked={Boolean(settings.discoverable)}
                disabled={savingSettingKey === "discoverable"}
                onChange={(value) => handleToggle("discoverable", value)}
              />
              <ToggleRow
                label="Auto-accept follow requests"
                description="Skip manual approval and accept every follow request automatically"
                checked={Boolean(settings.autoAcceptFollowRequests)}
                disabled={savingSettingKey === "autoAcceptFollowRequests"}
                onChange={(value) => handleToggle("autoAcceptFollowRequests", value)}
              />
            </div>
          </section>

          {/* Danger zone */}
          <section className="settings-section danger-zone">
            <div className="settings-section-header">
              <h2>Danger zone</h2>
              <p>These actions affect your account access.</p>
            </div>
            <div className="danger-row">
              <div className="danger-row-text">
                <h3>Deactivate account</h3>
                <p>Hide your profile and projects. Log back in anytime to reactivate.</p>
              </div>
              <button type="button" className="settings-btn-secondary" onClick={handleDeactivate} disabled={deactivating}>
                {deactivating ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
            <div className="danger-row">
              <div className="danger-row-text">
                <h3>Delete account</h3>
                <p>Permanently delete your profile, projects, and connections. This can't be undone.</p>
              </div>
              <button type="button" className="settings-btn-danger" onClick={() => setShowDeleteModal(true)}>
                Delete account
              </button>
            </div>
          </section>
        </div>
      </div>

      {showDeleteModal && (
        <div className="settings-modal-backdrop" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="settings-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Delete your account?</h2>
            <p>
              This permanently deletes your profile, your projects, and removes you from everyone's
              connections. Enter your password to confirm.
            </p>
            <input
              type="password"
              placeholder="Password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            {deleteError && <p className="settings-error-text">{deleteError}</p>}
            <div className="settings-modal-actions">
              <button
                type="button"
                className="settings-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="settings-btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
              >
                {deleting ? "Deleting..." : "Permanently delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

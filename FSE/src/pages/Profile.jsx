import { useEffect, useMemo, useState } from "react";
import { LuMail, LuMapPin, LuShield, LuUpload, LuUser } from "react-icons/lu";
import { changeFsePassword, fetchFseProfile, uploadFseProfilePhoto } from "../api/fseApi";

const SESSION_KEY = "crm_panel_session";

const updateSessionUser = (patch = {}) => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) : {};
    const next = {
      ...session,
      user: {
        ...(session?.user || {}),
        ...patch,
      },
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("crm-session-updated"));
  } catch {
    // Ignore storage parse failures.
  }
};

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px 20px",
        background: "#f8fafc",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
      }}
    >
      <span
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#2563eb",
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </span>
      <div>
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            margin: 0,
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1e293b", margin: "2px 0 0" }}>
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await fetchFseProfile();
        if (!mounted) {
          return;
        }
        setProfile(data);
        updateSessionUser({
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          zone: data.zone,
          profileImage: data.profileImage || "",
        });
      } catch (requestError) {
        if (mounted) {
          setError(requestError?.response?.data?.message || "Failed to load profile.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();

    return () => {
      mounted = false;
    };
  }, []);

  const previewUrl = useMemo(() => {
    if (!selectedFile) {
      return "";
    }
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onPasswordSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      await changeFsePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password updated successfully.");
    } catch (requestError) {
      setMessage(requestError?.response?.data?.message || "Failed to update password.");
    }
  };

  const handlePhotoUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setPhotoMessage("Please choose an image first.");
      return;
    }

    try {
      setIsUploading(true);
      setPhotoMessage("");
      const updatedUser = await uploadFseProfilePhoto(selectedFile);
      setProfile((current) => ({
        ...(current || {}),
        ...updatedUser,
      }));
      updateSessionUser({
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        zone: updatedUser.zone,
        profileImage: updatedUser.profileImage || "",
      });
      setSelectedFile(null);
      setPhotoMessage("Profile picture updated successfully.");
    } catch (requestError) {
      setPhotoMessage(requestError?.response?.data?.message || "Failed to upload profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-section">
        <div className="data-card">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-section">
        <div className="status-banner">{error}</div>
      </div>
    );
  }

  const displayName = profile?.fullName || "Field Sales Executive";
  const displayEmail = profile?.email || "-";
  const displayZone = profile?.zone || "-";
  const displayRole = profile?.role || "FSE";
  const displayImage = previewUrl || profile?.profileImage || "";

  return (
    <div className="page-section" style={{ maxWidth: "860px", margin: "0 auto" }}>
      <section className="my-leads-heading">
        <h1>My Profile</h1>
        <p>Account information, security controls, and profile picture.</p>
      </section>

      <section
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          borderRadius: "14px",
          padding: "28px",
          color: "#fff",
        }}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayName}
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(255,255,255,0.6)",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{displayName}</h2>
          <p style={{ margin: "4px 0 0", opacity: 0.85, fontSize: "0.85rem" }}>
            {displayRole.replace(/_/g, " ")} | {displayZone} Zone
          </p>
        </div>
      </section>

      <section className="data-card">
        <div className="card-header">
          <div className="section-copy">
            <h2>Profile Picture</h2>
            <p>Upload JPG, PNG, or WEBP (max 5MB). Stored on Cloudinary.</p>
          </div>
        </div>
        <form onSubmit={handlePhotoUpload} className="add-lead-form" style={{ marginTop: "10px" }}>
          <div className="form-field">
            <label htmlFor="fse-profile-photo">Choose Image</label>
            <input
              id="fse-profile-photo"
              className="input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
          </div>
          {photoMessage ? (
            <p className={photoMessage.toLowerCase().includes("success") ? "helper-copy" : "status-banner"}>
              {photoMessage}
            </p>
          ) : null}
          <div className="form-actions">
            <button type="submit" className="button button-primary" disabled={isUploading}>
              <LuUpload />
              {isUploading ? "Uploading..." : "Update Picture"}
            </button>
          </div>
        </form>
      </section>

      <section className="data-card">
        <div className="card-header">
          <div className="section-copy">
            <h2>Account Information</h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
          <InfoCard icon={LuUser} label="Full Name" value={displayName} />
          <InfoCard icon={LuMail} label="Email Address" value={displayEmail} />
          <InfoCard icon={LuMapPin} label="Zone" value={`${displayZone} Zone`} />
          <InfoCard icon={LuShield} label="Role" value={displayRole.replace(/_/g, " ")} />
        </div>
      </section>

      <section className="data-card">
        <div className="card-header">
          <div className="section-copy">
            <h2>Change Password</h2>
            <p>Use a strong password with at least 8 characters.</p>
          </div>
        </div>

        <form onSubmit={onPasswordSubmit} className="add-lead-form" style={{ marginTop: "12px" }}>
          <div className="form-field">
            <label htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              className="input"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              type="password"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              className="input"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              required
            />
          </div>
          {message ? (
            <p className={message.toLowerCase().includes("success") ? "helper-copy" : "status-banner"}>
              {message}
            </p>
          ) : null}
          <div className="form-actions">
            <button type="submit" className="button button-primary">Update Password</button>
          </div>
        </form>
      </section>
    </div>
  );
}

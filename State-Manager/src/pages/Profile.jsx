import { useEffect, useMemo, useState } from "react";
import { LuMail, LuMapPin, LuShield, LuUpload, LuUser } from "react-icons/lu";
import { fetchStateManagerProfile, uploadStateManagerProfilePhoto } from "../api/leadApi";

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
        <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const data = await fetchStateManagerProfile();
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

    loadProfile();
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

  const handlePhotoUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage("Please choose an image first.");
      return;
    }

    try {
      setIsUploading(true);
      setMessage("");
      const updatedUser = await uploadStateManagerProfilePhoto(selectedFile);
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
      setMessage("Profile picture updated successfully.");
    } catch (requestError) {
      setMessage(requestError?.response?.data?.message || "Failed to upload profile picture.");
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

  const displayName = profile?.fullName || "State Manager";
  const displayEmail = profile?.email || "-";
  const displayZone = profile?.zone || "-";
  const displayRole = profile?.role || "STATE_MANAGER";
  const displayImage = previewUrl || profile?.profileImage || "";

  return (
    <div className="page-section" style={{ maxWidth: "860px", margin: "0 auto" }}>
      <section className="my-leads-heading">
        <h1>My Profile</h1>
        <p>Manage account details and profile picture.</p>
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
            <label htmlFor="state-manager-profile-photo">Choose Image</label>
            <input
              id="state-manager-profile-photo"
              className="input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
          </div>
          {message ? (
            <p className={message.toLowerCase().includes("success") ? "helper-copy" : "status-banner"}>
              {message}
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
    </div>
  );
}

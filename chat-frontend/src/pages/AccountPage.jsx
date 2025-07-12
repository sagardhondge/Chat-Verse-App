import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Button, Card, Form, Image, Modal, Spinner } from "react-bootstrap";
import axios from "axios";

export default function AccountPage() {
  const { user, setUser } = useAuth();
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    about: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        about: user.about || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth?.substring(0, 10) || "",
        email: user.email || "",
        password: "",
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      form.append("firstName", formData.firstName);
      form.append("lastName", formData.lastName);
      form.append("about", formData.about);
      form.append("gender", formData.gender);
      form.append("dateOfBirth", formData.dateOfBirth);
      form.append("email", formData.email);
      if (formData.password) form.append("password", formData.password);
      if (avatar) form.append("avatar", avatar);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axios.put(
        "https://chatverse-backend-0c8u.onrender.com/api/user/profile",
        form,
        config
      );

      const fullUser = {
        ...user,
        ...data.updatedUser,
        token: data.token,
      };
      setUser(fullUser);
      localStorage.setItem("chat-user", JSON.stringify(fullUser));

      alert("✅ Profile updated successfully");
    } catch (error) {
      console.error("❌ Update failed", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword.trim()) {
      alert("Please enter your password to confirm.");
      return;
    }

    try {
      setDeleting(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.post(
        "https://chatverse-backend-0c8u.onrender.com/api/user/verify-password",
        { password: deletePassword },
        config
      );

      if (data.valid) {
        await axios.delete(
          "https://chatverse-backend-0c8u.onrender.com/api/user/delete",
          config
        );
        setUser(null);
        localStorage.removeItem("chat-user");
        alert("✅ Account deleted");
        window.location.href = "/register";
      } else {
        alert("❌ Incorrect password");
      }
    } catch (err) {
      console.error("❌ Delete failed", err);
      alert("Something went wrong");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner />
      </div>
    );

  return (
    <div
      className={`p-4 vh-100 overflow-auto ${
        darkMode ? "bg-dark text-white" : "bg-light text-dark"
      }`}
      style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}
    >
      <Card
        className={`shadow p-4 ${darkMode ? "bg-secondary text-white" : ""}`}
        style={{ width: "100%", maxWidth: "500px" }}
      >
        <Card.Body>
          <h4 className="mb-4 text-center">Account Details</h4>

          <div className="text-center mb-3">
            <Image
              src={`https://chatverse-backend-0c8u.onrender.com${
                user.avatar || "/default-avatar.png"
              }`}
              roundedCircle
              width={90}
              height={90}
              alt="Avatar"
              className="mb-2"
            />
            <Form.Group className="mb-3">
              <Form.Label className="d-block">Change Avatar</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} />
            </Form.Group>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter to update password"
              />
              <Form.Text muted>Password change will require verification.</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>About</Form.Label>
              <Form.Control
                name="about"
                value={formData.about}
                onChange={handleChange}
                as="textarea"
                rows={3}
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={saving} className="w-100">
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </Form>

          <div className="d-grid mt-4">
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete My Account
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* 🔒 Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Account Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please enter your password to confirm deletion:</p>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

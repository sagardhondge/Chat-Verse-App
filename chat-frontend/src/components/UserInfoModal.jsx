import { Modal, Button, Form, Image } from "react-bootstrap";
import { useState } from "react";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import UserInfoModal from "./UserInfoModal";

export default function UserInfoModal({ show, onHide, user }) {
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth?.slice(0, 10) || "",
    about: user.about || "",
  });

  const [avatarFile, setAvatarFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarFile(file);
  };

  const handleSave = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // 1. Update profile info
      const { data } = await axios.put(
        "http://localhost:4000/api/user/profile",
        formData,
        config
      );

      // 2. Upload avatar (optional)
      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append("avatar", avatarFile);
        const avatarRes = await axios.post(
          "http://localhost:4000/api/user/avatar",
          formDataAvatar,
          config
        );
        data.avatar = avatarRes.data.avatar;
      }

      setUser({ ...user, ...data });
      onHide();
    } catch (err) {
      alert("Failed to update profile");
      console.error(err);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdropClassName="blurred-backdrop"
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <div>
          <Image
            src={`http://localhost:4000${user.avatar || "/default-avatar.png"}`}
            roundedCircle
            width={100}
            height={100}
            className="mb-3 shadow"
          />
          <Form.Group controlId="avatar" className="mb-3">
            <Form.Label>Change Avatar</Form.Label>
            <Form.Control type="file" onChange={handleAvatarChange} accept="image/*" />
          </Form.Group>
        </div>

        <Form>
          <Form.Group className="mb-2">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control value={user.email} disabled />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Gender</Form.Label>
            <Form.Control
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>About</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="about"
              value={formData.about}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>

      {/* 👇 Embedded styles for animation, blur and font */}
      <style>{`
        .blurred-backdrop {
          backdrop-filter: blur(8px);
          background-color: rgba(0, 0, 0, 0.4);
        }

        .modal-content {
          font-family: 'Segoe UI', sans-serif;
          border-radius: 12px;
          transition: all 0.3s ease-in-out;
        }

        .modal-title {
          font-weight: 600;
        }

        .shadow {
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </Modal>
  );
}

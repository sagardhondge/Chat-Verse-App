import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Card, Spinner, Image } from "react-bootstrap";

export default function ProfilePage() {
  const { id } = useParams(); 
  const { user } = useAuth(); 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !id || id === user?._id;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = isOwnProfile ? "/me" : `/${id}`;
        const { data } = await axios.get(
          `https://chatverse-backend-0c8u.onrender.com/api/user${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user, isOwnProfile]);

  if (loading) return <div className="text-center mt-5"><Spinner /></div>;
  if (!profile) return <div className="text-center mt-5">User not found</div>;

  return (
    <div className="p-4 d-flex justify-content-center">
      <Card style={{ width: "100%", maxWidth: "500px" }}>
        <Card.Body className="text-center">
          <Image
            src={profile.avatar || "/default-avatar.png"}
            roundedCircle
            width={100}
            height={100}
            className="mb-3"
          />
          <h4>{profile.firstName} {profile.lastName}</h4>
          <p>{profile.email}</p>
          <p><strong>Gender:</strong> {profile.gender || "N/A"}</p>
          <p><strong>DOB:</strong> {profile.dateOfBirth?.substring(0, 10) || "N/A"}</p>
          <p><strong>About:</strong><br />{profile.about || "No bio added."}</p>
        </Card.Body>
      </Card>
    </div>
  );
}

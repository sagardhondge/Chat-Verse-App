const token = localStorage.getItem("token");

await axios.put("https://chatverse-backend-0c8u.onrender.com/api/user/profile", formData, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

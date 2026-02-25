const token = localStorage.getItem("token");

await axios.put("https://chat-verse-app.onrender.com/api/user/profile", formData, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const token = localStorage.getItem("token");

await axios.put("http://localhost:4000/api/user/profile", formData, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

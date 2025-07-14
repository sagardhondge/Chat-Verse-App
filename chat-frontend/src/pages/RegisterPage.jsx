import RegisterForm from "../components/Auth/RegisterForm";
import registerBg from "./register.jpg";

export default function RegisterPage() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${registerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "rgba(190, 186, 186, 0.57)",
          backdropFilter: "blur(12px)",
          borderRadius: "20px",
          padding: "2rem",
          width: "500px",
          boxShadow: "0 0 1000px rgba(248, 234, 234, 1)",
          color: "#000",
        }}
      >
        <div className="text-center mb-3">
          <h4 className="fw-bold mb-1">ChatVerse App ✉</h4>
          <h6 className="mb-4">Create your account</h6>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}

import Navbar from "../../components/Navbar/Navbar";

export default function Dashboard() {
  return (
    <div>
      <Navbar />
      <div style={{ 
        padding: "2rem", 
        color: "#F5F0E8", 
        background: "#0D0D0D",
        minHeight: "100vh"
      }}>
        <h1>Dashboard Content</h1>
        <p>Your navbar should appear above this content.</p>
      </div>
    </div>
  );
}
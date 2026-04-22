import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import ResetPassword from "./pages/resetPassword";

export default function App() {
  const path = window.location.pathname;
  const token = localStorage.getItem("token");

  if (path.startsWith("/home")) {
    return <Home />;
  }

  if (path.startsWith("/register")) {
    if (token) {
      window.location.replace("/home");
      return null;
    }

    return <Register />;
  }

  if (path.startsWith("/reset-password")) {
    if (token) {
      window.location.replace("/home");
      return null;
    }

    return <ResetPassword />;
  }

  if (token) {
    window.location.replace("/home");
    return null;
  }

  return <Login />;
}

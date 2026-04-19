import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";

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

  if (token) {
    window.location.replace("/home");
    return null;
  }

  return <Login />;
}

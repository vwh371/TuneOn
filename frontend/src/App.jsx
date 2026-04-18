import Login from "./pages/login";
import Register from "./pages/register";

export default function App() {
  const path = window.location.pathname;

  if (path.startsWith("/register")) {
    return <Register />;
  }

  return <Login />;
}

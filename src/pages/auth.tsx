import { useState } from "react";
import { Navbar, Nav, Container, Card, Form, Button, Alert, Spinner, ButtonGroup, ToggleButton } from "react-bootstrap";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [dark, setDark] = useState(true); // default to dark
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setSuccess(data.message);
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={dark ? "bg-black text-light min-vh-100" : "bg-light text-dark min-vh-100"}>
      <Navbar bg={dark ? "dark" : "light"} variant={dark ? "dark" : "light"} expand="lg">
        <Container>
          <Navbar.Brand href="/">MyApp</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse>
            <Nav className="ms-auto align-items-center">
              <Button
                size="sm"
                variant={dark ? "outline-light" : "outline-dark"}
                onClick={() => setDark(!dark)}
                className="ms-3"
              >
                {dark ? "☀️ Light" : "🌙 Dark"}
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-5">
        <Card
          className={`p-4 rounded-4 border-0 ${dark ? "bg-dark text-light" : "shadow"}`}
          style={{ maxWidth: "400px", margin: "2rem auto" }}
        >
          <ButtonGroup className="mb-4 d-flex">
            <ToggleButton
              id="toggle-login"
              type="radio"
              value="login"
              variant={mode === "login" ? (dark ? "light" : "primary") : "outline-primary"}
              name="radio"
              checked={mode === "login"}
              onChange={() => setMode("login")}
            >
              Login
            </ToggleButton>
            <ToggleButton
              id="toggle-register"
              type="radio"
              value="register"
              variant={mode === "register" ? (dark ? "light" : "primary") : "outline-primary"}
              name="radio"
              checked={mode === "register"}
              onChange={() => setMode("register")}
            >
              Register
            </ToggleButton>
          </ButtonGroup>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={dark ? "bg-dark text-light border-light" : ""}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={dark ? "bg-dark text-light border-light" : ""}
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant={dark ? "light" : "primary"} type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {mode === "register" ? "Registering..." : "Logging in..."}
                  </>
                ) : (
                  mode === "register" ? "Register" : "Login"
                )}
              </Button>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
}

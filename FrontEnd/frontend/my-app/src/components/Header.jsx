import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import './Header.css';

function Header() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId || location.pathname === "/login") return;

    fetch(`http://localhost:8081/user?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("User fetch failed");
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => console.error("Failed to fetch user:", err));
  }, [location.pathname]);

  return (
    <>
      <header className="custom-header">
        <div className="header-inner">
          <Image
            src="/commercebankhorizontallogo.png"
            alt="Logo"
            className="logo"
          />

          <Navbar expand="lg" className="nav-bar">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="navbar-links">
                <Nav.Link href="/">Login</Nav.Link>
                <Nav.Link href="/urls">URL</Nav.Link>
                <Nav.Link href="/analysis">Analysis</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          {user && (
            <div className="logged-in-info">
              Logged in as: <strong>{user.userId}</strong>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("userId");
                  window.location.href = "/";
                }}
                style={{ marginLeft: "10px" }}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="separator-bar"></div>
    </>
  );
}

export default Header;

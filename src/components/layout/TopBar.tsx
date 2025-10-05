import React from 'react';
import { Navbar, Container } from 'react-bootstrap';

const TopBar: React.FC = () => {
  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <Navbar.Brand>Class Management System</Navbar.Brand>
        {/* Placeholder for future top bar functionality */}
      </Container>
    </Navbar>
  );
};

export default TopBar;

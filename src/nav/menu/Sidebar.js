import React, { useState } from 'react';
import { Button, Offcanvas } from 'react-bootstrap';
import './Sidebar.css';

function Sidebar() {
  const [showSidebar, setShowSidebar] = useState(true);

  const handleClose = () => setShowSidebar(false);
  const handleShow = () => setShowSidebar(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Open Sidebar
      </Button>

      <Offcanvas show={showSidebar} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Offcanvas Sidebar</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Sidebar content goes here */}
          <p>This is the content of the sidebar.</p>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Sidebar;

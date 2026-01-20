import React, { useState } from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';


function Header() {
    const navigate = useNavigate();
    const [loginModalShow, setLoginModalShow] = useState(false);
    const [registerModalShow, setRegisterModalShow] = useState(false);

    return (
        <div>
            <RegisterModal show={registerModalShow} setShow={setRegisterModalShow} setShowLogin={setLoginModalShow} />
            <LoginModal show={loginModalShow} setShow={setLoginModalShow} setShowRegister={setRegisterModalShow} />
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href="/" style={{ color: '#198754' }}>Plated.AI</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            <Nav.Link href="/recipeGenerator">Generate Recipe</Nav.Link>
                        </Nav>

                        <div className="d-flex">
                            <button onClick={() => setLoginModalShow(true)} className='btn btn-success me-2'>
                                Log in
                            </button>
                            <button onClick={() => setRegisterModalShow(true)} className='btn btn-outline-success'>
                                Sign up
                            </button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    )
}

export default Header


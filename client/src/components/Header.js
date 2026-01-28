import React, { useContext, useState } from 'react'
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext'

const api = axios.create({
    baseURL: '/api/',
    withCredentials: true
});


function Header() {
    const navigate = useNavigate();
    const { user, setUser, authLoading, loginModalOpen, setLoginModalOpen} = useContext(AuthContext);
    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const logOut = async () => {
        try {
            await api.post("/logout", { withCredentials: true });
            setUser(null);
        }
        catch (err) {
            console.log(err.response.data.error);
        }
    };


    return (
        <div>
            <RegisterModal show={registerModalOpen} setShow={setRegisterModalOpen} setShowLogin={setLoginModalOpen} />
            <LoginModal show={loginModalOpen} setShow={setLoginModalOpen} setShowRegister={setRegisterModalOpen} />
            <Navbar expand="lg" className="bg-body-tertiary">
                {authLoading && <Container>
                    <Navbar.Brand href="/" style={{ color: '#198754' }}>Plated.AI</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            <Nav.Link href="/recipeGenerator">Generate Recipe</Nav.Link>
                        </Nav>
                        <div>
                            {user ? (
                                <Dropdown>
                                    <Dropdown.Toggle variant="success" id="dropdownLogin">
                                        {user.name}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={logOut}>Log out</Dropdown.Item>
                                        <Dropdown.Item onClick={() => navigate('/profile')}>Profile</Dropdown.Item>
                                        <Dropdown.Item onClick={() => navigate('/settings')}>Settings</Dropdown.Item>
                                    </Dropdown.Menu>
                                    </Dropdown>) : (<div className="d-flex justify-content-between">
                                        <button onClick={() => setLoginModalOpen(true)} className='btn btn-success me-2'>
                                        Log in
                                    </button>
                                        <button onClick={() => setRegisterModalOpen(true)} className='btn btn-outline-success'>
                                        Sign up
                                    </button>
                                </div>)}
                        </div>
                    </Navbar.Collapse>
                </Container>}
            </Navbar>
        </div>
    )
}

export default Header


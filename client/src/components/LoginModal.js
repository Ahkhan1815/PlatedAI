import React from 'react'
import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';


const api = axios.create({
  baseURL: '/api/',
});


function LoginModal({ show, setShow, setShowRegister }) {
  const [error, setError]= useState("");
  const navigate = useNavigate();
  const logUser = async (values) => {
    try {
      const res = await api.post("/login", { email: values.email, password: values.password, });
      // localStorage.setItem("token", res.data.token);
      console.log("Login Successful");
      setShow(false);
    }
    catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      }
    }
  }

  const handleClose = () => setShow(false);

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-light text-success">Log In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={Yup.object({
              email: Yup.string().required("Email is required"),
              password: Yup.string().required("Password is required"),
            })}
            onSubmit={logUser}>
            <Form>
              <div className="form-group text-start mb-3">
                <label htmlFor="emailEntryLogin" className="form-label">Email address</label>
                <Field name="email" type="email" className="form-control mb-2" id="emailEntryLogin" placeholder="Enter email..." />
                <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
              </div>
              <div className="form-group text-start mb-3">
                <label htmlFor="passwordEntryLogin" className="form-label">Password</label>
                <Field name="password" type="password" className="form-control mb-2" id="passwordEntryLogin" placeholder="Enter password..." />
                <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                <p className="text-danger text-start small">{error}</p>
                <p className='text-end'><a className='link-opacity-75' href="forgotPassword">Forgot Password?</a></p>
              </div>
              <hr className='my-4' />
              <div className="d-flex justify-content-center mb-3">
                <button type="submit" className="btn btn-outline-success py-2 px-4">Log In</button>
              </div>
              <p className='text-center'>Don't have an account? <button type="button" className='btn btn-link p-0 link-opacity-75' onClick={() => { setShow(false); setShowRegister(true) }}>Sign up</button></p>
            </Form>
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default LoginModal

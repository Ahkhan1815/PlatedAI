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


function RegisterModal({ show, setShow, setShowLogin }) {
  const [error, setError]= useState("");
  const navigate = useNavigate();

  const registerUser = async (values) => {
    try {
      const res = await api.post("/register", { email: values.email, password: values.password, name: values.name });
      console.log("Register Successful", res.data);
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
          <Modal.Title className="fw-light text-success">Sign Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
            validationSchema={Yup.object({
              name: Yup.string().required("Name is required"),
              email: Yup.string().required("Email is required"),
              password: Yup.string().required("Password is required"),
              confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Please confirm your password'),
            })}
            onSubmit={registerUser}>
            <Form>
              <div className="form-group text-start mb-3">
                <label htmlFor="nameEntryRegister" className="form-label">Name</label>
                <Field name="name" type="text" className="form-control mb-2" id="nameEntryRegister" placeholder="Enter name..." />
                <ErrorMessage name="name" component="div" className="text-danger small mt-1" />
              </div>
              <div className="form-group text-start mb-3">
                <label htmlFor="emailEntryRegister" className="form-label">Email address</label>
                <Field name="email" type="email" className="form-control mb-2" id="emailEntryRegister" placeholder="Enter email..." />
                <ErrorMessage name="email" component="div" className="text-danger small mt-1" />
              </div>
              <div className="form-group text-start mb-3">
                <label htmlFor="passwordEntryRegister" className="form-label">Password</label>
                <Field name="password" type="password" className="form-control mb-2" id="passwordEntryRegister" placeholder="Enter password..." />
                <ErrorMessage name="password" component="div" className="text-danger small mt-1" />
                <p className="text-danger text-start small">{error}</p>
              </div>
              <div className="form-group text-start mb-3">
                <label htmlFor="confirmPasswordEntryRegister" className="form-label">Confirm Password</label>
                <Field name="confirmPassword" type="password" className="form-control mb-2" id="confirmPasswordEntryRegister" placeholder="Confirm password..." />
                <ErrorMessage name="confirmPassword" component="div" className="text-danger small mt-1" />
              </div>
              <hr className='my-4' />
              <div className="d-flex justify-content-center mb-3">
                <button type="submit" className="btn btn-outline-success py-2 px-4">Sign Up</button>
              </div>
              <p className='text-center'>Already have an account? <button type="button" className="btn btn-link p-0" onClick={() => { setShow(false); setShowLogin(true); }}>Log in</button></p>
            </Form>
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default RegisterModal

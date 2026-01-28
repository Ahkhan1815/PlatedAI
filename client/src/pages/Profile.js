import React, { useContext, useEffect } from 'react'
import { Formik, Field, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import AuthContext from '../contexts/AuthContext'

const api = axios.create({ baseURL: '/api/', withCredentials: true })

function Profile() {
  const { user, setUser, authLoading, setLoginModalOpen } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading && !user) {
      setLoginModalOpen(true)
      navigate('/')
    }
  }, [authLoading, user, navigate, setLoginModalOpen])

  if (!authLoading) return null

  const initial = {
    allergies: (user && user.allergies && user.allergies.join(', ')) || '',
    health_conditions: (user && user.health_conditions && user.health_conditions.join(', ')) || ''
  }

  const schema = Yup.object({
    allergies: Yup.string(),
    health_conditions: Yup.string()
  })

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        allergies: values.allergies,
        health_conditions: values.health_conditions
      }
      const res = await api.put('/profile', payload)
      if (res.data && res.data.user) setUser(res.data.user)
      setSubmitting(false)
      navigate('/recipeGenerator')
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  return (
    <div className="container mt-4">
      <h3 className="text-success">Profile</h3>
      <p className="text-muted">Update your health information to improve recipe recommendations.</p>
      <Formik initialValues={initial} validationSchema={schema} enableReinitialize onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <div className="mb-3 text-start">
              <label className="form-label">Allergies (comma separated)</label>
              <Field name="allergies" as="textarea" className="form-control" rows="2" />
              <ErrorMessage name="allergies" component="div" className="text-danger small mt-1" />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label">Health conditions (comma separated)</label>
              <Field name="health_conditions" as="textarea" className="form-control" rows="3" />
              <ErrorMessage name="health_conditions" component="div" className="text-danger small mt-1" />
            </div>
            <div className="d-flex justify-content-center">
              <button type="submit" className="btn btn-success px-4" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default Profile

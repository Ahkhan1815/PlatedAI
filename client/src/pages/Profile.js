import React, { useContext, useEffect, useState } from 'react'
import * as Yup from 'yup'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Accordion, Card, Container, InputGroup, Form, Button, ListGroup } from 'react-bootstrap'
import AuthContext from '../contexts/AuthContext'

const api = axios.create({ baseURL: '/api/', withCredentials: true })

function Profile() {
  const { user, setUser, authLoading, setLoginModalOpen } = useContext(AuthContext)
  const navigate = useNavigate()
  const [allergies, setAllergies] = useState(() => (user && user.allergies) ? Array.from(new Set(user.allergies)) : [])
  const [conditions, setConditions] = useState(() => (user && user.health_conditions) ? Array.from(new Set(user.health_conditions)) : [])
  const [allergyInput, setAllergyInput] = useState('')
  const [conditionInput, setConditionInput] = useState('')

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
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const addAllergy = () => {
    const v = (allergyInput || '').trim()
    if (!v) return
    const formatEntry = (s) => s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    const formatted = formatEntry(v)
    const lower = formatted.toLowerCase()
    setAllergies(prev => {
      const exists = (prev || []).some(x => x.toLowerCase() === lower)
      if (exists) return prev
      return [...(prev || []), formatted]
    })
    setAllergyInput('')
  }

  const removeAllergy = (val) => {
    setAllergies(prev => (prev || []).filter(x => x !== val))
  }

  const addCondition = () => {
    const v = (conditionInput || '').trim()
    if (!v) return
    const formatEntry = (s) => s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    const formatted = formatEntry(v)
    const lower = formatted.toLowerCase()
    setConditions(prev => {
      const exists = (prev || []).some(x => x.toLowerCase() === lower)
      if (exists) return prev
      return [...(prev || []), formatted]
    })
    setConditionInput('')
  }

  const removeCondition = (val) => {
    setConditions(prev => (prev || []).filter(x => x !== val))
  }

  const saveProfile = async () => {
    try {
      const payload = { allergies, health_conditions: conditions }
      const res = await api.put('/profile', payload)
      if (res.data && res.data.user) setUser(res.data.user)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "700px" }}>
        <Card.Body>
          <h2 className="text-center mb-3 text-success fw-light">Profile</h2>
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Account Information</Accordion.Header>
              <Accordion.Body>
                <Form.Label className="d-block text-start">Name</Form.Label>
                <InputGroup className="mb-2 w-100">
                  <Form.Control id="nameEntry" aria-describedby="name-entry" />
                </InputGroup>
                <Form.Label className="d-block text-start">Email</Form.Label>
                <InputGroup className="mb-2 w-100">
                  <Form.Control id="emailEntry" aria-describedby="email-entry" />
                </InputGroup>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Allergies</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-2 w-100">
                  <Form.Label className="d-block text-start">Add Allergy</Form.Label>
                  <InputGroup>
                    <Form.Control
                      placeholder="e.g. Peanuts"
                      value={allergyInput}
                      onChange={e => setAllergyInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAllergy() } }}
                      aria-label="Add allergy"
                    />
                    <Button variant="outline-success" onClick={addAllergy}>Add</Button>
                  </InputGroup>
                </Form.Group>

                <ListGroup className="mt-2">
                  {(allergies || []).map((a, idx) => (
                    <ListGroup.Item key={a + idx} className="d-flex justify-content-between align-items-center">
                      <span className="text-start">{a}</span>
                      <Button variant="outline-danger" size="sm" onClick={() => removeAllergy(a)}>×</Button>
                    </ListGroup.Item>
                  ))}
                  {(!allergies || allergies.length === 0) && <ListGroup.Item className="text-muted">No allergies added.</ListGroup.Item>}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Health Conditions</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-2 w-100">
                  <Form.Label className="d-block text-start">Add Health Condition</Form.Label>
                  <InputGroup>
                    <Form.Control
                      placeholder="e.g. Diabetes"
                      value={conditionInput}
                      onChange={e => setConditionInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCondition() } }}
                      aria-label="Add condition"
                    />
                    <Button variant="outline-success" onClick={addCondition}>Add</Button>
                  </InputGroup>
                </Form.Group>

                <ListGroup className="mt-2">
                  {(conditions || []).map((c, idx) => (
                    <ListGroup.Item key={c + idx} className="d-flex justify-content-between align-items-center">
                      <span className="text-start">{c}</span>
                      <Button variant="outline-danger" size="sm" onClick={() => removeCondition(c)}>×</Button>
                    </ListGroup.Item>
                  ))}
                  {(!conditions || conditions.length === 0) && <ListGroup.Item className="text-muted">No conditions added.</ListGroup.Item>}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Profile

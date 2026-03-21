import React, { useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Accordion, Card, Container, InputGroup, Form, Button } from 'react-bootstrap'
import CreatableSelect from 'react-select/creatable'
import AuthContext from '../contexts/AuthContext'
import { useNavigationGuard } from '../contexts/NavigationGuardContext'

const api = axios.create({ baseURL: '/api/', withCredentials: true })

const PRESET_DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Pescatarian'
]

const PRESET_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Soy',
  'Wheat',
  'Shellfish',
  'Fish',
  'Sesame'
]

const PRESET_HEALTH_CONDITIONS = [
  'Diabetes',
  'High Blood Pressure',
  'High Cholesterol',
  'Kidney Disease',
  'Celiac Disease',
  'IBS',
  'Acid Reflux'
]

const formatEntry = (value) => (
  value
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
)

const addUnique = (list, value) => {
  const formatted = formatEntry(value.trim())
  if (!formatted) return list
  const exists = (list || []).some(item => item.toLowerCase() === formatted.toLowerCase())
  if (exists) return list
  return [...(list || []), formatted]
}

function Profile() {
  const { user, setUser, authLoading, setLoginModalOpen } = useContext(AuthContext)
  const { setUnsavedChanges } = useNavigationGuard()

  const [allergies, setAllergies] = useState(() => (user && user.allergies) ? Array.from(new Set(user.allergies)) : [])
  const [conditions, setConditions] = useState(() => (user && user.health_conditions) ? Array.from(new Set(user.health_conditions)) : [])
  const [dietaryRestrictions, setDietaryRestrictions] = useState(() => (user && user.dietary_restrictions) ? Array.from(new Set(user.dietary_restrictions)) : [])

  const [saveState, setSaveState] = useState('idle')
  const [savedSnapshot, setSavedSnapshot] = useState({ allergies: [], conditions: [], dietaryRestrictions: [] })

  const normalizeListForCompare = (list) => (
    Array.from(new Set((list || []).map(item => String(item || '').trim().toLowerCase())))
      .filter(Boolean)
      .sort()
  )

  const hasUnsavedChanges = useMemo(() => {
    const currentAllergies = normalizeListForCompare(allergies)
    const currentConditions = normalizeListForCompare(conditions)
    const currentDiet = normalizeListForCompare(dietaryRestrictions)

    const savedAllergies = normalizeListForCompare(savedSnapshot.allergies)
    const savedConditions = normalizeListForCompare(savedSnapshot.conditions)
    const savedDiet = normalizeListForCompare(savedSnapshot.dietaryRestrictions)

    return (
      JSON.stringify(currentAllergies) !== JSON.stringify(savedAllergies) ||
      JSON.stringify(currentConditions) !== JSON.stringify(savedConditions) ||
      JSON.stringify(currentDiet) !== JSON.stringify(savedDiet)
    )
  }, [allergies, conditions, dietaryRestrictions, savedSnapshot])

  useEffect(() => {
    setUnsavedChanges(hasUnsavedChanges)
    return () => setUnsavedChanges(false)
  }, [hasUnsavedChanges, setUnsavedChanges])

  useEffect(() => {
    if (authLoading && !user) {
      setLoginModalOpen(true)
    }
  }, [authLoading, user, setLoginModalOpen])

  useEffect(() => {
    if (!user) return
    const nextAllergies = Array.from(new Set(user.allergies || []))
    const nextConditions = Array.from(new Set(user.health_conditions || []))
    const nextDietaryRestrictions = Array.from(new Set(user.dietary_restrictions || []))

    setAllergies(nextAllergies)
    setConditions(nextConditions)
    setDietaryRestrictions(nextDietaryRestrictions)
    setSavedSnapshot({
      allergies: nextAllergies,
      conditions: nextConditions,
      dietaryRestrictions: nextDietaryRestrictions
    })
  }, [user])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!hasUnsavedChanges) return
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  if (!authLoading || !user) return null

  const toSelectOptions = (list) => (list || []).map(item => ({ value: item, label: item }))
  const fromSelectedOptions = (selected) => {
    const values = (selected || []).map(item => item.value)
    return values.reduce((acc, value) => addUnique(acc, String(value || '')), [])
  }

  const allergyOptions = PRESET_ALLERGENS.map(item => ({ value: item, label: item }))
  const conditionOptions = PRESET_HEALTH_CONDITIONS.map(item => ({ value: item, label: item }))
  const dietaryRestrictionOptions = PRESET_DIETARY_RESTRICTIONS.map(item => ({ value: item, label: item }))

  const saveProfile = async () => {
    setSaveState('saving')
    try {
      const payload = {
        allergies,
        health_conditions: conditions,
        dietary_restrictions: dietaryRestrictions
      }
      const res = await api.put('/profile', payload)
      if (res.data && res.data.user) {
        setUser(res.data.user)
        const nextAllergies = Array.from(new Set(res.data.user.allergies || allergies))
        const nextConditions = Array.from(new Set(res.data.user.health_conditions || conditions))
        const nextDietaryRestrictions = Array.from(new Set(res.data.user.dietary_restrictions || dietaryRestrictions))
        setSavedSnapshot({
          allergies: nextAllergies,
          conditions: nextConditions,
          dietaryRestrictions: nextDietaryRestrictions
        })
      }
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch (err) {
      console.error(err)
      setSaveState('error')
    }
  }

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: '700px' }}>
        <Card.Body>
          <h2 className="text-center mb-3 text-success fw-light">Profile</h2>
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Account Information</Accordion.Header>
              <Accordion.Body>
                <Form.Label className="d-block text-start">Name</Form.Label>
                <InputGroup className="mb-2 w-100">
                  <Form.Control id="nameEntry" aria-describedby="name-entry" value={(user && user.name) || ''} readOnly />
                </InputGroup>
                <Form.Label className="d-block text-start">Email</Form.Label>
                <InputGroup className="mb-2 w-100">
                  <Form.Control id="emailEntry" aria-describedby="email-entry" value={(user && user.email) || ''} readOnly />
                </InputGroup>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Allergens</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-2 w-100">
                  <CreatableSelect
                    isMulti
                    classNamePrefix="diet-select"
                    options={allergyOptions}
                    placeholder="Type or select allergies..."
                    value={toSelectOptions(allergies)}
                    onChange={(selected) => setAllergies(fromSelectedOptions(selected))}
                    formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                  />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Health Conditions</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-2 w-100">
                  <CreatableSelect
                    isMulti
                    classNamePrefix="diet-select"
                    options={conditionOptions}
                    placeholder="Type or select health conditions..."
                    value={toSelectOptions(conditions)}
                    onChange={(selected) => setConditions(fromSelectedOptions(selected))}
                    formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                  />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>Dietary Restrictions</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-2 w-100">
                  <CreatableSelect
                    isMulti
                    classNamePrefix="diet-select"
                    options={dietaryRestrictionOptions}
                    placeholder="Type or select dietary restrictions..."
                    value={toSelectOptions(dietaryRestrictions)}
                    onChange={(selected) => {
                      setDietaryRestrictions(fromSelectedOptions(selected))
                    }}
                    formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                  />
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <Button className="w-100 mt-4" variant="success" onClick={saveProfile} disabled={saveState === 'saving'}>
            {saveState === 'saving' ? 'Saving...' : 'Save Profile'}
          </Button>
          {saveState === 'saved' && <div className="text-success mt-2 text-center">Profile saved.</div>}
          {saveState === 'error' && <div className="text-danger mt-2 text-center">Unable to save profile.</div>}
        </Card.Body>

        <style>{`
          .diet-select__control {
            background-color: #ffffff !important;
            border-color: #ced4da !important;
            color: #212529 !important;
            min-height: 38px !important;
          }

          .diet-select__input-container,
          .diet-select__input,
          .diet-select__single-value,
          .diet-select__placeholder {
            color: #212529 !important;
          }

          .diet-select__menu {
            background-color: #ffffff !important;
            color: #212529 !important;
          }

          .diet-select__option {
            background-color: #ffffff !important;
            color: #212529 !important;
          }

          .diet-select__option--is-focused {
            background-color: #e9f7ef !important;
          }

          .diet-select__multi-value {
            background-color: #198754 !important;
            position: relative;
            display: inline-flex;
            align-items: center;
            padding: 0.45rem 2.2rem 0.45rem 0.8rem !important;
            border-radius: 999px !important;
            max-width: 200px;
            line-height: 1.05;
          }

          .diet-select__multi-value__label,
          .diet-select__multi-value__remove {
            color: #ffffff !important;
          }

          .diet-select__multi-value__remove {
            display: none !important;
            position: absolute;
            right: 6px;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: rgba(0, 0, 0, 0.35) !important;
            width: 22px;
            height: 22px;
            border-radius: 999px !important;
            font-weight: 700;
            line-height: 18px;
            cursor: pointer;
            padding: 0 !important;
            align-items: center;
            justify-content: center;
          }

          .diet-select__multi-value:hover .diet-select__multi-value__remove {
            display: inline-flex !important;
          }

          .diet-select__multi-value__label {
            display: inline-block;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: left;
            font-weight: 700 !important;
            padding: 0 !important;
          }

          [data-bs-theme='dark'] .diet-select__control {
            background-color: #1f242a !important;
            border-color: rgba(255, 255, 255, 0.15) !important;
            color: #f1f3f5 !important;
          }

          [data-bs-theme='dark'] .diet-select__input-container,
          [data-bs-theme='dark'] .diet-select__input,
          [data-bs-theme='dark'] .diet-select__single-value,
          [data-bs-theme='dark'] .diet-select__placeholder {
            color: #f1f3f5 !important;
          }

          [data-bs-theme='dark'] .diet-select__menu,
          [data-bs-theme='dark'] .diet-select__option {
            background-color: #1f242a !important;
            color: #f1f3f5 !important;
          }

          [data-bs-theme='dark'] .diet-select__option--is-focused {
            background-color: #2c333a !important;
          }

          @media (hover: none) {
            .diet-select__multi-value__remove {
              display: inline-flex !important;
            }
          }

          @media (max-width: 480px) {
            .diet-select__multi-value {
              max-width: 40%;
              padding-right: 1.6rem !important;
            }

            .diet-select__multi-value__label {
              font-size: 0.9rem;
            }
          }
        `}</style>
      </Card>
    </Container>
  )
}

export default Profile

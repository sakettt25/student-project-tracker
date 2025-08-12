import React, { useState } from 'react';

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  console.log('Login attempt:', { email, password }) // Debug login attempt

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    console.log('Login response:', data) // Debug server response

    if (response.ok) {
      // ... existing login success code ...
    } else {
      setError(data.error || 'Login failed')
    }
  } catch (error) {
    console.error('Login error:', error)
    setError('An error occurred during login')
  }
}
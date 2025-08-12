'use client'

import { useEffect, useState } from 'react'

interface Faculty {
  _id: string
  name: string
  email: string
  university?: string
}

interface Props {
  onSelect: (facultyId: string) => void
}

export default function FacultySelect({ onSelect }: Props) {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch('/api/faculty')
        if (!response.ok) throw new Error('Failed to fetch faculty list')
        const data = await response.json()
        setFaculties(data)
      } catch (err) {
        setError('Failed to load faculty list')
      } finally {
        setLoading(false)
      }
    }

    fetchFaculties()
  }, [])

  if (loading) return <div>Loading faculty list...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Select Faculty</label>
      <select 
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500"
        onChange={(e) => onSelect(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Choose a faculty</option>
        {faculties.map((faculty) => (
          <option key={faculty._id} value={faculty._id}>
            {faculty.name} - {faculty.email}
          </option>
        ))}
      </select>
    </div>
  )
}
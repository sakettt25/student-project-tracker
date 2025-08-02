"use client"

import { useAuth } from "@/lib/auth"
import { useCallback } from "react"

export function useApi() {
  const { token } = useAuth()

  const apiCall = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
      }

      return response.json()
    },
    [token],
  )

  return { apiCall }
}

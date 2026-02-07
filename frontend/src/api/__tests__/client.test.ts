/**
 * Tests for API client
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import { apiClient, authApi, tanksApi } from '../client'

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}))

describe('API Client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('creates axios instance with correct base URL', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: expect.any(String),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  })

  describe('authApi', () => {
    it('has login method', () => {
      expect(authApi.login).toBeDefined()
      expect(typeof authApi.login).toBe('function')
    })

    it('has register method', () => {
      expect(authApi.register).toBeDefined()
      expect(typeof authApi.register).toBe('function')
    })

    it('has getCurrentUser method', () => {
      expect(authApi.getCurrentUser).toBeDefined()
      expect(typeof authApi.getCurrentUser).toBe('function')
    })
  })

  describe('tanksApi', () => {
    it('has CRUD methods', () => {
      expect(tanksApi.list).toBeDefined()
      expect(tanksApi.get).toBeDefined()
      expect(tanksApi.create).toBeDefined()
      expect(tanksApi.update).toBeDefined()
      expect(tanksApi.delete).toBeDefined()
    })
  })
})

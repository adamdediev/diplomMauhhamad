import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

// Mock providers for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Common test utilities
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.IntersectionObserver = mockIntersectionObserver
}

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn()
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  })
  window.ResizeObserver = mockResizeObserver
}

// Mock window.scrollTo
export const mockScrollTo = () => {
  window.scrollTo = jest.fn()
}

// Create mock component props
export const createMockProps = <T extends Record<string, any>>(
  overrides: Partial<T> = {}
): T => {
  const defaultProps = {
    className: '',
    children: 'Test content',
    onClick: jest.fn(),
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    ...overrides,
  }
  return defaultProps as T
}

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock fetch for API testing
export const mockFetch = (response: any, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: async () => response,
    text: async () => JSON.stringify(response),
  })
}

// Reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks()
  jest.resetAllMocks()
}


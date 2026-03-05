import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StorachaErrorBoundary } from '../src/components/ErrorBoundary.js'

function ThrowingComponent({
  message,
}: {
  message?: string
}): React.ReactElement {
  throw new Error(message || 'Test render error')
}

function SafeComponent(): React.ReactElement {
  return <div>Safe Content</div>
}

describe('StorachaErrorBoundary', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  test('renders children when no error occurs', () => {
    render(
      <StorachaErrorBoundary>
        <SafeComponent />
      </StorachaErrorBoundary>
    )

    expect(screen.getByText('Safe Content')).toBeTruthy()
  })

  test('renders default fallback when child throws', () => {
    render(
      <StorachaErrorBoundary>
        <ThrowingComponent message="Kaboom" />
      </StorachaErrorBoundary>
    )

    expect(screen.getByText('⚠️ Something went wrong')).toBeTruthy()
    expect(screen.getByText('Kaboom')).toBeTruthy()
    expect(screen.getByText('Try Again')).toBeTruthy()
  })

  test('renders static fallback prop when child throws', () => {
    render(
      <StorachaErrorBoundary fallback={<div>Static Fallback</div>}>
        <ThrowingComponent />
      </StorachaErrorBoundary>
    )

    expect(screen.getByText('Static Fallback')).toBeTruthy()
    expect(screen.queryByText('⚠️ Something went wrong')).toBeFalsy()
  })

  test('renders renderFallback when child throws (takes priority over fallback)', () => {
    render(
      <StorachaErrorBoundary
        fallback={<div>Should NOT appear</div>}
        renderFallback={(error, _reset) => (
          <div>Render fallback: {error.message}</div>
        )}
      >
        <ThrowingComponent message="Custom error" />
      </StorachaErrorBoundary>
    )

    expect(screen.getByText('Render fallback: Custom error')).toBeTruthy()
    expect(screen.queryByText('Should NOT appear')).toBeFalsy()
  })

  test('calls onError callback with error and error info', () => {
    const onError = vi.fn()

    render(
      <StorachaErrorBoundary onError={onError}>
        <ThrowingComponent message="Tracked error" />
      </StorachaErrorBoundary>
    )

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Tracked error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    )
  })

  test('reset clears error state and re-renders children', async () => {
    let shouldThrow = true

    function ConditionalThrower() {
      if (shouldThrow) {
        throw new Error('First render error')
      }
      return <div>Recovered Content</div>
    }

    render(
      <StorachaErrorBoundary
        renderFallback={(_error, reset) => (
          <div>
            <span>Error occurred</span>
            <button
              onClick={() => {
                shouldThrow = false
                reset()
              }}
            >
              Reset
            </button>
          </div>
        )}
      >
        <ConditionalThrower />
      </StorachaErrorBoundary>
    )

    expect(screen.getByText('Error occurred')).toBeTruthy()

    const user = userEvent.setup()
    await user.click(screen.getByText('Reset'))

    expect(screen.getByText('Recovered Content')).toBeTruthy()
    expect(screen.queryByText('Error occurred')).toBeFalsy()
  })

  test('passes className and style to default fallback div', () => {
    const { container } = render(
      <StorachaErrorBoundary
        className="error-wrapper"
        style={{ border: '1px solid red' }}
      >
        <ThrowingComponent />
      </StorachaErrorBoundary>
    )

    const wrapper = container.querySelector('.error-wrapper')
    expect(wrapper).toBeTruthy()
    expect((wrapper as HTMLElement).style.border).toBe('1px solid red')
  })

  test('StorachaErrorBoundary is a class component', () => {
    expect(StorachaErrorBoundary.prototype).toHaveProperty('componentDidCatch')
    expect(StorachaErrorBoundary).toHaveProperty('getDerivedStateFromError')
  })
})

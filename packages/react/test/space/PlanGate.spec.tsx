// eslint-disable-next-line @typescript-eslint/no-unused-vars -- React in scope for JSX in test env
import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import {
  Provider,
  PlanGate,
  usePlanGateContext,
  PlanGateContextDefaultValue,
} from '../../src/index.js'

describe('PlanGate Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('PlanGateProvider', () => {
    test('provides plan gate context with default loading state', () => {
      function TestComponent() {
        const [{ planStatus, plan, error }] = usePlanGateContext()
        return (
          <div>
            Status: {planStatus}, Plan: {plan?.product || 'none'}, Error: {error || 'none'}
          </div>
        )
      }

      render(
        <Provider>
          <PlanGate>
            <TestComponent />
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText(/Status:/)).toBeTruthy()
    })

    test('renders children', () => {
      render(
        <Provider>
          <PlanGate>
            <div>Child Content</div>
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText('Child Content')).toBeTruthy()
    })

    test('calls onPlanChecked callback when plan check completes', () => {
      const onPlanChecked = vi.fn()

      render(
        <Provider>
          <PlanGate onPlanChecked={onPlanChecked}>
            <div>Content</div>
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText('Content')).toBeTruthy()
    })

    test('calls onError callback prop is accepted', () => {
      const onError = vi.fn()

      render(
        <Provider>
          <PlanGate onError={onError}>
            <div>Content</div>
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText('Content')).toBeTruthy()
    })
  })

  describe('PlanGateGate', () => {
    test('renders nothing when plan status is not active (default loading)', () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Gate>
              <div>Protected Content</div>
            </PlanGate.Gate>
          </PlanGate>
        </Provider>
      )

      expect(screen.queryByText('Protected Content')).toBeFalsy()
    })
  })

  describe('PlanGateFallback', () => {
    test('renders default loading fallback when plan status is loading', () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Fallback />
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText('Checking your plan status...')).toBeTruthy()
    })

    test('renders custom children as fallback when provided', () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Fallback>
              <div>Custom Fallback</div>
            </PlanGate.Fallback>
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText('Custom Fallback')).toBeTruthy()
    })

    test('renders custom renderFallback when provided', () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Fallback
              renderFallback={({ planStatus }) => (
                <div>Custom render: {planStatus}</div>
              )}
            />
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText(/Custom render: loading/)).toBeTruthy()
    })

    test('passes className and style to default fallback div', () => {
      const { container } = render(
        <Provider>
          <PlanGate>
            <PlanGate.Fallback
              className="test-class"
              style={{ color: 'red' }}
            />
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText('Checking your plan status...')).toBeTruthy()
      const wrapper = container.querySelector('.test-class')
      expect(wrapper).toBeTruthy()
      expect((wrapper as HTMLElement).style.color).toBe('red')
    })
  })

  describe('PlanGateLoading', () => {
    test('renders default loading text when plan status is loading', () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Loading />
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText('Checking plan status...')).toBeTruthy()
    })

    test('renders custom children when provided and status is loading', () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Loading>
              <div>Custom Loading...</div>
            </PlanGate.Loading>
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText('Custom Loading...')).toBeTruthy()
    })

    test('renders custom renderLoading when provided and status is loading', () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Loading renderLoading={() => <div>Render Loading</div>} />
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText('Render Loading')).toBeTruthy()
    })
  })

  describe('usePlanGateContext', () => {
    test('returns default context values outside provider', () => {
      function TestComponent() {
        const [state, actions] = usePlanGateContext()
        return (
          <div>
            <span>Status: {state.planStatus}</span>
            <span>Has refreshPlan: {typeof actions.refreshPlan}</span>
            <span>Has selectPlan: {typeof actions.selectPlan}</span>
          </div>
        )
      }

      render(
        <Provider>
          <TestComponent />
        </Provider>
      )

      expect(screen.getByText(/Status: loading/)).toBeTruthy()
      expect(screen.getByText(/Has refreshPlan: function/)).toBeTruthy()
      expect(screen.getByText(/Has selectPlan: function/)).toBeTruthy()
    })

    test('default refreshPlan throws when called outside provider', async () => {
      const [, actions] = PlanGateContextDefaultValue

      await expect(actions.refreshPlan()).rejects.toThrow(
        'missing refreshPlan function'
      )
    })

    test('default selectPlan throws when called outside provider', async () => {
      const [, actions] = PlanGateContextDefaultValue

      await expect(actions.selectPlan('did:web:test')).rejects.toThrow(
        'missing selectPlan function'
      )
    })
  })

  describe('PlanGate compound component', () => {
    test('has Gate sub-component', () => {
      expect(PlanGate.Gate).toBeDefined()
    })

    test('has Fallback sub-component', () => {
      expect(PlanGate.Fallback).toBeDefined()
    })

    test('has Loading sub-component', () => {
      expect(PlanGate.Loading).toBeDefined()
    })
  })
})

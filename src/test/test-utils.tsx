import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { AppProviders } from '../context/AppProviders'

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: MemoryRouterProps['initialEntries']
}

/**
 * Custom render helper wrapping the component under test with AppProviders and MemoryRouter.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderWithProvidersOptions,
): RenderResult {
  const { initialEntries = ['/'], ...renderOptions } = options ?? {}

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AppProviders>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </AppProviders>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export * from '@testing-library/react'
export { renderWithProviders as render }

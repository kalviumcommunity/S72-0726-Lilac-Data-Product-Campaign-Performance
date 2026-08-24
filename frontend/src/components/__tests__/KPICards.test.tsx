import { render, screen } from '@testing-library/react'
import KPICards from '../KPICards'
import { KPI } from '../../types'

const mockKpis: KPI[] = [
  { label: 'Total Revenue', value: '$1.2M', color: '#00f', icon: 'revenue', glow: 'glow-class' },
]

test('renders KPI label and value', () => {
  render(<KPICards kpis={mockKpis} />)
  expect(screen.getByText('Total Revenue')).toBeInTheDocument()
  expect(screen.getByText('$1.2M')).toBeInTheDocument()
})

test('renders nothing when kpis is empty', () => {
  const { container } = render(<KPICards kpis={[]} />)
  // Ensure the container has the grid layout but no cards inside
  expect(container.firstChild?.childNodes.length).toBe(0)
})
import type { ReactElement } from 'react'
import { useParams } from 'react-router-dom'

const Confirmation = (): ReactElement => {
  const { orderId } = useParams<{ orderId: string }>()
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Purchase Confirmation</h1>
      <p>Order ID: {orderId}</p>
      <p>ST9 — coming soon.</p>
    </main>
  )
}

export default Confirmation

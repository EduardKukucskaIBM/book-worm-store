import type { ReactElement } from 'react'
import { useParams } from 'react-router-dom'

const ProductDetail = (): ReactElement => {
  const { bookId } = useParams<{ bookId: string }>()
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Product Detail</h1>
      <p>Book ID: {bookId}</p>
      <p>ST6 — coming soon.</p>
    </main>
  )
}

export default ProductDetail

import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'

const NotFound = (): ReactElement => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>404 — Page Not Found</h1>
    <Link to="/">Back to Home</Link>
  </div>
)

export default NotFound

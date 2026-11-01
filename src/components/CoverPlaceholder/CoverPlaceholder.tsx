import type { ReactElement } from 'react'
import { Book } from '../../types'
import './CoverPlaceholder.scss'

export interface CoverPlaceholderProps {
  book: Pick<Book, 'id' | 'title' | 'authorId' | 'format'>
  authorName?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

interface CoverTheme {
  background: string
  color: string
  accentColor: string
  subtitle?: string
  iconType?: string
}

const KNOWN_THEMES: Record<string, CoverTheme> = {
  'book-art-of-focus': {
    background: '#f4f4f4',
    color: '#161616',
    accentColor: '#da1e28',
    subtitle: 'How to Prioritize Your Life for Maximum Productivity',
    iconType: 'bullseye',
  },
  'book-art-of-learning': {
    background: '#c41c1c',
    color: '#ffffff',
    accentColor: '#f1c21b',
    iconType: 'bulb-book',
  },
  'book-path-to-success': {
    background: '#195b8c',
    color: '#ffffff',
    accentColor: '#f1c21b',
    iconType: 'stars-trophy',
  },
  'book-midnight-hour': {
    background: '#12253a',
    color: '#ffffff',
    accentColor: '#68b5fb',
    subtitle: 'A NOVEL',
    iconType: 'lantern',
  },
  'book-beneath-the-stars': {
    background: '#391b4a',
    color: '#ffffff',
    accentColor: '#ee5396',
    subtitle: 'A ROMANCE',
    iconType: 'stars-couple',
  },
  'book-final-frontier': {
    background: '#0d2847',
    color: '#ffffff',
    accentColor: '#4589ff',
    iconType: 'planet-orbit',
  },
  'book-joy-of-minimalism': {
    background: '#f1c21b',
    color: '#161616',
    accentColor: '#161616',
    subtitle: 'Simplify your life for greater clarity and happiness',
    iconType: 'minimal-arch',
  },
  'book-vanishing-house': {
    background: '#133934',
    color: '#ffffff',
    accentColor: '#82cfff',
    iconType: 'mansion-moon',
  },
  'book-lost-kitten': {
    background: '#eb6200',
    color: '#ffffff',
    accentColor: '#ffe082',
    iconType: 'cat',
  },
}

const FALLBACK_PALETTES: CoverTheme[] = [
  { background: '#0e605c', color: '#ffffff', accentColor: '#3ddbd9', iconType: 'abstract' },
  { background: '#5e1965', color: '#ffffff', accentColor: '#ff7eb6', iconType: 'abstract' },
  { background: '#084887', color: '#ffffff', accentColor: '#78a9ff', iconType: 'abstract' },
  { background: '#8a3800', color: '#ffffff', accentColor: '#ffd700', iconType: 'abstract' },
  { background: '#2d3f4e', color: '#ffffff', accentColor: '#a7f0ba', iconType: 'abstract' },
  { background: '#1c4228', color: '#ffffff', accentColor: '#42be65', iconType: 'abstract' },
  { background: '#6929c4', color: '#ffffff', accentColor: '#be95ff', iconType: 'abstract' },
  { background: '#0043ce', color: '#ffffff', accentColor: '#82cfff', iconType: 'abstract' },
]

function getThemeForBook(book: Pick<Book, 'id' | 'title'>): CoverTheme {
  if (KNOWN_THEMES[book.id]) {
    return KNOWN_THEMES[book.id]
  }

  // Hash title for deterministic fallback
  let hash = 0
  for (let i = 0; i < book.title.length; i++) {
    hash = (hash << 5) - hash + book.title.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % FALLBACK_PALETTES.length
  return FALLBACK_PALETTES[index]
}

function renderCoverIcon(iconType?: string, accentColor?: string) {
  if (!iconType) return null

  switch (iconType) {
    case 'bullseye':
      return (
        <svg className="cover-placeholder__icon" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="40" fill="none" stroke={accentColor} strokeWidth="6" />
          <circle cx="50" cy="50" r="28" fill="none" stroke={accentColor} strokeWidth="5" />
          <circle cx="50" cy="50" r="16" fill="none" stroke={accentColor} strokeWidth="4" />
          <circle cx="50" cy="50" r="6" fill={accentColor} />
          <line x1="10" y1="50" x2="90" y2="50" stroke={accentColor} strokeWidth="4" />
          <line x1="50" y1="10" x2="50" y2="90" stroke={accentColor} strokeWidth="4" />
        </svg>
      )
    case 'bulb-book':
      return (
        <svg className="cover-placeholder__icon" viewBox="0 0 100 80" aria-hidden="true">
          <path d="M40 25 C40 15 60 15 60 25 C60 32 54 36 54 42 L46 42 C46 36 40 32 40 25 Z" fill={accentColor} />
          <rect x="47" y="44" width="6" height="3" fill={accentColor} />
          <path d="M20 65 Q50 55 50 72 Q50 55 80 65 L80 75 Q50 65 50 78 Q50 65 20 75 Z" fill="#ffffff" opacity="0.9" />
        </svg>
      )
    case 'minimal-arch':
      return (
        <svg className="cover-placeholder__icon" viewBox="0 0 100 60" aria-hidden="true">
          <path
            d="M 25 50 A 25 25 0 0 1 75 50"
            fill="none"
            stroke="#161616"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="50" cy="48" r="7" fill="#161616" />
        </svg>
      )
    case 'cat':
      return (
        <svg className="cover-placeholder__icon" viewBox="0 0 100 80" aria-hidden="true">
          <path
            d="M30 40 L35 20 L50 32 L65 20 L70 40 C75 55 68 70 50 70 C32 70 25 55 30 40 Z"
            fill="#ffffff"
            opacity="0.95"
          />
          <circle cx="42" cy="46" r="3" fill="#eb6200" />
          <circle cx="58" cy="46" r="3" fill="#eb6200" />
          <path d="M47 52 Q50 55 53 52" fill="none" stroke="#eb6200" strokeWidth="2" />
        </svg>
      )
    case 'planet-orbit':
      return (
        <svg className="cover-placeholder__icon" viewBox="0 0 100 80" aria-hidden="true">
          <circle cx="50" cy="45" r="22" fill="#ffffff" opacity="0.85" />
          <ellipse cx="50" cy="45" rx="42" ry="12" fill="none" stroke={accentColor} strokeWidth="3" transform="rotate(-18 50 45)" />
        </svg>
      )
    case 'stars-couple':
      return (
        <svg className="cover-placeholder__icon" viewBox="0 0 100 80" aria-hidden="true">
          <circle cx="20" cy="20" r="2" fill="#ffffff" />
          <circle cx="45" cy="15" r="2" fill="#ffffff" />
          <circle cx="80" cy="25" r="2" fill="#ffffff" />
          <circle cx="70" cy="10" r="1.5" fill="#ffffff" />
          <path d="M35 75 C35 60 48 58 48 50 C48 45 42 45 42 40 C42 35 48 35 48 35 C48 35 54 35 54 40 C54 45 48 45 48 50 C48 58 61 60 61 75 Z" fill="#120826" />
        </svg>
      )
    default:
      return (
        <svg className="cover-placeholder__icon" viewBox="0 0 100 60" aria-hidden="true">
          <rect x="25" y="15" width="50" height="30" rx="3" fill="none" stroke={accentColor} strokeWidth="2" opacity="0.6" />
          <line x1="35" y1="25" x2="65" y2="25" stroke={accentColor} strokeWidth="2" opacity="0.6" />
          <line x1="35" y1="33" x2="55" y2="33" stroke={accentColor} strokeWidth="2" opacity="0.6" />
        </svg>
      )
  }
}

export const CoverPlaceholder = ({
  book,
  authorName,
  className = '',
  size = 'md',
}: CoverPlaceholderProps): ReactElement => {
  const theme = getThemeForBook(book)
  const displayAuthor = authorName || (book.authorId ? book.authorId.replace('auth-', 'Author ') : '')

  return (
    <div
      className={`cover-placeholder cover-placeholder--${size} ${className}`.trim()}
      style={{
        backgroundColor: theme.background,
        color: theme.color,
      }}
      role="img"
      aria-label={`Book cover of ${book.title}${displayAuthor ? ` by ${displayAuthor}` : ''}`}
    >
      <div className="cover-placeholder__spine-highlight" aria-hidden="true" />
      <div className="cover-placeholder__content" aria-hidden="true">
        {theme.subtitle && (
          <span className="cover-placeholder__pretitle" style={{ color: theme.color }}>
            {theme.subtitle}
          </span>
        )}

        <div className="cover-placeholder__title-wrap">
          <div className="cover-placeholder__title" style={{ color: theme.color }}>
            {book.title}
          </div>
        </div>

        <div className="cover-placeholder__art">
          {renderCoverIcon(theme.iconType, theme.accentColor)}
        </div>

        {displayAuthor && (
          <span className="cover-placeholder__author" style={{ color: theme.color }}>
            {displayAuthor.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  )
}

export default CoverPlaceholder

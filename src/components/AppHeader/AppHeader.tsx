import { useState, useRef, useEffect } from 'react'
import type { ReactElement } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent,
} from '@carbon/react'
import { Book, ShoppingCart, UserAvatar, Logout } from '@carbon/icons-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import './AppHeader.scss'

export interface AppHeaderProps {
  className?: string
}

export const AppHeader = ({ className }: AppHeaderProps): ReactElement => {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const location = useLocation()

  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [prevPathname, setPrevPathname] = useState(location.pathname)

  // Reset open menus on route change during render
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname)
    setIsSideNavExpanded(false)
    setIsUserMenuOpen(false)
  }

  const userMenuRef = useRef<HTMLDivElement>(null)
  const userButtonRef = useRef<HTMLButtonElement>(null)

  // Close user menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!isUserMenuOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent): void => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsUserMenuOpen(false)
        userButtonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isUserMenuOpen])

  const handleLogout = (): void => {
    logout()
    setIsUserMenuOpen(false)
  }

  const isCurrent = (path: string): boolean => location.pathname === path

  return (
    <Header aria-label="Book Worm" className={`app-header ${className ?? ''}`.trim()}>
      <SkipToContent href="#main-content" />

      {/* Hamburger button visible only on sm/md screens (< 1056px) */}
      <HeaderMenuButton
        aria-label={isSideNavExpanded ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isSideNavExpanded}
        isActive={isSideNavExpanded}
        onClick={() => setIsSideNavExpanded((prev) => !prev)}
        className="app-header__menu-button"
      />

      {/* Brand logo + name */}
      <HeaderName as={Link} to="/" prefix="" className="app-header__brand">
        <Book size={20} className="app-header__brand-icon" aria-hidden="true" />
        <span className="app-header__brand-title">Book Worm</span>
      </HeaderName>

      {/* Desktop navigation (≥ 1056px) */}
      <HeaderNavigation aria-label="Main Navigation" className="app-header__nav">
        <HeaderMenuItem as={Link} to="/orders" isCurrentPage={isCurrent('/orders')}>
          My Orders
        </HeaderMenuItem>
        <HeaderMenuItem as={Link} to="/wishlist" isCurrentPage={isCurrent('/wishlist')}>
          My Wishlist
        </HeaderMenuItem>
        <HeaderMenuItem as={Link} to="/writers" isCurrentPage={isCurrent('/writers')}>
          My Writers
        </HeaderMenuItem>
      </HeaderNavigation>

      {/* Action icons: Cart + User */}
      <HeaderGlobalBar className="app-header__global-bar">
        <Link
          to="/checkout"
          aria-label={itemCount > 0 ? `Shopping cart, ${itemCount} items` : 'Shopping cart, empty'}
          className="cds--header__action app-header__global-action app-header__cart-action"
          title={itemCount > 0 ? `Shopping cart, ${itemCount} items` : 'Shopping cart, empty'}
        >
          <div className="app-header__cart-wrapper">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span
                className="app-header__cart-badge"
                data-testid="cart-badge"
                aria-label={`${itemCount} items in cart`}
              >
                {itemCount}
              </span>
            )}
          </div>
        </Link>

        {isAuthenticated && user ? (
          <div className="app-header__user-menu-container" ref={userMenuRef}>
            <HeaderGlobalAction
              ref={userButtonRef}
              aria-label={`User menu for ${user.name}`}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              isActive={isUserMenuOpen}
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="app-header__user-action"
              tooltipAlignment="end"
            >
              <UserAvatar size={20} />
            </HeaderGlobalAction>

            {isUserMenuOpen && (
              <div
                className="app-header__user-popover"
                role="menu"
                aria-label="User account options"
              >
                <div className="app-header__user-info" role="none">
                  <div className="app-header__user-name">{user.name}</div>
                  <div className="app-header__user-email">{user.email}</div>
                </div>
                <div className="app-header__user-divider" role="separator" />
                <button
                  type="button"
                  className="app-header__user-logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <Logout size={16} aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            aria-label="Log in"
            className="cds--header__action app-header__global-action app-header__user-action"
            title="Log in"
          >
            <UserAvatar size={20} />
          </Link>
        )}
      </HeaderGlobalBar>

      {/* Side panel for mobile / tablet (< 1056px) */}
      <SideNav
        aria-label="Side navigation"
        expanded={isSideNavExpanded}
        isPersistent={false}
        onOverlayClick={() => setIsSideNavExpanded(false)}
        className="app-header__side-nav"
      >
        <SideNavItems>
          <SideNavLink
            as={Link}
            to="/orders"
            isActive={isCurrent('/orders')}
            onClick={() => setIsSideNavExpanded(false)}
          >
            My Orders
          </SideNavLink>
          <SideNavLink
            as={Link}
            to="/wishlist"
            isActive={isCurrent('/wishlist')}
            onClick={() => setIsSideNavExpanded(false)}
          >
            My Wishlist
          </SideNavLink>
          <SideNavLink
            as={Link}
            to="/writers"
            isActive={isCurrent('/writers')}
            onClick={() => setIsSideNavExpanded(false)}
          >
            My Writers
          </SideNavLink>
        </SideNavItems>
      </SideNav>
    </Header>
  )
}

export default AppHeader

import { useEffect, useState, type ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { Book, Author, Category, Review } from '../types'
import { BookWithDetails } from '../types'
import { getBookById, getRelatedBooks, addBookReview } from '../api/books'
import { getCategories } from '../api/categories'
import { getAuthors } from '../api/authors'
import { loadJSON, saveJSON } from '../utils/storage'
import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'
import EmptyState from '../components/EmptyState/EmptyState'
import BookGallery from '../components/BookGallery/BookGallery'
import PublisherLink from '../components/PublisherLink/PublisherLink'
import CategoryTags from '../components/CategoryTags/CategoryTags'
import PriceTag from '../components/PriceTag/PriceTag'
import DeliveryDate from '../components/DeliveryDate/DeliveryDate'
import AuthorBio from '../components/AuthorBio/AuthorBio'
import BookMeta from '../components/BookMeta/BookMeta'
import ProductActions from '../components/ProductActions/ProductActions'
import ReviewForm from '../components/ReviewForm/ReviewForm'
import ReviewList from '../components/ReviewList/ReviewList'
import RelatedReads from '../components/RelatedReads/RelatedReads'
import { AuthorLink } from '../components/AuthorLink/AuthorLink'
import './ProductDetail.scss'

const REVIEW_STORAGE_KEY = (bookId: string) => `bookworm.reviews.${bookId}`

interface PageState {
  book: BookWithDetails | null
  relatedBooks: Book[]
  allAuthors: Author[]
  allCategories: Category[]
  loading: boolean
  notFound: boolean
}

const ProductDetail = (): ReactElement => {
  const { bookId } = useParams<{ bookId: string }>()

  const [state, setState] = useState<PageState>(() => ({
    book: null,
    relatedBooks: [],
    allAuthors: [],
    allCategories: [],
    loading: Boolean(bookId),
    notFound: !bookId,
  }))

  const [localReviews, setLocalReviews] = useState<Review[]>(() => {
    if (!bookId) return []
    return loadJSON<Review[]>(REVIEW_STORAGE_KEY(bookId), [], Array.isArray)
  })

  useEffect(() => {
    if (!bookId) return

    let cancelled = false

    async function load() {
      const [book, related, authors, categories] = await Promise.all([
        getBookById(bookId!),
        getRelatedBooks(bookId!, 4),
        getAuthors(),
        getCategories(),
      ])

      if (cancelled) return

      // Restore local reviews from storage
      const stored = loadJSON<Review[]>(REVIEW_STORAGE_KEY(bookId!), [], Array.isArray)
      setLocalReviews(stored)

      setState({
        book: book ?? null,
        relatedBooks: related,
        allAuthors: authors as Author[],
        allCategories: categories as Category[],
        loading: false,
        notFound: !book,
      })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [bookId])

  const handleReviewSubmit = async (
    reviewInput: Omit<Review, 'id' | 'bookId' | 'createdAt'>
  ) => {
    if (!bookId) return
    const newReview = await addBookReview(bookId, { ...reviewInput, bookId })
    setLocalReviews((prev) => {
      const updated = [newReview, ...prev]
      saveJSON(REVIEW_STORAGE_KEY(bookId), updated)
      return updated
    })
  }

  if (state.loading) {
    return (
      <main id="main-content" className="pdp pdp--loading" aria-busy="true">
        <div className="pdp__skeleton" aria-label="Loading book details…" />
      </main>
    )
  }

  if (state.notFound || !state.book) {
    return (
      <main id="main-content" className="pdp pdp--not-found">
        <EmptyState
          title="Book not found"
          description="We couldn't find the book you're looking for."
          action={{ label: 'Back to catalogue', to: '/' }}
          data-testid="pdp-not-found"
        />
      </main>
    )
  }

  const { book, relatedBooks, allAuthors, allCategories } = state

  const author = book.author ?? allAuthors.find((a) => a.id === book.authorId)
  const publisher = book.publisher
  const categories = book.categories ?? allCategories.filter((c) => book.categoryIds.includes(c.id))

  // Build breadcrumb: Home / Parent Category / Category
  const primaryCategory = categories[0]
  const parentCategory = primaryCategory?.parentId
    ? allCategories.find((c) => c.id === primaryCategory.parentId)
    : undefined

  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    ...(parentCategory
      ? [{ label: parentCategory.name, to: `/?category=${encodeURIComponent(parentCategory.id)}` }]
      : []),
    ...(primaryCategory
      ? [
          {
            label: primaryCategory.name,
            to: `/?category=${encodeURIComponent(primaryCategory.id)}`,
            isCurrent: true,
          },
        ]
      : [{ label: book.title, isCurrent: true }]),
  ]

  // Related books with enriched author/category data
  const relatedItems = relatedBooks.map((rb) => {
    const rbAuthor = allAuthors.find((a) => a.id === rb.authorId)
    const rbCategories = allCategories.filter((c) => rb.categoryIds.includes(c.id))
    return {
      book: rb,
      authorName: rbAuthor?.name,
      categories: rbCategories,
    }
  })

  // All reviews: API reviews + local reviews (deduped by id)
  const apiReviews = book.reviews ?? []
  const apiIds = new Set(apiReviews.map((r) => r.id))
  const allReviews: Review[] = [
    ...localReviews.filter((r) => !apiIds.has(r.id)),
    ...apiReviews,
  ]

  return (
    <main id="main-content" className="pdp">
      {/* Breadcrumb */}
      <div className="pdp__breadcrumb-wrap">
        <div className="pdp__container">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      {/* Main layout: left+details | right related */}
      <div className="pdp__container">
        <div className="pdp__layout">
          {/* Main content column */}
          <div className="pdp__main">
            {/* Gallery + Details */}
            <section className="pdp__top-section" aria-label={`${book.title} details`}>
              {/* Left: BookGallery */}
              <div className="pdp__gallery">
                <BookGallery book={book} authorName={author?.name} />
              </div>

              {/* Right: Details */}
              <div className="pdp__details">
                <h1 className="pdp__title">{book.title}</h1>

                {author && (
                  <div className="pdp__author-row">
                    <AuthorLink authorId={author.id} authorName={author.name} />
                  </div>
                )}

                <p className="pdp__short-desc">{book.description}</p>

                {publisher && (
                  <p className="pdp__publisher-row">
                    <span className="pdp__publisher-label">Published by: </span>
                    <PublisherLink publisher={publisher} />
                  </p>
                )}

                <p className="pdp__format">{book.format}</p>

                {categories.length > 0 && (
                  <CategoryTags categories={categories} className="pdp__categories" />
                )}

                <div className="pdp__price-row">
                  <PriceTag price={book.price} size="lg" className="pdp__price" />
                </div>

                <p className="pdp__delivery-row">
                  {book.format === 'eBook' ? (
                    <span className="pdp__delivery">Instant download</span>
                  ) : (
                    <>
                      <span className="pdp__delivery-prefix">Delivery by </span>
                      <strong className="pdp__delivery">
                        <DeliveryDate book={book} />
                      </strong>
                    </>
                  )}
                </p>

                <ProductActions bookId={book.id} className="pdp__actions" />

                <BookMeta book={book} className="pdp__meta" />
              </div>
            </section>

            {/* About the writer */}
            {author && (
              <section className="pdp__author-section" aria-labelledby="pdp-author-heading">
                <h2 id="pdp-author-heading" className="pdp__section-heading">
                  About the writer
                </h2>
                <AuthorBio author={author} />
              </section>
            )}

            {/* Reviews */}
            <section className="pdp__reviews-section" aria-labelledby="pdp-reviews-heading">
              <h2 id="pdp-reviews-heading" className="pdp__section-heading">
                Reviews
              </h2>

              <div className="pdp__reviews-layout">
                <div className="pdp__review-form-col">
                  <ReviewForm bookId={book.id} onSubmit={handleReviewSubmit} />
                </div>
                <div className="pdp__review-list-col">
                  <ReviewList reviews={allReviews} />
                </div>
              </div>
            </section>

            {/* Related reads (below reviews on narrow screens) */}
            {relatedItems.length > 0 && (
              <section className="pdp__related-inline" aria-label="Related Reads">
                <RelatedReads items={relatedItems} />
              </section>
            )}
          </div>

          {/* Right sidebar: Related Reads (hidden on narrow, shown on wide) */}
          {relatedItems.length > 0 && (
            <aside className="pdp__sidebar">
              <RelatedReads items={relatedItems} />
            </aside>
          )}
        </div>
      </div>
    </main>
  )
}

export default ProductDetail

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/ProductCard'
import PaymentModal from '@/components/PaymentModal'
import { Sparkles, Zap, Shield, Loader2 } from 'lucide-react'
import type { Product, SiteContent } from '@/lib/types'

interface HeroContent {
  title: string
  subtitle: string
  cta_text: string
}

export default function HomePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])
  const [user, setUser] = useState<{ id: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser({ id: user.id })

          // Get purchased products
          const { data: purchases } = await supabase
            .from('user_purchases')
            .select('product_id')
            .eq('user_id', user.id)

          if (purchases) {
            setPurchasedIds(purchases.map(p => p.product_id))
          }
        }

        // Get products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (productsData) {
          setProducts(productsData)
        }

        // Get hero content
        const { data: contentData } = await supabase
          .from('site_content')
          .select('*')
          .eq('key', 'homepage_hero')
          .single()

        if (contentData) {
          setHeroContent(contentData.value as unknown as HeroContent)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const handleBuyClick = async (product: Product) => {
    if (!user) {
      router.push(`/login?redirectTo=/&product=${product.id}`)
      return
    }
    setSelectedProduct(product)
  }

  const handlePaymentSuccess = () => {
    setSelectedProduct(null)
    if (selectedProduct) {
      setPurchasedIds([...purchasedIds, selectedProduct.id])
    }
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-foreground-muted">Loading...</p>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container relative z-10">
          <div className="animate-slide-up">
            <h1 className="hero-title">
              {heroContent?.title || 'Digital Products Marketplace'}
            </h1>
            <p className="hero-subtitle">
              {heroContent?.subtitle || 'Access premium PDFs and exclusive Telegram groups'}
            </p>
            <a href="#products" className="btn btn-primary btn-lg">
              <Sparkles className="w-5 h-5" />
              {heroContent?.cta_text || 'Browse Products'}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-static text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-semibold mb-2">Instant Access</h3>
              <p className="text-sm text-foreground-muted">
                Get immediate access to your purchases. No waiting required.
              </p>
            </div>
            <div className="card-static text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-foreground-muted">
                All transactions are encrypted and processed securely via Razorpay.
              </p>
            </div>
            <div className="card-static text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Premium Quality</h3>
              <p className="text-sm text-foreground-muted">
                Curated collection of high-quality digital products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Products</h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Explore our collection of premium digital products designed to help you grow.
            </p>
          </div>

          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3 className="empty-state-title">No Products Available</h3>
              <p>Check back soon for new products!</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onBuyClick={handleBuyClick}
                  isPurchased={purchasedIds.includes(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Payment Modal */}
      {selectedProduct && (
        <PaymentModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}

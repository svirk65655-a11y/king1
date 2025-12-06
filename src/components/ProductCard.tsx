'use client'

import Image from 'next/image'
import { FileText, Users } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductCardProps {
    product: Product
    onBuyClick: (product: Product) => void
    isPurchased?: boolean
}

export default function ProductCard({ product, onBuyClick, isPurchased }: ProductCardProps) {
    return (
        <div className="card group relative overflow-hidden">
            {/* Product Type Badge */}
            <div className="product-type-badge">
                <span className={`badge ${product.type === 'pdf' ? 'badge-info' : 'badge-success'}`}>
                    {product.type === 'pdf' ? (
                        <>
                            <FileText className="w-3 h-3 mr-1" />
                            PDF
                        </>
                    ) : (
                        <>
                            <Users className="w-3 h-3 mr-1" />
                            Telegram
                        </>
                    )}
                </span>
            </div>

            {/* Product Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4 bg-white/5">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {product.type === 'pdf' ? (
                            <FileText className="w-16 h-16 text-indigo-500/50" />
                        ) : (
                            <Users className="w-16 h-16 text-emerald-500/50" />
                        )}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>

            {product.description && (
                <p className="text-sm text-foreground-muted mb-4 line-clamp-3">
                    {product.description}
                </p>
            )}

            {/* Price & CTA */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                </span>

                {isPurchased ? (
                    <span className="badge badge-success">Purchased</span>
                ) : (
                    <button
                        onClick={() => onBuyClick(product)}
                        className="btn btn-primary btn-sm"
                    >
                        Buy Now
                    </button>
                )}
            </div>
        </div>
    )
}

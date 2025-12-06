'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Loader2,
    Save,
    AlertCircle,
    CheckCircle,
    Home,
    FileText
} from 'lucide-react'

type ContentKey = 'homepage_hero' | 'privacy_policy' | 'refund_policy' | 'terms_conditions'

const contentItems: { key: ContentKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'homepage_hero', label: 'Homepage Hero', icon: Home },
    { key: 'privacy_policy', label: 'Privacy Policy', icon: FileText },
    { key: 'refund_policy', label: 'Refund Policy', icon: FileText },
    { key: 'terms_conditions', label: 'Terms & Conditions', icon: FileText },
]

export default function AdminContentPage() {
    const [activeTab, setActiveTab] = useState<ContentKey>('homepage_hero')
    const [content, setContent] = useState<Record<string, unknown>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const supabase = createClient()

    // Hero form state
    const [heroTitle, setHeroTitle] = useState('')
    const [heroSubtitle, setHeroSubtitle] = useState('')
    const [heroCta, setHeroCta] = useState('')

    // Policy form state
    const [policyContent, setPolicyContent] = useState('')

    useEffect(() => {
        loadContent()
    }, [activeTab])

    const loadContent = async () => {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
            .from('site_content')
            .select('value')
            .eq('key', activeTab)
            .single()

        if (error && error.code !== 'PGRST116') {
            setError(error.message)
        } else if (data) {
            setContent(data.value as Record<string, unknown>)

            if (activeTab === 'homepage_hero') {
                const value = data.value as { title?: string; subtitle?: string; cta_text?: string }
                setHeroTitle(value.title || '')
                setHeroSubtitle(value.subtitle || '')
                setHeroCta(value.cta_text || '')
            } else {
                const value = data.value as { content?: string }
                setPolicyContent(value.content || '')
            }
        }

        setLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)

        try {
            let value: Record<string, unknown>

            if (activeTab === 'homepage_hero') {
                value = {
                    title: heroTitle,
                    subtitle: heroSubtitle,
                    cta_text: heroCta,
                }
            } else {
                value = {
                    content: policyContent,
                }
            }

            const { error } = await supabase
                .from('site_content')
                .upsert({
                    key: activeTab,
                    value,
                })

            if (error) throw error

            setSuccess('Content saved successfully')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save content')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Content Management</h1>
                <p className="page-description">Edit website content and policies</p>
            </div>

            {success && (
                <div className="alert alert-success mb-6">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {error && (
                <div className="alert alert-error mb-6">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="card-static">
                        <nav className="space-y-1">
                            {contentItems.map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveTab(item.key)}
                                    className={`admin-nav-item w-full text-left ${activeTab === item.key ? 'active' : ''
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content Editor */}
                <div className="lg:col-span-3">
                    <div className="card-static">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : activeTab === 'homepage_hero' ? (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold">Homepage Hero Section</h2>

                                <div className="input-group">
                                    <label className="label">Title</label>
                                    <input
                                        type="text"
                                        value={heroTitle}
                                        onChange={(e) => setHeroTitle(e.target.value)}
                                        className="input"
                                        placeholder="Welcome to our platform"
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="label">Subtitle</label>
                                    <textarea
                                        value={heroSubtitle}
                                        onChange={(e) => setHeroSubtitle(e.target.value)}
                                        className="input textarea"
                                        rows={3}
                                        placeholder="A compelling description of your products"
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="label">CTA Button Text</label>
                                    <input
                                        type="text"
                                        value={heroCta}
                                        onChange={(e) => setHeroCta(e.target.value)}
                                        className="input"
                                        placeholder="Browse Products"
                                    />
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn btn-primary"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold">
                                    {contentItems.find(i => i.key === activeTab)?.label}
                                </h2>

                                <div className="input-group">
                                    <label className="label">Content (Markdown supported)</label>
                                    <textarea
                                        value={policyContent}
                                        onChange={(e) => setPolicyContent(e.target.value)}
                                        className="input textarea font-mono text-sm"
                                        rows={20}
                                        placeholder="# Heading&#10;&#10;Content here..."
                                    />
                                    <p className="text-xs text-foreground-muted mt-2">
                                        Use Markdown formatting: # for headings, ** for bold, * for italic
                                    </p>
                                </div>

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn btn-primary"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

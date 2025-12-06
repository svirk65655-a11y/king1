'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import {
    Search,
    Loader2,
    AlertCircle,
    CheckCircle,
    ShieldCheck,
    ShieldOff,
    Ban,
    UserCheck
} from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            setError(error.message)
        } else if (data) {
            setUsers(data)
        }
        setLoading(false)
    }

    const toggleAdmin = async (user: Profile) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_admin: !user.is_admin })
                .eq('id', user.id)

            if (error) throw error

            setSuccess(`${user.email} ${user.is_admin ? 'removed from' : 'added to'} admin role`)
            loadUsers()
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user')
        }
    }

    const toggleBan = async (user: Profile) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_banned: !user.is_banned })
                .eq('id', user.id)

            if (error) throw error

            setSuccess(`${user.email} ${user.is_banned ? 'unbanned' : 'banned'} successfully`)
            loadUsers()
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user')
        }
    }

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Users</h1>
                <p className="page-description">Manage user accounts and permissions</p>
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

            <div className="card-static">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state py-8">
                        <div className="empty-state-icon">👥</div>
                        <h3 className="empty-state-title">No Users Found</h3>
                        <p>
                            {searchTerm ? 'Try a different search term' : 'Users will appear here when they sign up'}
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div>
                                                <div className="font-medium">{user.full_name || 'No name'}</div>
                                                <div className="text-sm text-foreground-muted">{user.email}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.is_admin ? 'badge-primary' : 'badge-info'}`}>
                                                {user.is_admin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${user.is_banned ? 'badge-danger' : 'badge-success'}`}>
                                                {user.is_banned ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="text-foreground-muted">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleAdmin(user)}
                                                    className={`btn btn-ghost btn-sm p-2 ${user.is_admin ? 'text-amber-400' : 'text-foreground-muted'
                                                        }`}
                                                    title={user.is_admin ? 'Remove admin' : 'Make admin'}
                                                >
                                                    {user.is_admin ? (
                                                        <ShieldOff className="w-4 h-4" />
                                                    ) : (
                                                        <ShieldCheck className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => toggleBan(user)}
                                                    className={`btn btn-ghost btn-sm p-2 ${user.is_banned ? 'text-emerald-400' : 'text-red-400'
                                                        }`}
                                                    title={user.is_banned ? 'Unban user' : 'Ban user'}
                                                >
                                                    {user.is_banned ? (
                                                        <UserCheck className="w-4 h-4" />
                                                    ) : (
                                                        <Ban className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-4 text-sm text-foreground-muted">
                    Showing {filteredUsers.length} of {users.length} users
                </div>
            </div>
        </div>
    )
}

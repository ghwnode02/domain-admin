import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isAuthenticated = ref(false)

    async function login(username, password) {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            if (res.ok) {
                const data = await res.json()
                user.value = data.user
                isAuthenticated.value = true
                return true
            }
        } catch (e) {
            console.error(e)
        }
        return false
    }

    async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        user.value = null
        isAuthenticated.value = false
    }

    async function checkAuth() {
        try {
            const res = await fetch('/api/auth/me')
            if (res.ok) {
                const data = await res.json()
                if (data.authenticated) {
                    user.value = data.user
                    isAuthenticated.value = true
                    return true
                }
            }
        } catch (e) {
            console.error(e)
        }
        isAuthenticated.value = false
        return false
    }

    async function updateLocale(locale: string) {
        try {
            const res = await fetch('/api/auth/locale', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locale })
            })

            if (res.ok) {
                if (user.value) {
                    user.value.locale = locale
                }
                return true
            }
        } catch (e) {
            console.error(e)
        }
        return false
    }

    return { user, isAuthenticated, login, logout, checkAuth, updateLocale }
})

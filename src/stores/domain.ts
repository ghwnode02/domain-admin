import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDomainStore = defineStore('domain', () => {
    const domains = ref([])
    const loading = ref(false)
    const error = ref('')

    async function fetchDomains() {
        loading.value = true
        try {
            const res = await fetch('/api/domains')
            if (res.ok) {
                domains.value = await res.json()
            }
        } catch (e) {
            error.value = 'Failed to fetch domains'
        }
        loading.value = false
    }

    async function addDomain(domainData) {
        loading.value = true
        try {
            const res = await fetch('/api/domains', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(domainData)
            })
            if (res.ok) {
                await fetchDomains()
                return true
            }
        } catch (e) {
            error.value = 'Failed to add domain'
        }
        loading.value = false
        return false
    }

    async function updateDomain(id, domainData) {
        loading.value = true
        try {
            const res = await fetch(`/api/domains/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(domainData)
            })
            if (res.ok) {
                await fetchDomains()
                return true
            }
        } catch (e) {
            error.value = 'Failed to update domain'
        }
        loading.value = false
        return false
    }

    async function deleteDomain(id) {
        loading.value = true
        try {
            const res = await fetch(`/api/domains/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                await fetchDomains()
                return true
            }
        } catch (e) {
            error.value = 'Failed to delete domain'
        }
        loading.value = false
        return false
    }

    async function importDomains(domainsList) {
        loading.value = true
        try {
            const res = await fetch('/api/domains/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domains: domainsList })
            })
            if (res.ok) {
                const result = await res.json()
                await fetchDomains()
                loading.value = false
                return result
            } else {
                const result = await res.json()
                loading.value = false
                return { success: false, error: result.error || 'Unknown error' }
            }
        } catch (e: any) {
            error.value = 'Failed to import domains'
            loading.value = false
            return { success: false, error: e.message }
        }
    }

    return { domains, loading, error, fetchDomains, addDomain, updateDomain, deleteDomain, importDomains }
})

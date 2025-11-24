<template>
  <div>
    <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">{{ $t('dashboard.title') }}</h2>
    
    <div class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt class="truncate text-sm font-medium text-gray-500">{{ $t('dashboard.totalDomains') }}</dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{{ domains.length }}</dd>
      </div>
      <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt class="truncate text-sm font-medium text-gray-500">{{ $t('dashboard.onlineDomains') }}</dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-green-600">{{ onlineDomains }}</dd>
      </div>
      <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt class="truncate text-sm font-medium text-gray-500">{{ $t('dashboard.offlineDomains') }}</dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-red-600">{{ offlineDomains }}</dd>
      </div>
      <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt class="truncate text-sm font-medium text-gray-500">{{ $t('dashboard.expiringSoon') }}</dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-yellow-600">{{ expiringSoon }}</dd>
      </div>
      <div class="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt class="truncate text-sm font-medium text-gray-500">{{ $t('dashboard.expiredDomains') }}</dt>
        <dd class="mt-1 text-3xl font-semibold tracking-tight text-red-600">{{ expiredDomains }}</dd>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDomainStore } from '../stores/domain'
import { storeToRefs } from 'pinia'

const domainStore = useDomainStore()
const { domains } = storeToRefs(domainStore)

onMounted(() => {
  domainStore.fetchDomains()
})

const onlineDomains = computed(() => domains.value.filter(d => d.status === 'Active').length)
const offlineDomains = computed(() => domains.value.filter(d => d.status !== 'Active').length)
const expiringSoon = computed(() => {
  const now = new Date()
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  return domains.value.filter(d => {
    const expiry = new Date(d.expiry_date)
    return expiry > now && expiry < thirtyDaysLater
  }).length
})
const expiredDomains = computed(() => {
  const now = new Date()
  return domains.value.filter(d => {
    const expiry = new Date(d.expiry_date)
    return expiry <= now
  }).length
})
</script>

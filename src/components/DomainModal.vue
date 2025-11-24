<template>
  <div v-if="isOpen" class="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">{{ isEdit ? $t('domains.editDomain') : $t('domains.addDomain') }}</h3>
              <div class="mt-2">
                <form @submit.prevent="handleSubmit" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium leading-6 text-gray-900">{{ $t('domains.domainName') }}</label>
                    <input v-model="form.domain" type="text" required class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium leading-6 text-gray-900">{{ $t('domains.domainUrl') }}</label>
                    <input v-model="form.domain_url" type="url" placeholder="https://example.com" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium leading-6 text-gray-900">{{ $t('domains.registrar') }}</label>
                    <input v-model="form.registrar" type="text" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium leading-6 text-gray-900">{{ $t('domains.registrarUrl') }}</label>
                    <input v-model="form.registrar_url" type="url" placeholder="https://registrar.com" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium leading-6 text-gray-900">{{ $t('domains.expiryDate') }}</label>
                    <input v-model="form.expiry_date" type="date" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium leading-6 text-gray-900">{{ $t('domains.status') }}</label>
                    <select v-model="form.status" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3">
                      <option value="Active">{{ $t('domains.online') }}</option>
                      <option value="Inactive">{{ $t('domains.offline') }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium leading-6 text-gray-900">{{ $t('domains.notes') }}</label>
                    <textarea v-model="form.notes" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"></textarea>
                  </div>
                  <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button type="submit" class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto">{{ $t('common.save') }}</button>
                    <button type="button" @click="$emit('close')" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">{{ $t('common.cancel') }}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  domain?: any
}>()

const emit = defineEmits(['close', 'save'])

const isEdit = ref(false)
const form = ref({
  domain: '',
  domain_url: '',
  registrar: '',
  registrar_url: '',
  expiry_date: '',
  status: 'Active',
  notes: ''
})

watch(() => props.domain, (newVal) => {
  if (newVal) {
    isEdit.value = true
    form.value = { 
      domain: newVal.domain || '',
      domain_url: newVal.domain_url || '',
      registrar: newVal.registrar || '',
      registrar_url: newVal.registrar_url || '',
      expiry_date: newVal.expiry_date ? newVal.expiry_date.split('T')[0] : '',
      status: newVal.status || 'Active',
      notes: newVal.notes || ''
    }
  } else {
    isEdit.value = false
    form.value = { 
      domain: '', 
      domain_url: '',
      registrar: '', 
      registrar_url: '',
      expiry_date: '',
      status: 'Active',
      notes: '' 
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('save', { ...form.value })
}
</script>

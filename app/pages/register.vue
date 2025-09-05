<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white">Registrar</h2>
      <form class="space-y-4" @submit.prevent="onRegister">
        <input v-model="name" type="text" placeholder="Nome" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
        <input v-model="email" type="email" placeholder="Email" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
        <input v-model="password" type="password" placeholder="Senha" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
        <div v-if="error" class="text-red-500 text-sm text-center">{{ error }}</div>
        <button type="submit" class="w-full py-2 rounded bg-indigo-600 dark:bg-indigo-500 text-white font-medium">Registrar</button>
        <NuxtLink to="/login" class="w-full block text-center py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mt-2">Voltar para login</NuxtLink>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function onRegister() {
  error.value = ''
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value, email: email.value, password: password.value })
    })
    const data = await res.json()
    if (data.ok) {
      router.push('/login')
    } else {
      error.value = data.error || 'Erro ao registrar.'
    }
  } catch (e) {
    error.value = 'Erro de conexão.'
  }
}
</script>

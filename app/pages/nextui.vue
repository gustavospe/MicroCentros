<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-2 bg-gradient-to-br from-indigo-50 to-indigo-200 dark:from-gray-900 dark:to-gray-800">
    <h1 class="text-4xl font-bold mb-8 text-indigo-700 dark:text-indigo-300">Exemplo NextUI</h1>
    <ClientOnly>
      <NextUIBtn color="primary">Botão NextUI</NextUIBtn>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { Button as NextUIBtn } from '@nextui-org/react'
</script>

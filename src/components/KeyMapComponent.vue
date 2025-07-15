<template>
    <div v-if="meta.length" class="relative p-4 bg-gray-100 rounded-md font-mono text-sm text-gray-800 select-text whitespace-pre-wrap">
        <div class="absolute top-2 right-2">
            <BaseButton @click="onCopy" color="bg-green-600" icon="ClipboardDocumentIcon" tooltip="Копировать в буфер обмена" />
        </div>
        <h3 class="mb-2 font-semibold text-gray-900">Карта ключей:</h3>
        <div>{</div>
        <div v-for="(item, index) in meta" :key="index" class="pl-4">
            "<span class="text-blue-700">{{ item.id }}</span>": "<span class="text-gray-600">{{ item.meta }}</span>",
        </div>
        <div>}</div>
    </div>
</template>

<script setup>
import BaseButton from "@/components/base/BaseButton.vue";

defineProps({
    meta: {
        type: Array,
        required: true,
    },
    onCopy: {
        type: Function,
        required: true,
    }
});
</script>

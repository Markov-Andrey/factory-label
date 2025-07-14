<template>
    <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center gap-4">
        <button
                @click="$emit('page-change', currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
            ← Назад
        </button>
        <span>Страница {{ currentPage }} из {{ totalPages }}</span>
        <button
                @click="$emit('page-change', currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
            Вперёд →
        </button>
    </div>
</template>

<script>
export default {
    name: 'PaginationControls',
    props: {
        currentPage: { type: Number, required: true },
        totalPages: { type: Number, required: true },
    },
};
</script>

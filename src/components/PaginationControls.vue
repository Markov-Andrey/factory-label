<template>
    <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center gap-4">
        <BaseButton
            @click="$emit('page-change', currentPage - 1)"
            :disabled="currentPage === 1"
            color="bg-mascot"
        >
            ← Назад
        </BaseButton>
        <span>Страница {{ currentPage }} из {{ totalPages }}</span>
        <BaseButton
            @click="$emit('page-change', currentPage + 1)"
            :disabled="currentPage === totalPages"
            color="bg-mascot"
        >
            Вперёд →
        </BaseButton>
    </div>
</template>

<script>
import BaseButton from "@/components/base/BaseButton.vue";

export default {
    name: 'PaginationControls',
    components: {BaseButton},
    props: {
        currentPage: { type: Number, required: true },
        totalPages: { type: Number, required: true },
    },
};
</script>

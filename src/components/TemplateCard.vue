<template>
    <div
            class="template-card relative border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow hover-with-buttons"
    >
        <div class="flex justify-between items-center px-2 bg-green-50 border-b rounded-t-lg">
            <h2 class="text-lg font-semibold truncate max-w-[70%] text-gray-900">
                {{ template.name }}
            </h2>
            <span
                    v-if="template.tags"
                    class="bg-gray-300 text-gray-700 text-xs font-medium px-3 py-1 rounded-full truncate max-w-[25%]"
                    title="Тег"
            >
        {{ template.tags }}
      </span>
        </div>

        <router-link :to="`/templates/${template.id}`" class="block">
            <div class="relative w-full h-48 sm:h-56 md:h-48 lg:h-56 flex items-center justify-center">
                <img
                        v-if="template.preview_path"
                        :src="apiBaseUrl + '/' + template.preview_path"
                        alt="preview"
                        class="max-w-full max-h-full object-contain"
                />
                <div v-else class="text-gray-400 italic">Нет превью</div>
            </div>
        </router-link>

        <div
                class="button-overlay absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm px-3 py-2 flex justify-center gap-2 opacity-0 pointer-events-none transition-opacity duration-200"
        >
            <div class="pointer-events-auto flex gap-2">
                <BaseButton @click="onDuplicate" icon="DocumentDuplicateIcon" color="bg-blue-600" tooltip="Создать дубликат" />
                <BaseButton @click="onEdit" icon="PencilSquareIcon" color="bg-green-600" tooltip="Редактировать" />
                <BaseButton @click="onDelete" icon="XCircleIcon" color="bg-red-600" tooltip="Удалить" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.hover-with-buttons:hover .button-overlay {
    opacity: 1;
    pointer-events: auto;
}
</style>

<script>
import BaseButton from "@/components/base/BaseButton.vue";

export default {
    name: "TemplateCard",
    components: { BaseButton },
    props: {
        template: { type: Object, required: true },
        apiBaseUrl: { type: String, required: true },
    },
    emits: ['duplicate', 'edit', 'delete'],
    methods: {
        onDuplicate(e) {
            e.stopPropagation()
            this.$emit('duplicate', this.template)
        },
        onEdit(e) {
            e.stopPropagation()
            this.$emit('edit', this.template)
        },
        onDelete(e) {
            e.stopPropagation()
            this.$emit('delete', this.template)
        },
    },
}
</script>

<template>
    <div
            class="template-card relative rounded shadow hover:shadow-xl transition-shadow hover-with-buttons"
    >
        <div class="flex justify-between items-center px-2 bg-gray-600 border-b rounded-t-lg">
            <h2 class="text-lg font-semibold truncate max-w-[70%] text-white">
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
            <div class="relative w-full flex items-center justify-center" style="height: 200px;">
                <img
                        v-if="template.preview_path"
                        :src="apiBaseUrl + '/' + template.preview_path"
                        alt="preview"
                        class="max-w-full max-h-full object-contain"
                />
                <div
                        v-else
                        class="text-gray-400 italic absolute left-1/2 top-1/2 text-xl font-bold"
                        style="transform: translate(-50%, -50%); margin-top: -10px;"
                >
                    Нет превью
                </div>
            </div>
        </router-link>

        <div class="button-overlay rounded absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm px-3 py-2 flex justify-center gap-2 opacity-0 pointer-events-none transition-opacity duration-200">
            <div class="pointer-events-auto flex gap-2">
                <BaseButton @click="onRename" icon="PencilSquareIcon" color="bg-gray-600" placement="top" tooltip="Переименовать"/>
                <BaseButton @click="onDuplicate" icon="DocumentDuplicateIcon" color="bg-gray-600" placement="top" tooltip="Создать дубликат" />
                <BaseButton @click="onEdit" icon="PaintBrushIcon" color="bg-gray-600" placement="top" tooltip="Редактировать" />
                <BaseButton @click="onDelete" icon="XCircleIcon" color="bg-gray-600" placement="top" tooltip="Удалить" />
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
    emits: ['duplicate', 'edit', 'delete', 'rename'],
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
        onRename(e) {
            e.stopPropagation()
            this.$emit('rename', this.template)
        },
    },
}
</script>

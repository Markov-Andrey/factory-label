<template>
    <div
            class="relative rounded shadow hover:shadow-xl transition-shadow hover-with-buttons"
    >
        <div class="grid items-start gap-0.5 px-3 py-1 bg-mascot rounded-t-lg">
            <h2 class="font-semibold truncate text-white leading-tight">
                {{ template.name }}
            </h2>
            <span
                v-if="template.tags"
                class="text-[14px] text-white/80 font-normal"
            >
                #{{ template.tags }}
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
                <BaseButton @click="onRename" icon="PencilSquareIcon" color="bg-mascot" placement="top" tooltip="Переименовать"/>
                <BaseButton @click="onDuplicate" icon="DocumentDuplicateIcon" color="bg-mascot" placement="top" tooltip="Создать копию" />
                <BaseButton @click="onEdit" icon="PaintBrushIcon" color="bg-mascot" placement="top" tooltip="Редактировать" />
                <BaseButton @click="onDelete" icon="XCircleIcon" color="bg-danger" placement="top" tooltip="Удалить" />
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

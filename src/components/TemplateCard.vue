<template>
    <router-link
        :to="`/templates/${template.id}`"
        class="template-card block border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
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

        <div
            class="relative w-full h-48 sm:h-56 md:h-48 lg:h-56 flex items-center justify-center"
        >
            <img
                v-if="template.preview_path"
                :src="apiBaseUrl + '/' + template.preview_path"
                alt="preview"
                class="max-w-full max-h-full object-contain"
            />
            <div v-else class="text-gray-400 italic">Нет превью</div>
        </div>
    </router-link>
</template>

<script>
export default {
    name: "TemplateCard",
    props: {
        template: { type: Object, required: true },
        apiBaseUrl: { type: String, required: true },
    },
};
</script>

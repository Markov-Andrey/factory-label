<template>
    <div class="max-w-6xl mx-auto p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="border p-4 rounded">
                <h2 class="text-lg font-semibold mb-2">{{ template?.name || 'Шаблон' }}</h2>
                <div class="w-full h-64 bg-gray-100 flex items-center justify-center">
                    <img
                        v-if="template?.preview_path"
                        :src="`${apiBaseUrl}/${template.preview_path}`"
                        alt="preview"
                        class="max-h-full object-contain"
                    />
                    <div v-else class="text-gray-400 italic">Нет превью</div>
                </div>
            </div>

            <div class="border p-4 rounded">
                <h3 class="text-md font-semibold mb-2">Загрузите JSON-файл</h3>
                <input
                    type="file"
                    accept=".json"
                    @change="handleFileUpload"
                    class="mb-4"
                />
                <div v-if="previewImageUrl" class="max-h-full object-contain">
                    <img
                        :src="previewImageUrl"
                        alt="Предпросмотр"
                        class="max-w-full max-h-64 object-contain"
                    />
                </div>
                <div v-else-if="errorMessage" class="mt-4 text-red-600 font-semibold">
                    {{ errorMessage }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'TemplateSinglePage',
    data() {
        return {
            template: null,
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            previewImageUrl: null,
            errorMessage: null,
        }
    },
    async mounted() {
        try {
            const { data } = await axios.get(`${this.apiBaseUrl}/api/templates/${this.$route.params.id}`)
            this.template = data
        } catch (e) {
            console.error(e)
        }
    },
    methods: {
        handleFileUpload({ target }) {
            const file = target.files[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = async (e) => {
                try {
                    const json = JSON.parse(e.target.result)
                    const obj = Array.isArray(json) && json.length ? json[0] : json
                    this.errorMessage = null
                    this.previewImageUrl = null
                    await this.sendPreview(obj)
                } catch {
                    this.errorMessage = 'Ошибка при разборе JSON файла.'
                    this.previewImageUrl = null
                }
            }
            reader.readAsText(file)
        },
        async sendPreview(previewData) {
            try {
                const payload = { template_id: this.template?.id, data: previewData }
                const { data } = await axios.post(`${this.apiBaseUrl}/api/generate-preview`, payload)
                this.previewImageUrl = typeof data === 'string' ? data : data.url || null
                this.errorMessage = null
            } catch (e) {
                this.errorMessage = 'Ошибка при отправке предпросмотра.'
                this.previewImageUrl = null
                console.error(e)
            }
        },
    },
}
</script>

<style scoped></style>

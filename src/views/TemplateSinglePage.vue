<template>
    <div class="max-w-6xl mx-auto p-6">
        <div class="grid grid-cols-2 grid-rows-[auto_1fr] gap-6 mt-4">
            <h2 class="text-lg font-semibold border rounded p-4 flex items-center justify-center">
                {{ template?.name || 'Шаблон' }}
            </h2>

            <h3 class="text-md font-semibold border rounded p-4 flex flex-col items-center">
                Загрузите JSON-файл

                <!-- Скрытый инпут -->
                <input
                    id="json-upload"
                    type="file"
                    accept=".json"
                    @change="handleFileUpload"
                    class="hidden"
                    ref="fileInput"
                />

                <BaseButton tooltip="Назад" @click="$refs.fileInput.click()" color="bg-gray-600" icon="ArrowDownOnSquareIcon">
                    Выбрать файл
                </BaseButton>
                <div v-if="objectCount !== null" class="text-sm text-gray-600 mt-2 text-center">
                    Количество объектов: <strong>{{ objectCount }}</strong>
                </div>
            </h3>

            <section
                class="flex items-center justify-center overflow-hidden h-[256px]"
            >
                <img
                    v-if="template?.preview_path"
                    :src="`${apiBaseUrl}/${template.preview_path}`"
                    alt="preview"
                    class="border rounded max-h-full max-w-full object-contain"
                />
                <div v-else class="text-gray-400 italic">Нет превью</div>
            </section>

            <section
                class="flex items-center justify-center overflow-hidden h-[256px]"
            >
                <img
                    v-if="previewImageUrl"
                    :src="previewImageUrl"
                    alt="Предпросмотр"
                    class="border rounded max-h-full max-w-full object-contain"
                />
                <div v-else-if="errorMessage" class="text-red-600 font-semibold italic p-4 text-center">
                    {{ errorMessage }}
                </div>
                <div v-else class="text-gray-400 italic">Нет превью</div>
            </section>
        </div>
        <div class="flex gap-2 items-center justify-center m-5">
            <BaseButton tooltip="К выбору шаблона" @click="exit" color="bg-gray-600" icon="ArrowLeftEndOnRectangleIcon">
                Назад
            </BaseButton>
            <BaseButton
                :disabled="!(objectCount > 0 && previewImageUrl)"
                tooltip="Полная обработка файла"
                color="bg-gray-600"
                icon="PlusCircleIcon"
                @click="upload"
            >
                Обработать
            </BaseButton>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import BaseButton from "@/components/base/BaseButton.vue";

export default {
    name: 'TemplateSinglePage',
    components: { BaseButton },
    data() {
        return {
            template: null,
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            previewImageUrl: null,
            errorMessage: null,
            fullJson: null,
            objectCount: null,
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
                    this.fullJson = json
                    const firstObj = Array.isArray(json) && json.length ? json[0] : json
                    this.errorMessage = null
                    this.previewImageUrl = null
                    this.objectCount = Array.isArray(json) ? json.length : 0
                    await this.sendPreview(firstObj)
                } catch {
                    this.errorMessage = 'Ошибка при разборе JSON файла.'
                    this.previewImageUrl = null
                    this.objectCount = null
                    this.fullJson = null
                }
            }
            reader.readAsText(file)
        },
        exit() { this.$router.push('/'); },
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
        async upload() {
            if (!this.fullJson || !this.template) {
                this.errorMessage = 'Нет данных для отправки.'
                return
            }
            try {
                const { data } = await axios.post(`${this.apiBaseUrl}/api/upload-data`, {
                    template_id: this.template.id,
                    data: this.fullJson
                })
                const url = typeof data === 'string' ? data : data.url
                if (url) {
                    const a = document.createElement('a')
                    a.href = url
                    a.download = ''
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                }
            } catch {
                this.errorMessage = 'Ошибка при отправке данных.'
            }
        }
    },
}
</script>

<style scoped></style>

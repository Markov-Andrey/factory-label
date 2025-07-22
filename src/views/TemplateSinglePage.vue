<template>
    <div class="max-w-6xl mx-auto p-6">
        <div class="grid grid-cols-2 grid-rows-[auto_1fr_auto] gap-6 mt-4">
            <div class="border rounded p-4 flex flex-col justify-center items-center">
                <h2 class="text-2xl font-bold text-black"> {{ template?.name || 'Шаблон' }} </h2>
                <span v-if="template?.tags" class="text-sm text-gray-500 px-3 py-1 rounded"> #{{ template.tags }} </span>
            </div>

            <div class="text-md font-semibold border rounded p-4 flex flex-col items-center">
                Загрузите JSON-файл
                <input
                    id="json-upload"
                    type="file"
                    accept=".json"
                    @change="handleFileUpload"
                    class="hidden"
                    ref="fileInput"
                />
                <BaseButton tooltip="Загрузить файл" @click="$refs.fileInput.click()" color="bg-mascot" icon="ArrowDownOnSquareIcon">
                    Выбрать файл
                </BaseButton>
                <div v-if="objectCount !== null" class="text-sm text-gray-600 mt-2 text-center">
                    Количество объектов: <strong>{{ objectCount }}</strong>
                </div>
            </div>

            <div class="col-span-2 border rounded p-4">
                <h3 class="text-md font-medium mb-2">Карта ключей</h3>
                <div class="grid grid-cols-4 gap-1 max-h-48 overflow-auto">
                    <div
                        v-for="(value, key) in meta"
                        :key="key"
                        :class="[
                            'px-3 py-1 rounded whitespace-nowrap',
                            {
                              'text-gray-500 bg-gray-100': value === null,
                              'text-green-600 bg-green-100': value === true,
                              'text-red-600 bg-red-100': value === false,
                            }
                        ]"
                    >
                        {{ key }}
                    </div>
                </div>
            </div>

            <section class="flex items-center justify-center overflow-hidden h-[256px]">
                <img
                    v-if="template?.preview_path"
                    :src="`${apiBaseUrl}/${template.preview_path}`"
                    alt="preview"
                    class="border rounded h-full max-w-full object-contain"
                />
                <div v-else class="text-gray-400 italic">Нет превью</div>
            </section>

            <section class="flex items-center justify-center overflow-hidden h-[256px]">
                <img
                    v-if="previewImageUrl"
                    :src="previewImageUrl"
                    alt="Предпросмотр"
                    class="border rounded h-full max-w-full object-contain"
                />
                <div v-else-if="errorMessage" class="text-red-600 font-semibold italic p-4 text-center">
                    {{ errorMessage }}
                </div>
                <div v-else class="text-gray-400 italic">Нет превью</div>
            </section>
        </div>

        <div v-if="jobId" class="flex gap-2 items-center justify-center m-5">
            <div class="w-full" v-if="!result_zip_path">
                <div class="flex justify-between mb-1">
                    <span class="text-base font-medium">{{ statusMap[status] }}</span>
                    <span class="text-sm font-medium">{{ displayedPercent }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                        class="bg-mascot h-2.5 rounded-full transition-all duration-[1500ms] ease-in-out"
                        :style="{ width: progressPercent + '%' }"
                    />
                </div>
            </div>
            <div v-else>
                <BaseButton
                    tooltip="Скачать архив"
                    color="bg-mascot"
                    icon="ArchiveBoxArrowDownIcon"
                    @click="downloadZip"
                >
                    Скачать
                </BaseButton>
            </div>
        </div>

        <div class="flex gap-2 items-center justify-center m-5">
            <BaseButton tooltip="К выбору шаблона" @click="exit" color="bg-danger" icon="ArrowLeftEndOnRectangleIcon">
                Назад
            </BaseButton>
            <BaseButton
                :disabled="!(objectCount > 0 && previewImageUrl)"
                tooltip="Полная обработка файла"
                color="bg-mascot"
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
            meta: null,
            metaJson: {},
            template: null,
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            previewImageUrl: null,
            errorMessage: null,
            fullJson: null,
            objectCount: null,
            result_zip_path: null,
            progressPercent: 0,
            displayedPercent: 0,
            status: 'queued',
            statusMap: {
                queued: 'В очереди',
                processed: 'В процессе',
                done: 'Готово',
                error: 'Ошибка',
            }
        }
    },
    computed: {
        jobId() {
            return this.$route.query.id
        }
    },
    watch: {
        jobId(newId) {
            if (newId && !this.statusInterval) {
                this.startJobPolling()
            }
        },
        progressPercent(newVal) {
            this.animatePercent(newVal)
        }
    },
    async mounted() {
        try {
            const { data } = await axios.get(`${this.apiBaseUrl}/api/templates/${this.$route.params.id}`)
            this.template = data
            this.canvasMeta()
        } catch (e) {
            console.error(e)
        }
        if (this.jobId && !this.result_zip_path) {
            this.statusInterval = setInterval(() => {
                this.checkJobStatus()
            }, 3000)
        }
    },
    beforeUnmount() {
        clearInterval(this.statusInterval);
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
                    this.metaJson = Object.keys(firstObj);
                    this.meta = Object.fromEntries(
                        Object.entries(this.meta).map(([key]) => [
                            key,
                            !!this.metaJson.includes(key),
                        ])
                    );
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
        exit() {
            this.$router.push('/');
        },
        async sendPreview(previewData) {
            try {
                const payload = { template_id: this.template?.id, data: previewData }
                const { data } = await axios.post(`${this.apiBaseUrl}/api/jobs`, payload)
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
                this.result_zip_path = null;
                this.progressPercent = 0;
                this.displayedPercent = 0;
                this.status = 'queued';
                const { data } = await axios.post(`${this.apiBaseUrl}/api/jobs/upload`, {
                    template_id: this.template.id,
                    data: this.fullJson
                })
                this.$router.push({ path: this.$route.path, query: { ...this.$route.query, id: data.id } })
                this.startJobPolling()
            } catch {
                this.errorMessage = 'Ошибка при отправке данных.'
            }
        },
        async checkJobStatus() {
            if (!this.jobId) return;

            try {
                const { data } = await axios.get(`${this.apiBaseUrl}/api/jobs/status/${this.jobId}`);

                if (data.status === 'done') {
                    clearInterval(this.statusInterval);
                    this.result_zip_path = data.result_zip_path;
                    this.progressPercent = 100;
                } else if (data.status === 'error') {
                    clearInterval(this.statusInterval);
                    console.error('Ошибка:', data.error_message);
                    this.errorMessage = `Ошибка при генерации: ${data.error_message}`;
                } else if (data.status === 'processed' && data.records_total > 0) {
                    this.status = data.status;
                    this.progressPercent = Math.floor((data.records_done / data.records_total) * 100);
                }
            } catch (e) {
                console.error('Ошибка при запросе статуса', e);
            }
        },
        startJobPolling() {
            this.statusInterval = setInterval(() => {
                this.checkJobStatus()
            }, 3000)
        },
        downloadZip() {
            const url = this.result_zip_path;
            if (url) {
                const a = document.createElement('a');
                a.href = url;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        },
        animatePercent(target) {
            if (this.percentInterval) clearInterval(this.percentInterval)

            this.percentInterval = setInterval(() => {
                if (this.displayedPercent < target) {
                    this.displayedPercent++
                } else if (this.displayedPercent > target) {
                    this.displayedPercent--
                } else {
                    clearInterval(this.percentInterval)
                }
            }, 100)
        },
        canvasMeta() {
            try {
                const objects = JSON.parse(this.template?.template)?.objects || [];
                const ids = [...new Set(objects.filter(o => o.meta && o.id?.trim()).map(o => o.id.trim()))];
                this.meta = Object.fromEntries(ids.map(id => [id, null]));
            } catch {
                this.meta = {};
            }
        },
    },
}
</script>

<style scoped></style>

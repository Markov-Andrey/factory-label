<template>
    <div class="max-w-6xl mx-auto p-6">
        <button
            @click="openModal('create')"
            class="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            Создать
        </button>

        <div v-if="list.length === 0" class="text-center text-gray-500 mt-10">
            Пока нет ни одного шаблона.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <TemplateCard
                v-for="tpl in list"
                :key="tpl.id"
                :template="tpl"
                :apiBaseUrl="api"
                @duplicate="handleDuplicate"
                @edit="handleEdit"
                @delete="handleDelete"
                @rename="handleRename"
            />
        </div>

        <PaginationControls :currentPage="page" :totalPages="pages" @page-change="go" />

        <div
            v-if="modalVisible"
            class="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm"
        >
            <div class="bg-white p-6 rounded shadow-md w-96">
                <h2 class="text-xl mb-4">{{ modalTitle }}</h2>
                <BaseInput v-model="name" type="text" label="Название" class="w-full" />
                <BaseInput v-model="tags" type="text" label="Тег" class="w-full" />
                <div class="flex justify-end space-x-2">
                    <BaseButton @click="closeModal" color="bg-gray-500">Отмена</BaseButton>
                    <BaseButton @click="submitModal" :disabled="!name.trim() || loading" color="bg-blue-600">
                        {{ modalButtonText }}
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TemplateCard from '../components/TemplateCard.vue'
import PaginationControls from '../components/PaginationControls.vue'
import axios from 'axios'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

export default {
    name: 'TemplatesPage',
    components: { BaseButton, BaseInput, TemplateCard, PaginationControls },
    data() {
        return {
            list: [],
            page: 1,
            pages: 1,
            perPage: 20,
            api: import.meta.env.VITE_API_BASE_URL,
            modalVisible: false,
            modalType: '',
            currentId: null,
            name: '',
            tags: '',
            loading: false
        }
    },
    computed: {
        modalTitle() {
            return {
                create: 'Создать новый шаблон',
                duplicate: 'Дублировать шаблон',
                rename: 'Переименовать шаблон'
            }[this.modalType] || ''
        },
        modalButtonText() {
            return {
                create: 'Создать',
                duplicate: 'Создать копию',
                rename: 'Переименовать'
            }[this.modalType] || ''
        }
    },
    methods: {
        async fetch(p = 1) {
            try {
                const { data } = await axios.get(`${this.api}/api/templates`, {
                    params: { page: p, per_page: this.perPage }
                })
                this.list = data.data
                this.page = data.current_page
                this.pages = data.last_page
            } catch {}
        },
        go(p) {
            if (p >= 1 && p <= this.pages) this.fetch(p)
        },
        openModal(type, template = null) {
            this.modalType = type
            this.modalVisible = true
            this.loading = false
            if (template) {
                this.name = template.name
                this.tags = template.tags
                this.currentId = template.id
            } else {
                this.name = ''
                this.tags = ''
                this.currentId = null
            }
        },
        closeModal() {
            this.modalVisible = false
            this.name = ''
            this.tags = ''
            this.currentId = null
            this.loading = false
        },
        async submitModal() {
            if (!this.name.trim()) return
            this.loading = true
            try {
                if (this.modalType === 'create') {
                    const { data } = await axios.post(`${this.api}/api/templates/store`, {
                        name: this.name.trim(),
                        tags: this.tags.trim()
                    })
                    this.$router.push({ name: 'LabelEditor', params: { id: data.id } })
                } else if (this.modalType === 'duplicate') {
                    const { data } = await axios.post(`${this.api}/api/templates/duplicate`, {
                        id: this.currentId,
                        name: this.name.trim(),
                        tags: this.tags.trim()
                    })
                    this.$router.push({ name: 'LabelEditor', params: { id: data.id } })
                } else if (this.modalType === 'rename') {
                    await axios.patch(`${this.api}/api/templates/${this.currentId}`, {
                        name: this.name.trim(),
                        tags: this.tags.trim()
                    })
                    await this.fetch(this.page)
                }
                this.closeModal()
            } catch (e) {
                console.error('Ошибка:', e)
            } finally {
                this.loading = false
            }
        },
        handleDuplicate(template) {
            this.openModal('duplicate', template)
        },
        handleRename(template) {
            this.openModal('rename', template)
        },
        handleEdit(template) {
            this.$router.push({ name: 'LabelEditor', params: { id: template.id } })
        },
        async handleDelete(template) {
            if (!confirm(`Удалить шаблон "${template.name}"?`)) return
            try {
                await axios.delete(`${this.api}/api/templates/${template.id}`)
                await this.fetch(this.page)
            } catch (e) {
                console.error('Ошибка при удалении шаблона:', e)
            }
        }
    },
    mounted() {
        this.fetch()
    }
}
</script>

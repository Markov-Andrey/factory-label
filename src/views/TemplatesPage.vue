<template>
    <div class="max-w-6xl mx-auto p-6">
        <div class="my-2 flex gap-2">
            <BaseButton @click="openModal('create')" color="bg-blue-600">Создать</BaseButton>
            <BaseSelect v-model="selectedTag" :options="tags" tooltip="Выбрать тег"/>
            <BaseInput v-model="nameTemplate" type="text" label="Название" class="" />
        </div>

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
    </div>

    <div
        v-if="modalVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm"
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
</template>

<script>
import TemplateCard from '../components/TemplateCard.vue'
import PaginationControls from '../components/PaginationControls.vue'
import axios from 'axios'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSelect from "@/components/base/BaseSelect.vue";

export default {
    name: 'TemplatesPage',
    components: { BaseSelect, BaseButton, BaseInput, TemplateCard, PaginationControls },
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
            nameTemplate: '',
            tags: [],
            selectedTag: null,
            loading: false,
        }
    },
    watch: {
        selectedTag(newTag) {
            this.go(1, newTag, this.nameTemplate)
        },
        nameTemplate(newName) {
            this.go(1, this.selectedTag, newName)
        }
    },
    computed: {
        modalTitle() {
            return {
                create: 'Создать',
                duplicate: 'Создать копию',
                rename: 'Переименовать',
            }[this.modalType] || ''
        },
        modalButtonText() {
            return this.modalTitle
        }
    },
    created() {
        this.selectedTag = this.$route.query.tag || null
        this.nameTemplate = this.$route.query.name || null
        this.page = Number(this.$route.query.page) || 1
        this.fetch(this.page)
        this.fetchTags()
    },
    methods: {
        async fetchTags() {
            try {
                const res = await axios.get(`${this.api}/api/templates/tags`)
                this.tags = [null, ...res.data]
            } catch (e) {
                console.error('Ошибка при загрузке тегов:', e)
            }
        },
        async fetch(page = 1) {
            this.loading = true
            try {
                const { data } = await axios.get(`${this.api}/api/templates`, {
                    params: {
                        page,
                        per_page: this.perPage,
                        tag: this.selectedTag || undefined,
                        name: this.nameTemplate || undefined,
                    }
                })
                this.list = data.data
                this.page = data.current_page
                this.pages = data.last_page
            } catch (e) {
                console.error('Ошибка при загрузке шаблонов:', e)
            } finally {
                this.loading = false
            }
        },
        go(page = this.page, tag = this.selectedTag, name = this.nameTemplate) {
            const tagChanged = this.selectedTag !== tag
            const nameChanged = this.nameTemplate !== name
            const pageChanged = this.page !== page

            if (!tagChanged && !nameChanged && !pageChanged) return

            this.page = page
            if (tagChanged) this.selectedTag = tag
            if (nameChanged) this.nameTemplate = name

            this.fetch(page)
            this.$router.replace({
                query: {
                    page,
                    tag: tag || undefined,
                    name: name || undefined,
                }
            })
        },
        openModal(type, template = null) {
            this.modalType = type
            this.modalVisible = true
            this.loading = false
            if (template) {
                this.name = template.name || ''
                this.tags = template.tags || ''
                this.currentId = template.id || null
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
            const nameTrimmed = this.name.trim()
            if (!nameTrimmed) return

            this.loading = true
            try {
                const payload = { name: nameTrimmed, tags: this.tags.trim() }
                const apiCalls = {
                    create: () => axios.post(`${this.api}/api/templates/store`, payload),
                    duplicate: () => axios.post(`${this.api}/api/templates/duplicate`, { ...payload, id: this.currentId }),
                    rename: () => axios.patch(`${this.api}/api/templates/${this.currentId}`, payload),
                }
                const res = await apiCalls[this.modalType]()

                if (res?.data?.id) {
                    this.$router.push({ name: 'LabelEditor', params: { id: res.data.id } })
                }

                if (this.modalType === 'rename') {
                    await this.fetch(this.page)
                }

                this.closeModal()
            } catch (e) {
                console.error('Ошибка при сохранении шаблона:', e)
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
    }
}
</script>

<template>
    <div class="max-w-6xl mx-auto p-6">
        <button
            @click="modal = true"
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
            />
        </div>

        <PaginationControls :currentPage="page" :totalPages="pages" @page-change="go" />

        <!-- Модалка создания -->
        <div v-if="modal" class="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
            <div class="bg-white p-6 rounded shadow-md w-96">
                <h2 class="text-xl mb-4">Создать новый шаблон</h2>
                <BaseInput v-model="name" type="text" label="Название" class="w-full" />
                <BaseInput v-model="tags" type="text" label="Тег" class="w-full" />
                <div class="flex justify-end space-x-2">
                    <BaseButton @click="modal = false" color="bg-gray-500">Отмена</BaseButton>
                    <BaseButton @click="create" :disabled="!name.trim() || loading" color="bg-blue-600">Создать</BaseButton>
                </div>
            </div>
        </div>

        <!-- Модалка дублирования -->
        <div v-if="duplicateModal" class="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
            <div class="bg-white p-6 rounded shadow-md w-96">
                <h2 class="text-xl mb-4">Дублировать шаблон</h2>
                <BaseInput v-model="name" type="text" label="Название" class="w-full" />
                <BaseInput v-model="tags" type="text" label="Тег" class="w-full" />
                <div class="flex justify-end space-x-2">
                    <BaseButton @click="duplicateModal = false" color="bg-gray-500">Отмена</BaseButton>
                    <BaseButton @click="duplicateCreate" :disabled="!name.trim() || loading" color="bg-blue-600">Создать копию</BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TemplateCard from '../components/TemplateCard.vue';
import PaginationControls from '../components/PaginationControls.vue';
import axios from 'axios';
import BaseInput from "@/components/base/BaseInput.vue";
import BaseButton from "@/components/base/BaseButton.vue";

export default {
    name: 'TemplatesPage',
    components: {BaseButton, BaseInput, TemplateCard, PaginationControls },
    data() {
        return {
            list: [],
            page: 1,
            pages: 1,
            perPage: 20,
            api: import.meta.env.VITE_API_BASE_URL,
            modal: false,
            duplicateModal: false,
            duplicateId: null,
            name: '',
            tags: '',
            loading: false,
        };
    },
    methods: {
        async fetch(p = 1) {
            try {
                const { data } = await axios.get(`${this.api}/api/templates`, {
                    params: { page: p, per_page: this.perPage },
                });
                this.list = data.data;
                this.page = data.current_page;
                this.pages = data.last_page;
            } catch {}
        },
        go(p) {
            if (p >= 1 && p <= this.pages) this.fetch(p);
        },
        async create() {
            if (!this.name.trim()) return;
            this.loading = true;
            try {
                const { data } = await axios.post(`${this.api}/api/templates/store`, {
                    name: this.name.trim(),
                    tags: this.tags.trim(),
                });
                this.modal = false;
                this.name = '';
                this.tags = '';
                this.$router.push({ name: 'LabelEditor', params: { id: data.id } });
            } catch {} finally {
                this.loading = false;
            }
        },
        async handleDuplicate(template) {
            this.template = template.name;
            this.tags = template.tags;
            this.duplicateId = template.id;
            this.duplicateModal = true;
        },
        handleEdit(template) {
            this.$router.push({ name: 'LabelEditor', params: { id: template.id } });
        },
        async handleDelete(template) {
            if (!confirm(`Удалить шаблон "${template.name}"?`)) return;
            try {
                await axios.delete(`${this.api}/api/templates/${template.id}`);
                await this.fetch(this.page);
            } catch (error) {
                console.error('Ошибка при удалении шаблона:', error);
            }
        },
        async duplicateCreate() {
            if (!this.name.trim()) return;
            this.loading = true;
            try {
                const { data } = await axios.post(`${this.api}/api/templates/duplicate`, {
                    name: this.name.trim(),
                    tags: this.tags.trim(),
                    id: this.duplicateId,
                });
                this.duplicateModal = false;
                this.name = '';
                this.tags = '';
                this.$router.push({ name: 'LabelEditor', params: { id: data.id } });
            } catch (e) {
                console.error('Ошибка при дублировании:', e);
            } finally {
                this.loading = false;
            }
        },
    },
    mounted() {
        this.fetch();
    },
};
</script>

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
            />
        </div>

        <PaginationControls
            :currentPage="page"
            :totalPages="pages"
            @page-change="go"
        />

        <div
            v-if="modal"
            class="fixed inset-0 flex items-center justify-center bg-opacity-30 backdrop-blur-sm"
        >
            <div class="bg-white p-6 rounded shadow-md w-96">
                <h2 class="text-xl mb-4">Создать новый шаблон</h2>
                <input
                    v-model="name"
                    type="text"
                    placeholder="Название"
                    class="w-full mb-4 border border-gray-300 rounded px-3 py-2"
                />
                <input
                    v-model="tags"
                    type="text"
                    placeholder="Теги"
                    class="w-full mb-4 border border-gray-300 rounded px-3 py-2"
                />
                <div class="flex justify-end space-x-2">
                    <button
                        @click="modal = false"
                        class="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Отмена
                    </button>
                    <button
                        @click="create"
                        :disabled="!name.trim() || loading"
                        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Создать
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TemplateCard from '../components/TemplateCard.vue';
import PaginationControls from '../components/PaginationControls.vue';
import axios from 'axios';
import LabelEditor from "@/views/LabelEditor.vue";

export default {
    name: 'TemplatesPage',
    components: { TemplateCard, PaginationControls },
    data() {
        return {
            list: [],
            page: 1,
            pages: 1,
            perPage: 20,
            api: import.meta.env.VITE_API_BASE_URL,
            modal: false,
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
    },
    mounted() {
        this.fetch();
    },
};
</script>

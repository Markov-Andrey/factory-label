<template>
    <div class="max-w-6xl mx-auto p-6">
        <div v-if="templates.length === 0" class="text-center text-gray-500 mt-10">
            Пока нет ни одного шаблона.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <TemplateCard
                v-for="tpl in templates"
                :key="tpl.id"
                :template="tpl"
                :apiBaseUrl="apiBaseUrl"
            />
        </div>

        <PaginationControls
            :currentPage="currentPage"
            :totalPages="totalPages"
            @page-change="goToPage"
        />
    </div>
</template>

<script>
import TemplateCard from '../components/TemplateCard.vue';
import PaginationControls from '../components/PaginationControls.vue';
import axios from 'axios';

export default {
    name: 'TemplatesPage',
    components: { TemplateCard, PaginationControls },
    data() {
        return {
            templates: [],
            currentPage: 1,
            totalPages: 1,
            perPage: 20,
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
        };
    },
    methods: {
        async fetchTemplates(page = 1) {
            try {
                const response = await axios.get(
                    `${this.apiBaseUrl}/api/templates?page=${page}&per_page=${this.perPage}`
                );
                this.templates = response.data.data;
                this.currentPage = response.data.current_page;
                this.totalPages = response.data.last_page;
            } catch (e) {
                console.error('Ошибка при загрузке:', e);
            }
        },
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.fetchTemplates(page);
            }
        },
    },
    mounted() {
        this.fetchTemplates();
    },
};
</script>

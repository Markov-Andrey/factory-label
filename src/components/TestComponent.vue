<template>
    <div>
        <h2>SVG to JSON Rect Parser</h2>
        <input type="file" accept=".svg" @change="handleFile" />
        <pre v-if="jsonOutput">{{ JSON.stringify(jsonOutput, null, 2) }}</pre>
    </div>
</template>

<script>
export default {
    data() {
        return {
            jsonOutput: null,
        };
    },
    methods: {
        handleFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const svgText = e.target.result;
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgText, "image/svg+xml");

                this.jsonOutput = Array.from(doc.querySelectorAll("rect")).map((rect) => ({
                    x: Number(rect.getAttribute("x")),
                    y: Number(rect.getAttribute("y")),
                    width: Number(rect.getAttribute("width")),
                    height: Number(rect.getAttribute("height")),
                    fill: rect.getAttribute("fill"),
                    stroke: rect.getAttribute("stroke"),
                    strokeWidth: rect.getAttribute("stroke-width"),
                }));
            };
            reader.readAsText(file);
        },
    },
};
</script>

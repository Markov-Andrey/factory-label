<template>
    <div style="display:none" ref="svgWrapper" v-html="svgContent"></div>
</template>

<script>
export default {
    data() {
        return {
            svgContent: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
        <path transform="translate(0,.5)" stroke="#000" d="m1.5,.5v22
M3,1h1m1,0h1m1,0h1m1,0h1m1,0h1m1,0h1m1,0h1m1,0h1m1,0h1m1,0h1
M4,2h3m1,0h2m2,0h1m2,0h1m3,0h4
M3,3h1m1,0h1m3,0h1m2,0h1m3,0h2m2,0h2
M7,4h1m1,0h2m3,0h1m3,0h2m1,0h2
M2,5h1m1,0h3m1,0h2m1,0h1m1,0h1m1,0h1m1,0h1m2,0h2
M2,6h3m1,0h2m2,0h2m1,0h1m2,0h1m3,0h3
M4,7h5m1,0h2m2,0h1m1,0h3m1,0h2
M2,8h2m2,0h2m1,0h1m1,0h2m1,0h1m1,0h2m2,0h3
M2,9h2m1,0h1m4,0h1m2,0h1m2,0h1m1,0h3
M2,10h1m1,0h3m3,0h4m2,0h2m2,0h3
M2,11h2m1,0h1m3,0h4m5,0h3
M2,12h1m2,0h1m3,0h3m1,0h3m5,0h2
M3,13h1m4,0h1m1,0h1m2,0h1m2,0h1m1,0h1m1,0h2
M2,14h5m5,0h1m2,0h3m2,0h3
M2,15h3m4,0h1m1,0h1m1,0h9
M2,16h1m2,0h1m2,0h2m1,0h1m1,0h3m1,0h2m2,0h2
M2,17h3m2,0h4m1,0h1m4,0h3m1,0h1
M2,18h2m1,0h1m2,0h1m2,0h5m1,0h1m1,0h4
M2,19h3m2,0h1m1,0h1m1,0h2m2,0h3
M2,20h2m1,0h3m2,0h1m1,0h1m1,0h1m1,0h2m2,0h3
M4,21h3m1,0h1m1,0h2m1,0h2m4,0h1
M1,22h22"/>
    </svg>`
        }
    },
    methods: {
        getSVGString() {
            return this.svgContent;
        }
    },
    expose: ['getSVGString']
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  tileUrl?: string
}>()

// Show a grid of preview tiles at zoom level 2
const defaultTile = 'https://a.tile.openstreetmap.org'
const tileBase = computed(() => {
  const url = props.tileUrl
  if (url) return url.replace('/{z}/{x}/{y}.png', '')
  return defaultTile
})
const tiles = [
  { z: 2, x: 2, y: 1 },
  { z: 2, x: 3, y: 1 },
  { z: 2, x: 2, y: 2 },
  { z: 2, x: 3, y: 2 }
]
</script>

<template>
  <div class="osm-preview">
    <div class="tile-grid">
      <img
        v-for="t in tiles"
        :key="`${t.z}-${t.x}-${t.y}`"
        :src="`${tileBase}/${t.z}/${t.x}/${t.y}.png`"
      />
    </div>
    <div class="label">OpenStreetMap Preview</div>
  </div>
</template>

<style scoped lang="less">
.osm-preview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}
.tile-grid {
  display: grid;
  grid-template-columns: 256px 256px;
  grid-template-rows: 256px 256px;
}
.tile-grid img {
  width: 256px;
  height: 256px;
  display: block;
}
.label {
  margin-top: 12px;
  color: #8f959e;
  font-size: 14px;
}
</style>

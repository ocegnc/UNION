<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../services/api.js';

const testResults = ref([]);
const error = ref('');

onMounted(async () => {
  const endpoints = ['categorie', 'participant', 'questionnaire', 'question', 'choix', 'reponse'];
  
  for (let e of endpoints) {
    try {
      const res = await api.get(`/${e}`);
      testResults.value.push({ endpoint: e, data: res.data });
    } catch (err) {
      testResults.value.push({ endpoint: e, data: `Erreur: ${err.message}` });
    }
  }
});
</script>

<template>
  <div>
    <h2>Test Backend :</h2>
    <ul>
      <li v-for="r in testResults" :key="r.endpoint">
        <strong>{{ r.endpoint }}</strong> : {{ r.data }}
      </li>
    </ul>
  </div>
</template>

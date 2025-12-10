<template>
  <div class="form-container">
    <h2>Nouveau questionnaire</h2>

    <label>ID participant :</label>
    <input v-model="participantId" />

    <label>Catégorie (si nouveau participant) :</label>
    <select v-model="categorie">
      <option v-for="cat in categories" :key="cat.id_categorie" :value="cat.id_categorie.toString()">
        {{ cat.categorie }}
      </option>
    </select>

    <button @click="validate">Valider</button>

    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useParticipant } from "@/services/participantService";
import { useCategorie } from '@/services/categorieService';

const { getCategories } = useCategorie();
const categories = ref([]);
const router = useRouter();

const participantId = ref("");
const categorie = ref("1");
const error = ref("");

const { getParticipantById } = useParticipant();

onMounted(async () => {
  try {
    const res = await getCategories();
    categories.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = 'Impossible de charger les catégories';
  }
});

const validate = async () => {
  error.value = "";
  participantId.value = participantId.value.trim();
  if (!participantId.value) {
    alert("L'ID participant est obligatoire.");
    return;
  }

  let exist = false;
  let participantData = null;

  try {
    const res = await getParticipantById(participantId.value);
    participantData = res.data;
    exist = true;
  } catch (e) {
    exist = false;
    participantData = null;
    if (e.response && e.response.status !== 404) {
      console.error(e);
      error.value = "Erreur serveur";
    }
  }

  router.push({
    name: "questionnaire",
    query: {
      id: participantId.value,
      categorie: categorie.value,
      exist,
    },
    state: participantData,
  });
};
</script>

<style scoped>
.form-container {
  max-width: 400px;   /* taille réduite */
  margin: 40px auto;  /* centré avec un peu de marge haut/bas */
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  background-color: #61616161;
}

label {
  display: block;
  margin-top: 12px;
  font-weight: bold;
}

input, select {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
  box-sizing: border-box;
}

button {
  margin-top: 20px;
  padding: 10px;
  width: 100%;
  cursor: pointer;
}
</style>

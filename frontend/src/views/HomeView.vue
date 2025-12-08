<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useParticipant } from "@/services/participantService";
import { useCategorie } from '@/services/categorieService';

const { getCategories } = useCategorie();
const categories = ref([]);

const router = useRouter();

const participantId = ref("");
const categorie = ref("1"); // default 1
const error = ref("");

// Récupérer les fonctions de ton service
const { getParticipantById } = useParticipant();

onMounted(async () => {
  try {
    const res = await getCategories();
    categories.value = res.data; // tableau {id_categorie, categorie}
  } catch (err) {
    console.error(err);
    error.value = 'Impossible de charger les catégories';
  }
});

const validate = async () => {
  error.value = "";

  participantId.value = participantId.value.trim();
    // Vérification ID obligatoire
  if (!participantId.value || participantId.value.trim() === "") {
    alert("L'ID participant est obligatoire.");
    return;
  }
  let exist = false;
  let participantData = null;

  try {
    // API retourne un objet si trouvé, 404 si pas trouvé
    const res = await getParticipantById(participantId.value);
    participantData = res.data; // c'est déjà un objet
    exist = true;

  } catch (e) {
    // Si 404 ou autre erreur → participant inexistant
    exist = false;
    participantData = null;

    // Tu peux filtrer les 404 pour pas afficher dans console
    if (e.response && e.response.status !== 404) {
      console.error(e);
      error.value = "Erreur serveur";
    }
  }

  // Redirection vers la page questionnaire
  router.push({
    name: "questionnaire",
    query: {
      id: participantId.value,
      categorie: categorie.value,
      exist,
    },
    state: participantData, // pour préremplir
  });
};
</script>



<template>
  <div class="p-3">

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

<style scoped>
label {
  display: block;
  margin-top: 12px;
  font-weight: bold;
}
input, select {
  width: 100%;
  padding: 6px;
  margin-top: 4px;
}
button {
  margin-top: 20px;
  padding: 10px;
  width: 100%;
}
</style>
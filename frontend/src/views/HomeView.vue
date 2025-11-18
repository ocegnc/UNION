<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useParticipant } from "@/services/participantService";

const router = useRouter();

const participantId = ref("");
const categorie = ref("1"); // default 1
const error = ref("");

// Récupérer les fonctions de ton service
const { getParticipantById } = useParticipant();

const validate = async () => {
  error.value = "";

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

    <label>Catégorie :</label>
    <select v-model="categorie">
      <option value="1">Catégorie 1</option>
      <option value="2">Catégorie 2</option>
    </select>

    <button @click="validate">Valider</button>

    <p v-if="error">{{ error }}</p>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useParticipant } from "@/services/participantService";
import { useQuestionnaire } from "@/services/questionnaireService";

const route = useRoute();
const { getParticipantById } = useParticipant();
const { getQuestionnaireById } = useQuestionnaire();

const loading = ref(true);
const error = ref("");
const questionnaire = ref(null);

/* ---------------------------
   PAGINATION
---------------------------- */
const currentPage = ref(0);
const questionsPerPage = 5;

const paginatedQuestions = computed(() => {
  if (!questionnaire.value) return [];
  const start = currentPage.value * questionsPerPage;
  return questionnaire.value.questions.slice(start, start + questionsPerPage);
});

const totalPages = computed(() => {
  if (!questionnaire.value) return 0;
  return Math.ceil(questionnaire.value.questions.length / questionsPerPage);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 0) currentPage.value--;
};

/* ---------------------------
   CHARGEMENT DU QUESTIONNAIRE
---------------------------- */
onMounted(async () => {
  console.log("==== PAGE QUESTIONNAIRE CHARGÉE ====");
  console.log("route.query :", route.query);

  const participantId = route.query.id;
  let categorieId = route.query.categorie;

  if (!categorieId) {
    error.value = "Aucune catégorie fournie";
    loading.value = false;
    return;
  }

  let participantData = null;
  try {
    const res = await getParticipantById(participantId);
    participantData = res.data;
    console.log("Participant existant :", participantData);

    categorieId = participantData.categorie_id.toString();
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log("Nouveau participant — catégorie utilisée :", categorieId);
      participantData = null;
    } else {
      console.error("Erreur API participant :", err);
      error.value = "Erreur serveur participant";
      loading.value = false;
      return;
    }
  }

  const categorieName = categorieId === "1" ? "patient" : "soignant";

  try {
    const res = await getQuestionnaireById(categorieName);
    questionnaire.value = res.data;
  } catch (err) {
    console.error("Erreur API questionnaire :", err);
    error.value = "Impossible de charger le questionnaire";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container" v-if="!loading">
    <div v-if="error">
      <p style="color:red">{{ error }}</p>
    </div>

    <div v-else-if="questionnaire">
      <h1>{{ questionnaire.titre }}</h1>

      <div class="questions">
        <div
          class="question-card"
          v-for="(q, index) in paginatedQuestions"
          :key="q.id_question"
        >
          <h3>{{ (currentPage * questionsPerPage) + index + 1 }}. {{ q.intitule }}</h3>

          <div v-if="q.choix && q.choix.length > 0">
            <div
              v-for="c in q.choix"
              :key="c.id_choix"
              style="display:inline-block; margin-right:10px"
            >
              <input
                type="radio"
                :name="'q_' + q.id_question"
                :id="'c_' + c.id_choix"
              />
              <label :for="'c_' + c.id_choix">{{ c.libelle }}</label>
            </div>
          </div>

          <div v-else>
            <input type="text" placeholder="Réponse libre" style="width:100%" />
          </div>
        </div>
      </div>

      <!-- Navigation pagination -->
      <div>
        <button @click="prevPage" :disabled="currentPage === 0">Précédent</button>

        <span>Page {{ currentPage + 1 }} / {{ totalPages }}</span>

        <button @click="nextPage" :disabled="currentPage >= totalPages - 1">
          Suivant
        </button>
      </div>
    </div>

    <div v-else>
      <p>Aucun questionnaire trouvé</p>
    </div>
  </div>

  <div v-else>
    <p>Chargement...</p>
  </div>
</template>

<style scoped>
/* Container global */
.container {
  max-width: 800px;  /* optionnel, limite sur grand écran */
  margin: 0 auto;    /* centre horizontalement */
  padding: 40px;
  padding-top: 20px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 6px;  
}

/* Carte de chaque question */
.question-card {
  padding: 16px;
  border-bottom: 1px solid #000;   /* bordure noire */
  border-radius: 0;         /* rectangle sans arrondis (enlève si tu veux arrondi) */
  box-sizing: border-box;
  background-color: white;
}
.titre-question{
  font-weight: bold;
  margin-bottom: 6px;
}

/* Questions empilées */
.questions {
  display: flex;
  flex-direction: column;
}

/* Radios côte à côte */
.question-card div > div {
  display: inline-block;
  margin-right: 10px;
}

/* Input texte prend toute la largeur */
.question-card input[type="text"] {
  padding: 6px;
  margin-top: 6px;
  box-sizing: border-box;
}
/* Container de TOUS les choix → une seule ligne */
.choices-row {
  display: flex;
  flex-wrap: nowrap;     /* NE PAS passer à la ligne */
  gap: 20px;
  align-items: flex-start;
}

/* Chaque choix → permet au texte d'aller à la ligne */
.choice-item {
  display: flex;
  align-items: flex-start;
  max-width: 200px;       /* pour forcer le retour à la ligne du libellé si trop long */
  white-space: normal;    /* autorise le retour à la ligne */
}

</style>

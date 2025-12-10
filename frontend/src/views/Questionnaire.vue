<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useParticipant } from "@/services/participantService";
import { useQuestionnaire } from "@/services/questionnaireService";

const route = useRoute();
const { getParticipantById } = useParticipant();
const { getQuestionnaireById } = useQuestionnaire();

const loading = ref(true);
const error = ref("");
const questionnaire = ref(null);

onMounted(async () => {
  console.log("==== PAGE QUESTIONNAIRE CHARGÉE ====");
  console.log("route.query :", route.query);

  const participantId = route.query.id;
  let categorieId = route.query.categorie; // "1" = Patient, "2" = Soignant

  if (!categorieId) {
    error.value = "Aucune catégorie fournie";
    loading.value = false;
    return;
  }

  // Vérifier si participant existe
  let participantData = null;
  try {
    const res = await getParticipantById(participantId);
    participantData = res.data;
    console.log("Participant existant :", participantData);

    // Si existant, on prend sa catégorie
    categorieId = participantData.categorie_id.toString();
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log("Nouveau participant, catégorie choisie :", categorieId);
      participantData = null;
    } else {
      console.error("Erreur API participant :", err);
      error.value = "Erreur serveur participant";
      loading.value = false;
      return;
    }
  }

  // Mapper catégorie ID → string pour API
  const categorieName = categorieId === "1" ? "patient" : "soignant";
  console.log("Catégorie utilisée pour le questionnaire :", categorieName);

  // Récupérer questionnaire complet
  try {
    const res = await getQuestionnaireById(categorieName);
    console.log("Questionnaire complet reçu :", res.data);
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
          v-for="(q, index) in questionnaire.questions"
          :key="q.id_question"
        >
          <h3>{{ index + 1 }}. {{ q.intitule }}</h3>

          <!-- QCM / Choix multiples -->
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

          <!-- Réponse libre -->
          <div v-else>
            <input type="text" placeholder="Réponse libre" style="width:100%" />
          </div>
        </div>
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
  width: 100%;       /* prend toute la largeur disponible */
  max-width: 900px;  /* optionnel, limite sur grand écran */
  margin: 0 auto;    /* centre horizontalement */
  padding: 20px;
  box-sizing: border-box;
}

/* Carte de chaque question */
.question-card {
  background: #61616161;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  width: 100%;       /* prend toute la largeur du container */
  box-sizing: border-box;
}

/* Questions empilées */
.questions {
  display: flex;
  flex-direction: column;
  gap: 12px;  /* espace entre questions */
}

/* Radios côte à côte */
.question-card div > div {
  display: inline-block;
  margin-right: 10px;
}

/* Input texte prend toute la largeur */
.question-card input[type="text"] {
  width: 100%;
  padding: 6px;
  margin-top: 6px;
  box-sizing: border-box;
}
</style>

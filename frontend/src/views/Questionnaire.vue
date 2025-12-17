<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useParticipant } from "@/services/participantService";
import { useQuestionnaire } from "@/services/questionnaireService";
import { useSoumission } from "@/services/soumissionService";

const route = useRoute();
const router = useRouter();
const { getParticipantById } = useParticipant();
const { getQuestionnaireById } = useQuestionnaire();
const { createSoumissionComplete } = useSoumission();

const loading = ref(true);
const error = ref("");
const questionnaire = ref(null);

/* ---------------------------
   PAGINATION
---------------------------- */
const currentPage = ref(0);
const questionsPerPage = 4;

const paginatedQuestions = computed(() => {
  if (!questionnaire.value) return [];
  const start = currentPage.value * questionsPerPage;
  return questionnaire.value.questions.slice(start, start + questionsPerPage);
});

const reponseQ1 = computed(() =>
  reponses.value.find(r => r.question_id === 1)
);
const reponseQ3 = computed(() =>
  reponses.value.find(r => r.question_id === 5)
);

const visibleQuestions = computed(() => {
  return paginatedQuestions.value.filter(q => {

    // Q2 & Q3 visibles uniquement si Q1 = Oui
    if (q.id_question === 2 || q.id_question === 3) {
      return Number(reponseQ1.value?.choix_id) === 20;
    }

    // Q6 visible uniquement si Q3 = "Autres"
    if (q.id_question === 6) {
      return Number(reponseQ3.value?.choix_id) === 35;
    }

    return true;
  });
});

const shouldDisplayQuestion = (questionId) => {
  if (!reponses.value.length) return true;

  if (questionId === 2 || questionId === 3) {
    return reponseQ1.value?.choix_id === 20;
  }
  return true;
};

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
  const participantId = route.query.id;
  let categorieId = route.query.categorie;

  if (!categorieId) {
    try {
      const res = await getParticipantById(participantId);
      categorieId = res.data.categorie_id.toString();
    } catch (err) {
      console.error("Erreur participant :", err);
      error.value = "Participant introuvable";
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

/* ---------------------------
   RÉPONSES UTILISATEUR
---------------------------- */
const reponses = ref([]);

// Initialiser le tableau des réponses après chargement du questionnaire
watch(questionnaire, (q) => {
  if (q) {
    reponses.value = q.questions.map((question) => ({
      question_id: question.id_question,
      choix_id: null,
      reponse_libre: ""
    }));
  }
});

/* ---------------------------
   SOUMISSION
---------------------------- */
const submitReponses = async () => {
  const participantId = route.query.id;
  if (!participantId || !questionnaire.value) return;

  const q1 = reponses.value.find(r => r.question_id === 1);
  const q1IsYes = q1 && q1.choix_id === 20;

  const filteredReponses = reponses.value.filter(r => {

  // Toujours garder Q1
  if (r.question_id === 1) return true;

  // Q2 & Q3 uniquement si Q1 = Oui
  if (r.question_id === 2 || r.question_id === 3) {
    return Number(reponseQ1.value?.choix_id) === 20;
  }

  // Q6 uniquement si Q3 = "Autres"
  if (r.question_id === 6) {
    return Number(reponseQ3.value?.choix_id) === 35
      && r.reponse_libre.trim() !== "";
  }

  // Autres questions : garder si réponse donnée
  return r.choix_id !== null || r.reponse_libre.trim() !== "";
});

  const payload = {
    participant_id: Number(participantId),
    questionnaire_id: questionnaire.value.id_questionnaire,
    reponses: filteredReponses
  };

  console.log("OBJET ENVOYÉ À L'API :", JSON.stringify(payload, null, 2));

  try {
    await createSoumissionComplete(payload);
    alert("Réponses envoyées !");
    router.push("/");
  } catch (err) {
    console.error("Erreur soumission :", err);
    alert("Impossible d'envoyer les réponses");
  }
};

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
          v-for="(q, index) in visibleQuestions"
          :key="q.id_question"
        >
          <h3>
            {{ (currentPage * questionsPerPage) + index + 1 }}.
            {{ q.intitule }}
          </h3>

          <!-- QUESTIONS AVEC CHOIX -->
          <div v-if="q.choix && q.choix.length > 0" class="choices-group">
            <div
              v-for="c in q.choix"
              :key="c.id_choix"
              class="choice-item"
            >
              <input
                type="radio"
                :name="'q_' + q.id_question"
                :id="'c_' + c.id_choix"
                v-model="reponses.find(r => r.question_id === q.id_question).choix_id"
                :value="c.id_choix"
              />
              <label :for="'c_' + c.id_choix">
                {{ c.libelle }}
              </label>
            </div>
          </div>

          <!-- RÉPONSE LIBRE -->
          <div v-else>
            <input
              type="text"
              placeholder="Réponse libre"
              style="width:100%"
              v-model="reponses.find(r => r.question_id === q.id_question).reponse_libre"
            />
          </div>
        </div>
      </div>

      <!-- PAGINATION -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 0">
          Précédent
        </button>
        <span>
          Page {{ currentPage + 1 }} / {{ totalPages }}
        </span>
        <button @click="nextPage" :disabled="currentPage >= totalPages - 1">
          Suivant
        </button>
      </div>

      <!-- SOUMISSION -->
      <button @click="submitReponses" class="submit-button">
        Soumettre les réponses
      </button>
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
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 6px;
}

.question-card {
  padding: 16px;
  border-bottom: 1px solid #000;
  background-color: white;
  margin-bottom: 10px;
}

.choices-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.choice-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  max-width: 45%;
}

.choice-item label {
  cursor: pointer;
  white-space: normal;
  line-height: 1.4;
}

.question-card input[type="text"] {
  padding: 6px;
  margin-top: 6px;
}

.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-button {
  margin-top: 20px;
  padding: 10px;
  width: 100%;
  cursor: pointer;
}
</style>

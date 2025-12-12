<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useParticipant } from "@/services/participantService";

const router = useRouter();
const { getParticipantById } = useParticipant();

const participantId = ref("");
const error = ref("");

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

  if (exist) {
    // ✔ Participant existe → questionnaire direct
    router.push({
      name: "questionnaire",
      query: {
        id: participantId.value,
        categorie: participantData.id_categorie,
        exist: true,
      },
      state: participantData,
    });
  } else {
    // ❌ Participant existe pas → page de création
    router.push({
      name: "newpatient",
      query: {
        id: participantId.value,
        exist: false,
      }
    });
  }
};
</script>

<template>
  <div class="form-container">
    <h2>Nouveau questionnaire</h2>

    <label>ID participant :</label>
    <input v-model="participantId" />

    <button @click="validate">Valider</button>

    <p v-if="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #000;
  background-color: white;
}

label {
  display: block;
  margin-top: 12px;
  font-weight: bold;
}

input {
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

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useParticipant } from "@/services/participantService";

const route = useRoute();
const router = useRouter();
const { createParticipant } = useParticipant();

// Champs dynamiques
const id_participant = ref(route.query.id || "");
const tranche_age = ref("");
const sexe = ref("");
const anciennete_service = ref(null);
const anciennete_fonction = ref(null);
const id_categorie = ref(route.query.categorie || "1");

// Flags
const exist = ref(route.query.exist === "true");
const participantData = ref(history.state || null);

// Préremplissage si participant existant
onMounted(() => {
  if (exist.value && participantData.value) {
    const mapping = {
      id_participant,
      tranche_age,
      sexe,
      anciennete_service,
      anciennete_fonction,
      id_categorie
    };

    Object.entries(participantData.value).forEach(([key, value]) => {
      if (mapping[key] !== undefined) {
        mapping[key].value = value;
      }
    });
  }
});

// Computed pour savoir si on affiche ancienneté
const showAnciennete = computed(() => {
  if (exist.value && participantData.value) {
    // participant existant → afficher si soignant
    return participantData.value.id_categorie === 2;
  }
  // nouveau participant → afficher si soignant
  return Number(id_categorie.value) === 2;
});

// Ancienneté désactivée si participant existant
const ancienneteDisabled = computed(() => exist.value);

// Envoyer le participant
const send = async () => {
  const data = {
    id_participant: id_participant.value,
    tranche_age: tranche_age.value,
    sexe: sexe.value,
    anciennete_service: showAnciennete.value ? anciennete_service.value : null,
    anciennete_fonction: showAnciennete.value ? anciennete_fonction.value : null,
    id_categorie: Number(id_categorie.value),
  };

  try {
    if (!exist.value) {
      await createParticipant(data);
      alert("✅ Participant créé !");
    }
    router.push({ name: "home" });
  } catch (err) {
    console.error(err);
    alert("❌ Erreur lors de la création du participant");
  }
};
</script>

<template>
  <div>
    <h3>Questionnaire participant</h3>

    <label>ID</label>
    <input type="text" v-model="id_participant" disabled />

    <label>Tranche d'âge</label>
    <select v-model="tranche_age">
      <option value="18-24">18-24</option>
      <option value="25-34">25-34</option>
      <option value="35-44">35-44</option>
      <option value="45-54">45-54</option>
      <option value="55-64">55-64</option>
      <option value="+65">+65</option>
    </select>

    <label>Sexe</label>
    <select v-model="sexe">
      <option value="H">Homme</option>
      <option value="F">Femme</option>
      <option value="U">Autre</option>
    </select>

    <!-- Ancienneté uniquement si soignant -->
    <div v-if="showAnciennete">
      <label>Ancienneté service (années)</label>
      <input type="number" min="0" v-model="anciennete_service" :disabled="ancienneteDisabled" />

      <label>Ancienneté fonction (années)</label>
      <input type="number" min="0" v-model="anciennete_fonction" :disabled="ancienneteDisabled" />
    </div>

    <label>Catégorie</label>
    <select v-model="id_categorie" disabled>
      <option value="1">Patient</option>
      <option value="2">Soignant</option>
    </select>

    <button @click="send">Envoyer</button>
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

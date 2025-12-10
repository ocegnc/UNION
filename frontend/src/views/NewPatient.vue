<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useParticipant } from "@/services/participantService";
import { useCategorie } from "@/services/categorieService";

const route = useRoute();
const router = useRouter();
const { getParticipantById, createParticipant } = useParticipant();
const { getCategories } = useCategorie();

// Liste des catégories depuis la base
const categories = ref([]);
const error = ref("");

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

// Charger les catégories
onMounted(async () => {
  try {
    const res = await getCategories();
    categories.value = res.data; // tableau {id_categorie, categorie}
  } catch (err) {
    console.error(err);
    error.value = "Impossible de charger les catégories";
  }

  // Préremplissage si participant existant
  if (exist.value && participantData.value) {
    const mapping = {
      tranche_age,
      sexe,
      anciennete_service,
      anciennete_fonction,
      id_categorie
    };
    Object.entries(participantData.value).forEach(([key, value]) => {
      if (mapping[key] !== undefined) mapping[key].value = value;
    });
    id_categorie.value = participantData.value.id_categorie.toString();
  }
});

// afficher ancienneté (si soignant)
const showAnciennete = computed(() => {
  if (exist.value && participantData.value) {
    return participantData.value.id_categorie === 2;
  }
  return Number(id_categorie.value) === 2;
});

// bloquer les champs si participant existant
const disableInfosIfExist = computed(() => exist.value);

// Envoyer le participant
const send = async () => {
  try {
    // Vérifier si l'ID existe déjà
    if (!exist.value) {
      try {
        await getParticipantById(id_participant.value);
        alert("L'ID existe déjà !");
        return;
      } catch (e) {
        if (e.response && e.response.status !== 404) {
          console.error(e);
          alert("Erreur serveur lors de la vérification de l'ID");
          return;
        }
        // 404 → ID non existant → ok
      }
    }

    // Préparer les données
    const data = {
      id_participant: id_participant.value,
      tranche_age: tranche_age.value,
      sexe: sexe.value,
      anciennete_service: showAnciennete.value ? anciennete_service.value : null,
      anciennete_fonction: showAnciennete.value ? anciennete_fonction.value : null,
      id_categorie: Number(id_categorie.value)
    };

    if (!exist.value) {
      await createParticipant(data);
      alert("Participant créé !");
    }

    router.push({ name: "home" });
  } catch (err) {
    console.error(err);
    alert("Erreur lors de l'enregistrement du participant");
  }
};
</script>

<template>
  <div>
    <h3>Questionnaire participant</h3>

    <label>ID</label>
    <input type="text" v-model="id_participant" disabled />

    <label>Tranche d'âge</label>
    <select v-model="tranche_age" :disabled="disableInfosIfExist">
      <option value="18-24">18-24</option>
      <option value="25-34">25-34</option>
      <option value="35-44">35-44</option>
      <option value="45-54">45-54</option>
      <option value="55-64">55-64</option>
      <option value="+65">+65</option>
    </select>

    <label>Sexe</label>
    <select v-model="sexe" :disabled="disableInfosIfExist">
      <option value="H">Homme</option>
      <option value="F">Femme</option>
      <option value="U">Autre</option>
    </select>

    <!-- Ancienneté uniquement si soignant -->
    <div v-if="showAnciennete">
      <label>Ancienneté service (années)</label>
      <input type="number" min="0" v-model="anciennete_service" :disabled="disableInfosIfExist" />

      <label>Ancienneté fonction (années)</label>
      <input type="number" min="0" v-model="anciennete_fonction" :disabled="disableInfosIfExist" />
    </div>

    <label>Catégorie</label>
    <select v-model="id_categorie" disabled>
      <option v-for="cat in categories" :key="cat.id_categorie" :value="cat.id_categorie.toString()">
        {{ cat.categorie }}
      </option>
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

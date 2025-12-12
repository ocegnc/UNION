<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useParticipant } from "@/services/participantService";
import { useCategorie } from "@/services/categorieService";

const route = useRoute();
const router = useRouter();
const { createParticipant } = useParticipant();
const { getCategories } = useCategorie();

// Catégories
const categories = ref([]);
const error = ref("");

// Champs
const id_participant = ref(route.query.id || "");
const tranche_age = ref("");
const sexe = ref("");
const anciennete_service = ref(null);
const anciennete_fonction = ref(null);
const categorie_id = ref(route.query.categorie || "1");

// Charger catégories
onMounted(async () => {
  try {
    const res = await getCategories();
    categories.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = "Impossible de charger les catégories";
  }
});

// Affichage ancienneté si catégorie = soignant (2)
const showAnciennete = computed(() => Number(categorie_id.value) === 2);

// Enregistrement participant
const send = async () => {
  try {
    const data = {
      id_participant: id_participant.value,
      tranche_age: tranche_age.value,
      sexe: sexe.value,
      anciennete_service: showAnciennete.value ? anciennete_service.value : null,
      anciennete_fonction: showAnciennete.value ? anciennete_fonction.value : null,
      categorie_id: Number(categorie_id.value) // ⚡ important
    };

    await createParticipant(data);
    alert("Participant enregistré !");

    router.push({
      name: "questionnaire",
      query: {
        id: id_participant.value,
        categorie: categorie_id.value,
        exist: true
      },
      state: data
    });

  } catch (err) {
    console.error(err);
    alert("Erreur lors de l'enregistrement du participant");
  }
};
</script>

<template>
  <div class="container">

    <div class="form-sections">

      <!-- ID participant -->
      <div class="form-card">
        <div class="form-title">ID participant</div>
        <input type="text" v-model="id_participant" disabled />
      </div>

      <!-- Tranche d'âge -->
      <div class="form-card">
        <div class="form-title">Tranche d'âge</div>
        <div class="form-row">
          <label class="form-item" v-for="age in ['18-24','25-34','35-44','45-54','55-64','+65']" :key="age">
            <input type="radio" :value="age" v-model="tranche_age" />
            {{ age }}
          </label>
        </div>
      </div>

      <!-- Sexe -->
      <div class="form-card">
        <div class="form-title">Sexe</div>
        <div class="form-row">
          <label
            class="form-item"
            v-for="s in [{val:'H', label:'Homme'},{val:'F', label:'Femme'},{val:'U', label:'Autre'}]"
            :key="s.val"
          >
            <input type="radio" :value="s.val" v-model="sexe" />
            {{ s.label }}
          </label>
        </div>
      </div>

      <!-- Ancienneté si soignant -->
      <div class="form-card" v-if="showAnciennete">
        <div class="form-title">Ancienneté service (années)</div>
        <input type="number" min="0" v-model="anciennete_service" />

        <div class="form-title">Ancienneté fonction (années)</div>
        <input type="number" min="0" v-model="anciennete_fonction" />
      </div>

      <!-- Catégorie -->
      <div class="form-card">
        <div class="form-title">Catégorie</div>
        <div class="form-row">
          <label class="form-item" v-for="cat in categories" :key="cat.id_categorie">
            <input type="radio" :value="cat.id_categorie.toString()" v-model="categorie_id" />
            {{ cat.categorie }}
          </label>
        </div>
      </div>

      <!-- Bouton -->
      <button @click="send">Valider le participant</button>

      <p v-if="error" style="color:red;">{{ error }}</p>

    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  padding-top: 20px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 6px;
}

.form-card {
  padding: 16px;
  border-bottom: 1px solid #000;
  background-color: white;
}

.form-title {
  font-weight: bold;
  margin-bottom: 6px;
}

.form-sections {
  display: flex;
  flex-direction: column;
}

.form-card input[type="text"],
.form-card input[type="number"] {
  width: 100%;
  padding: 6px;
  margin-top: 6px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.form-item {
  display: flex;
  align-items: center;
  max-width: 200px;
}

.form-item input[type="radio"] {
  margin-right: 6px;
}

button {
  margin-top: 20px;
  padding: 10px;
  width: 100%;
  cursor: pointer;
}
</style>

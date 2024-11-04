<template>
  <div class="container">
    <h1>{{ page }}</h1> 
    <div class="apibuilder">
        <div class="top-level">
            <v-text-field class="input" width="200" v-model="documentName" label="Add top level item"></v-text-field>
            <v-btn @click="submitDocument">+</v-btn>
        </div>
        <div class="problems-row">
            <!-- <div v-for="(item, index) in problemsArray" :style="{ width: 100 / problemsArray.length - 1 + '%' }" class="top-level-problem">
                {{ item.name }}
                <div class="top-level-problem__add-symptom">
                    <v-text-field class="input" v-model="symptomName" label="Add Symptom"></v-text-field>
                    <v-btn @click="addSymptom">+</v-btn>
                </div>
                <div class="symptoms-container">

                </div>
            </div> -->
            <Problem v-for="(item, index) in problemsArray" :key="index" :collection="page" :problems="item" :itemWidth="100 / problemsArray.length " />
        </div>
    </div>
  </div>
</template>

<script setup>
    import { useRoute } from 'vue-router'

    const route = useRoute()
    const page = route.params.page
    const documentName = ref('');
    const symptomName = ref('');
    var problemsArray = ref([]);

    const createProblem = async (name, collection) => {
        try {
            const response = await $fetch('/api/problems', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    "_id" : "",
                    "collectionName" : collection,
                    "name" : name,
                    "symptoms" : []
                },
            })

        return response
        } catch (error) {
            console.error('Error creating collection:', error)
            throw error
        }
    }
    const getProblems = async () => {
        try {
            const response = await $fetch('/api/problems?collectionName=' + page, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            return response
        } catch (error) {
            console.error('Error creating collection:', error)
            throw error
        }
    }

    problemsArray = await getProblems();

    console.log(problemsArray);

    const submitDocument = async () => {
        if (documentName.value) {
            try {
                const response = await createProblem(documentName.value, page);
                console.log('problem created:', response)
                // You can handle the response, maybe reset the CName field, etc.
                documentName.value = ''
            } catch (error) {
                console.error('Failed to create collection:', error)
            }
        } else {
            console.error('Collection Name is required')
        }
    }
    
</script>

<style lang="scss">
    @use "~/assets/scss/page.scss";
    @use "~/assets/scss/symptom.scss";
</style>
<template>
    <div class="collection-container">
        <div class="collection-container__header">
            <h1>Collections</h1>
            <div class="collection-container__row">
                <v-text-field class="input" width="100" v-model="CName" label="Add Collection"></v-text-field>
                <v-btn @click="submitCollection">+</v-btn>
            </div>
        </div>
        <div class="collection-container__list">
            <div v-for="(item, index) in collectionsArry" >
                <h3>{{ item.name }}</h3>
                <NuxtLink :to="'/' + item.name" active-class="is-active">View</NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const CName = ref('') // State for collection name
var collectionsArry = ref('');

const getCollections = async () => {
    try {
        const response = await $fetch('/api/allcollections', {
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


const colResponse = await getCollections()
collectionsArry = colResponse.collections
console.log('colResponse', colResponse, collectionsArry);

// Function to create a collection
const createCollection = async (name) => {
    try {
   
        const response = await $fetch('/api/collection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                collectionName: name, // Data to send
                symptoms: [] // You can modify symptoms as needed
            },
        })

        return response
    } catch (error) {
        console.error('Error creating collection:', error)
        throw error
    }
}

// Function to handle the submission
const submitCollection = async () => {
    if (CName.value) {
        collectionsArry.push({ name: CName.value });
        try {
            const response = await createCollection(CName.value)
            console.log('Collection created:', response)
            // You can handle the response, maybe reset the CName field, etc.
            CName.value = ''
        } catch (error) {
            console.error('Failed to create collection:', error)
        }
    } else {
        console.error('Collection Name is required')
    }
}
</script>

<style lang="scss">
    @use "~/assets/scss/home.scss";
</style>

<template>
    <div class="symptom">
        <div class="symptom__head">
            <h3>{{ itemObject.name }}</h3>
            <div class="symptom__add">
                <v-btn v-on:click="inputType = inputType === 'Symptom' ? '' : 'Symptom'">Add Symptom</v-btn> or <v-btn v-on:click="inputType = inputType === 'Cause' ? '' : 'Cause'">Add Cause</v-btn>
            </div>
            <div class="symptom__input" :class="'input__' + inputType">
                <v-text-field class="input" v-model="inputValue" :label="'Add ' + inputType"></v-text-field>
                <v-btn @click="addSymptom(inputType, collection, itemObject._id )">+</v-btn>
            </div>
        </div>
        <div class="symptoms">
            <SymptomBlock v-for="(item, index) in itemObject.symptoms"  :collection="collection" :documentID="documentID" :itemObject="item" :key="index" />
        </div>
        <div v-if="itemObject.causes.length > 0" class="causes">
            <Causes v-for="(item, index) in itemObject.causes" :key="index" :item="item" />
        </div>
        <div class="indent" ></div>
    </div>
</template>

<script setup>
    const props = defineProps({
        itemObject: Object,
        collection: String,
        documentID: Number
    });

    const inputType = ref('');
    const inputValue = ref('');
    console.log('itemObject', props.itemObject._id);

    const addSymptom = async (type, theCollection, theDoc) => {
        if(type == 'Symptom'){
            try {
                const response = await $fetch('/api/symptoms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: {
                        _id: props.documentID,
                        parentSymptomId: props.itemObject._id,  // Document's ID
                        collectionName : theCollection,
                        newSymptom: {
                            name: inputValue.value ,
                            level: 2,
                            symptoms: [],  
                            causes: []
                        }
                    },
                })
            return response
            } catch (error) {
                console.error('Error creating collection:', error)
                throw error
            }
        }else if(type == 'Cause'){
            try {
                const response = await $fetch('/api/causes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: {
                        _id: props.documentID,  // Document ID
                        collectionName: theCollection,  // Collection where the document exists
                        symptomId: props.itemObject._id,  // Symptom ID where the cause will be added
                        newCause: {
                            name: inputValue.value,
                            linkedSymptom: ""
                        }
                    }
                })
            return response
            } catch (error) {
                console.error('Error creating collection:', error)
                throw error
            }
        }
    }

</script>
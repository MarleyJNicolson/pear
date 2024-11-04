<template>
    <div class="top-level-problem" :style="{ width: 'calc(' + itemWidth + '% - 2px)' }">
        <div class="top-level-problem__content" :class="editClass">
            <div class="top-level-problem__content-row">
                <v-text-field @blur="editClass = ''" ref="nameInput" class="name" v-model="dynamicName"></v-text-field>
                <div class="buttons">
                    <!-- if i wanted to be super smart i could have the name of the icon as a variable and update that but makes little dif -->
                    <Icon @click="toggleEdit" class="edit" name="lucide:edit" /> 
                    <Icon @click="editTitle(collection, problems._id)" class="save" name="ic:outline-save-as" />
                    <Icon class="delete" name="flowbite:trash-bin-outline" />
                </div>
            </div>
            <div class="top-level-problem__add-symptom">
                <v-text-field class="input" v-model="symptomName" label="Add Symptom"></v-text-field>
                <v-btn @click="addSymptom( collection, problems._id )">+</v-btn>
            </div>
        </div>
        <div class="symptoms-container">
            <SymptomBlock v-for="(item, index) in problems.symptoms"  :collection="collection" :documentID="problems._id" :itemObject="item" :key="index" />
        </div>
    </div>
</template>

<script setup>

    const props = defineProps({
        problems: Object,
        collection: String, 
        itemWidth: Number 
    });

    const symptomName = ref('');
    const dynamicName = ref(''); 
    const editClass = ref('');
    const nameInput = ref(null);


    const toggleEdit = () => {
      if(editClass.value == ''){
        editClass.value = 'can-edit'
        nameInput.value.focus();
      }else{
        editClass.value = '';
        nameInput.value.blur(); 
      } 
    };

    dynamicName.value = props.problems.name;

    const addSymptom = async (theCollection, theDoc) => {
        try {
            const response = await $fetch('/api/symptoms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    _id: theDoc,  // Document's ID
                    collectionName : theCollection,
                    newSymptom: {
                        name: symptomName.value ,
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
    };

    const editTitle = async (col, id) => {
        try {
            const response = await $fetch('/api/problems', {
            method: 'PUT',  
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                _id: id,
                collectionName : col, 
                name: dynamicName.value,  
            },
        })
        return response
        } catch (error) {
            console.error('Error updating name:', error)
            throw error
        }
    };

</script>
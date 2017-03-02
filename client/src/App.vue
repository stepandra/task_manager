<style>

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

h1,
h2 {
    font-weight: normal;
}

a {
    color: #42b983;
}

</style>

<template>

<div class="uk-container">
    <div id="app">
        <div class="uk-text-center" uk-grid>
            <div class="uk-width-3-5@s uk-margin-auto">
                <project-item v-for="project in projects" v-bind:project="project" :get-projects="getProjects" />
                <button class="uk-button uk-button-primary" uk-toggle="target: #my-id" type="button">
                    <i class="glyphicon glyphicon-plus pull-left"></i> Add project</button>
                <div id="my-id" uk-modal>
                    <div class="uk-modal-dialog uk-modal-body">
                        <input type="text" v-validate="'required|min:3|max:32'" :class="{'uk-input uk-width-2-3': true, 'uk-form-danger': errors.has('projectname'), 'uk-form-success': fields.passed('projectname') }" name="projectname" class="uk-input uk-width-2-3" placeholder="Project name"
                        v-model="projectname">
                        <button class="uk-modal-close uk-button uk-button-primary" type="button" v-on:click="addProject"> Add project</button>
                        <p class="uk-text-danger uk-margin-top" v-if="errors.has('projectname')">{{ errors.first('projectname') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<script>

import ProjectItem from './components/ProjectItem.vue'

export default {
    name: 'app',
    components: {
        'project-item': ProjectItem,
    },
    data() {
        return {
            projects: [],
            projectname: ''
        }
    },
    methods: {
        getProjects() {
                this.$http.get('/data')
                    .then(
                        (response) => this.projects = response.body, (err) => console.error(err)
                    )

            },
            addProject(e) {
                e.preventDefault()
                this.$validator.validateAll().then(result => {
                    if (!result) {
                        console.log('Error');
                        return;
                    }

                    var deadlineFormat = moment().format('YYYY-MM-DD');
                    this.$http.post('/addProject', {
                            projectname: this.projectname,
                            deadline: deadlineFormat
                        })
                        .then(
                            (response) => this.getProjects(), (err) => console.error(err)
                        )
                    this.projectname = '';
                    setTimeout(() => {
                        this.errors.clear();
                        console.log(this.errors)
                    }, 100);
                });

            }
    },
    mounted: function() {
        this.getProjects()
    },
}

</script>

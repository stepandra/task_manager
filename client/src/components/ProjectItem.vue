<style lang="css">

.panel-body {
    padding: 0px;
    padding: 10px 2px;
}

.panel-footer .pagination {
    margin: 0;
}

.panel .glyphicon,
.list-group-item .glyphicon {
    margin-right: 5px;
}

.panel-body .radio,
.checkbox {
    display: inline-block;
    margin: 0px;
}

.panel-body input[type=checkbox]:checked + label {
    text-decoration: line-through;
    color: rgb(128, 144, 160);
}

.list-group-item:hover,
a.list-group-item:focus {
    text-decoration: none;
    background-color: rgb(245, 245, 245);
}

.task-input {
    background-color: #e6e6e6;
}

.task-input i {
    line-height: 30px;
    min-height: 30px;
    margin-left: 10px;
}

.project-item {
    margin-bottom: 0;
    border-radius: 0;
}

.icon-center {
    line-height: 45px;
    min-height: 45px;
}

.uk-icon::before {
    background-image: url(../assets/icons.svg);
}

</style>

<template lang="html">

<div class="uk-navbar-container uk-margin">
    <div class="uk-navbar project-item">
        <div class="uk-navbar-left">
          <a href="#" class="uk-icon-link uk-margin-left" uk-icon="icon: calendar" v-on:click="dateinput = !dateinput"></a>
          <form  v-if="dateinput">
          <datepicker  :disabled="disabled" v-model="project.deadline" input-class="uk-input uk-form-width-small uk-form-small uk-margin-left" placeholder="Pick date"></datepicker>
          <a v-on:click="updateProject(project)">Add deadline</a>
          </form>
            <span class="uk-navbar-item glyphicon glyphicon-calendar icon-center"></span>
            <a class="uk-link-reset navbar-text navbar-right" v-if="project !== editedProject" v-on:click="seen = !seen">{{ project.name }}</a>
            <form v-if="project === editedProject">
            <input type="text" class="edit"

                   v-model="project.name"
                   @keyup.enter="updateProject(project)"
                   @keyup.esc="cancelEdit(project)"/>
            </form>

        </div>
        <div class="uk-navbar-right">
            <a href="#" class="uk-icon-link uk-margin-small-right" uk-icon="icon: file-edit" v-on:click="editProject(project)"></a>
            <a href="#" class="uk-icon-link uk-margin-small-right" uk-icon="icon: trash" v-on:click="deleteProject"></a>
        </div>
    </div>
    <div v-if="seen" class="uk-background-default uk-padding uk-padding-remove-horizontal uk-padding-remove-top">
        <nav class="uk-navbar-container" uk-navbar>
            <div class="uk-width-auto uk-navbar-item uk-margin-remove-right uk-margin-left">
                <span class=" uk-logo" uk-icon="icon: plus; ratio:1.5"></span>
            </div>
            <form class="uk-navbar-item uk-width-expand uk-padding-remove-horizontal">
                <input type="text" class="uk-input uk-width-2-3" placeholder="Search" v-model="task">
                <button class="uk-button uk-button-primary" v-on:click="addTask" type="button">Add task</button>
            </form>
        </nav>
        <ul class="uk-list uk-list-divider">
            <task-item v-for="task in filter" v-bind:task="task" :get-projects="getProjects" />
            </li>
    </div>

</template>

<script>
import TaskItem from './TaskItem.vue'
import Datepicker from 'vuejs-datepicker'


export default {
  name: 'project-item',
  components: {
    'task-item': TaskItem,
    Datepicker,
  },
  props: ['project', 'getProjects'],
  computed: {
    filter() {
      return _.orderBy(this.project.tasks, ['priority'], ['desc']);
    },
  },
  methods: {
    backEndDateFormat(date) {
      return moment(date).format('YYYY-MM-DD');
    },
    updateProject(project) {
      this.beforeEditCache = project.name
      var serverDate = this.backEndDateFormat(project.deadline);
      this.$http.put(`http://localhost:3000/project/${this.project.id}`, { name: project.name, deadline: serverDate })
                .then((response) => {
                  this.getProjects()
                })
            .catch((err) => {
              console.log(err)
            })
      this.dateinput = false
    },
    cancelEdit(project) {
      this.editedProject = null
      project.name = this.beforeEditCache
    },
    deleteProject(e) {
      e.preventDefault()

      this.$http.delete(`http://localhost:3000/project/${this.project.id}`)
                .then((response) => {
                  this.getProjects()
                })
    },
    addTask(e) {
      e.preventDefault()

      this.$http.post('http://localhost:3000/addTask', {
        name: this.task,
        status: 'f',
        project_id: this.project.id,
        priority: '1',
      })
            .then((response) => {
              this.getProjects()
              this.task = ''
            })
            .catch((err) => {
              console.log(err)
            })
    },
    editProject(project) {
      this.beforeEditCache = project.name
      this.editedProject = project
    }
  },
  data() {
    return {
      task: '',
      seen: true,
      dateinput: false,
      date: null,
      editedProject: null,
      disabled: {
          to: new Date(2017, 1, 28), // TODO: Refactor hardcode
      }
    }
  },
}

</script>

<template lang="html">

    <li class="uk-width-body uk-margin uk-margin-remove-right" :class="{completed: task.status}">
        <input type="checkbox" class="uk-checkbox uk-float-left uk-margin-left uk-margin-small-top" @change="updateTask" v-bind:id="task.id" v-model="task.status"/>
        <label v-bind:for="task.id" v-if="task !== editedTodo" class="uk-margin-small-top">
            {{task.name}}
        </label>

        <div class="uk-float-right action-buttons" >



          <a href="#" v-on:click="incPriority(task)" class="uk-icon-link uk-margin-small-right" uk-icon="icon: chevron-up"></a>
          <a href="#" v-on:click="decPriority(task)" class="uk-icon-link uk-margin-right" uk-icon="icon: chevron-down"></a>
            <a href="#" v-on:click="editTodo(task)" class="uk-icon-link uk-margin-small-right" uk-icon="icon: file-edit"></a>

            <!-- <a href="#" class="trash"> -->
                <!-- <span v-on:click="deleteTask" class="glyphicon glyphicon-trash"></span></a> -->
                <a href="#" v-on:click="deleteTask" class="uk-icon-link uk-margin-right" uk-icon="icon: trash"></a>

        </div>
        <input type="text" class="edit"
               v-if="task === editedTodo"
               v-model="task.name"
               @keyup.enter="updateTask(task)"
               @keyup.esc="cancelEdit(task)"/>
    </li>

</template>
<script>
    export default {
      name: 'task-item',
      props: ['task', 'getProjects'],
      methods: {
        deleteTask(e) {
          e.preventDefault()

          this.$http.delete(`http://localhost:3000/task/${this.task.id}`)
                    .then((response) => {
                      this.getProjects()
                    })
        },
        updateTask(task) {
          this.beforeEditCache = task.name
          this.$http.put(`http://localhost:3000/task/${this.task.id}`, { name: this.task.name, status: this.task.status, priority: this.task.priority })
                    .then((response) => {
                      this.getProjects()
                    })
                .catch((err) => {
                  console.log(err)
                })
        },
        incPriority(task) {
          if(task.priority < 3) {
            task.priority++
            this.updateTask(task)
          }
        },
        decPriority(task) {
          if(task.priority <= 3 && task.priority > 1) {
            task.priority--
            this.updateTask(task)
          }
        },
        changeStatus(task) {
          task.status = !task.status
        },
        editTodo(task) {
          this.beforeEditCache = task.name
          this.editedTodo = task
        },
        doneEdit(task) {
          if (!this.editedTodo) {
            return
          }
          this.editedTodo = null

          task.name = task.name.trim()
          if (!task.name) {
            this.removeTodo(this.task)
          }
        },
        cancelEdit(task) {
          this.editedTodo = null
          task.name = this.beforeEditCache
        },
        change() {
          this.showList = !this.showList
        },
      },
      data() {
        return {
          editedTodo: null,
          showList: false,
        }
      },
    }
</script>

<style lang="css">
    .completed {
      text-decoration: line-through;
    }
    .list-group-item {
        margin: 0;
        border-width: 0 0 1px !important;
    }


</style>

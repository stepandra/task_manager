import Vue from 'vue'
import VueResource from 'vue-resource'
import VeeValidate from 'vee-validate';

import App from './App.vue'

Vue.use(VueResource)
Vue.use(VeeValidate)

new Vue({
  el: '#app',
  render: (h) => h(App),
})

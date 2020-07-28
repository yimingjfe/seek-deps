import './index.less';
import 'vis-network/dist/vis-network.css';
import Vue from 'vue';
import App from './app.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

new Vue({
  el: '#app',
  render: (h) => h(App),
});

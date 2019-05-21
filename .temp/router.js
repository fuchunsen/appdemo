import Vue from 'vue'
/*global Vue*/
import Router from 'vue-router';
import Main from '@/index.vue';
import HelloWorld from '@/components/HelloWorld.vue';
import Content from '@/components/Content.vue';

Vue.use(Router);

export const router = new Router({
    routes: [
        {
            path: '/',
            name: 'Router',
            component: Main,
            children: [
                { path: '/', name: 'HelloWorld', component: HelloWorld },
                { path: '/content', name: 'Content', component: Content }
            ]
        }
    ]
});

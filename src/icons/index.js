import SvgIcon from '@/components/SvgIcon';
import Vue from 'vue';

// 注册到全局
Vue.component('svg-icon', SvgIcon)

const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./svg', false, /\.svg$/)
requireAll(req)
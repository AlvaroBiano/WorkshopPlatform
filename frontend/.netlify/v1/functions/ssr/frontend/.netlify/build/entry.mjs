import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_B6S4SWcS.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/affiliates.astro.mjs');
const _page2 = () => import('./pages/admin/api/affiliates.astro.mjs');
const _page3 = () => import('./pages/admin/api/approve-student.astro.mjs');
const _page4 = () => import('./pages/admin/api/devices.astro.mjs');
const _page5 = () => import('./pages/admin/api/modules/_moduleid_/lessons.astro.mjs');
const _page6 = () => import('./pages/admin/api/notifications.astro.mjs');
const _page7 = () => import('./pages/admin/api/products/_productid_/modules/_moduleid_.astro.mjs');
const _page8 = () => import('./pages/admin/api/products/_productid_/modules.astro.mjs');
const _page9 = () => import('./pages/admin/api/products/_id_.astro.mjs');
const _page10 = () => import('./pages/admin/api/products.astro.mjs');
const _page11 = () => import('./pages/admin/api/reject-student.astro.mjs');
const _page12 = () => import('./pages/admin/api/settings.astro.mjs');
const _page13 = () => import('./pages/admin/api/toggle-ban.astro.mjs');
const _page14 = () => import('./pages/admin/devices.astro.mjs');
const _page15 = () => import('./pages/admin/financial.astro.mjs');
const _page16 = () => import('./pages/admin/messages.astro.mjs');
const _page17 = () => import('./pages/admin/products/new.astro.mjs');
const _page18 = () => import('./pages/admin/products/_id_.astro.mjs');
const _page19 = () => import('./pages/admin/products.astro.mjs');
const _page20 = () => import('./pages/admin/settings.astro.mjs');
const _page21 = () => import('./pages/admin/students.astro.mjs');
const _page22 = () => import('./pages/admin.astro.mjs');
const _page23 = () => import('./pages/affiliate/api/withdraw.astro.mjs');
const _page24 = () => import('./pages/affiliate/dashboard.astro.mjs');
const _page25 = () => import('./pages/cadastro.astro.mjs');
const _page26 = () => import('./pages/first-access.astro.mjs');
const _page27 = () => import('./pages/login.astro.mjs');
const _page28 = () => import('./pages/logout.astro.mjs');
const _page29 = () => import('./pages/recuperar-senha.astro.mjs');
const _page30 = () => import('./pages/student/api/progress.astro.mjs');
const _page31 = () => import('./pages/student/course/_slug_.astro.mjs');
const _page32 = () => import('./pages/student/profile.astro.mjs');
const _page33 = () => import('./pages/student.astro.mjs');
const _page34 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["../node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/affiliates.astro", _page1],
    ["src/pages/admin/api/affiliates.ts", _page2],
    ["src/pages/admin/api/approve-student.ts", _page3],
    ["src/pages/admin/api/devices.ts", _page4],
    ["src/pages/admin/api/modules/[moduleId]/lessons.ts", _page5],
    ["src/pages/admin/api/notifications.ts", _page6],
    ["src/pages/admin/api/products/[productId]/modules/[moduleId].ts", _page7],
    ["src/pages/admin/api/products/[productId]/modules.ts", _page8],
    ["src/pages/admin/api/products/[id].ts", _page9],
    ["src/pages/admin/api/products.ts", _page10],
    ["src/pages/admin/api/reject-student.ts", _page11],
    ["src/pages/admin/api/settings.ts", _page12],
    ["src/pages/admin/api/toggle-ban.ts", _page13],
    ["src/pages/admin/devices.astro", _page14],
    ["src/pages/admin/financial.astro", _page15],
    ["src/pages/admin/messages.astro", _page16],
    ["src/pages/admin/products/new.astro", _page17],
    ["src/pages/admin/products/[id].astro", _page18],
    ["src/pages/admin/products/index.astro", _page19],
    ["src/pages/admin/settings.astro", _page20],
    ["src/pages/admin/students.astro", _page21],
    ["src/pages/admin/index.astro", _page22],
    ["src/pages/affiliate/api/withdraw.ts", _page23],
    ["src/pages/affiliate/dashboard.astro", _page24],
    ["src/pages/cadastro.astro", _page25],
    ["src/pages/first-access.astro", _page26],
    ["src/pages/login.astro", _page27],
    ["src/pages/logout.astro", _page28],
    ["src/pages/recuperar-senha.astro", _page29],
    ["src/pages/student/api/progress.ts", _page30],
    ["src/pages/student/course/[slug].astro", _page31],
    ["src/pages/student/profile.astro", _page32],
    ["src/pages/student/index.astro", _page33],
    ["src/pages/index.astro", _page34]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "48afee65-54ea-4d37-8c89-b8cfa1074b64"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };

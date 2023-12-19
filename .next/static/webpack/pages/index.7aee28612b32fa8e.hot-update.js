"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/index",{

/***/ "./src/pages/index.tsx":
/*!*****************************!*\
  !*** ./src/pages/index.tsx ***!
  \*****************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Home; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_ui_selectAccount__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/components/ui/selectAccount */ \"./src/components/ui/selectAccount.tsx\");\n/* harmony import */ var _components_ui_input__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/ui/input */ \"./src/components/ui/input.tsx\");\n/* harmony import */ var _components_ui_button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/components/ui/button */ \"./src/components/ui/button.tsx\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var react_query__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-query */ \"./node_modules/react-query/es/index.js\");\n/* harmony import */ var _utils_extractBody__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/extractBody */ \"./src/utils/extractBody.ts\");\n\nvar _s = $RefreshSig$();\n\n\n\n\n\n\nfunction Home() {\n    _s();\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_4__.useRouter)();\n    //issue with line 30, i have multiple inputs, could have submits\n    //one after the other?\n    const mutation = (0,react_query__WEBPACK_IMPORTED_MODULE_5__.useMutation)({\n        mutationFn: (handle)=>{\n            return fetch(\"/api/pages\", {\n                method: \"POST\",\n                body: JSON.stringify({\n                    handle\n                })\n            });\n        },\n        onSuccess: async (res)=>{\n            const body = await (0,_utils_extractBody__WEBPACK_IMPORTED_MODULE_6__.extractBody)(res);\n            const entryPrice = body.entryPrice;\n            router.push(\"/\".concat(entryPrice));\n            const stopLoss = body.stopLoss;\n            router.push(\"/\".concat(stopLoss));\n            const takeProfit = body.takeProfit;\n            router.push(\"/\".concat(takeProfit));\n        }\n    });\n    function handleSubmit(event) {\n        event.preventDefault();\n        const data = new FormData(event.target);\n        const entryPrice = data.get(\"entryPrice\");\n        const stopLoss = data.get(\"stopLoss\");\n        const takeProfit = data.get(\"takeprofit\");\n        if (!entryPrice || !stopLoss || !takeProfit) return;\n        mutation.mutate(entryPrice);\n        mutation.mutate(stopLoss);\n        mutation.mutate(takeProfit);\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n        className: \"text-centre p-3 bg-slate-200 h-screen\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"flex flex-col items-center\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                    className: \"m-4 text-4xl font-extrabold text-black\",\n                    children: \"Enter data\"\n                }, void 0, false, {\n                    fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                    lineNumber: 52,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                lineNumber: 51,\n                columnNumber: 7\n            }, this),\n            mutation.isLoading && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                children: \"Creating Page...\"\n            }, void 0, false, {\n                fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                lineNumber: 56,\n                columnNumber: 30\n            }, this),\n            !mutation.isLoading && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"flex flex-row my-20\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"w-full md:w-1/2 lg:w-1/3 xl:w-1/4\",\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"ml-80 my-5\",\n                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_selectAccount__WEBPACK_IMPORTED_MODULE_1__.AccountDropdown, {}, void 0, false, {\n                                fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                                lineNumber: 61,\n                                columnNumber: 11\n                            }, this)\n                        }, void 0, false, {\n                            fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                            lineNumber: 60,\n                            columnNumber: 9\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                        lineNumber: 59,\n                        columnNumber: 7\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"w-full md:w-1/2 lg:w-2/3 xl:w-3/4\",\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                            className: \"flex flex-col items-center mx-auto\",\n                            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"form\", {\n                                className: \"my-auto w-80\",\n                                onSubmit: handleSubmit,\n                                children: [\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                        className: \"p-5\",\n                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_input__WEBPACK_IMPORTED_MODULE_2__.Input, {\n                                            id: \"entryPrice\",\n                                            name: \"entryPrice\",\n                                            type: \"number\",\n                                            placeholder: \"Entry Price...\"\n                                        }, void 0, false, {\n                                            fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                                            lineNumber: 68,\n                                            columnNumber: 15\n                                        }, this)\n                                    }, void 0, false, {\n                                        fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                                        lineNumber: 67,\n                                        columnNumber: 13\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                        className: \"p-5\",\n                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_input__WEBPACK_IMPORTED_MODULE_2__.Input, {\n                                            id: \"stopLoss\",\n                                            name: \"stopLoss\",\n                                            type: \"number\",\n                                            placeholder: \"Stop Loss...\"\n                                        }, void 0, false, {\n                                            fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                                            lineNumber: 71,\n                                            columnNumber: 15\n                                        }, this)\n                                    }, void 0, false, {\n                                        fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                                        lineNumber: 70,\n                                        columnNumber: 13\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                        className: \"p-5\",\n                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_input__WEBPACK_IMPORTED_MODULE_2__.Input, {\n                                            id: \"takeProfit\",\n                                            name: \"takeProfit\",\n                                            type: \"number\",\n                                            placeholder: \"Take Profit...\"\n                                        }, void 0, false, {\n                                            fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                                            lineNumber: 74,\n                                            columnNumber: 15\n                                        }, this)\n                                    }, void 0, false, {\n                                        fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                                        lineNumber: 73,\n                                        columnNumber: 13\n                                    }, this),\n                                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                        className: \"p-4\",\n                                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_components_ui_button__WEBPACK_IMPORTED_MODULE_3__.Button, {\n                                            type: \"submit\",\n                                            children: \"Submit Entry\"\n                                        }, void 0, false, {\n                                            fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                                            lineNumber: 77,\n                                            columnNumber: 15\n                                        }, this)\n                                    }, void 0, false, {\n                                        fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                                        lineNumber: 76,\n                                        columnNumber: 13\n                                    }, this)\n                                ]\n                            }, void 0, true, {\n                                fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                                lineNumber: 66,\n                                columnNumber: 11\n                            }, this)\n                        }, void 0, false, {\n                            fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                            lineNumber: 65,\n                            columnNumber: 9\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                        lineNumber: 64,\n                        columnNumber: 7\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n                lineNumber: 58,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"/Volumes/MS-1tb/project/src/pages/index.tsx\",\n        lineNumber: 50,\n        columnNumber: 5\n    }, this);\n}\n_s(Home, \"Rq/HHWr8hN14xf4OuJmDDFBXliE=\", false, function() {\n    return [\n        next_router__WEBPACK_IMPORTED_MODULE_4__.useRouter,\n        react_query__WEBPACK_IMPORTED_MODULE_5__.useMutation\n    ];\n});\n_c = Home;\nvar _c;\n$RefreshReg$(_c, \"Home\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvaW5kZXgudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFnRTtBQUNsQjtBQUNFO0FBQ1I7QUFDRTtBQUNRO0FBSW5DLFNBQVNNOztJQUN0QixNQUFNQyxTQUFTSixzREFBU0E7SUFFeEIsZ0VBQWdFO0lBQ2hFLHNCQUFzQjtJQUV0QixNQUFNSyxXQUFXSix3REFBV0EsQ0FBQztRQUMzQkssWUFBWSxDQUFDQztZQUNYLE9BQU9DLE1BQU0sY0FBYTtnQkFDeEJDLFFBQVE7Z0JBQ1JDLE1BQU1DLEtBQUtDLFNBQVMsQ0FBQztvQkFBRUw7Z0JBQU87WUFDaEM7UUFDRjtRQUNBTSxXQUFXLE9BQU9DO1lBQ2hCLE1BQU1KLE9BQU8sTUFBTVIsK0RBQVdBLENBQUNZO1lBRS9CLE1BQU1DLGFBQWFMLEtBQUtLLFVBQVU7WUFDbENYLE9BQU9ZLElBQUksQ0FBQyxJQUFlLE9BQVhEO1lBQ2hCLE1BQU1FLFdBQVdQLEtBQUtPLFFBQVE7WUFDOUJiLE9BQU9ZLElBQUksQ0FBQyxJQUFhLE9BQVRDO1lBQ2hCLE1BQU1DLGFBQWFSLEtBQUtRLFVBQVU7WUFDbENkLE9BQU9ZLElBQUksQ0FBQyxJQUFlLE9BQVhFO1FBQ2xCO0lBQ0Y7SUFHQSxTQUFTQyxhQUFhQyxLQUFpQztRQUNyREEsTUFBTUMsY0FBYztRQUNwQixNQUFNQyxPQUFPLElBQUlDLFNBQVNILE1BQU1JLE1BQU07UUFDdEMsTUFBTVQsYUFBYU8sS0FBS0csR0FBRyxDQUFDO1FBQzVCLE1BQU1SLFdBQVdLLEtBQUtHLEdBQUcsQ0FBQztRQUMxQixNQUFNUCxhQUFhSSxLQUFLRyxHQUFHLENBQUM7UUFDNUIsSUFBRyxDQUFDVixjQUFjLENBQUNFLFlBQVksQ0FBQ0MsWUFBVztRQUMzQ2IsU0FBU3FCLE1BQU0sQ0FBQ1g7UUFDaEJWLFNBQVNxQixNQUFNLENBQUNUO1FBQ2hCWixTQUFTcUIsTUFBTSxDQUFDUjtJQUNwQjtJQUdFLHFCQUNFLDhEQUFDUztRQUFLQyxXQUFVOzswQkFDZCw4REFBQ0M7Z0JBQUlELFdBQVU7MEJBQ2IsNEVBQUNFO29CQUFHRixXQUFVOzhCQUF5Qzs7Ozs7Ozs7Ozs7WUFJeER2QixTQUFTMEIsU0FBUyxrQkFBSSw4REFBQ0M7MEJBQUU7Ozs7OztZQUN6QixDQUFDM0IsU0FBUzBCLFNBQVMsa0JBQ3BCLDhEQUFDRjtnQkFBSUQsV0FBVTs7a0NBQ2YsOERBQUNDO3dCQUFJRCxXQUFVO2tDQUNiLDRFQUFDQzs0QkFBSUQsV0FBVTtzQ0FDYiw0RUFBQy9CLHlFQUFlQTs7Ozs7Ozs7Ozs7Ozs7O2tDQUdwQiw4REFBQ2dDO3dCQUFJRCxXQUFVO2tDQUNiLDRFQUFDQzs0QkFBSUQsV0FBVTtzQ0FDYiw0RUFBQ0s7Z0NBQUtMLFdBQVU7Z0NBQWVNLFVBQVVmOztrREFDdkMsOERBQUNVO3dDQUFJRCxXQUFVO2tEQUNiLDRFQUFDOUIsdURBQUtBOzRDQUFDcUMsSUFBRzs0Q0FBYUMsTUFBSzs0Q0FBYUMsTUFBSzs0Q0FBU0MsYUFBWTs7Ozs7Ozs7Ozs7a0RBRXJFLDhEQUFDVDt3Q0FBSUQsV0FBVTtrREFDYiw0RUFBQzlCLHVEQUFLQTs0Q0FBQ3FDLElBQUc7NENBQVdDLE1BQUs7NENBQVdDLE1BQUs7NENBQVNDLGFBQVk7Ozs7Ozs7Ozs7O2tEQUVqRSw4REFBQ1Q7d0NBQUlELFdBQVU7a0RBQ2IsNEVBQUM5Qix1REFBS0E7NENBQUNxQyxJQUFHOzRDQUFhQyxNQUFLOzRDQUFhQyxNQUFLOzRDQUFTQyxhQUFZOzs7Ozs7Ozs7OztrREFFckUsOERBQUNUO3dDQUFJRCxXQUFVO2tEQUNiLDRFQUFDN0IseURBQU1BOzRDQUFDc0MsTUFBSztzREFBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBU3BDO0dBNUV3QmxDOztRQUNQSCxrREFBU0E7UUFLUEMsb0RBQVdBOzs7S0FOTkUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL3BhZ2VzL2luZGV4LnRzeD8xOWEwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFjY291bnREcm9wZG93biB9IGZyb20gXCJAL2NvbXBvbmVudHMvdWkvc2VsZWN0QWNjb3VudFwiO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tIFwiQC9jb21wb25lbnRzL3VpL2lucHV0XCI7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwiQC9jb21wb25lbnRzL3VpL2J1dHRvblwiO1xuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSBcIm5leHQvcm91dGVyXCI7XG5pbXBvcnQgeyB1c2VNdXRhdGlvbiB9IGZyb20gXCJyZWFjdC1xdWVyeVwiO1xuaW1wb3J0IHsgZXh0cmFjdEJvZHkgfSBmcm9tIFwiQC91dGlscy9leHRyYWN0Qm9keVwiO1xuaW1wb3J0IHsgRm9ybUV2ZW50IH0gZnJvbSBcInJlYWN0XCI7XG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSG9tZSgpIHtcbiAgY29uc3Qgcm91dGVyID0gdXNlUm91dGVyKClcbiAgXG4gIC8vaXNzdWUgd2l0aCBsaW5lIDMwLCBpIGhhdmUgbXVsdGlwbGUgaW5wdXRzLCBjb3VsZCBoYXZlIHN1Ym1pdHNcbiAgLy9vbmUgYWZ0ZXIgdGhlIG90aGVyP1xuXG4gIGNvbnN0IG11dGF0aW9uID0gdXNlTXV0YXRpb24oe1xuICAgIG11dGF0aW9uRm46IChoYW5kbGU6IHN0cmluZykgPT4ge1xuICAgICAgcmV0dXJuIGZldGNoKFwiL2FwaS9wYWdlc1wiLHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBoYW5kbGUgfSlcbiAgICAgIH0pXG4gICAgfSxcbiAgICBvblN1Y2Nlc3M6IGFzeW5jIChyZXMpID0+IHtcbiAgICAgIGNvbnN0IGJvZHkgPSBhd2FpdCBleHRyYWN0Qm9keShyZXMpO1xuICAgICAgXG4gICAgICBjb25zdCBlbnRyeVByaWNlID0gYm9keS5lbnRyeVByaWNlO1xuICAgICAgcm91dGVyLnB1c2goYC8ke2VudHJ5UHJpY2V9YCk7XG4gICAgICBjb25zdCBzdG9wTG9zcyA9IGJvZHkuc3RvcExvc3M7XG4gICAgICByb3V0ZXIucHVzaChgLyR7c3RvcExvc3N9YCk7XG4gICAgICBjb25zdCB0YWtlUHJvZml0ID0gYm9keS50YWtlUHJvZml0O1xuICAgICAgcm91dGVyLnB1c2goYC8ke3Rha2VQcm9maXR9YCk7XG4gICAgfVxuICB9KVxuXG5cbiAgZnVuY3Rpb24gaGFuZGxlU3VibWl0KGV2ZW50OiBGb3JtRXZlbnQ8SFRNTEZvcm1FbGVtZW50Pil7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNvbnN0IGRhdGEgPSBuZXcgRm9ybURhdGEoZXZlbnQudGFyZ2V0IGFzIEhUTUxGb3JtRWxlbWVudClcbiAgICBjb25zdCBlbnRyeVByaWNlID0gZGF0YS5nZXQoXCJlbnRyeVByaWNlXCIpYXMgc3RyaW5nO1xuICAgIGNvbnN0IHN0b3BMb3NzID0gZGF0YS5nZXQoXCJzdG9wTG9zc1wiKWFzIHN0cmluZztcbiAgICBjb25zdCB0YWtlUHJvZml0ID0gZGF0YS5nZXQoXCJ0YWtlcHJvZml0XCIpYXMgc3RyaW5nO1xuICAgIGlmKCFlbnRyeVByaWNlIHx8ICFzdG9wTG9zcyB8fCAhdGFrZVByb2ZpdClyZXR1cm5cbiAgICBtdXRhdGlvbi5tdXRhdGUoZW50cnlQcmljZSk7XG4gICAgbXV0YXRpb24ubXV0YXRlKHN0b3BMb3NzKTtcbiAgICBtdXRhdGlvbi5tdXRhdGUodGFrZVByb2ZpdCk7XG59XG5cblxuICByZXR1cm4gKFxuICAgIDxtYWluIGNsYXNzTmFtZT1cInRleHQtY2VudHJlIHAtMyBiZy1zbGF0ZS0yMDAgaC1zY3JlZW5cIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXJcIj5cbiAgICAgICAgPGgxIGNsYXNzTmFtZT1cIm0tNCB0ZXh0LTR4bCBmb250LWV4dHJhYm9sZCB0ZXh0LWJsYWNrXCI+XG4gICAgICAgICAgRW50ZXIgZGF0YVxuICAgICAgICA8L2gxPlxuICAgICAgPC9kaXY+XG4gICAgICB7bXV0YXRpb24uaXNMb2FkaW5nICYmIDxwPkNyZWF0aW5nIFBhZ2UuLi48L3A+fVxuICAgICAgeyFtdXRhdGlvbi5pc0xvYWRpbmcgJiYgKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtcm93IG15LTIwXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBtZDp3LTEvMiBsZzp3LTEvMyB4bDp3LTEvNFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1sLTgwIG15LTVcIj5cbiAgICAgICAgICA8QWNjb3VudERyb3Bkb3duPjwvQWNjb3VudERyb3Bkb3duPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgbWQ6dy0xLzIgbGc6dy0yLzMgeGw6dy0zLzRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBteC1hdXRvXCI+XG4gICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwibXktYXV0byB3LTgwXCIgb25TdWJtaXQ9e2hhbmRsZVN1Ym1pdH0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNVwiPlxuICAgICAgICAgICAgICA8SW5wdXQgaWQ9XCJlbnRyeVByaWNlXCIgbmFtZT1cImVudHJ5UHJpY2VcIiB0eXBlPVwibnVtYmVyXCIgcGxhY2Vob2xkZXI9XCJFbnRyeSBQcmljZS4uLlwiPjwvSW5wdXQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC01XCI+XG4gICAgICAgICAgICAgIDxJbnB1dCBpZD1cInN0b3BMb3NzXCIgbmFtZT1cInN0b3BMb3NzXCIgdHlwZT1cIm51bWJlclwiIHBsYWNlaG9sZGVyPVwiU3RvcCBMb3NzLi4uXCI+PC9JbnB1dD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTVcIj5cbiAgICAgICAgICAgICAgPElucHV0IGlkPVwidGFrZVByb2ZpdFwiIG5hbWU9XCJ0YWtlUHJvZml0XCIgdHlwZT1cIm51bWJlclwiIHBsYWNlaG9sZGVyPVwiVGFrZSBQcm9maXQuLi5cIj48L0lucHV0PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNFwiPlxuICAgICAgICAgICAgICA8QnV0dG9uIHR5cGU9XCJzdWJtaXRcIj5TdWJtaXQgRW50cnk8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj4gICAgXG4gICAgICApfVxuICAgIDwvbWFpbj5cbiAgKVxufVxuIl0sIm5hbWVzIjpbIkFjY291bnREcm9wZG93biIsIklucHV0IiwiQnV0dG9uIiwidXNlUm91dGVyIiwidXNlTXV0YXRpb24iLCJleHRyYWN0Qm9keSIsIkhvbWUiLCJyb3V0ZXIiLCJtdXRhdGlvbiIsIm11dGF0aW9uRm4iLCJoYW5kbGUiLCJmZXRjaCIsIm1ldGhvZCIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5Iiwib25TdWNjZXNzIiwicmVzIiwiZW50cnlQcmljZSIsInB1c2giLCJzdG9wTG9zcyIsInRha2VQcm9maXQiLCJoYW5kbGVTdWJtaXQiLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwiZGF0YSIsIkZvcm1EYXRhIiwidGFyZ2V0IiwiZ2V0IiwibXV0YXRlIiwibWFpbiIsImNsYXNzTmFtZSIsImRpdiIsImgxIiwiaXNMb2FkaW5nIiwicCIsImZvcm0iLCJvblN1Ym1pdCIsImlkIiwibmFtZSIsInR5cGUiLCJwbGFjZWhvbGRlciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/pages/index.tsx\n"));

/***/ })

});
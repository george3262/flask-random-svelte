
import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const myCustomTheme: CustomThemeConfig = {
    name: 'my-custom-theme',
    properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`,
		"--theme-font-family-heading": `ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`,
		"--theme-font-color-base": "var(--color-primary-500)",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "4px",
		"--theme-rounded-container": "2px",
		"--theme-border-base": "1px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "255 255 255",
		"--on-secondary": "255 255 255",
		"--on-tertiary": "0 0 0",
		"--on-success": "0 0 0",
		"--on-warning": "0 0 0",
		"--on-error": "255 255 255",
		"--on-surface": "var(--color-primary-500)",
		// =~= Theme Colors  =~=
		// primary | #06292d 
		"--color-primary-50": "218 223 224", // #dadfe0
		"--color-primary-100": "205 212 213", // #cdd4d5
		"--color-primary-200": "193 202 203", // #c1cacb
		"--color-primary-300": "155 169 171", // #9ba9ab
		"--color-primary-400": "81 105 108", // #51696c
		"--color-primary-500": "6 41 45", // #06292d
		"--color-primary-600": "5 37 41", // #052529
		"--color-primary-700": "5 31 34", // #051f22
		"--color-primary-800": "4 25 27", // #04191b
		"--color-primary-900": "3 20 22", // #031416
		// secondary | #5e1843 
		"--color-secondary-50": "231 220 227", // #e7dce3
		"--color-secondary-100": "223 209 217", // #dfd1d9
		"--color-secondary-200": "215 197 208", // #d7c5d0
		"--color-secondary-300": "191 163 180", // #bfa3b4
		"--color-secondary-400": "142 93 123", // #8e5d7b
		"--color-secondary-500": "94 24 67", // #5e1843
		"--color-secondary-600": "85 22 60", // #55163c
		"--color-secondary-700": "71 18 50", // #471232
		"--color-secondary-800": "56 14 40", // #380e28
		"--color-secondary-900": "46 12 33", // #2e0c21
		// tertiary | #faf6f2 
		"--color-tertiary-50": "254 254 253", // #fefefd
		"--color-tertiary-100": "254 253 252", // #fefdfc
		"--color-tertiary-200": "254 253 252", // #fefdfc
		"--color-tertiary-300": "253 251 250", // #fdfbfa
		"--color-tertiary-400": "252 249 246", // #fcf9f6
		"--color-tertiary-500": "250 246 242", // #faf6f2
		"--color-tertiary-600": "225 221 218", // #e1ddda
		"--color-tertiary-700": "188 185 182", // #bcb9b6
		"--color-tertiary-800": "150 148 145", // #969491
		"--color-tertiary-900": "123 121 119", // #7b7977
		// success | #84cc16 
		"--color-success-50": "237 247 220", // #edf7dc
		"--color-success-100": "230 245 208", // #e6f5d0
		"--color-success-200": "224 242 197", // #e0f2c5
		"--color-success-300": "206 235 162", // #ceeba2
		"--color-success-400": "169 219 92", // #a9db5c
		"--color-success-500": "132 204 22", // #84cc16
		"--color-success-600": "119 184 20", // #77b814
		"--color-success-700": "99 153 17", // #639911
		"--color-success-800": "79 122 13", // #4f7a0d
		"--color-success-900": "65 100 11", // #41640b
		// warning | #EAB308 
		"--color-warning-50": "252 244 218", // #fcf4da
		"--color-warning-100": "251 240 206", // #fbf0ce
		"--color-warning-200": "250 236 193", // #faecc1
		"--color-warning-300": "247 225 156", // #f7e19c
		"--color-warning-400": "240 202 82", // #f0ca52
		"--color-warning-500": "234 179 8", // #EAB308
		"--color-warning-600": "211 161 7", // #d3a107
		"--color-warning-700": "176 134 6", // #b08606
		"--color-warning-800": "140 107 5", // #8c6b05
		"--color-warning-900": "115 88 4", // #735804
		// error | #D41976 
		"--color-error-50": "249 221 234", // #f9ddea
		"--color-error-100": "246 209 228", // #f6d1e4
		"--color-error-200": "244 198 221", // #f4c6dd
		"--color-error-300": "238 163 200", // #eea3c8
		"--color-error-400": "225 94 159", // #e15e9f
		"--color-error-500": "212 25 118", // #D41976
		"--color-error-600": "191 23 106", // #bf176a
		"--color-error-700": "159 19 89", // #9f1359
		"--color-error-800": "127 15 71", // #7f0f47
		"--color-error-900": "104 12 58", // #680c3a
		// surface | #dcdcdc 
		"--color-surface-50": "250 250 250", // #fafafa
		"--color-surface-100": "248 248 248", // #f8f8f8
		"--color-surface-200": "246 246 246", // #f6f6f6
		"--color-surface-300": "241 241 241", // #f1f1f1
		"--color-surface-400": "231 231 231", // #e7e7e7
		"--color-surface-500": "220 220 220", // #dcdcdc
		"--color-surface-600": "198 198 198", // #c6c6c6
		"--color-surface-700": "165 165 165", // #a5a5a5
		"--color-surface-800": "132 132 132", // #848484
		"--color-surface-900": "108 108 108", // #6c6c6c
		
	}
}

export const themes = ['light', 'auto', 'dark'] as const;
export type Theme = typeof themes[number];

export const getPreferredTheme = (): Theme => {
	const storedTheme = localStorage.getItem('theme') as Theme | null;
	if (storedTheme && themes.includes(storedTheme)) return storedTheme;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export const setPreferredTheme = (theme: Theme) => {
	localStorage.setItem('theme', theme);
	applyTheme(theme);
}

const applyTheme = (theme: Theme) => {
	if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		theme = 'dark';
	}
	document.documentElement.setAttribute('data-bs-theme', theme);
}

applyTheme(getPreferredTheme());
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
	applyTheme(getPreferredTheme());
})

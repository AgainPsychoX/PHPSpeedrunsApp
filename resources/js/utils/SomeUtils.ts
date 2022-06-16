
export const parseBoolean = (value: string | boolean | null | undefined, defaultValue: boolean = false) => {
	if (typeof value === 'undefined' || value === null) {
		return defaultValue;
	}
	if (typeof value === 'boolean') {
		return value;
	}
	switch (value.toLowerCase().trim()) {
		case "true": case "yes": case "on": case "1": return true;
		case "false": case "no": case "off": case "0": return false;
		default: return defaultValue;
	}
}

export const parseForm = (form: HTMLFormElement) => {
	return Object.fromEntries([...new FormData(form)].filter(e => e[1] !== '')) as Record<string, string>;
}



// Adapted from https://stackoverflow.com/a/37704433/4880243
export const YouTubeRegex = new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/);

export const getYoutubeVideoId = (url: string) => {
	const match = YouTubeRegex.exec(url);
	if (!match) return null;
	return match[6];
}


export const parseBoolean = (value: string | boolean | null | undefined, defaultValue = false) => {
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

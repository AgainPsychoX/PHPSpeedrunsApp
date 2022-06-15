
export const formToValues = (form: HTMLFormElement): Record<string, string> => {
	const values: Record<string, any> = {};
	for (const element of form.elements as unknown as any[]) {
		if (element.name) {
			values[element.name as string] = element.value;
		}
	}
	return values;
}

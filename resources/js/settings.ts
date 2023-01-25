

const findRootForFileProtocol = () => {
	const i = location.href.lastIndexOf('/public/');
	if (i == -1) {
		window.alert(`Uruchamiać z folderu public!`);
		return '';
	}
	return location.href.substring(0, i + '/public/'.length);
}

const root = location.href.startsWith('file:')
	? findRootForFileProtocol()
	: location.origin;
const settings = {
	authRoot: root,
	apiRoot: `${root}/api`,
};
export default settings;

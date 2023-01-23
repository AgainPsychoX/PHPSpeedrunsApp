import { createContext } from 'react';
import { UserDetails } from '../../models/User';
import { getPreferredTheme, Theme } from '../BootstrapThemes';

type AppContextData = {
	currentUser?: UserDetails;
	theme: Theme;
};
const AppContext = createContext<AppContextData>({
	currentUser: undefined,
	theme: getPreferredTheme(),
});

export default AppContext;

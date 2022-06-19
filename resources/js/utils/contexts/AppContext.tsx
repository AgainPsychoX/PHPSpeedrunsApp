import { createContext } from 'react';
import { UserDetails } from '../../models/User';

type AppContextType = {
	currentUser?: UserDetails;
};
const AppContext = createContext<AppContextType>({
	currentUser: undefined,
});

export default AppContext;

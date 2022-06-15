import { createContext } from 'react';
import { UserDetails } from '../models/User';

type AppContextType = {
	user?: UserDetails;
};
const AppContext = createContext<AppContextType>({
	user: undefined,
});

export default AppContext;

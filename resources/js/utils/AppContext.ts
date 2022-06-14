import { createContext } from 'react';
import { UserDetails } from '../models/User';

type AppContextType = {
	user: UserDetails | null;
};
const AppContext = createContext<AppContextType>({
	user: null,
});

export default AppContext;

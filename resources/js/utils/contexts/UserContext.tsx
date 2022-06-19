import React, { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { fetchUserDetails } from '../../API';
import { GenericLoadingSection } from '../../components/GenericLoading';
import { UserDetails } from '../../models/User';
import AppContext from './AppContext';

const UserContext = createContext<UserDetails | undefined>(undefined);
export default UserContext;

export const UserContextRouterOutlet = () => {
	const { currentUser } = useContext(AppContext);
	const navigate = useNavigate();
	const { userIdPart } = useParams<{userIdPart: string}>();
	const [user, setUser] = useState<UserDetails>();

	useEffect(() => {
		if (!userIdPart) return;
		if (['current', 'me', 'my'].includes(userIdPart.toLowerCase())) {
			setUser(currentUser);
			return;
		}
		const userId = parseInt(userIdPart);
		if (user && user.id == userId) return;
		fetchUserDetails(userId)
			.then(setUser)
			.catch(error => {
				console.error(error);
				alert(`Wystąpił problem, przepraszamy.`);
				navigate('/');
				// TODO: generic error handling page
			})
		;
	}, [userIdPart]);

	if (!user) {
		return <GenericLoadingSection/>
	}

	return <UserContext.Provider value={user}>
		<Outlet/>
	</UserContext.Provider>
}

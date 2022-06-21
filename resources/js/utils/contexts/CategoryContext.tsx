import React, { createContext, useContext, useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { fetchCategoryDetails } from '../../API';
import { GenericLoadingSection } from '../../components/GenericLoading';
import { CategoryDetails } from '../../models/Category';
import AppContext from './AppContext';
import GameContext from './GameContext';

interface CategoryContextData {
	category?: CategoryDetails;
	isModerator: boolean;
};

const CategoryContext = createContext<CategoryContextData>({
	isModerator: false,
});
export default CategoryContext;

export const CategoryContextRouterOutlet = () => {
	const navigate = useNavigate();
	const { currentUser } = useContext(AppContext);
	const { isModerator : isGameModerator } = useContext(GameContext);
	const { categoryIdPart } = useParams<{categoryIdPart: string}>();
	const [category, setCategory] = useState<CategoryDetails>();
	const [isModerator, setIsModerator] = useState<boolean>(false);

	useEffect(() => {
		if (!categoryIdPart) return;
		const categoryId = parseInt(categoryIdPart);
		if (category?.id == categoryId) return;
		fetchCategoryDetails(categoryId)
			.then(category => {
				setCategory(category);
				setIsModerator(isGameModerator || !!(currentUser &&
					category.moderators.find(e => e.id === currentUser.id)
				));

			})
			.catch(error => {
				console.error(error);
				alert(`Wystąpił problem, przepraszamy.`);
				navigate('/');
				// TODO: generic error handling page
			})
		;
	}, [categoryIdPart, category, isGameModerator, currentUser, navigate]);

	if (!category) {
		return <GenericLoadingSection/>
	}

	return <CategoryContext.Provider value={{
		category,
		isModerator,
	}}>
		<Outlet/>
	</CategoryContext.Provider>
}

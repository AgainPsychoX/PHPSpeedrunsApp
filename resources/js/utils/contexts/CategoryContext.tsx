import React, { createContext, useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { fetchCategoryDetails } from '../../API';
import { GenericLoadingSection } from '../../components/GenericLoading';
import { CategoryDetails } from '../../models/Category';

const CategoryContext = createContext<CategoryDetails | undefined>(undefined);
export default CategoryContext;

export const CategoryContextRouterOutlet = () => {
	const navigate = useNavigate();
	const { categoryIdPart } = useParams<{categoryIdPart: string}>();
	const [category, setCategory] = useState<CategoryDetails>();

	useEffect(() => {
		if (!categoryIdPart) return;
		const categoryId = parseInt(categoryIdPart);
		if (category && category.id == categoryId) return;
		fetchCategoryDetails(categoryId)
			.then(setCategory)
			.catch(error => {
				console.error(error);
				alert(`Wystąpił problem, przepraszamy.`);
				navigate('/');
				// TODO: generic error handling page
			})
		;
	}, [categoryIdPart]);

	if (!category) {
		return <GenericLoadingSection/>
	}

	return <CategoryContext.Provider value={category}>
		<Outlet/>
	</CategoryContext.Provider>
}

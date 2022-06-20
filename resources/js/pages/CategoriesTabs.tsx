import React, { useEffect, useState } from "react";
import { Tab, Table, Tabs } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { fetchCategoryDetails } from "../API";
import { GenericLoadingSection } from "../components/GenericLoading";
import { CategoryDetails, CategoryEntry, getEditCategoryPageLink, getNewRunPageLink } from "../models/Category";
import { getRunPageLink, RunEntry } from "../models/Run";
import { formatDurationHTML } from "../utils/FormattingUtils";

interface CategoriesTabsProps {
	categories: CategoryEntry[];
	initialActiveCategoryId?: number;
}
const CategoriesTabs = ({
	categories,
	initialActiveCategoryId = 0
}: CategoriesTabsProps) => {
	const defaultKey = categories[initialActiveCategoryId].id.toString();
	const [activeKey, setKey] = useState<string>(defaultKey);

	const [details, setDetails] = useState<CategoryDetails>();

	useEffect(() => {
		fetchCategoryDetails(parseInt(activeKey as string)).then(setDetails);
	}, [activeKey]);

	return (
		<Tabs
			className="mb-3 px-2"
			activeKey={activeKey}
			onSelect={(key: string | null) => setKey(key || defaultKey)} // WHY THE FUCK DOES IT NEED 'key: string | null'?! ... TS7006: Parameter 'key' implicitly has an 'any' type.
		>
			{categories.map(category =>
				<Tab key={category.id} eventKey={category.id.toString()} title={category.name} className="px-2">
					{(details && details.id == category.id)
						? <CategoryTabContent category={details} />
						: <GenericLoadingSection/>
					}
				</Tab>
			)}
		</Tabs>
	);
}

const CategoryTabContent = ({category}: { category: CategoryDetails }) => {
	const isCategoryModerator = true;

	return <>
		{category.rules && <>
			<h5>Zasady kategorii</h5>
			<p>{category.rules}</p>
		</>}
		<div className="gap-2 hstack justify-content-center mb-3">
			{isCategoryModerator && <>
				<Link className="btn btn-outline-secondary" role="button" to={getEditCategoryPageLink(category)}>Edytuj lub usuń kategorię</Link>
				{/* <Link className="btn btn-outline-secondary" role="button" to={getManageCategoryModeratorsPageLink(category)}>Edytuj lub usuń kategorię</Link> */}
			</>}
			<Link className="btn btn-outline-secondary" role="button" to={getNewRunPageLink(category)}>Dodaj podejście</Link>
		</div>
		{(category.runs && category.runs.length > 0)
			? <>
				<h5>Podejścia</h5>
				<Table striped hover>
					<thead>
						<tr>
							<th>#</th>
							<th>Gracz</th>
							{category.scoreRule != 'none' && <th>Wynik</th>}
							<th>Czas</th>
							<th>Data</th>
						</tr>
					</thead>
					<tbody>
						{category.runs.map((run, i) => <RunRow key={run.id} place={i + 1} category={category} run={run} />)}
					</tbody>
				</Table>
			</>
			: <div className="h6">Brak podejść w bazie danych</div>
		}
	</>;
};

const RunRow = ({place, category, run}: { place: number, category: CategoryDetails, run: RunEntry }) => {
	const navigate = useNavigate();
	return <tr
		key={run.id}
		style={{cursor: 'pointer'}}
		onClick={() => navigate(getRunPageLink(run))}
	>
		<td>{place}</td>
		<td>{run.userName}</td>
		{category.scoreRule != 'none' && <td>{run.score}</td>}
		<td>{formatDurationHTML(run.duration)}</td>
		<td>{run.createdAt.toRelative()}</td>
	</tr>
}

export default CategoriesTabs;

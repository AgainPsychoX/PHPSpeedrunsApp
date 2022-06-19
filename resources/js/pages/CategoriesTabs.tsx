import { EventKey } from "@restart/ui/esm/types";
import React, { useEffect, useState } from "react";
import { Tab, Table, Tabs } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { fetchCategoryDetails } from "../API";
import { GenericLoadingSection } from "../components/GenericLoading";
import { CategoryDetails, CategoryEntry } from "../models/Category";
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
	const defaultKey = categories[initialActiveCategoryId].id;
	const [activeKey, setKey] = useState<EventKey>(defaultKey);

	const [details, setDetails] = useState<CategoryDetails>();

	useEffect(() => {
		fetchCategoryDetails(parseInt(activeKey as string)).then(setDetails);
	}, [activeKey]);

	return (
		<Tabs
			className="mb-3 px-2"
			activeKey={activeKey}
			onSelect={(key) => setKey(key || defaultKey)}
		>
			{categories.map(category =>
				<Tab key={category.id} eventKey={category.id} title={category.name} className="px-2">
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
	return <>
		{category.rules && <>
			<h5>Zasady kategorii</h5>
			<p>{category.rules}</p>
		</>}
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
			: <h6>Brak podejść w bazie danych</h6>
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

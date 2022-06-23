import React, { createContext, useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { fetchRunDetails } from '../../API';
import { GenericLoadingSection } from '../../components/GenericLoading';
import { RunDetails } from '../../models/Run';

interface RunContextData {
	run?: RunDetails;
}

const RunContext = createContext<RunContextData>({});
export default RunContext;

export const RunContextRouterOutlet = () => {
	const navigate = useNavigate();
	const { runIdPart } = useParams<{runIdPart: string}>();
	const [run, setRun] = useState<RunDetails>();

	useEffect(() => {
		if (!runIdPart) return;
		const runId = parseInt(runIdPart);
		if (run?.id == runId) return;
		fetchRunDetails(runId)
			.then(setRun)
			.catch(error => {
				console.error(error);
				alert(`Wystąpił problem, przepraszamy.`);
				navigate('/');
				// TODO: generic error handling page
			})
		;
	}, [runIdPart, run, navigate]);

	if (!run) {
		return <GenericLoadingSection/>
	}

	return <RunContext.Provider value={{
		run
	}}>
		<Outlet/>
	</RunContext.Provider>
}

import React from "react";
import { Container, Spinner } from "react-bootstrap";

export interface GenericLoadingProps {
	description?: string;
}
export const GenericLoadingSection = ({
	description
}: GenericLoadingProps) => {
	return (
		<div className="d-flex flex-column align-items-center m-4">
			<Spinner animation="border" role="status">
				{description ? '' : <span className="visually-hidden">Ładowanie...</span>}
			</Spinner>
			{description && <div>{description}</div>}
		</div>
	)
}

export const GenericLoadingPage = (props: GenericLoadingProps) => {
	return <main>
		<Container>
			<GenericLoadingSection {...props} />
		</Container>
	</main>
}

import React from "react";
import { Spinner } from "react-bootstrap";

export interface GenericLoadingSectionProps {
	description?: string;
};
export const GenericLoadingSection = ({
	description
}: GenericLoadingSectionProps) => {
	return (
		<div className="d-flex flex-column align-items-center m-4">
			<Spinner animation="border" role="status">
				{description ? '' : <span className="visually-hidden">Ładowanie...</span>}
			</Spinner>
			{description && <div>{description}</div>}
		</div>
	)
}

export default GenericLoadingSection;

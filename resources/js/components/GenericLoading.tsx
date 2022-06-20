import React, { CSSProperties } from "react";
import { Container, Spinner } from "react-bootstrap";

export interface GenericLoadingProps {
	description?: string;
	className?: string;
	divStyle?: CSSProperties
}
export const GenericLoadingSection = ({
	description,
	className = '',
	divStyle,
}: GenericLoadingProps) => {
	return (
		<div className={"d-flex flex-column align-items-center m-4 " + className} style={divStyle}>
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

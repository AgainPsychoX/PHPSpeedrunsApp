import React from "react";
import { Container } from "react-bootstrap";

const MyFooter = () => {
	return <footer>
		<Container>
			<address className="text-center fw-light mb-0">
				Przygotowane przez <a href="mailto:patryk.ludwikowski.7@gmail.com" className="text-decoration-none">Patryka Ludwikowskiego</a> w ramach zaliczenia przedmiotu Aplikacje Internetowe, Uniwersytet Rzeszowski 2022.
			</address>
		</Container>
	</footer>
};
export default MyFooter;

import React from "react";
import { Col, Container, Nav, Row } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const FooterLink = (props: any) => {
	return <Nav.Link className="px-0 py-1 link-muted" {...props}>{props.children}</Nav.Link>
}

const MyFooter = () => {
	return <footer className="mt-auto py-2 shadow">
		<Container>
			<Row>
				<Col xs={6} md={3}>
					<h5>Linki</h5>
					<FooterLink as={NavLink} to="/">Strona główna</FooterLink>
					<FooterLink as={NavLink} to="/games/">Katalog gier</FooterLink>
					<FooterLink as={NavLink} to="/users/">Gracze</FooterLink>
					<FooterLink as={NavLink} to="/about/">Kultura speedranów</FooterLink>
				</Col>
				<Col xs={6} md={3}>
					<h5>Odwiedź nas</h5>
					<FooterLink href="#" target="_blank"><i className="bi bi-discord"></i> Discord</FooterLink>
					<FooterLink href="#" target="_blank"><i className="bi bi-twitter"></i> Twitter</FooterLink>
					<FooterLink href="#" target="_blank"><i className="bi bi-youtube"></i> YouTube</FooterLink>
					<FooterLink href="#" target="_blank"><i className="bi bi-twitch"></i> Twitch</FooterLink>
				</Col>
				<Col xs={12} md={6}>
					<div className="hstack gap-2 flex-wrap mb-2 justify-content-center justify-content-md-start">
						<img src="/logo.png" alt="logo" className="shadow-sm" style={{display: "inline", height: "4em"}}/>
						<h5 className="footer-brand mb-0">SpeedrunsApp</h5>
					</div>
					<address className="fw-light mb-0 text-muted text-center text-md-start">
						Przygotowane przez <a href="mailto:patryk.ludwikowski.7@gmail.com" className="link-muted">Patryka Ludwikowskiego</a> w ramach zaliczenia przedmiotu Aplikacje Internetowe, Uniwersytet Rzeszowski 2022 oraz Projektowanie Interfejsów Internetowych, Uniwersytet Rzeszowski 2023.
					</address>
				</Col>
			</Row>
		</Container>
	</footer>
};
export default MyFooter;

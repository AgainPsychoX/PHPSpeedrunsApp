import React, { useContext, useState } from "react"
import { Button, Container, Nav, Navbar } from "react-bootstrap"
import { Link, NavLink } from "react-router-dom";
import AppContext from "../utils/contexts/AppContext";

const MyNavbar = () => {
	const { currentUser } = useContext(AppContext);
	const [expanded, setExpanded] = useState(false);

	const close = () => setTimeout(() => setExpanded(false), 150);

	return <Navbar bg="light" expand="lg" expanded={expanded}>
		<Container>
			<Navbar.Brand as={NavLink} to="/">SpeedrunsApp</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav className="me-auto text-nowrap">
					<Nav.Link as={NavLink} onClick={close} to="/">Strona główna</Nav.Link>
					<Nav.Link as={NavLink} onClick={close} to="/games/">Katalog gier</Nav.Link>
					<Nav.Link as={NavLink} onClick={close} to="/users/">Gracze</Nav.Link>
					<Nav.Link as={NavLink} onClick={close} to="/about/">O speedranowaniu</Nav.Link>
				</Nav>
			</Navbar.Collapse>
			<Navbar.Collapse className="justify-content-end">
				{currentUser
					? <>
						<Navbar.Text className="mx-auto mx-lg-2 text-center d-block">
							Zalogowany jako <span className="fw-semibold text-break">{currentUser.name}</span>
						</Navbar.Text>
						<div className="hstack gap-3 gap-lg-1 my-1 text-nowrap">
							<Button variant="outline-primary" className="flex-grow-1" onClick={close} as={Link} to="/users/current">Mój profil</Button>
							<Button variant="outline-secondary" className="flex-grow-1" onClick={close} as={Link} to="/logout">Wyloguj</Button>
						</div>
					</>
					:
					<>
						<div className="hstack gap-3 gap-lg-1 my-1 text-nowrap">
							<Button variant="outline-primary" className="flex-grow-1" onClick={close} as={Link} to="/login">Zaloguj się</Button>
							<Button variant="outline-secondary" className="flex-grow-1" onClick={close} as={Link} to="/register">Zarejestruj się</Button>
						</div>
					</>
				}
			</Navbar.Collapse>
		</Container>
	</Navbar>
}
export default MyNavbar;

import React, { useContext } from "react";
import { Button, Carousel, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import AppContext from "../utils/contexts/AppContext";

const images = [
	'1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.png', '8.jpg', '9.jpg',
	'10.png', '11.jpg', '12.jpg', '13.jpg', '14.png', '15.webp', '16.jpeg', '17.jpg', '18.jpeg', '19.png',
	'20.jpg', '21.jpg', '22.jpg',
].map(filename => ({ url: `/storage/images/home/carousel/${filename}` }));

export const HomePage = () => {
	const { currentUser } = useContext(AppContext);
	const isGlobalModerator = currentUser?.isAdmin;

	return <main>
		<Carousel indicators={false} fade style={{height: '66vh'}} className="overflow-hidden mb-3" id="home">
			{images.map(image =>
				<Carousel.Item key={image.url}>
					<img src={image.url} />
				</Carousel.Item>
			)}
		</Carousel>
		<Container>
			<h2>Strona główna</h2>
			<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</p>
		</Container>
		<Container>
			{isGlobalModerator && <>
				<Button variant="outline-secondary" size="sm" as={Link} to={'/moderators'}>Zarządzanie moderatorami globalnymi</Button>
			</>}
		</Container>
	</main>
};
export default HomePage;

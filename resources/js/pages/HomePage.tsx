import React from "react";
import { Carousel, Container } from "react-bootstrap";

const images = [
	'1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.png', '8.jpg', '9.jpg',
	'10.png', '11.jpg', '12.jpg', '13.jpg', '14.png', '15.webp', '16.jpeg', '17.jpg', '18.jpeg', '19.png',
	'20.jpg', '21.jpg', '22.jpg',
].map(filename => ({ url: `/storage/images/home/carousel/${filename}` }));

export const HomePage = () => {
	return <main>
		<Carousel indicators={false} style={{height: '32em'}} className="overflow-hidden mb-3">
			{images.map(image =>
				<Carousel.Item key={image.url}>
					<img className="d-block w-100 h-100" style={{objectFit: 'cover'}} src={image.url} />
				</Carousel.Item>
			)}
		</Carousel>
		<Container>
			<h2>Strona główna</h2>
			<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</p>
		</Container>
	</main>
};
export default HomePage;

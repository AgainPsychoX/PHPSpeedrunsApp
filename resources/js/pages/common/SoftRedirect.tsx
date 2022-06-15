import React, { FunctionComponent, useEffect } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";
import { Variant } from "react-bootstrap/esm/types";
import { useNavigate } from "react-router-dom";

interface AlertData {
	variant?: Variant;
	heading?: string;
	text: string;
}

interface Props extends AlertData {
	to: string | (() => void);
	timeout?: number;
}

const SoftRedirect: FunctionComponent<Props> = ({
	to,
	timeout = 3333,
	variant = 'secondary',
	heading = undefined,
	text = `Za chwilę nastąpi przekierowanie...`,
}) => {
	const navigate = useNavigate();
	const callback = typeof to === 'string' ? () => navigate(to) : to;

	useEffect(() => {
		if (timeout < 0) return;
		const timer = setTimeout(callback, timeout);
		return () => clearTimeout(timer);
	}, []);

	return <main>
		<Container>
			<Row className="justify-content-center my-4">
				<Col xs={12} sm={8} md={6} xl={5} xxl={4}>
					<Alert variant={variant}>
						{heading && <Alert.Heading>{heading}</Alert.Heading>}
						<p className="mb-0">{text}</p>
					</Alert>
				</Col>
			</Row>
		</Container>
	</main>
}
export default SoftRedirect;

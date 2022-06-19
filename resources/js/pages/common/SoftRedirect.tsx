import React, { FunctionComponent, useEffect } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";
import { Variant } from "react-bootstrap/esm/types";
import { useNavigate } from "react-router-dom";

interface AlertData {
	variant?: Variant;
	heading?: string;
	text?: string;
}

interface SoftRedirectProps extends AlertData {
	to: string | (() => void);
	timeout?: number;
	note?: string;

	/**
	 * If children specified, overrides the default content (heading, text, note).
	 */
	children?: JSX.Element;
}

const SoftRedirect: FunctionComponent<SoftRedirectProps> = ({
	to,
	timeout = 3333,
	variant = 'secondary',
	heading,
	text,
	note = `Za chwilę nastąpi przekierowanie...`,
	children,
}) => {
	const navigate = useNavigate();

	useEffect(() => {
		if (timeout < 0) return;
		const callback = typeof to === 'string' ? () => navigate(to) : to;
		const timer = setTimeout(callback, timeout);
		return () => clearTimeout(timer);
	}, [timeout, to, navigate]);

	return <main>
		<Container>
			<Row className="justify-content-center my-4">
				<Col xs={12} sm={8} md={6} xl={5} xxl={4}>
					<Alert variant={variant}>
						{React.Children.count(children) == 0
							? <>
								{heading && <Alert.Heading>{heading}</Alert.Heading>}
								{text && <p>{text}</p>}
								<p className="mb-0">{note}</p>
							</>
							: children
						}
					</Alert>
				</Col>
			</Row>
		</Container>
	</main>
}
export default SoftRedirect;

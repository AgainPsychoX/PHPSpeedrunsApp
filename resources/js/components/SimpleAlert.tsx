import React from "react";
import Alert from "react-bootstrap/esm/Alert";
import { Variant } from "react-bootstrap/esm/types";

export interface SimpleAlertData {
	variant: Variant;
	heading?: string;
	content: string;
}

const hasSomeTagsRegexp = /<\/?[\w]*\s*>/i;

const SimpleAlert = ({variant, heading, content}: SimpleAlertData) => {
	return <Alert variant={variant}>
		{heading && <Alert.Heading>{heading}</Alert.Heading>}
		{hasSomeTagsRegexp.test(content)
			? <div dangerouslySetInnerHTML={{__html: content}}></div>
			: <p className="mb-0">{content}</p>
		}
	</Alert>
}

export default SimpleAlert;

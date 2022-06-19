import React from "react";

const millisInHour = 60 * 60 * 1000;
const millisInMinute = 60 * 1000;
const millisInSecond = 1000;

export const formatDurationHTML = (duration: number): JSX.Element => {
	if (duration >= millisInHour) {
		return <>
			{duration / millisInHour | 0}
			<small>h </small>
			{formatDurationHTML(duration % millisInHour)}
		</>;
	}
	if (duration >= millisInMinute) {
		return <>
			{duration / millisInMinute | 0}
			<small>m </small>
			{formatDurationHTML(duration % millisInMinute)}
		</>
	}
	if (duration >= millisInSecond) {
		return <>
			{duration / millisInSecond | 0}
			<small>s </small>
			{formatDurationHTML(duration % millisInSecond)}
		</>
	}
	return <>
		{duration}
		<small>ms </small>
	</>;
}

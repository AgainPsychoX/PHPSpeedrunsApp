import React from "react";

const millisInHour = 60 * 60 * 1000;
const millisInMinute = 60 * 1000;
const millisInSecond = 1000;

export const formatDurationText = (duration: number, zeros: 'h' | 'm' | 's' | 'ms' | null = 'h'): string => {
	if (duration >= millisInHour || zeros == 'h') {
		return `${duration / millisInHour | 0}h ${formatDurationText(duration % millisInHour, 'm')}`;
	}
	if (duration >= millisInMinute || zeros == 'm') {
		return `${duration / millisInMinute | 0}m ${formatDurationText(duration % millisInMinute, 's')}`;
	}
	if (duration >= millisInSecond || zeros == 's') {
		return `${duration / millisInSecond | 0}s ${formatDurationText(duration % millisInSecond, 'ms')}`;
	}
	if (duration >= 1 || zeros == 'ms') {
		return `${duration}ms`;
	}
	return '';
}

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

export const durationByTimerRegex = /(?:(\d+):)?(\d+):(\d+):(\d+)(?:[,.](\d+))?/;
export const durationByWordsRegex = /^\s*(?:(\d+)\s*d(?:ays?)?[\s,]*)?(?:(\d+)\s*h(?:ours?)?[\s,]*)?(?:(\d+)\s*m(?:in(?:ute)?s?)?[\s,]*)?(?:(\d+)\s*s(?:ec(?:ond)?s?)?[\s,]*)?(?:(\d+)\s*(?:ms|mill?i?s)[\s,]*)?/i;

export const parseDuration = (string: string) => {
	const pattern = string.includes(":") ? durationByTimerRegex : durationByWordsRegex;
	const result = pattern.exec(string);
	if (!result) return 0;
	const days    = parseInt(result[1]) || 0;
	const hours   = parseInt(result[2]) || 0;
	const minutes = parseInt(result[3]) || 0;
	const seconds = parseInt(result[4]) || 0;
	const millis  = parseInt(result[5]) || 0;
	return (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000 + millis;
}

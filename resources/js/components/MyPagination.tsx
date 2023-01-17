import React from "react";
import { Pagination, PaginationProps } from "react-bootstrap";
import { PaginationMeta } from "../API";

export interface MyPaginationProps extends PaginationProps {
	meta: PaginationMeta,
	onSelected: (page: number) => void;
}

export const MyPagination = (props: MyPaginationProps) => {
	const { meta, onSelected, ...rest } = props;
	return (
		<Pagination className="justify-content-center" {...rest}>
			<Pagination.First disabled={meta.current_page <= 1} onClick={() => onSelected(1)}/>
			<Pagination.Prev disabled={meta.current_page <= 1} onClick={() => onSelected(meta.current_page - 1)}/>
			{/* <Pagination.Item>{1}</Pagination.Item> */}
			{/* <Pagination.Ellipsis /> */}

			{Array.from({length: meta.last_page}, (x, i) => {
				return <Pagination.Item key={i + 1} active={meta.current_page == i + 1} onClick={() => onSelected(i + 1)}>{i + 1}</Pagination.Item>;
			})}

			{/* <Pagination.Ellipsis />
			<Pagination.Item>{20}</Pagination.Item> */}
			<Pagination.Next disabled={meta.current_page == meta.last_page} onClick={() => onSelected(meta.current_page + 1)}/>
			<Pagination.Last disabled={meta.current_page == meta.last_page} onClick={() => onSelected(meta.last_page)} />
		</Pagination>
	);
}

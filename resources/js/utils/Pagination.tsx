import React from "react";
import { Pagination } from "react-bootstrap";
import { PaginationMeta } from "../API";

export const buildPagination = (meta: PaginationMeta, onPage: (page: number) => void) => {
	return (
		<Pagination className="justify-content-center">
			<Pagination.First disabled={meta.current_page <= 1} onClick={() => onPage(1)}/>
			<Pagination.Prev disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}/>
			{/* <Pagination.Item>{1}</Pagination.Item> */}
			{/* <Pagination.Ellipsis /> */}

			{Array.from({length: meta.last_page}, (x, i) => {
				return <Pagination.Item key={i + 1} active={meta.current_page == i + 1} onClick={() => onPage(i + 1)}>{i + 1}</Pagination.Item>;
			})}

			{/* <Pagination.Ellipsis />
			<Pagination.Item>{20}</Pagination.Item> */}
			<Pagination.Next disabled={meta.current_page == meta.last_page} onClick={() => onPage(meta.current_page + 1)}/>
			<Pagination.Last disabled={meta.current_page == meta.last_page} onClick={() => onPage(meta.last_page)} />
		</Pagination>
	);
}

<?php

namespace App\Traits;

trait Paginatable
{
	protected $perPageMax = 50;
	protected $allowPageAll = false;

	public function getPerPage(): int
	{
		$perPage = request('per_page', $this->perPage);

		if ($perPage === 'all' && $this->allowPageAll) {
			$perPage = $this->count();
		}

		return max(1, min($this->perPageMax, (int) $perPage));
	}
}

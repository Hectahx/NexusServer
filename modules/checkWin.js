/**
 * Not ideal but cba to do a more efficient solution
 */

function checkWin(buttonArr, color, size = 10) {
	buttons = formatArray(buttonArr, size);
	// horizontalCheck
	for (j = 0; j < size - 4; j++) {
		for (i = 0; i < size; i++) {
			if (
				buttons[i][j] == color &&
				buttons[i][j + 1] == color &&
				buttons[i][j + 2] == color &&
				buttons[i][j + 3] == color &&
				buttons[i][j + 4] == color
			) {
				return true;
			}
		}
	}

	// verticalCheck
	for (i = 0; i < size - 4; i++) {
		for (j = 0; j < size; j++) {
			if (
				buttons[i][j] == color &&
				buttons[i + 1][j] == color &&
				buttons[i + 2][j] == color &&
				buttons[i + 3][j] == color &&
				buttons[i + 4][j] == color
			) {
				return true;
			}
		}
	}

	// ascendingDiagonalCheck
	for (i = 4; i < size; i++) {
		for (j = 0; j < size - 4; j++) {
			if (
				buttons[i][j] == color &&
				buttons[i - 1][j + 1] == color &&
				buttons[i - 2][j + 2] == color &&
				buttons[i - 3][j + 3] == color &&
				buttons[i - 4][j + 4] == color
			)
				return true;
		}
	}

	// descendingDiagonalCheck
	for (i = 4; i < size; i++) {
		for (j = 4; j < size; j++) {
			if (
				buttons[i][j] == color &&
				buttons[i - 1][j - 1] == color &&
				buttons[i - 2][j - 2] == color &&
				buttons[i - 3][j - 3] == color &&
				buttons[i - 4][j - 4] == color
			)
				return true;
		}
	}

	return false;
}

function formatArray(arr, size) {
	const newArr = [];
	while (arr.length) newArr.push(arr.splice(0, size));
	return newArr;
}

module.exports = {checkWin}
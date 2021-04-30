const analyseFrequencyLetters = (str) => {
	const length = str.length;
	const frequencyMap = [];

	for (let i = 0; i < length; i++) {
		const letter = str[i];
		let frequencyItem = frequencyMap.find(f => f.letter === letter);
		if (!frequencyItem) {
			frequencyMap.push({
				letter,
				count: 1,
				percentage: (1 / length) * 100
			});
		} else {
			frequencyItem.count += 1;
			frequencyItem.percentage += (1 / length) * 100;
		}
	}

	frequencyMap.sort((a, b) => a.count > b.count ? -1 : 1);

	return frequencyMap;
};

const splitBlocks = (str, length) => {
	const blocks = [];

	let count = 0;
	for (let i = 0; i < str.length; i++) {
		const letter = str[i];
		if (count < length) {
			if (blocks[count]) {
				blocks[count] += letter;
			} else {
				blocks[count] = letter;
			}
			count += 1;
		} else {
			blocks[0] += letter;
			count = 1;
		}
	}

	return blocks;
};

const analyseFreqBlocks = (blocks, max) => {
	const analyses = [];
	blocks.forEach(block => {
		analyses.push(analyseFrequencyLetters(block).slice(0, max))
	});
	return analyses;
};

const findShiftValue = (firstLetter, secondLetter, alphabet) => {
	let index1, index2;
	if (typeof firstLetter === 'string') {
		index1 = alphabet[firstLetter];
	} else {
		index1 = firstLetter;
	}
	if (typeof secondLetter === 'string') {
		index2 = alphabet[secondLetter];
	} else {
		index2 = secondLetter;
	}
	let shiftValue;
	if (index1 > index2) {
		shiftValue = Object.keys(alphabet).length - (index1 - index2);
	} else {
		shiftValue = index1 - index2;
	}
	return Math.abs(shiftValue);
};

const findSmallestShift = (blockAnalyse, shiftValueOccuranceList, alphabet, frequentLetters) => {
	const letterShiftValues = {};

	shiftValueOccuranceList.forEach(shiftValue => {
		blockAnalyse.forEach(analyse => {
			const resultingShift = findShiftValue(parseInt(shiftValue), analyse.letter, alphabet);
			let resultingLetter;
			Object.keys(alphabet).forEach(alphabetLetter => {
				if (alphabet[alphabetLetter] == resultingShift) {
					resultingLetter = alphabetLetter;
				}
			});
			let resultLetterFrequency = frequentLetters.indexOf(resultingLetter) + 1;
			if (letterShiftValues[shiftValue]) {
				letterShiftValues[shiftValue] += resultLetterFrequency;
			} else {
				letterShiftValues[shiftValue] = resultLetterFrequency;
			}
		});
	});

	let lowest = Infinity;
	let field;
	for (let key of Object.keys(letterShiftValues)) {
		if (letterShiftValues[key] < lowest) {
			lowest = letterShiftValues[key];
			field = key;
		}
	}

	return field;
};

const findKeyword = (shiftValues, alphabet) => {
	let keyword = '';
	const sortedKeys = Object.keys(shiftValues);
	sortedKeys.sort((a, b) => a > b ? 1 : -1);

	sortedKeys.forEach(key => {
		let correspondingLetter;
		for (let letter of Object.keys(alphabet)) {
			if (alphabet[letter] - 1 == shiftValues[key]) {
				correspondingLetter = letter;
				break;
			}
		}
		keyword += correspondingLetter;
	});

	return keyword;
};

const decipher = (cipherBlocks, keyword, alphabet) => {
	const clearBlocks = [];
	let clearText = '';
	const alphabetKeys = Object.keys(alphabet);

	cipherBlocks.forEach((cipherBlock, index) => {
		let blockClearText = '';
		const blockShiftValue = alphabet[keyword[index]] - 1;

		for (let i = 0; i < cipherBlock.length; i++) {
			const letter = cipherBlock[i];
			const letterPos = alphabet[letter] - 1;

			if (blockShiftValue > letterPos) {
				const clearLetterPos = alphabetKeys.length - (blockShiftValue - letterPos);

				for (let alphabetLetter of alphabetKeys) {
					if (alphabet[alphabetLetter] === clearLetterPos + 1) {
						blockClearText += alphabetLetter;
						break;
					}
				}
			} else {
				for (let alphabetLetter of alphabetKeys) {
					if (alphabet[alphabetLetter] === letterPos - blockShiftValue + 1) {
						blockClearText += alphabetLetter;
						break;
					}
				}
			}
		}

		clearBlocks.push(blockClearText);
	});

	let columnNumber = 0;
	let totalColumns = clearBlocks.length - 1;
	while (columnNumber <= totalColumns) {
		if (clearBlocks[columnNumber].length > 0) {
			const [first, ...others] = clearBlocks[columnNumber];
			clearText += first;
			clearBlocks[columnNumber] = others;
			if (columnNumber < totalColumns) {
				columnNumber += 1;
			} else {
				columnNumber = 0;
			}
		} else {
			columnNumber = totalColumns + 1;
		}
	}

	return clearText;
};

const frequencyMap = (value) => {
	const map = {};
	for (let i = 0; i < value.length; i++) {
		if (!map[value[i]]) {
			map[value[i]] = 0;
		}
		map[value[i]]++;
	}
	return map;
}

const coincidenceIndex = (value) => {
	const fMap = frequencyMap(value);
	let accum = 0;
	Object.keys(fMap).forEach(char => {
		accum += fMap[char] * (fMap[char] - 1)
	});
	const divisor = value.length * (value.length - 1);
	return accum / divisor;
};

const chooseBestCoincidenceIndex = (coincidenceIndexes, languageCoincidenceIndexValue) => {
	let bestCoincidenceIndex = null;
	let bestDist = Infinity;
	coincidenceIndexes.forEach((coincidenceIndex) => {
		const dist = Math.abs(languageCoincidenceIndexValue - parseFloat(coincidenceIndex.value.toFixed(3)));
		if (dist < bestDist) {
			bestCoincidenceIndex = coincidenceIndex;
			bestDist = dist;
		}
	});
	return bestCoincidenceIndex;
};

module.exports = (cypher) => {
	const maxFrequent = 3;
	const maxFrequentAlphabet = 8;

	const ENGLISH_WORD_FREQUENCY = 0.067;
	const PORTUGUESE_WORD_FREQUENCY = 0.083;

	const avgCoincidenceIndexes = [];
	for (let keyLength = 1; keyLength < 15; keyLength++) {

		const blocks = splitBlocks(cypher.value, keyLength);

		const totalCoincidenceIndex = blocks.map(block => coincidenceIndex(block))
			.reduce((sum, value) => sum + value, 0);

		const avgCoincidenceIndex = totalCoincidenceIndex / keyLength;

		avgCoincidenceIndexes.push({ keyLength, value: avgCoincidenceIndex });
	}

	let keywordLength;
	let bestCI;
	let bestDist = Infinity;
	let bestWordFrequency;
	for (let wordFrequency of [ENGLISH_WORD_FREQUENCY, PORTUGUESE_WORD_FREQUENCY]) {
		const bestCoincidenceIndex = chooseBestCoincidenceIndex(avgCoincidenceIndexes, wordFrequency);
		const dist = Math.abs(bestCoincidenceIndex.value - wordFrequency);
		if (dist < bestDist) {
			keywordLength = bestCoincidenceIndex.keyLength;
			bestCI = bestCoincidenceIndex;
			bestDist = dist;
			bestWordFrequency = wordFrequency;
			// break;
		}
	}

	if (!keywordLength) {
		console.log({ avgCoincidenceIndexes, PORTUGUESE_WORD_FREQUENCY });
		throw new Error('Solver for cypher text language not implemented');
	}

	const alphabet = {
		'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9, 'j': 10, 'k': 11,
		'l': 12, 'm': 13, 'n': 14, 'o': 15, 'p': 16, 'q': 17, 'r': 18, 's': 19, 't': 20, 'u': 21,
		'v': 22, 'w': 23, 'x': 24, 'y': 25, 'z': 26
	}

	let frequentLetters;
	if (bestWordFrequency === ENGLISH_WORD_FREQUENCY) {
		frequentLetters = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r', 'd', 'l', 'c', 'u', 'm', 'w',
			'f', 'g', 'y', 'p', 'b', 'v', 'k', 'j', 'x', 'q', 'z'];
	} else if (bestWordFrequency === PORTUGUESE_WORD_FREQUENCY) {
		frequentLetters = ['e', 'a', 'o', 's', 'r', 'i', 'd', 'u', 'm', 'n', 't', 'c', 'l', 'p', 'v', 'h', 'q', 'f', 'b', 'g', 'j', 'k', 'z', 'x', 'w', 'y'];
	}

	const cipherBlocks = splitBlocks(cypher.value, keywordLength);

	const blockAnalysis = analyseFreqBlocks(cipherBlocks, maxFrequent);

	const shiftValueDict = {};
	const columnKeyLetter = {};

	frequentLetters.slice(0, maxFrequentAlphabet).forEach(frequentLetter => {
		blockAnalysis.forEach((blockAnalyse, index) => {
			blockAnalyse.forEach(analyse => {
				const shiftValue = findShiftValue(frequentLetter, analyse.letter, alphabet);
				if (!shiftValueDict[index]) {
					shiftValueDict[index] = {};
				}
				shiftValueDict[index][analyse.letter + frequentLetter] = shiftValue;
			});

			if (frequentLetter === frequentLetters[maxFrequentAlphabet - 1]) {
				const shiftValues = Object.values(shiftValueDict[index]);
				const shiftValueOccurante = {};
				shiftValues.forEach((shiftValue) => {
					shiftValueOccurante[shiftValue] = shiftValues.filter(value => value === shiftValue).length;
				});

				const occuredTimes = times => Object.values(shiftValueOccurante).filter(v => v === times).length;

				if (occuredTimes(3) > 1) {
					const valueoccuranteThree = [];
					Object.keys(shiftValueOccurante).forEach(value => {
						if (shiftValueOccurante[value] == 3) {
							valueoccuranteThree.push(value);
						}
					});
					const value = findSmallestShift(blockAnalyse, valueoccuranteThree, alphabet, frequentLetters);
					columnKeyLetter[index] = value;
				} else if (occuredTimes(3) == 1) {
					Object.keys(shiftValueOccurante).forEach(value => {
						if (shiftValueOccurante[value] == 3) {
							columnKeyLetter[index] = value;
						}
					});
				} else if (occuredTimes(2) == 1) {
					Object.keys(shiftValueOccurante).forEach(value => {
						if (shiftValueOccurante[value] == 2) {
							columnKeyLetter[index] = value;
						}
					});
				} else if (occuredTimes(2) > 1) {
					const valueoccuranteThree = [];
					Object.keys(shiftValueOccurante).forEach(value => {
						if (shiftValueOccurante[value] == 2) {
							valueoccuranteThree.push(value);
						}
					});
					const value = findSmallestShift(blockAnalyse, valueoccuranteThree, alphabet, frequentLetters);
					columnKeyLetter[index] = value;
				} else {
					const value = findSmallestShift(blockAnalyse, Object.keys(shiftValueOccurante), alphabet, frequentLetters);
					columnKeyLetter[index] = value;
				}
			}
		});
	});

	const keyword = findKeyword(columnKeyLetter, alphabet);

	const clearText = decipher(cipherBlocks, keyword, alphabet);

	return { clearText, keyword, coincidenceIndex: bestCI.value };
};

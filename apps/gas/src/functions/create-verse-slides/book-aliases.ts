/**
 * book-aliases.ts
 *
 * Created by Min-Kyu Lee on 23-08-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

/**
 * Full Korean book names mapped to the abbreviations a 개역개정 source keys its
 * verses by ("창세기 1:1" and "창1:1" both resolve to the key "창1:1").
 */
export const KOREAN_BOOK_ABBREVIATIONS: Record<string, string> = {
	창세기: "창",
	출애굽기: "출",
	레위기: "레",
	민수기: "민",
	신명기: "신",
	여호수아: "수",
	사사기: "삿",
	룻기: "룻",
	사무엘상: "삼상",
	사무엘하: "삼하",
	열왕기상: "왕상",
	열왕기하: "왕하",
	역대상: "대상",
	역대하: "대하",
	에스라: "스",
	느헤미야: "느",
	에스더: "에",
	욥기: "욥",
	시편: "시",
	잠언: "잠",
	전도서: "전",
	아가: "아",
	이사야: "사",
	예레미야: "렘",
	예레미야애가: "애",
	에스겔: "겔",
	다니엘: "단",
	호세아: "호",
	요엘: "욜",
	아모스: "암",
	오바댜: "옵",
	요나: "욘",
	미가: "미",
	나훔: "나",
	하박국: "합",
	스바냐: "습",
	학개: "학",
	스가랴: "슥",
	말라기: "말",
	마태복음: "마",
	마가복음: "막",
	누가복음: "눅",
	요한복음: "요",
	사도행전: "행",
	로마서: "롬",
	고린도전서: "고전",
	고린도후서: "고후",
	갈라디아서: "갈",
	에베소서: "엡",
	빌립보서: "빌",
	골로새서: "골",
	데살로니가전서: "살전",
	데살로니가후서: "살후",
	디모데전서: "딤전",
	디모데후서: "딤후",
	디도서: "딛",
	빌레몬서: "몬",
	히브리서: "히",
	야고보서: "약",
	베드로전서: "벧전",
	베드로후서: "벧후",
	요한일서: "요일",
	요한이서: "요이",
	요한삼서: "요삼",
	유다서: "유",
	요한계시록: "계",
};

/** Frequently used alternates that are not the canonical full name. */
export const KOREAN_BOOK_ALTERNATES: Record<string, string> = {
	애가: "애",
	아가서: "아",
	계시록: "계",
	전도: "전",
};

/**
 * Resolves a book as typed into the abbreviation the source file uses.
 *
 * Unknown names are returned unchanged, so a source keyed by some other
 * convention still works and a typo surfaces as a missing verse rather than
 * being silently rewritten.
 */
export const toBookAbbreviation_ = (
	book: string,
	extraAliases: Record<string, string> = {},
): string => {
	const trimmed = book.trim();
	return (
		extraAliases[trimmed] ??
		KOREAN_BOOK_ABBREVIATIONS[trimmed] ??
		KOREAN_BOOK_ALTERNATES[trimmed] ??
		trimmed
	);
};

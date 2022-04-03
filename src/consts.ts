
// colors
export const COLORS = {
    RED: 0xff595e,
    YELLOW: 0xffca3a,
    GREEN: 0x8ac926,
    BLUE: 0x1982c4,
    VIOLET: 0x6a4c93,
    BLACK: 0x023047
}


export const COLOR_TEXT = COLORS.BLACK;
export const COLOR_PLAYER = COLORS.BLUE;
export const COLOR_ISSUE = COLORS.YELLOW;
export const COLOR_HARD_ISSUE = COLORS.RED;
export const COLOR_ISSUE_PROGRESS = COLORS.GREEN;
export const COLOR_GUEST = COLORS.VIOLET;
export const COLOR_TIMER = COLORS.RED;


// collision categories
export const CATEGORY_WALLS  = 0b1000;
export const CATEGORY_PLAYER = 0b0100;
export const CATEGORY_GUESTS = 0b0010;
export const CATEGORY_ISSUES = 0b0001;

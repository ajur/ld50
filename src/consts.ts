
// colors
export const COLORS = {
    WHITE: 0xfef9ef,
    RED: 0xff595e,
    YELLOW: 0xffca3a,
    GREEN: 0x8ac926,
    BLUE: 0x1982c4,
    VIOLET: 0x6a4c93,
    BLACK: 0x202c39
}


export const COLOR_TEXT = COLORS.BLACK;
export const COLOR_PLAYER = COLORS.BLUE;
export const COLOR_ISSUE = COLORS.YELLOW;
export const COLOR_HARD_ISSUE = COLORS.RED;
export const COLOR_ISSUE_PROGRESS = COLORS.GREEN;
export const COLOR_GUEST = COLORS.VIOLET;
export const COLOR_TIMER = COLORS.RED;

export const MAP_BKG_COLOR = 0x14141e;


// collision categories
export const CATEGORY_WALLS  = 0b1;
export const CATEGORY_PLAYER = 0b10;
export const CATEGORY_GUESTS = 0b100;
export const CATEGORY_ISSUES = 0b1000;
export const CATEGORY_ROOMS  = 0b10000;

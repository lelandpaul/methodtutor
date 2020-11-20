export function bellName(b) {
    switch (b){
        case 10:
            return '0';
        case 11:
            return 'E';
        case 12:
            return 'T';
        case 13:
            return 'A';
        case 14:
            return 'B';
        case 15:
            return 'C';
        case 16:
            return 'D';
        default:
            return b;
    }
}

export function detectMob() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}


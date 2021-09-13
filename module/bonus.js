const prebonus_chalevel = {
    "ut":[0,0,0,0,0,0,0,0,0,0,0],
    "t" :[0,0,0,1,1,1,1,1,1,2,2],
    "e" :[0,0,1,1,1,2,2,2,3,3,3],
    "m" :[0,0,1,1,2,2,2,3,3,4,4],
    "l" :[0,0,1,1,2,2,3,3,4,4,5]
}

const prebonus_clalevel = {
    "ut":[0,0,0,0,0,0,0,0,0,0,0],
    "t" :[0,0,0,0,1,1,1,1,1,2,2],
    "e" :[0,0,0,1,1,1,1,1,2,2,2],
    "m" :[0,0,0,1,1,1,2,2,3,3,3],
    "l" :[0,0,0,1,1,1,2,2,2,3,3]
}

const latbonus_chalevel = {
    "ut":[0,0,0,0,0,0,0,0,0,0,0],
    "t" :[0,0,0,0,0,1,1,2,2,2,2],
    "e" :[0,0,0,1,1,1,2,2,2,3,3],
    "m" :[0,1,1,2,2,3,3,3,4,4,4],
    "l" :[0,1,1,2,2,3,3,4,4,5,5]
}

const latbonus_clalevel = {
    "ut":[0,0,0,0,0,0,0,0,0,0,0],
    "t" :[0,1,1,2,2,2,3,3,4,4,4],
    "e" :[0,1,2,2,2,3,3,4,4,5,5],
    "m" :[0,1,2,2,3,4,4,5,5,6,6],
    "l" :[0,1,2,2,3,4,4,5,6,6,7]
}

export const calculateBonus = function (precious, latter, chalevel, clalevel) {
    if (latter == "") {
        latter = precious;
    }
    chalevel = Number(chalevel);
    clalevel = Number(clalevel);
    return prebonus_chalevel[precious][chalevel] + prebonus_clalevel[precious][clalevel] + 
        latbonus_chalevel[latter][chalevel] + latbonus_clalevel[latter][clalevel];
};
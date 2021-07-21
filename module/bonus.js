const prebonus_chalevel = {
    "ut":[0,0,0,0,0,0,0,0,0,0,0],
    "t" :[0,0,0,0,1,1,1,1,1,1,1],
    "e" :[0,0,1,1,1,1,2,2,2,2,2],
    "m" :[0,0,1,1,2,2,2,2,3,3,3],
    "l" :[0,1,1,2,2,2,3,3,4,4,4]
}

const prebonus_clalevel = {
    "ut":[0,0,0,0,0,0,0,0,0,0,0],
    "t" :[0,0,0,0,0,1,1,1,1,1,1],
    "e" :[0,0,0,1,1,1,1,1,1,2,2],
    "m" :[0,0,1,1,1,1,2,2,2,2,3],
    "l" :[0,0,1,1,1,2,2,2,3,3,4]
}

const latbonus_chalevel = {
    "ut":[0,0,0,0,0,0,0,0,0,0,0],
    "t" :[0,0,0,0,0,0,0,0,1,1,1],
    "e" :[0,0,0,0,1,1,1,1,2,2,3],
    "m" :[0,0,0,1,1,1,2,3,3,3,4],
    "l" :[0,0,1,1,2,3,3,4,4,5,6]
}

const latbonus_clalevel = {
    "ut":[0,0,0,0,0,0,0,0,0,0,0],
    "t" :[0,1,1,1,1,1,1,1,1,2,2],
    "e" :[0,1,1,1,1,2,2,3,3,3,3],
    "m" :[0,1,1,2,2,3,3,4,4,5,5],
    "l" :[0,1,1,2,3,3,4,5,5,6,6]
}

export const calculateBonus = async function (precious, latter, chalevel, clalevel) {
    if (latter == "") {
        latter = precious;
    }
    return prebonus_chalevel[precious][chalevel] + prebonus_clalevel[precious][clalevel] + 
        latbonus_chalevel[latter][chalevel] + latbonus_clalevel[latter][clalevel];
};